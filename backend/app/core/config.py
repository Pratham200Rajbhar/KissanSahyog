from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List


class Settings(BaseSettings):
    project_name: str = "AgriAI API"
    supabase_url: str
    supabase_service_role_key: str
    supabase_jwt_secret: str
    open_meteo_api_url: str = "https://api.open-meteo.com/v1/forecast"
    soilgrids_api_url: str = "https://rest.isric.org/soilgrids/v2.0/properties/query"
    cors_origins: str | List[str] = "*"
    rate_limit_per_minute: int = 100

    model_config = SettingsConfigDict(
        env_file=".env", 
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
