from pydantic import BaseModel, Field
from typing import List

class CropRecommendationInput(BaseModel):
    N: float = Field(..., description="Nitrogen content (mg/kg)")
    P: float = Field(..., description="Phosphorus content (mg/kg)")
    K: float = Field(..., description="Potassium content (mg/kg)")
    pH: float = Field(..., description="Soil pH level")
    temperature: float = Field(..., description="Temperature in °C")
    humidity: float = Field(..., description="Humidity percentage")
    rainfall: float = Field(..., description="Rainfall (mm)")

class CropRecommendationItem(BaseModel):
    crop: str
    confidence: float

class CropRecommendationOutput(BaseModel):
    recommendations: List[CropRecommendationItem]

class FertilizerRecommendationInput(BaseModel):
    N: float = Field(..., description="Nitrogen content (mg/kg)")
    P: float = Field(..., description="Phosphorus content (mg/kg)")
    K: float = Field(..., description="Potassium content (mg/kg)")
    temperature: float = Field(..., description="Temperature in °C")
    humidity: float = Field(..., description="Humidity percentage")
    pH: float = Field(..., description="Soil pH level")
    rainfall: float = Field(..., description="Rainfall (mm)")

class FertilizerRecommendationOutput(BaseModel):
    fertilizer: str
    dosage: str
    notes: str
