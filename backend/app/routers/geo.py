import asyncio
import httpx
import traceback
from fastapi import APIRouter, Query, HTTPException, Depends
from typing import Dict, Any
from app.services.weather_service import get_nasa_averages
from app.services.environmental_service import get_comprehensive_environmental_data
from app.core.security import get_current_user
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/geo", tags=["Geocoding"], dependencies=[Depends(get_current_user)])

@router.get("/reverse")
async def reverse_geocode(lat: float = Query(...), lon: float = Query(...)) -> Dict[str, Any]:
    """
    Reverse geocode latitude and longitude to State and District using Nominatim,
    and fetch recent environmental averages (Soil & Meteo).
    """
    # Using centralized Nominatim Source URL from settings
    base_url = settings.geo_nominatim_source_url
    url = f"{base_url}?format=json&lat={lat}&lon={lon}&zoom=10&addressdetails=1"
    headers = {"User-Agent": "AgriAI/1.0"}
    
    async with httpx.AsyncClient() as client:
        try:
            # 1. Fetch Location Details
            geo_response = await client.get(url, headers=headers, timeout=12.0)
            geo_response.raise_for_status()
            geo_data = geo_response.json()
            
            address = geo_data.get("address", {})
            state = address.get("state")
            if not state:
                raise HTTPException(status_code=404, detail="State not identified for these coordinates")
                
            district = (address.get("district") or 
                        address.get("county") or 
                        address.get("city") or 
                        address.get("town") or 
                        address.get("suburb"))

            # 2. Parallel fetch NASA and GEE/Meteo data
            nasa_task = get_nasa_averages(lat, lon)
            env_task = get_comprehensive_environmental_data(lat, lon)
            
            nasa_data, env_data = await asyncio.gather(nasa_task, env_task)
            
            nasa_vals = nasa_data or {}
            env_vals = env_data or {}

            return {
                "state": state,
                "district": district or "Unknown",
                "full_address": geo_data.get("display_name", ""),
                # Climate (NASA)
                "temperature": nasa_vals.get("avg_temp"),
                "humidity": nasa_vals.get("avg_humidity"),
                "rainfall": nasa_vals.get("avg_rainfall"),
                # Environmental (GEE + Open-Meteo)
                "nitrogen": env_vals.get("nitrogen"),
                "phosphorus": env_vals.get("phosphorus"),
                "potassium": env_vals.get("potassium"),
                "ph": env_vals.get("ph"),
                "clay": env_vals.get("clay"),
                "carbon": env_vals.get("carbon"),
                "wind_speed": env_vals.get("wind_speed"),
                "solar_radiation": env_vals.get("solar_radiation")
            }
            
        except httpx.HTTPStatusError as hse:
            status_code = hse.response.status_code
            error_msg = hse.response.text
            logger.error(f"External API failed with {status_code}: {error_msg}")
            
            if status_code == 429:
                raise HTTPException(status_code=429, detail="Location service rate limit exceeded. Please wait a moment.")
            elif status_code == 403:
                raise HTTPException(status_code=403, detail="Location service access denied. Please check User-Agent or API limits.")
            else:
                raise HTTPException(status_code=status_code, detail=f"External service error ({status_code})")
                
        except HTTPException as he:
            raise he
        except Exception as e:
            logger.critical(f"Geocoding orchestration failed for ({lat}, {lon}): {e}", exc_info=True)
            raise HTTPException(status_code=500, detail="Internal orchestration failure during location sync")



