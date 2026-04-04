from fastapi import APIRouter, Depends
from app.schemas.predict import YieldPredictionInput, YieldPredictionOutput
from app.services import yield_service
from app.core.security import get_current_user
from app.core.dependencies import get_db
from supabase import Client

router = APIRouter(prefix="/predict", tags=["Prediction"])

@router.post("/yield", response_model=YieldPredictionOutput)
async def predict_yield_endpoint(
    input_data: YieldPredictionInput,
    current_user: dict = Depends(get_current_user),
    db: Client = Depends(get_db)
):
    user_id = current_user.get("sub")
    return await yield_service.predict_yield(input_data, user_id, db)
