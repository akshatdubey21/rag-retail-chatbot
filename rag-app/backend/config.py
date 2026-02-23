"""
Application configuration — reads from .env and exposes typed settings.
"""

import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env from the project root (one level above backend/)
_env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=_env_path)


class Settings:
    """Central configuration consumed by every module."""

    # HuggingFace models
    HF_MODEL_NAME: str = os.getenv("HF_MODEL_NAME", "google/flan-t5-base")
    EMBEDDING_MODEL: str = os.getenv(
        "EMBEDDING_MODEL", "sentence-transformers/all-MiniLM-L6-v2"
    )

    # Text splitting
    CHUNK_SIZE: int = int(os.getenv("CHUNK_SIZE", "1000"))
    CHUNK_OVERLAP: int = int(os.getenv("CHUNK_OVERLAP", "200"))

    # Paths
    PROJECT_ROOT: Path = Path(__file__).resolve().parent.parent
    FAISS_INDEX_PATH: str = os.getenv("FAISS_INDEX_PATH", "data/faiss_index")
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "data/uploads")

    # LLM generation
    MAX_NEW_TOKENS: int = int(os.getenv("MAX_NEW_TOKENS", "512"))

    # Number of chunks to retrieve per query
    TOP_K: int = int(os.getenv("TOP_K", "6"))

    @property
    def faiss_abs_path(self) -> Path:
        return self.PROJECT_ROOT / self.FAISS_INDEX_PATH

    @property
    def upload_abs_path(self) -> Path:
        return self.PROJECT_ROOT / self.UPLOAD_DIR


settings = Settings()
