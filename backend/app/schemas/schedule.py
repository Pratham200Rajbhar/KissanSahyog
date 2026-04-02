from pydantic import BaseModel
from typing import List

class IrrigationScheduleInput(BaseModel):
    temperature: float
    humidity: float
    wind_speed: float
    solar_radiation: float
    soil_moisture: float
    rainfall: float
    crop_stage: str

class IrrigationDay(BaseModel):
    day: str
    irrigate: bool
    amount_mm: float

class IrrigationScheduleOutput(BaseModel):
    schedule: List[IrrigationDay]
