import logging
import pandas as pd
import numpy as np
from fastapi.concurrency import run_in_threadpool
from app.core.config import settings
from app.schemas.recommend import CropRecommendationInput, CropRecommendationOutput, CropRecommendationItem

logger = logging.getLogger(__name__)

MODEL_PATH = settings.crop_model_dir.rstrip(" ") # Safety to remove trailing spaces from configs

class CropRecommendationModel:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            # Create a shell instance
            instance = super(CropRecommendationModel, cls).__new__(cls)
            try:
                # Only assign to _instance if artifacts are successfully loaded
                instance._load_artifacts()
                cls._instance = instance
            except Exception as e:
                logger.error(f"Failed to initialize CropRecommendationModel: {e}")
                raise
        return cls._instance

    def _load_artifacts(self):
        logger.info(f"Loading Crop Recommendation artifacts from {MODEL_PATH}...")
        try:
            import os
            import joblib
            # Load the best model and the label encoder
            self.model = joblib.load(os.path.join(MODEL_PATH, "crop_model.pkl"))
            self.le = joblib.load(os.path.join(MODEL_PATH, "npk_label_encoder.pkl"))
            
            # Features order as confirmed via inspection
            self.feature_columns = ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']
            logger.info("✅ Crop recommendation artifacts loaded successfully.")
        except Exception as e:
            logger.error(f"❌ Failed to load crop recommendation models: {e}")
            raise

    def predict(self, input_data: CropRecommendationInput, top_k: int = 3):
        # Prepare feature vector exactly as entered by the user
        data_dict = {
            'N': float(input_data.N),
            'P': float(input_data.P),
            'K': float(input_data.K),
            'temperature': float(input_data.temperature),
            'humidity': float(input_data.humidity),
            'ph': float(input_data.pH),
            'rainfall': float(input_data.rainfall)
        }
        
        # Convert to DataFrame with correct column order
        X = pd.DataFrame([data_dict])[self.feature_columns]
        
        # Get probabilities
        probabilities = self.model.predict_proba(X)[0]
        
        # Get top K indices
        top_k_indices = np.argsort(probabilities)[-top_k:][::-1]
        
        # Map indices to crop names and create recommendation items
        recommendations = []
        for idx in top_k_indices:
            crop_name = self.le.classes_[idx]
            confidence = float(probabilities[idx])
            recommendations.append(CropRecommendationItem(crop=crop_name, confidence=confidence))
            
        return recommendations

# Singleton instance
_model_instance = None

async def recommend_crop(
    input_data: CropRecommendationInput, 
    user_id: str = None,
    supabase = None
) -> CropRecommendationOutput:
    global _model_instance
    if _model_instance is None:
        _model_instance = CropRecommendationModel()
    
    # Run CPU-bound prediction in a threadpool to avoid blocking event loop
    recommendations = await run_in_threadpool(_model_instance.predict, input_data)
    
    if user_id and supabase and len(recommendations) > 0:
        try:
            top_rec = recommendations[0]
            recs_dict = [{"crop": r.crop, "confidence": r.confidence} for r in recommendations]
            
            supabase.table("crop_recommendations").insert({
                "user_id": user_id,
                "top_crop": top_rec.crop,
                "confidence": top_rec.confidence,
                "recommendations_json": recs_dict
            }).execute()
        except Exception as e:
            logger.error(f"Failed to persist crop recommendation: {e}")
            
    # Generate AI Explanation
    from app.services.chatbot_service import explain_prediction
    top_crops = [r.crop for r in recommendations]
    ai_explanation = await explain_prediction(
        prediction_type="Crop Recommendation",
        input_data=input_data.model_dump(),
        result={"recommended_crops": top_crops}
    )
    
    return CropRecommendationOutput(
        recommendations=recommendations,
        ai_explanation=ai_explanation
    )

