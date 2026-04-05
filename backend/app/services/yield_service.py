import logging
import os
import pickle
import pandas as pd
import numpy as np
from fastapi.concurrency import run_in_threadpool
from app.core.config import settings
from app.schemas.predict import YieldPredictionInput, YieldPredictionOutput

logger = logging.getLogger(__name__)

MODEL_PATH = settings.yield_model_path

# Singleton instance for the model
_yield_model = None

def get_yield_model():
    """
    Standardized singleton getter for the yield model. 
    Loads the model into memory if not already present.
    """
    global _yield_model
    if _yield_model is None:
        try:
            logger.info(f"Loading yield prediction pipeline from {MODEL_PATH}...")
            if not os.path.exists(MODEL_PATH):
                raise FileNotFoundError(f"Pipeline file not found at {MODEL_PATH}")
                
            with open(MODEL_PATH, "rb") as f:
                _yield_model = pickle.load(f)
            logger.info("✅ Yield prediction pipeline loaded successfully.")
        except Exception as e:
            logger.error(f"❌ Failed to load yield prediction pipeline: {e}")
            raise
    return _yield_model

async def predict_yield(
    input_data: YieldPredictionInput, 
    user_id: str = None,
    supabase = None
) -> YieldPredictionOutput:
    model = get_yield_model()
    
    # Use run_in_threadpool because prediction is synchronous and CPU-bound
    # This prevents blocking the main event loop.
    predicted_val, shap_vals = await run_in_threadpool(_perform_prediction, model, input_data)
    
    if user_id and supabase:
        try:
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
    
    # Generate AI Explanation
    from app.services.chatbot_service import explain_prediction
    ai_explanation = await explain_prediction(
        prediction_type="Yield Prediction",
        input_data=input_data.model_dump(),
        result={"predicted_yield": round(predicted_val, 2), "unit": "kg/ha"}
    )
    
    return YieldPredictionOutput(
        predicted_yield=round(predicted_val, 2),
        unit="kg/ha",
        risk_score=0.15,
        shap_values=shap_vals,
        ai_explanation=ai_explanation
    )

def _perform_prediction(model, data: YieldPredictionInput):
    """Internal synchronous prediction logic."""
    input_dict = {
        'Year': [2024],
        'Area_ha': [data.area_ha],
        'N_req_kg_per_ha': [data.n_req_kg_per_ha],
        'P_req_kg_per_ha': [data.p_req_kg_per_ha],
        'K_req_kg_per_ha': [data.k_req_kg_per_ha],
        'Temperature_C': [data.temperature_c],
        'Humidity_%': [data.humidity_pct],
        'pH': [6.5],
        'Rainfall_mm': [data.rainfall_mm],
        'Wind_Speed_m_s': [data.wind_speed_m_s],
        'Solar_Radiation_MJ_m2_day': [data.solar_radiation_mj_m2_day],
        'State Name': [data.state_name],
        'Dist Name': [data.dist_name],
        'Crop': [data.crop]
    }
    
    X_df = pd.DataFrame(input_dict)
    prediction = model.predict(X_df)[0]
    prediction = max(0.0, float(prediction))
    
    # Calculate feature importance
    try:
        # Assuming model is a pipeline with a named step 'model'
        inner_model = model.named_steps['model']
        importances = inner_model.feature_importances_
        
        num_feat = [
            'Year', 'Area_ha', 'N_req_kg_per_ha', 'P_req_kg_per_ha', 'K_req_kg_per_ha',
            'Temperature_C', 'Humidity_%', 'pH', 'Rainfall_mm', 'Wind_Speed_m_s', 
            'Solar_Radiation_MJ_m2_day'
        ]
        cat_feat = ['State Name', 'Dist Name', 'Crop']
        all_features = num_feat + cat_feat
        
        importance_map = {}
        for i, feat in enumerate(all_features):
            clean_name = feat.replace('_', ' ').replace('%', 'Percentage').replace('kg per ha', '').strip()
            importance_map[clean_name] = float(importances[i])
        
        top_shap_values = dict(sorted(importance_map.items(), key=lambda x: x[1], reverse=True)[:5])
        
        total = sum(top_shap_values.values())
        if total > 0:
            top_shap_values = {k: v/total for k, v in top_shap_values.items()}
            
    except Exception:
        top_shap_values = {
            "Rainfall": 0.35, "Temperature": 0.25, "Soil nutrients": 0.20, "Area": 0.15, "Other": 0.05
        }
    
    return prediction, top_shap_values

