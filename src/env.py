import logging
import os
from typing import List

from dotenv import load_dotenv

DOTENV_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env")

if os.path.exists(DOTENV_PATH):
    logging.info(f"Carregando variáveis de ambiente de: {DOTENV_PATH}")
    load_dotenv(dotenv_path=DOTENV_PATH)
else:
    logging.warning(
        "Arquivo .env não encontrado. Usando valores padrão e variáveis de ambiente."
    )

SERVER_HOST: str = os.environ.get("SERVER_HOST", "127.0.0.1")
SERVER_PORT: int = int(os.environ.get("SERVER_PORT", 8000))

_cors_origins_str = os.environ.get(
    "CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000"
)
CORS_ORIGINS: List[str] = [origin.strip() for origin in _cors_origins_str.split(",")]

RELOAD_SERVER: bool = os.environ.get("RELOAD_SERVER", "True").lower() == "true"

TRANSCRIPTION_MODEL: str = os.environ.get("TRANSCRIPTION_MODEL", "base")

DIARIZATION_MODEL: str = os.environ.get(
    "DIARIZATION_MODEL", "pyannote/speaker-diarization-community-1"
)

TARGET_SAMPLE_RATE: int = int(os.environ.get("TARGET_SAMPLE_RATE", 16000))

HF_TOKEN: str | None = os.environ.get("HF_TOKEN")
