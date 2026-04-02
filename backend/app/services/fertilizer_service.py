import os
import joblib
import pandas as pd
from app.schemas.recommend import FertilizerRecommendationInput, FertilizerRecommendationOutput

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_DIR = os.path.join(BASE_DIR, "models", "fertilizer_recommendation")

_model = None
_le = None
_columns = None

def get_fertilizer_model():
    global _model, _le, _columns
    if _model is None:
        # Load model, label encoder, and features columns
        _model = joblib.load(os.path.join(MODEL_DIR, "fertilizer_model.pkl"))
        _le = joblib.load(os.path.join(MODEL_DIR, "label_encoder.pkl"))
        _columns = joblib.load(os.path.join(MODEL_DIR, "columns.pkl"))
    return _model, _le, _columns


async def recommend_fertilizer(input_data: FertilizerRecommendationInput) -> FertilizerRecommendationOutput:
    model, le, columns = get_fertilizer_model()
    
    input_dict = {
        'N': input_data.N,
        'P': input_data.P,
        'K': input_data.K,
        'temperature': input_data.temperature,
        'humidity': input_data.humidity,
        'ph': input_data.pH,
        'rainfall': input_data.rainfall
    }
    
    # Needs a 2D array or dataframe for xgboost
    df = pd.DataFrame([input_dict], columns=columns)
    
    prediction = model.predict(df)
    predicted_fertilizer = le.inverse_transform(prediction)[0]
    
    return FertilizerRecommendationOutput(
        fertilizer=predicted_fertilizer,
        dosage="Please adjust dosage based on soil deficiency tests.",
        notes=f"Predicted optimal fertilizer formulation is {predicted_fertilizer} based on given soil parameters."
    )
