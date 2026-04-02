import time
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from app.core.config import settings

from app.routers import predict, recommend, detect, schedule, market, weather, admin, geo, history

limiter = Limiter(key_func=get_remote_address, default_limits=[f"{settings.rate_limit_per_minute}/minute"])

app = FastAPI(
    title=settings.project_name, 
    version="1.0.0",
    docs_url="/docs"
)

# Exception handler for RateLimit
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Global Exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"error": "Internal Server Error", "status_code": 500, "details": str(exc)},
    )

# CORS middleware
origins = settings.cors_origins.split(",") if isinstance(settings.cors_origins, str) else settings.cors_origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    print(f"INFO: {request.method} {request.url.path} - Completed in {process_time:.4f}s - Status {response.status_code}")
    return response

# Include routers
api_prefix = "/api"
app.include_router(predict.router, prefix=api_prefix)
app.include_router(recommend.router, prefix=api_prefix)
app.include_router(detect.router, prefix=api_prefix)
app.include_router(schedule.router, prefix=api_prefix)
app.include_router(market.router, prefix=api_prefix)
app.include_router(weather.router_weather, prefix=api_prefix)
app.include_router(admin.router, prefix=api_prefix)
app.include_router(geo.router, prefix=api_prefix)
app.include_router(history.router, prefix=api_prefix)

from app.routers import protected
app.include_router(protected.router, prefix=api_prefix)

@app.get("/api/health", tags=["Health"])
@limiter.limit("5/minute")
async def health_check(request: Request):
    return {"status": "ok", "version": "1.0.0"}
