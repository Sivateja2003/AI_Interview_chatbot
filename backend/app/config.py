"""Application configuration loaded from environment variables."""

import os
from pathlib import Path
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from .env file or environment."""

    # Gemini
    GEMINI_API_KEY: str = ""
    GEMINI_EMBEDDING_MODEL: str = "models/gemini-embedding-001"
    GEMINI_LLM_MODEL: str = "models/gemini-flash-latest"
    EMBEDDING_DIMENSIONS: int = 3072

    # Pinecone
    PINECONE_API_KEY: str = ""
    PINECONE_INDEX_NAME: str = "interview-rag-3072"

    # Firebase
    FIREBASE_PROJECT_ID: str = ""
    GOOGLE_APPLICATION_CREDENTIALS: str = ""

    # Application
    DATA_DIR: str = str(Path(__file__).parent.parent / "data")
    FRONTEND_URL: str = "http://localhost:5173"  # Vite default port

    # RAG Settings
    CHUNK_SIZE_TOKENS: int = 400
    CHUNK_OVERLAP_TOKENS: int = 50
    TOP_K: int = 5

    # Database
    DATABASE_URL: str = ""

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    """Return cached settings instance."""
    return Settings()
