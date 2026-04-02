from fastapi import APIRouter, Depends, Query
from app.schemas.market import MarketPriceOutput
from app.services import market_service

router = APIRouter(prefix="/market", tags=["Market"])

@router.get("/prices", response_model=MarketPriceOutput)
async def fetch_market_prices_endpoint(
    crop: str = Query(..., description="Crop name"), 
    state: str = Query(..., description="State name")
):
    return await market_service.fetch_market_prices(crop, state)
