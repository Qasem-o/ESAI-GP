

import os
try:
    from pydantic_settings import BaseSettings
except ImportError:
    from pydantic import BaseSettings


class Settings(BaseSettings):
    # Database
    PG_USER: str = "postgres"
    PG_PASS: str = "123123"
    PG_HOST: str = "localhost"
    PG_PORT: str = "5432"
    PG_DB: str = "Stocksdata"
    
    # JWT & Security
    SECRET_KEY: str = "your-secret-key-change-this-in-production-use-env-variable"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Social Auth
    GOOGLE_CLIENT_ID: str = "your-google-client-id"
    GOOGLE_CLIENT_SECRET: str = "your-google-client-secret"
    TELEGRAM_BOT_TOKEN: str = "your-telegram-bot-token"
    
    # Email Service (Resend)
    RESEND_API_KEY: str = "your-resend-api-key"
    FROM_EMAIL: str = "onboarding@resend.dev"

    class Config:
        env_file = ".env"

settings = Settings()
