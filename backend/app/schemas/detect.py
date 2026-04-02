from pydantic import BaseModel

class DiseaseDetectionOutput(BaseModel):
    disease: str
    confidence: float
    remedy: str
