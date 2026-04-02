from fastapi import APIRouter, Query
from app.services import weather_service

router_weather = APIRouter(prefix="/weather", tags=["Weather"])

@router_weather.get("")
async def get_weather_endpoint(
    lat: float = Query(...), 
    lon: float = Query(...)
):
    return await weather_service.get_weather(lat, lon)
