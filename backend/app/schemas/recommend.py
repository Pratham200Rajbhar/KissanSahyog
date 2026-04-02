from pydantic import BaseModel
from typing import List

class CropRecommendationInput(BaseModel):
    N: float
    P: float
    K: float
    pH: float
    temperature: float
    humidity: float
    rainfall: float

class CropRecommendationItem(BaseModel):
    crop: str
    confidence: float

class CropRecommendationOutput(BaseModel):
    recommendations: List[CropRecommendationItem]

class FertilizerRecommendationInput(BaseModel):
    N: float
    P: float
    K: float
    pH: float
    temperature: float
    humidity: float
    rainfall: float

class FertilizerRecommendationOutput(BaseModel):
    fertilizer: str
    dosage: str
    notes: str
