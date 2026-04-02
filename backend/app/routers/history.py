from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, List, Any
from app.core.security import get_current_user
from app.core.supabase_client import get_supabase_client

router = APIRouter(prefix="/history", tags=["History"], dependencies=[Depends(get_current_user)])

@router.get("/summary")
async def get_history_summary(current_user: dict = Depends(get_current_user)):
    user_id = current_user.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="User ID not found in token")

    supabase = get_supabase_client()
    try:
        # Get latest yield prediction
        yield_res = supabase.table("yield_predictions").select("*").eq("user_id", user_id).order("created_at", desc=True).limit(5).execute()
        
        # Get latest disease detections
        disease_res = supabase.table("disease_detections").select("*").eq("user_id", user_id).order("created_at", desc=True).limit(5).execute()
        
        # Get latest crop recommendations
        crop_res = supabase.table("crop_recommendations").select("*").eq("user_id", user_id).order("created_at", desc=True).limit(5).execute()
        
        return {
            "yield_predictions": yield_res.data,
            "disease_detections": disease_res.data,
            "crop_recommendations": crop_res.data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/full")
async def get_history_full(current_user: dict = Depends(get_current_user)):
    user_id = current_user.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="User ID not found in token")

    supabase = get_supabase_client()
    try:
        # Get all history up to 1000 items
        yield_res = supabase.table("yield_predictions").select("*").eq("user_id", user_id).order("created_at", desc=True).limit(1000).execute()
        disease_res = supabase.table("disease_detections").select("*").eq("user_id", user_id).order("created_at", desc=True).limit(1000).execute()
        crop_res = supabase.table("crop_recommendations").select("*").eq("user_id", user_id).order("created_at", desc=True).limit(1000).execute()
        
        return {
            "yield_predictions": yield_res.data,
            "disease_detections": disease_res.data,
            "crop_recommendations": crop_res.data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
