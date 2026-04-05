import os
import logging
import joblib
import pandas as pd
from fastapi.concurrency import run_in_threadpool
from supabase import Client
from app.core.config import settings
from app.schemas.recommend import FertilizerRecommendationInput, FertilizerRecommendationOutput

logger = logging.getLogger(__name__)

# Cache for models
_model = None
_le = None
_columns = None

# Model Directory setup
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_DIR = os.path.join(BASE_DIR, "models", "fertilizer_recommendation")

def get_fertilizer_model():
    global _model, _le, _columns
    if _model is None:
        try:
            # Load into local variables first to ensure atomicity
            model = joblib.load(os.path.join(MODEL_DIR, "fertilizer_model.pkl"))
            le = joblib.load(os.path.join(MODEL_DIR, "label_encoder.pkl"))
            columns = joblib.load(os.path.join(MODEL_DIR, "columns.pkl"))
            
            # Update globals only after all loads succeed
            _model = model
            _le = le
            _columns = columns
            logger.info("✅ Fertilizer recommendation models loaded successfully.")
        except Exception as e:
            logger.error(f"❌ Failed to load fertilizer recommendation models: {e}")
            raise
    return _model, _le, _columns


def _predict_sync(input_data: FertilizerRecommendationInput):
    model, le, columns = get_fertilizer_model()
    
    # Input Processing: Use exact farmer values as entered
    input_dict = {
        'N': float(input_data.N),
        'P': float(input_data.P),
        'K': float(input_data.K),
        'temperature': float(input_data.temperature),
        'humidity': float(input_data.humidity),
        'ph': float(input_data.pH),
        'rainfall': float(input_data.rainfall)
    }
    
    # Needs a 2D array or dataframe for xgboost
    df = pd.DataFrame([input_dict], columns=columns)
    
    prediction = model.predict(df)
    predicted_fertilizer = le.inverse_transform(prediction)[0]
    return predicted_fertilizer

async def recommend_fertilizer(input_data: FertilizerRecommendationInput, user_id: str = None, db: Client = None) -> FertilizerRecommendationOutput:
    # Run CPU-bound prediction in a threadpool
    predicted_fertilizer = await run_in_threadpool(_predict_sync, input_data)
    
    # Generate AI Explanation
    from app.services.chatbot_service import explain_prediction
    ai_explanation = await explain_prediction(
        prediction_type="Fertilizer Recommendation",
        input_data=input_data.model_dump(),
        result={"recommended_fertilizer": predicted_fertilizer}
    )
    
    # Save to history if DB and User are provided
    if db and user_id:
        try:
            db.table("fertilizer_recommendations").insert({
                "user_id": user_id,
                "fertilizer": predicted_fertilizer,
                "dosage": "As per deficiency",
                "notes": f"Predicted optimal fertilizer formulation is {predicted_fertilizer}.",
                "ai_explanation": ai_explanation,
                "N": float(input_data.N),
                "P": float(input_data.P),
                "K": float(input_data.K),
                "pH": float(input_data.pH),
                "temperature": float(input_data.temperature),
                "humidity": float(input_data.humidity),
                "rainfall": float(input_data.rainfall)
            }).execute()
            logger.info(f"✅ Fertilizer recommendation saved for user {user_id}")
        except Exception as e:
            logger.error(f"❌ Failed to save fertilizer history for user {user_id}: {e}")

    return FertilizerRecommendationOutput(
        fertilizer=predicted_fertilizer,
        dosage="Please adjust dosage based on soil deficiency tests.",
        notes=f"Predicted optimal fertilizer formulation is {predicted_fertilizer} based on given soil parameters.",
        ai_explanation=ai_explanation
    )

