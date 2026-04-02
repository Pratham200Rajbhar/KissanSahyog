import os
import joblib
import numpy as np
import pandas as pd
from app.schemas.recommend import CropRecommendationInput, CropRecommendationOutput, CropRecommendationItem

# Model path with trailing space as found in filesystem
MODEL_PATH = "/disk2/conv/backend/app/models/crop_recommendation /"

class CropRecommendationModel:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(CropRecommendationModel, cls).__new__(cls)
            cls._instance._load_artifacts()
        return cls._instance

    def _load_artifacts(self):
        print("DEBUG: Loading Crop Recommendation artifacts...")
        try:
            # Load the best model and the label encoder
            self.model = joblib.load(os.path.join(MODEL_PATH, "crop_model.pkl"))
            self.le = joblib.load(os.path.join(MODEL_PATH, "npk_label_encoder.pkl"))
            
            # Features order as confirmed via inspection
            self.feature_columns = ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']
        except Exception as e:
            print(f"ERROR: Failed to load crop recommendation models: {e}")
            raise

    def predict(self, input_data: CropRecommendationInput, top_k: int = 3):
        # Prepare feature vector (mapping pH to ph as required by the model)
        data_dict = {
            'N': input_data.N,
            'P': input_data.P,
            'K': input_data.K,
            'temperature': input_data.temperature,
            'humidity': input_data.humidity,
            'ph': input_data.pH,
            'rainfall': input_data.rainfall
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

async def recommend_crop(input_data: CropRecommendationInput) -> CropRecommendationOutput:
    global _model_instance
    if _model_instance is None:
        _model_instance = CropRecommendationModel()
        
    recommendations = _model_instance.predict(input_data)
    
    return CropRecommendationOutput(recommendations=recommendations)

