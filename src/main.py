import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src import env
from src.routes import subtitle

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)

logger = logging.getLogger(__name__)

app = FastAPI(
    title="API de Legendas e Narração",
    description="Backend para processamento de vídeo (Whisper, Pyannote) e TTS.",
    version="1.0.0",
)

logging.info(f"Configurando CORS para as origens: {env.CORS_ORIGINS}")
app.add_middleware(
    CORSMiddleware,
    allow_origins=env.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(subtitle.router, prefix="/api/subtitles", tags=["Subtitles"])


@app.get("/")
def read_root():
    """Rota principal para verificar se a API está online."""
    return {"status": "Backend is running!"}
