from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from app.core.config import settings
from app.core.logging_config import setup_logging
import logging

setup_logging()
logger = logging.getLogger(__name__)

from contextlib import asynccontextmanager
from app.routers import predict, recommend, weather, geo, history
from app.services.yield_service import get_yield_model
from app.services.fertilizer_service import get_fertilizer_model

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Eager load ML models on startup
    logger.info("Initializing ML models...")
    try:
        get_yield_model()
        get_fertilizer_model()
        logger.info("🚀 All ML models pre-loaded and ready.")
    except Exception as e:
        logger.error(f"⚠️ Model pre-loading failed: {e}")
    yield

limiter = Limiter(key_func=get_remote_address, default_limits=[f"{settings.rate_limit_per_minute}/minute"])

app = FastAPI(
    title=settings.project_name, 
    version="1.0.0",
    docs_url="/docs",
    lifespan=lifespan
)

# Exception handler for RateLimit
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Global Exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled Exception: {exc}", exc_info=True)
    
    # In production, mask the actual error details
    error_detail = "Internal Server Error"
    if settings.model_config.get("env_file") != ".env.production": # Basic check for dev env
         error_detail = str(exc)
         
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal Server Error", 
            "status_code": 500, 
            "message": error_detail
        },
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
    import time
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    logger.info(
        f"Request: {request.method} {request.url.path} handled in {process_time:.4f}s",
        extra={
            "method": request.method,
            "path": request.url.path,
            "process_time": process_time,
            "status_code": response.status_code
        }
    )
    return response

# Include routers
api_prefix = "/api/v1"
app.include_router(predict.router, prefix=api_prefix)
app.include_router(recommend.router, prefix=api_prefix)
app.include_router(weather.router_weather, prefix=api_prefix)
app.include_router(geo.router, prefix=api_prefix)
app.include_router(history.router, prefix=api_prefix)

from app.routers import protected
app.include_router(protected.router, prefix=api_prefix)

@app.get("/health/live", tags=["Health"])
async def liveness_check():
    return {"status": "alive"}

@app.get("/health/ready", tags=["Health"])
async def readiness_check():
    # Here you could check DB connectivity, etc.
    return {"status": "ready", "version": "1.0.0"}

@app.get("/api/v1/health", tags=["Health"])
@limiter.limit("5/minute")
async def health_check(request: Request):
    return {"status": "ok", "version": "1.0.0", "api_version": "v1"}
