from pydantic import BaseModel
from typing import List

class PriceTrendItem(BaseModel):
    date: str
    price: float

class MarketPriceOutput(BaseModel):
    crop: str
    price_per_quintal: float
    trend: List[PriceTrendItem]
