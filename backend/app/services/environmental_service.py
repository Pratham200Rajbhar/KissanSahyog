import ee
import httpx
import logging
import asyncio
from typing import Dict, Any, Optional
from app.core.config import settings

logger = logging.getLogger(__name__)

def _get_soil_value_sync(lat: float, lon: float, asset: str, band: str, divisor: float) -> Optional[float]:
    """Synchronous helper for GEE reduction."""
    try:
        region = ee.Geometry.Point([lon, lat]).buffer(5000)
        img = ee.Image(asset).select(band)
        
        stats = img.reduceRegion(
            reducer=ee.Reducer.mean(),
            geometry=region,
            scale=250,
            maxPixels=1e9
        ).get(band).getInfo()
        
        if stats is None:
            return None
        return round(float(stats) / divisor, 2)
    except Exception as e:
        logger.warning(f"GEE Soil Error ({asset}): {e}")
        return None

async def get_soil_data(lat: float, lon: float) -> Dict[str, Any]:
    """Fetches soil metrics from GEE SoilGrids."""
    metrics = {
        "nitrogen": ("projects/soilgrids-isric/nitrogen_mean", "nitrogen_0-5cm_mean", 100),
        "ph": ("projects/soilgrids-isric/phh2o_mean", "phh2o_0-5cm_mean", 10),
        "potassium": ("projects/soilgrids-isric/cec_mean", "cec_0-5cm_mean", 10),
        "clay": ("projects/soilgrids-isric/clay_mean", "clay_0-5cm_mean", 10),
        "carbon": ("projects/soilgrids-isric/soc_mean", "soc_0-5cm_mean", 10),
    }

    results = {}
    
    # Run GEE calls in threads to avoid blocking event loop
    tasks = []
    for key, (asset, band, divisor) in metrics.items():
        tasks.append(asyncio.to_thread(_get_soil_value_sync, lat, lon, asset, band, divisor))
    
    soil_values = await asyncio.gather(*tasks)
    
    for key, val in zip(metrics.keys(), soil_values):
        results[key] = val

    # Phosphorus estimation logic from agronomic formula for Indian soils
    # P ≈ 12 + 0.5×clay - 0.8×pH
    clay = results.get("clay")
    ph = results.get("ph")
    if clay is not None and ph is not None:
        results["phosphorus"] = round(12 + (0.5 * clay) - (0.8 * ph), 2)
    else:
        results["phosphorus"] = None

    return results

async def get_meteo_data(lat: float, lon: float) -> Dict[str, Any]:
    """Fetches real-time weather metrics from Open-Meteo."""
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                settings.meteo_source_url,
                params={
                    "latitude": lat,
                    "longitude": lon,
                    "current": "wind_speed_10m",
                    "daily": "shortwave_radiation_sum",
                    "wind_speed_unit": "ms",
                    "timezone": "auto"
                },
                timeout=10
            )
            resp.raise_for_status()
            data = resp.json()
            
            return {
                "wind_speed": data.get("current", {}).get("wind_speed_10m"),
                "solar_radiation": data.get("daily", {}).get("shortwave_radiation_sum", [None])[0]
            }
    except Exception as e:
        logger.error(f"Open-Meteo Error: {e}")
        return {"wind_speed": None, "solar_radiation": None}

async def get_comprehensive_environmental_data(lat: float, lon: float) -> Dict[str, Any]:
    """Combines GEE Soil and Open-Meteo data."""
    soil_task = get_soil_data(lat, lon)
    meteo_task = get_meteo_data(lat, lon)
    
    soil_data, meteo_data = await asyncio.gather(soil_task, meteo_task)
    
    return {**soil_data, **meteo_data}
