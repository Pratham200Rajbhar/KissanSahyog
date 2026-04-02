from fastapi import APIRouter, Depends
from app.schemas.schedule import IrrigationScheduleInput, IrrigationScheduleOutput
from app.services import irrigation_service

router = APIRouter(prefix="/schedule", tags=["Schedule"])

@router.post("/irrigation", response_model=IrrigationScheduleOutput)
async def schedule_irrigation_endpoint(input_data: IrrigationScheduleInput):
    return await irrigation_service.schedule_irrigation(input_data)
