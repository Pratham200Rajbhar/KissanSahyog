from pydantic import BaseModel, ConfigDict, Field
from typing import Dict

class YieldPredictionInput(BaseModel):
    model_config = ConfigDict(strict=True)

    crop: str = Field(..., min_length=1)
    state_name: str = Field(..., min_length=1)
    dist_name: str = Field(..., min_length=1)
    area_ha: float = Field(..., gt=0)
    temperature_c: float = Field(..., ge=-10, le=60)
    humidity_pct: float = Field(..., ge=0, le=100, alias="humidity_percentage")
    rainfall_mm: float = Field(..., ge=0, le=10000)
    wind_speed_m_s: float = Field(..., ge=0, le=100)
    solar_radiation_mj_m2_day: float = Field(..., ge=0, le=50)
    n_req_kg_per_ha: float = Field(..., ge=0)
    p_req_kg_per_ha: float = Field(..., ge=0)
    k_req_kg_per_ha: float = Field(..., ge=0)

class YieldPredictionOutput(BaseModel):
    predicted_yield: float
    unit: str
    risk_score: float
    shap_values: Dict[str, float]
