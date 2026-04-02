from pydantic import BaseModel, ConfigDict, Field
from typing import Dict

class YieldPredictionInput(BaseModel):
    model_config = ConfigDict(strict=True)

    crop: str
    state_name: str
    dist_name: str
    area_ha: float
    temperature_c: float
    humidity_pct: float = Field(alias="humidity_percentage")
    rainfall_mm: float
    wind_speed_m_s: float
    solar_radiation_mj_m2_day: float
    n_req_kg_per_ha: float
    p_req_kg_per_ha: float
    k_req_kg_per_ha: float

class YieldPredictionOutput(BaseModel):
    predicted_yield: float
    unit: str
    risk_score: float
    shap_values: Dict[str, float]
