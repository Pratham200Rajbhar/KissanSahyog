import os
import cv2
import numpy as np
from fastapi import UploadFile, HTTPException
from app.schemas.detect import DiseaseDetectionOutput
from PIL import Image
import io

# Optional: Disable GPU if not needed or to avoid library overhead in some environments
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3' 

# Lazy load tensorflow to avoid startup delay if not used
_tf = None

def get_tf():
    global _tf
    if _tf is None:
        import tensorflow as tf
        _tf = tf
    return _tf

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_DIR = os.path.join(BASE_DIR, "models", "disease_detection")

# Cache for loaded models
_models = {}

# Label and Remedy Mapping
# Note: Alphabetical order is standard for Keras categorical models trained from directory
DISEASE_MAPPING = {
    "Brinjal": {
        "labels": ["Bacterial Wilt", "Cercospora Leaf Spot", "Healthy", "Tobacco Mosaic Virus"],
        "remedies": {
            "Bacterial Wilt": "Use resistant varieties and maintain proper soil drainage. Remove and destroy infected plants.",
            "Cercospora Leaf Spot": "Apply Mancozeb or Copper oxychloride fungicides. Ensure proper plant spacing for ventilation.",
            "Tobacco Mosaic Virus": "Remove infected plants immediately. Avoid handling healthy plants after touching infected ones.",
            "Healthy": "Your Brinjal crop is healthy. Continue regular monitoring and balanced fertilization."
        }
    },
    "Castor": {
        "labels": ["Cercospora Leaf Spot", "Healthy", "Rust"],
        "remedies": {
            "Cercospora Leaf Spot": "Spray Carbendazim (1g/L) or Mancozeb (2g/L) at 15-day intervals.",
            "Rust": "Dust with Sulfur (25kg/ha) or spray Bitertanol (1g/L) to control rust spread.",
            "Healthy": "Castor crop shows no sign of disease. Maintain optimal irrigation."
        }
    },
    "Cumin": {
        "labels": ["Alternaria Blight", "Healthy", "Powdery Mildew"],
        "remedies": {
            "Alternaria Blight": "Spray Mancozeb (0.2%) or Zineb (0.2%) starting from 45 days after sowing.",
            "Powdery Mildew": "Apply Dinocap (0.1%) or Wettable Sulfur (0.2%) during high humidity periods.",
            "Healthy": "Cumin crop is in good health. Avoid over-irrigation during flowering stage."
        }
    },
    "Guava": {
        "labels": ["Canker", "Healthy", "Wilt"],
        "remedies": {
            "Canker": "Prune infected twigs and spray Bordeaux mixture (1%) or Copper oxychloride (0.3%).",
            "Wilt": "Drench soil with Carbendazim (0.2%) or apply bio-control agents like Trichoderma viride.",
            "Healthy": "Guava tree is healthy. Prune regularly for better sunlight penetration."
        }
    },
    "Papaya": {
        "labels": ["Anthracnose", "Curly Leaf", "Healthy", "Mealybug"],
        "remedies": {
            "Anthracnose": "Apply Prochloraz (0.05%) or Carbendazim (0.1%) post-harvest or as a spray.",
            "Curly Leaf": "Control whitefly vectors using Imidacloprid (0.3ml/L) or Neem oil (1%).",
            "Mealybug": "Apply Neem oil (2%) or spray Fish Oil Rosin Soap (20g/L). Encourage natural predators.",
            "Healthy": "Papaya plant is healthy. Ensure consistent watering for optimal fruit quality."
        }
    }
}

def load_crop_model(crop_type: str):
    """Loads and caches the model for a specific crop."""
    target_crop = crop_type.capitalize()
    if target_crop not in DISEASE_MAPPING:
        raise HTTPException(status_code=400, detail=f"Unsupported crop type: {crop_type}")
    
    if target_crop not in _models:
        model_path = os.path.join(MODEL_DIR, f"{target_crop}_model.keras")
        if not os.path.exists(model_path):
            # Fallback for case sensitivity or exact filename match
            model_path = os.path.join(MODEL_DIR, f"{crop_type}_model.keras")
        
        if not os.path.exists(model_path):
            raise HTTPException(status_code=404, detail=f"Model file Not Found for crop: {crop_type}")
        
        tf = get_tf()
        try:
            _models[target_crop] = tf.keras.models.load_model(model_path)
            print(f"INFO: Loaded model for {target_crop}")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error loading model: {str(e)}")
            
    return _models[target_crop]

async def detect_disease(image: UploadFile, crop_type: str) -> DiseaseDetectionOutput:
    """Performs inference on the uploaded image using the specified crop model."""
    tf = get_tf()
    
    # 1. Load the appropriate model
    model = load_crop_model(crop_type)
    crop_info = DISEASE_MAPPING[crop_type.capitalize()]
    
    # 2. Preprocess the image
    try:
        contents = await image.read()
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is None:
            raise HTTPException(status_code=400, detail="Invalid image format")
        
        # Models usually expect 224x224 (typical for MobileNet/ResNet/VGG)
        img_resized = cv2.resize(img, (224, 224))
        img_array = img_resized.astype(np.float32) / 255.0
        img_batch = np.expand_dims(img_array, axis=0)
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error processing image: {str(e)}")
    
    # 3. Prediction
    try:
        predictions = model.predict(img_batch, verbose=0)
        index = np.argmax(predictions[0])
        confidence = float(predictions[0][index])
        
        disease_name = crop_info["labels"][index]
        remedy = crop_info["remedies"][disease_name]
        
        return DiseaseDetectionOutput(
            disease=disease_name,
            confidence=confidence,
            remedy=remedy
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference error: {str(e)}")
