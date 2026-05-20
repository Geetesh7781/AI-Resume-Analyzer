from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_name: str = "AI Resume Analyzer"
    app_env: str = "development"
    secret_key: str = "dev-secret-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 1440

    database_url: str = "sqlite+aiosqlite:///./resume_analyzer.db"

    gemini_api_key: str = ""
    gemini_model: str = "gemini-2.0-flash"

    embedding_model: str = "all-MiniLM-L6-v2"
    chunk_size: int = 500
    chunk_overlap: int = 50

    cors_origins: str = "http://localhost:5173,http://localhost:3000"

    upload_dir: str = "uploads"
    vectorstore_dir: str = "vectorstore"

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    @property
    def base_path(self) -> Path:
        return Path(__file__).resolve().parent.parent

    @property
    def upload_path(self) -> Path:
        path = self.base_path / self.upload_dir
        path.mkdir(parents=True, exist_ok=True)
        return path

    @property
    def vectorstore_path(self) -> Path:
        path = self.base_path / self.vectorstore_dir
        path.mkdir(parents=True, exist_ok=True)
        return path


@lru_cache
def get_settings() -> Settings:
    return Settings()
