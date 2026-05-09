import os
from typing import Optional
try:
    from pydantic_settings import BaseSettings, SettingsConfigDict
except ImportError:
    from pydantic import BaseSettings
    SettingsConfigDict = None

class Settings(BaseSettings):
    # Database
    DATABASE_URL: Optional[str] = None
    PG_USER: str = "your_db_user"
    PG_PASS: str = "your_db_password"
    PG_HOST: str = "localhost"
    PG_PORT: str = "5432"
    PG_DB: str = "your_db_name"
    
    # JWT & Security
    SECRET_KEY: str = "your-secret-key-change-this-in-production-use-env-variable"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Social Auth
    GOOGLE_CLIENT_ID: str = "your-google-client-id"
    GOOGLE_CLIENT_SECRET: str = "your-google-client-secret"
    TELEGRAM_BOT_TOKEN: str = "your-telegram-bot-token"
    
    # Email Service (Brevo SMTP)
    SMTP_SERVER: str = "smtp-relay.brevo.com"
    SMTP_PORT: int = 587
    SMTP_USER: Optional[str] = None
    SMTP_PASS: Optional[str] = None
    FROM_EMAIL: str = "no-reply@example.com"
    FROM_NAME: str = "EyeStocks AI"
    LOGO_URL: str = "https://example.com/logo.png"

    # Support extra fields to prevent crashes when new env vars are added
    if SettingsConfigDict:
        model_config = SettingsConfigDict(env_file=".env", extra="allow")
    else:
        class Config:
            env_file = ".env"
            extra = "allow"

settings = Settings()
