import os
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List


class Settings(BaseSettings):
    project_name: str = "KissanSahyog API"
    
    # Kissan DB Provider (Supabase)
    supabase_url: str = Field(..., alias="KISSAN_DB_PROVIDER_URL")
    supabase_service_role_key: str = Field(..., alias="KISSAN_DB_SERVICE_KEY")
    supabase_jwt_secret: str = Field(..., alias="KISSAN_DB_JWT_SECRET")
    
    # External API Endpoints (Required via .env)
    meteo_source_url: str = Field(..., alias="KISSAN_METEO_SOURCE_URL")
    soil_data_source_url: str = Field(..., alias="KISSAN_SOIL_DATA_SOURCE_URL")
    nasa_power_source_url: str = Field(..., alias="KISSAN_NASA_POWER_SOURCE_URL")
    geo_nominatim_source_url: str = Field(..., alias="KISSAN_GEO_NOMINATIM_SOURCE_URL")
    
    # Security & CORS
    cors_origins: str | List[str] = Field(..., alias="KISSAN_API_CORS_ORIGINS")
    rate_limit_per_minute: int = Field(..., alias="KISSAN_API_RATE_LIMIT")
    
    # Identity & Auth (NextAuth Shared Secrets)
    nextauth_secret: str = Field(..., alias="KISSAN_AUTH_ENCRYPTION_SECRET")
    google_auth_client_id: str = Field(..., alias="KISSAN_GOOGLE_AUTH_CLIENT_ID")
    google_auth_client_secret: str = Field(..., alias="KISSAN_GOOGLE_AUTH_CLIENT_SECRET")
    google_ee_project_id: str = Field(..., alias="KISSAN_GEE_PROJECT_ID")
    gemini_api_key: str = Field(..., alias="GEMINI_API_KEY")

    # ML Model Storage Paths
    yield_model_path: str = Field(
        default=os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "models/yield_prediction/yield_pipeline.pkl"),
        description="Path to the yield prediction pickle file"
    )
    crop_model_dir: str = Field(
        default=os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "models/crop_recommendation/"),
        description="Directory containing crop recommendation models"
    )

    model_config = SettingsConfigDict(
        env_file=".env", 
        env_file_encoding="utf-8",
        extra="ignore",
        populate_by_name=True
    )

settings = Settings()
