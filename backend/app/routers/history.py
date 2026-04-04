from fastapi import APIRouter, Depends, HTTPException
from app.core.security import get_current_user
from app.core.dependencies import get_db
from supabase import Client

router = APIRouter(prefix="/history", tags=["History"], dependencies=[Depends(get_current_user)])

@router.get("/summary")
async def get_history_summary(
    current_user: dict = Depends(get_current_user),
    db: Client = Depends(get_db)
):
    user_id = current_user.get("sub")
    try:
        # Get latest yield prediction
        yield_res = db.table("yield_predictions").select("*").eq("user_id", user_id).order("created_at", desc=True).limit(5).execute()
        
        # Get latest crop recommendations
        crop_res = db.table("crop_recommendations").select("*").eq("user_id", user_id).order("created_at", desc=True).limit(5).execute()
        
        return {
            "yield_predictions": yield_res.data,
            "crop_recommendations": crop_res.data
        }
    except Exception as e:
        # Let global exception handler handle detailed logging
        raise HTTPException(status_code=500, detail="Failed to retrieve history summary")

@router.get("/full")
async def get_history_full(
    current_user: dict = Depends(get_current_user),
    db: Client = Depends(get_db)
):
    user_id = current_user.get("sub")
    try:
        # Get all history up to 1000 items
        yield_res = db.table("yield_predictions").select("*").eq("user_id", user_id).order("created_at", desc=True).limit(1000).execute()
        crop_res = db.table("crop_recommendations").select("*").eq("user_id", user_id).order("created_at", desc=True).limit(1000).execute()
        
        return {
            "yield_predictions": yield_res.data,
            "crop_recommendations": crop_res.data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to retrieve full history")
