from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Dict, Any

router = APIRouter(prefix="/admin", tags=["Admin"])

class AlertInput(BaseModel):
    message: str
    district: str

@router.get("/logs", response_model=List[Dict[str, Any]])
async def get_logs_endpoint():
    # Mock list of last 50 prediction log entries
    return [{"id": i, "action": "predict_yield", "timestamp": f"2026-04-02T10:{i:02d}:00Z"} for i in range(1, 51)]

@router.post("/alert")
async def send_alert_endpoint(input_data: AlertInput):
    # Returns test status
    return {"status": "sent"}
