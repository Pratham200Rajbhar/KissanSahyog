from fastapi import APIRouter, Query, Depends
from app.services import weather_service
from app.core.security import get_current_user

router_weather = APIRouter(prefix="/weather", tags=["Weather"], dependencies=[Depends(get_current_user)])

@router_weather.get("")
async def get_weather_endpoint(
    lat: float = Query(...), 
    lon: float = Query(...)
):
    return await weather_service.get_weather(lat, lon)
