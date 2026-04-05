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
        # Get latest fertilizer recommendations
        fert_res = db.table("fertilizer_recommendations").select("*").eq("user_id", user_id).order("created_at", desc=True).limit(5).execute()
        # Get latest disease detections
        disease_res = db.table("disease_detections").select("*").eq("user_id", user_id).order("created_at", desc=True).limit(5).execute()
        
        return {
            "yield_predictions": yield_res.data,
            "crop_recommendations": crop_res.data,
            "fertilizer_recommendations": fert_res.data,
            "disease_detections": disease_res.data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to retrieve history summary")

@router.get("/full")
async def get_history_full(
    current_user: dict = Depends(get_current_user),
    db: Client = Depends(get_db)
):
    user_id = current_user.get("sub")
    try:
        yield_res = db.table("yield_predictions").select("*").eq("user_id", user_id).order("created_at", desc=True).limit(100).execute()
        crop_res = db.table("crop_recommendations").select("*").eq("user_id", user_id).order("created_at", desc=True).limit(100).execute()
        fert_res = db.table("fertilizer_recommendations").select("*").eq("user_id", user_id).order("created_at", desc=True).limit(100).execute()
        disease_res = db.table("disease_detections").select("*").eq("user_id", user_id).order("created_at", desc=True).limit(100).execute()
        
        return {
            "yield_predictions": yield_res.data,
            "crop_recommendations": crop_res.data,
            "fertilizer_recommendations": fert_res.data,
            "disease_detections": disease_res.data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to retrieve full history")

@router.get("/trends")
async def get_soil_trends(
    current_user: dict = Depends(get_current_user),
    db: Client = Depends(get_db)
):
    """Returns combined soil parameter trends from all historical records."""
    user_id = current_user.get("sub")
    try:
        # Fetch data from multiple sources to reconstruct soil history
        crops = db.table("crop_recommendations").select("created_at, N, P, K, pH").eq("user_id", user_id).order("created_at").execute()
        ferts = db.table("fertilizer_recommendations").select("created_at, N, P, K, pH").eq("user_id", user_id).order("created_at").execute()
        
        combined = []
        for item in crops.data:
            if item.get("N") is not None:
                combined.append({"date": item["created_at"], "N": item["N"], "P": item["P"], "K": item["K"], "pH": item["pH"], "source": "crop"})
        
        for item in ferts.data:
            if item.get("N") is not None:
                combined.append({"date": item["created_at"], "N": item["N"], "P": item["P"], "K": item["K"], "pH": item["pH"], "source": "fert"})
        
        # Sort by date
        combined.sort(key=lambda x: x["date"])
        
        return combined
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to retrieve soil trends")

