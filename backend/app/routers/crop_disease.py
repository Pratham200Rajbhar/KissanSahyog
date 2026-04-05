from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.crop_disease_service import crop_disease_service
import io
import logging

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/crop-disease",
    tags=["crop-disease"]
)

@router.post("/predict")
async def predict_disease(image: UploadFile = File(...)):
    """Predicts crop disease from an uploaded image."""
    if not image.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image.")

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
            
        return {
            "status": "success",
            "predictions": results,
            "ai_insights": ai_insights
        }
    except Exception as e:
        logger.error(f"Error in predict_disease router: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
