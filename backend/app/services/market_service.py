from app.schemas.market import MarketPriceOutput, PriceTrendItem

async def fetch_market_prices(crop: str, state: str) -> MarketPriceOutput:
    # TODO: Replace with real Agmarknet or other model logic
    return MarketPriceOutput(
        crop=crop.capitalize(),
        price_per_quintal=2125.0,
        trend=[
            PriceTrendItem(date="2026-03-25", price=2100.0),
            PriceTrendItem(date="2026-03-28", price=2110.0),
            PriceTrendItem(date="2026-04-01", price=2125.0),
        ]
    )
