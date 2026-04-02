from fastapi import APIRouter, Depends
from app.schemas.recommend import (
    CropRecommendationInput, CropRecommendationOutput,
    FertilizerRecommendationInput, FertilizerRecommendationOutput
)
from app.services import crop_service, fertilizer_service

router = APIRouter(prefix="/recommend", tags=["Recommendation"])

@router.post("/crop", response_model=CropRecommendationOutput)
async def recommend_crop_endpoint(input_data: CropRecommendationInput):
    return await crop_service.recommend_crop(input_data)

@router.post("/fertilizer", response_model=FertilizerRecommendationOutput)
async def recommend_fertilizer_endpoint(input_data: FertilizerRecommendationInput):
    return await fertilizer_service.recommend_fertilizer(input_data)
