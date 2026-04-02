from fastapi import APIRouter, Depends, UploadFile, File, Form
from app.schemas.detect import DiseaseDetectionOutput
from app.services import disease_service
from app.core.security import get_current_user

router = APIRouter(prefix="/detect", tags=["Detection"], dependencies=[Depends(get_current_user)])

@router.post("/disease", response_model=DiseaseDetectionOutput)
async def detect_disease_endpoint(
    image: UploadFile = File(...),
    crop_type: str = Form(...),
    current_user: dict = Depends(get_current_user)
):
    user_id = current_user.get("sub")
    return await disease_service.detect_disease(image, crop_type, user_id)
