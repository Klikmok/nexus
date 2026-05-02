from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # App
    APP_NAME: str = "Nexus"
    DEBUG: bool = False
    SECRET_KEY: str = "nexus-dev-secret-change-in-production"

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@db:5432/nexus"
    REDIS_URL: str = "redis://redis:6379"

    # Telegram
    BOT_TOKEN: str = ""
    ADMIN_TELEGRAM_IDS: str = ""
    WEBAPP_URL: str = "http://localhost:5173"

    # AI — Groq
    GROQ_API_KEY: str = ""
    GROQ_MODEL: str = "llama-3.3-70b-versatile"
    GROQ_MODEL_FAST: str = "llama-3.1-8b-instant"

    # JWT
    JWT_SECRET: str = "nexus-jwt-secret-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_HOURS: int = 72

    @property
    def admin_ids(self) -> list[int]:
        if not self.ADMIN_TELEGRAM_IDS:
            return []
        return [int(x.strip()) for x in self.ADMIN_TELEGRAM_IDS.split(",") if x.strip()]

    class Config:
        env_file = ".env"


settings = Settings()
