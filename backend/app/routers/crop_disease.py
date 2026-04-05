from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from app.services.crop_disease_service import crop_disease_service
from app.core.security import get_current_user
from app.core.dependencies import get_db
from supabase import Client
import io
import logging

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/crop-disease",
    tags=["crop-disease"]
)

@router.post("/predict")
async def predict_disease(
    image: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
    db: Client = Depends(get_db)
):
    """Predicts crop disease from an uploaded image and saves to history."""
    if not image.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image.")

    user_id = current_user.get("sub")

    try:
        content = await image.read()
        image_bytes = io.BytesIO(content)
        
        results = crop_disease_service.predict(image_bytes)
        
        if isinstance(results, dict) and "error" in results:
            raise HTTPException(status_code=500, detail=results["error"])
            
        # Get AI insights for the top prediction
        ai_insights = None
        if results and len(results) > 0:
            top_disease = results[0]["class"]
            ai_insights = await crop_disease_service.get_disease_insights(top_disease)
            
            # Persist to history
            try:
                db.table("disease_detections").insert({
                    "user_id": user_id,
                    "predictions": results,
                    "ai_insights": ai_insights
                }).execute()
                logger.info(f"✅ Disease detection history saved for user {user_id}")
            except Exception as db_err:
                logger.error(f"❌ Failed to save disease detection history: {db_err}")
            
        return {
            "status": "success",
            "predictions": results,
            "ai_insights": ai_insights
        }
    except Exception as e:
        logger.error(f"Error in predict_disease router: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
