import os
import pickle
import numpy as np
import pandas as pd
import logging
from app.schemas.predict import YieldPredictionInput, YieldPredictionOutput

MODEL_PATH = "/disk2/conv/backend/app/models/yield_prediction/yield_pipeline.pkl"

logger = logging.getLogger(__name__)

class YieldPredictionModel:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(YieldPredictionModel, cls).__new__(cls)
            cls._instance._load_pipeline()
        return cls._instance

    def _load_pipeline(self):
        logger.info(f"Loading yield prediction pipeline from {MODEL_PATH}...")
        try:
            # Check if file exists first
            if not os.path.exists(MODEL_PATH):
                raise FileNotFoundError(f"Pipeline file not found at {MODEL_PATH}")
                
            with open(MODEL_PATH, "rb") as f:
                self.pipeline = pickle.load(f)
            logger.info("✅ Pipeline loaded successfully.")
        except Exception as e:
            logger.error(f"❌ Failed to load yield prediction pipeline: {e}")
            raise

    def predict(self, data: YieldPredictionInput):
        # 1. Map input schema to training features
        # Columns must match EXACTLY what was in the training DataFrame
        # Numerical: Year, Area_ha, N_req_kg_per_ha, P_req_kg_per_ha, K_req_kg_per_ha, 
        #           Temperature_C, Humidity_%, pH, Rainfall_mm, Wind_Speed_m_s, Solar_Radiation_MJ_m2_day
        # Categorical: State Name, Dist Name, Crop

        # Defaults for missing UI fields
        year = 2024
        ph = 6.5
        
        # Prepare data in exact same order and naming as training script (05_train_yield_pipeline.py)
        input_dict = {
            'Year': [year],
            'Area_ha': [data.area_ha],
            'N_req_kg_per_ha': [data.n_req_kg_per_ha],
            'P_req_kg_per_ha': [data.p_req_kg_per_ha],
            'K_req_kg_per_ha': [data.k_req_kg_per_ha],
            'Temperature_C': [data.temperature_c],
            'Humidity_%': [data.humidity_pct],
            'pH': [ph],
            'Rainfall_mm': [data.rainfall_mm],
            'Wind_Speed_m_s': [data.wind_speed_m_s],
            'Solar_Radiation_MJ_m2_day': [data.solar_radiation_mj_m2_day],
            'State Name': [data.state_name],
            'Dist Name': [data.dist_name],
            'Crop': [data.crop]
        }
        
        X_df = pd.DataFrame(input_dict)
        
        # 2. Pipeline handles scaling and encoding internally!
        prediction = self.pipeline.predict(X_df)[0]
            
        prediction = max(0.0, float(prediction))
        
        # 3. Dynamic Feature Importance (using model.feature_importances_)
        try:
            model = self.pipeline.named_steps['model']
            importances = model.feature_importances_
            
            # The order in ColumnTransformer is preserved: num_feat then cat_feat
            num_feat = [
                'Year', 'Area_ha', 'N_req_kg_per_ha', 'P_req_kg_per_ha', 'K_req_kg_per_ha',
                'Temperature_C', 'Humidity_%', 'pH', 'Rainfall_mm', 'Wind_Speed_m_s', 
                'Solar_Radiation_MJ_m2_day'
            ]
            cat_feat = ['State Name', 'Dist Name', 'Crop']
            all_features = num_feat + cat_feat
            
            importance_map = {}
            for i, feat in enumerate(all_features):
                # Clean name for frontend display
                clean_name = feat.replace('_', ' ').replace('%', 'Percentage').replace('kg per ha', '').strip()
                importance_map[clean_name] = float(importances[i])
            
            # Sort and take top 5
            top_shap_values = dict(sorted(importance_map.items(), key=lambda x: x[1], reverse=True)[:5])
            
            # Normalize to sum to 1
            total = sum(top_shap_values.values())
            if total > 0:
                top_shap_values = {k: v/total for k, v in top_shap_values.items()}
                
        except Exception as e:
            logger.warning(f"Failed to extract dynamic importance: {e}. Using fallback.")
            top_shap_values = {
                "Rainfall": 0.35,
                "Temperature": 0.25,
                "Soil nutrients": 0.20,
                "Area": 0.15,
                "Other": 0.05
            }
        
        return prediction, top_shap_values

# Singleton instance
model_instance = None

def get_yield_model():
    global model_instance
    if model_instance is None:
        model_instance = YieldPredictionModel()
    return model_instance

async def predict_yield(input_data: YieldPredictionInput, user_id: str = None) -> YieldPredictionOutput:
    model = get_yield_model()
    predicted_val, shap_vals = model.predict(input_data)
    
    if user_id:
        try:
            from app.core.supabase_client import get_supabase_client
            supabase = get_supabase_client()
            supabase.table("yield_predictions").insert({
                "user_id": user_id,
                "crop": input_data.crop,
                "state_name": input_data.state_name,
                "district_name": input_data.dist_name,
                "area_ha": input_data.area_ha,
                "predicted_yield": round(predicted_val, 2),
                "risk_score": 0.15
            }).execute()
        except Exception as e:
            logger.error(f"Failed to persist yield prediction: {e}")
    
    return YieldPredictionOutput(
        predicted_yield=round(predicted_val, 2),
        unit="kg/ha",
        risk_score=0.15,
        shap_values=shap_vals
    )
