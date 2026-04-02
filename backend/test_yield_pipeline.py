import asyncio
import sys
import os

# Add app to path
sys.path.append("/disk2/conv/backend")

from app.services.yield_service import predict_yield
from app.schemas.predict import YieldPredictionInput

async def test_prediction():
    # Mock data matching frontend
    mock_input = YieldPredictionInput(
        crop="rice",
        state_name="Maharashtra",
        dist_name="Pune",
        area_ha=1.5,
        temperature_c=28.5,
        humidity_percentage=75.0,
        rainfall_mm=1200.0,
        wind_speed_m_s=3.4,
        solar_radiation_mj_m2_day=18.5,
        n_req_kg_per_ha=120.0,
        p_req_kg_per_ha=60.0,
        k_req_kg_per_ha=40.0
    )
    
    print(f"Testing prediction for: {mock_input.crop} in {mock_input.state_name}")
    try:
        result = await predict_yield(mock_input)
        print(f"✅ Prediction Successful!")
        print(f"Predicted Yield: {result.predicted_yield} {result.unit}")
        print(f"Top Insights: {result.shap_values}")
    except Exception as e:
        print(f"❌ Prediction Failed: {e}")

if __name__ == "__main__":
    asyncio.run(test_prediction())
