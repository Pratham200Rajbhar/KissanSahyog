import httpx
import pandas as pd
import traceback
from datetime import datetime
from typing import Dict, Any

async def _fetch_nasa_data(lat: float, lon: float) -> Dict[str, Any]:
    """
    Fetch comprehensive environmental data from NASA POWER API (2000-Present).
    Standardized to match the validated test script (nasa_api.py).
    """
    # Define date range: last ~14 days (to ensure we get at least 7 valid days, accounting for lag)
    end_date_dt = datetime.today()
    start_date_dt = end_date_dt - pd.Timedelta(days=14)
    
    start_date = start_date_dt.strftime("%Y%m%d")
    end_date = end_date_dt.strftime("%Y%m%d")
    
    url = f"https://power.larc.nasa.gov/api/temporal/daily/point?parameters=T2M,PRECTOTCORR,RH2M&community=AG&longitude={lon}&latitude={lat}&start={start_date}&end={end_date}&format=JSON"
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url, timeout=30.0)
            response.raise_for_status()
            data = response.json()
            
            # Accessing properties/parameter as per nasa_api.py
            p = data.get('properties', {}).get('parameter', {})
            if not p or 'T2M' not in p:
                print(f"WARNING: NASA data incomplete for ({lat}, {lon})")
                return None

            # Standardized DataFrame creation
            df = pd.DataFrame({
                'date': list(p.get('T2M', {}).keys()),
                'temp': list(p.get('T2M', {}).values()),
                'rain': list(p.get('PRECTOTCORR', {}).values()),
                'hum': list(p.get('RH2M', {}).values())
            })
            
            # Convert date column to datetime
            df['date'] = pd.to_datetime(df['date'])
            
            # Replace -999 with NaN as per nasa_api.py
            df.replace(-999.0, pd.NA, inplace=True)
            
            # Drop rows with missing values
            df = df.dropna()
            
            # Sort by date (just in case)
            df = df.sort_values('date')
            
            # Take the last 7 valid days
            last_7_valid = df.tail(7)
            
            if last_7_valid.empty:
                return None
            
            # Calculate Averages matching the dashboard needs
            avg_temp = round(float(last_7_valid['temp'].mean()), 2)
            avg_hum = round(float(last_7_valid['hum'].mean()), 2)
            avg_rainfall = round(float(last_7_valid['rain'].mean()), 2)
            
            return {
                "avg_temp": avg_temp,
                "avg_humidity": avg_hum,
                "avg_rainfall": avg_rainfall,
                "days_sampled": len(last_7_valid)
            }
        except Exception as e:
            error_trace = traceback.format_exc()
            print(f"ERROR: NASA service failure: {str(e)}\n{error_trace}")
            return None

async def get_weather(lat: float, lon: float) -> Dict[str, Any]:
    """Public API for dashboard weather context."""
    d = await _fetch_nasa_data(lat, lon)
    if not d:
        return None
    
    return {
        "temperature": d.get("avg_temp"),
        "humidity": d.get("avg_humidity"),
        "rainfall": d.get("avg_rainfall"),
        "wind_speed": 2.5,
        "description": "7-Day NASA Average"
    }

async def get_nasa_averages(lat: float, lon: float) -> Dict[str, Any]:
    """Public utility for location sync."""
    return await _fetch_nasa_data(lat, lon)
