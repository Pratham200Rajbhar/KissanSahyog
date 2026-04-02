import os
import cv2
import numpy as np
import json
import logging
from fastapi import UploadFile, HTTPException
from app.schemas.detect import DiseaseDetectionOutput

# Optional: Disable GPU if not needed or to avoid library overhead in some environments
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3' 

logger = logging.getLogger(__name__)

# Lazy load tensorflow to avoid startup delay
_tf = None

def get_tf():
    global _tf
    if _tf is None:
        import tensorflow as tf
        _tf = tf
    return _tf

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_DIR = os.path.join(BASE_DIR, "models", "disease_detection")

# Cache for loaded models and labels
_cache = {
    "models": {},
    "labels": {}
}

# Remedy Mapping (Keep fixed descriptions)
REMEDY_MAPPING = {
    "Bacterial Wilt": "Use resistant varieties and maintain proper soil drainage. Remove and destroy infected plants.",
    "Cercospora Leaf Spot": "Apply Mancozeb or Copper oxychloride fungicides. Ensure proper plant spacing for ventilation.",
    "Tobacco Mosaic Virus": "Remove infected plants immediately. Avoid handling healthy plants after touching infected ones.",
    "Healthy": "Your crop is healthy. Continue regular monitoring and balanced fertilization.",
    "Rust": "Dust with Sulfur (25kg/ha) or spray Bitertanol (1g/L) to control rust spread.",
    "Alternaria Blight": "Spray Mancozeb (0.2%) or Zineb (0.2%) starting from 45 days after sowing.",
    "Powdery Mildew": "Apply Dinocap (0.1%) or Wettable Sulfur (0.2%) during high humidity periods.",
    "Canker": "Prune infected twigs and spray Bordeaux mixture (1%) or Copper oxychloride (0.3%).",
    "Wilt": "Drench soil with Carbendazim (0.2%) or apply bio-control agents like Trichoderma viride.",
    "Anthracnose": "Apply Prochloraz (0.05%) or Carbendazim (0.1%) post-harvest or as a spray.",
    "Curly Leaf": "Control whitefly vectors using Imidacloprid (0.3ml/L) or Neem oil (1%).",
    "Mealybug": "Apply Neem oil (2%) or spray Fish Oil Rosin Soap (20g/L). Encourage natural predators."
}

def preprocess_image(contents: bytes, target_size=(224, 224)):
    """Decodes, converts, resizes and normalizes an image for model input."""
    # 1. Decode bytes using OpenCV
    nparr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    if img is None:
        raise ValueError("Invalid image format or corrupted file.")
    
    # 2. Fix Color Space: OpenCV (BGR) -> Model (RGB)
    img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    
    # 3. Resize to model's target size
    img_resized = cv2.resize(img_rgb, target_size)
    
    # 4. Normalize to [0, 1] range
    img_array = img_resized.astype(np.float32) / 255.0
    
    # 5. Expand to batch format (1, 224, 224, 3)
    img_batch = np.expand_dims(img_array, axis=0)
    
    logger.debug(f"Preprocessing complete. Input shape: {img_batch.shape}, Range: {img_batch.min()}-{img_batch.max()}")
    return img_batch

def get_model_and_labels(crop_type: str):
    """Loads and caches both the Keras model and the class labels JSON."""
    target_crop = crop_type.capitalize()
    
    if target_crop not in _cache["models"]:
        model_path = os.path.join(MODEL_DIR, f"{target_crop}_model.keras")
        label_path = os.path.join(MODEL_DIR, f"{target_crop}_labels.json")
        
        if not os.path.exists(model_path):
            raise HTTPException(status_code=404, detail=f"Model file Not Found for crop: {crop_type}")
        if not os.path.exists(label_path):
            raise HTTPException(status_code=404, detail=f"Label mapping file Not Found for crop: {crop_type}")
        
        tf = get_tf()
        try:
            # Load Model
            _cache["models"][target_crop] = tf.keras.models.load_model(model_path)
            
            # Load Labels
            with open(label_path, "r") as f:
                indices_map = json.load(f)
                # Invert to {index: label}
                _cache["labels"][target_crop] = {int(v): k for k, v in indices_map.items()}
                
            logger.info(f"✅ Loaded model and labels for {target_crop}")
        except Exception as e:
            logger.error(f"Error loading model/labels for {target_crop}: {e}")
            raise HTTPException(status_code=500, detail="Internal server error while loading ML components.")
            
    return _cache["models"][target_crop], _cache["labels"][target_crop]

async def detect_disease(image: UploadFile, crop_type: str, user_id: str = None) -> DiseaseDetectionOutput:
    """Consolidated function for modular disease detection."""
    try:
        # 1. Image Preprocessing
        contents = await image.read()
        img_batch = preprocess_image(contents)
        
        # 2. Model & Label Loading
        model, labels = get_model_and_labels(crop_type)
        
        # 3. Model Inference
        predictions = model.predict(img_batch, verbose=0)
        idx = np.argmax(predictions[0])
        confidence = float(predictions[0][idx])
        
        # 4. Result Mapping
        predicted_label = labels.get(idx, "Unknown")
        remedy = REMEDY_MAPPING.get(predicted_label, "No specific remedy suggested. Consult an agricultural expert.")
        
        # Log discovery
        logger.info(f"Inference complete: {crop_type} -> {predicted_label} ({confidence:.2f})")
        
        # 5. Optional Persistence
        if user_id:
            try:
                from app.core.supabase_client import get_supabase_client
                supabase = get_supabase_client()
                supabase.table("disease_detections").insert({
                    "user_id": user_id,
                    "crop": crop_type,
                    "disease_name": predicted_label,
                    "confidence": confidence,
                    "remedy": remedy
                }).execute()
            except Exception as e:
                logger.error(f"Failed to persist disease detection: {e}")

        return DiseaseDetectionOutput(
            disease=predicted_label,
            confidence=confidence,
            remedy=remedy
        )
        
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        logger.exception(f"Unexpected error during disease detection: {e}")
        raise HTTPException(status_code=500, detail="Failed to analyze image.")
