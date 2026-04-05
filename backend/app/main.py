from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from app.core.config import settings
from app.core.logging_config import setup_logging
from app.core import logging_context
import logging
import time

setup_logging()
logger = logging.getLogger(__name__)

from contextlib import asynccontextmanager
from app.routers import predict, recommend, weather, geo, history, crop_disease
from app.services.yield_service import get_yield_model
from app.services.fertilizer_service import get_fertilizer_model
from app.services.crop_disease_service import crop_disease_service

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Eager load ML models on startup
    logger.info("Initializing ML models and Earth Engine...")
    try:
        import ee
        ee.Initialize(project=settings.google_ee_project_id)
        get_yield_model()
        get_fertilizer_model()
        # Trigger model loading for crop disease
        _ = crop_disease_service.model
        logger.info("🚀 All ML models and GEE initialized and ready.")
    except Exception as e:
        logger.error(f"⚠️ Initialization failed: {e}")
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
    # Log the full exception with context
    logger.error(f"Unhandled Exception: {exc}", exc_info=True)
    
    # In production, mask the actual error details
    is_production = settings.model_config.get("env_file") == ".env.production"
    error_detail = "Internal Server Error"
    
    if not is_production:
         error_detail = str(exc)
         
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal Server Error", 
            "status_code": 500, 
            "message": error_detail,
            "request_id": logging_context.get_request_id()
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

# Security Headers Middleware
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response

# Request logging middleware with Context Tracking
@app.middleware("http")
async def log_requests(request: Request, call_next):
    # 1. Start timer and setup request ID
    start_time = time.time()
    request_id = request.headers.get("X-Request-ID")
    request_id = logging_context.set_request_id(request_id)
    
    # 2. Extract user identity if available (e.g. from a previous auth check or cookie)
    # Note: Full auth check usually happens in routers, but we can peek at the session token
    # to identify the user for logging purposes without full decryption if needed.
    # For now, we'll let routers/dependencies set this if they want more detail.
    
    logger.info(f"Incoming Request: {request.method} {request.url.path}")
    
    try:
        response = await call_next(request)
        process_time = time.time() - start_time
        
        # 3. Log completion with status code and duration
        logger.info(
            f"Request Completed: {request.method} {request.url.path} with status {response.status_code} in {process_time:.4f}s",
            extra={
                "extra_info": {
                    "method": request.method,
                    "path": request.url.path,
                    "status_code": response.status_code,
                    "process_time": process_time,
                }
            }
        )
        # 4. Attach request ID to response headers for debugging
        response.headers["X-Request-ID"] = request_id
        return response
        
    except Exception as e:
        # Exceptions are handled by the global handler, but we can log context here too if needed
        raise e

# Include routers
api_prefix = "/api/v1"
app.include_router(predict.router, prefix=api_prefix)
app.include_router(recommend.router, prefix=api_prefix)
app.include_router(weather.router_weather, prefix=api_prefix)
app.include_router(geo.router, prefix=api_prefix)
app.include_router(history.router, prefix=api_prefix)
app.include_router(crop_disease.router, prefix=api_prefix)

from app.routers import protected, chatbot
app.include_router(protected.router, prefix=api_prefix)
app.include_router(chatbot.router, prefix=api_prefix)

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
