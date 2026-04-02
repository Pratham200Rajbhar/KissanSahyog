from fastapi import APIRouter, Depends, UploadFile, File, Form
from app.schemas.detect import DiseaseDetectionOutput
from app.services import disease_service

router = APIRouter(prefix="/detect", tags=["Detection"])

@router.post("/disease", response_model=DiseaseDetectionOutput)
async def detect_disease_endpoint(
    image: UploadFile = File(...),
    crop_type: str = Form(...)
):
    return await disease_service.detect_disease(image, crop_type)
