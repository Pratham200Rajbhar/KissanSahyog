from fastapi import APIRouter, Depends
from app.schemas.recommend import (
    CropRecommendationInput, CropRecommendationOutput,
    FertilizerRecommendationInput, FertilizerRecommendationOutput
)
from app.services import crop_service, fertilizer_service
from app.core.security import get_current_user
from app.core.dependencies import get_db
from supabase import Client

router = APIRouter(prefix="/recommend", tags=["Recommendation"], dependencies=[Depends(get_current_user)])

@router.post("/crop", response_model=CropRecommendationOutput)
async def recommend_crop_endpoint(
    input_data: CropRecommendationInput,
    current_user: dict = Depends(get_current_user),
    db: Client = Depends(get_db)
):
    user_id = current_user.get("sub")
    return await crop_service.recommend_crop(input_data, user_id, db)

@router.post("/fertilizer", response_model=FertilizerRecommendationOutput)
async def recommend_fertilizer_endpoint(input_data: FertilizerRecommendationInput):
    return await fertilizer_service.recommend_fertilizer(input_data)
