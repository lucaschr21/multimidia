from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from src.env import CORS_ORIGINS

from src.routes import subtitle

from src.services.transcription import load_transcription_service
from src.services.diarization import load_diarization_service
from src.services.rendering import load_rendering_service
from src.services.subtitle import load_subtitle_service


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Gerencia os eventos de 'startup' e 'shutdown' da aplicação.
    """
    print("Lifespan: Evento de 'startup' iniciado.")
    print("Lifespan: Carregando modelos e serviços de IA...")

    load_transcription_service()
    load_diarization_service()
    load_rendering_service()
    load_subtitle_service()

    print("Lifespan: Todos os serviços foram carregados e estão prontos.")

    yield

    print("Lifespan: Evento de 'shutdown' iniciado.")


app = FastAPI(
    title="Legendas e Narração",
    description="Backend para processamento de vídeo (Whisper, Pyannote) e TTS.",
    version="1.0.0",
    lifespan=lifespan,
)

print(f"Configurando CORS para as origens: {CORS_ORIGINS}")
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(subtitle.router, prefix="/api/v1/subtitles", tags=["Subtitles"])


@app.get("/")
def read_root():
    """Rota principal para verificar se a API está online."""
    return {"status": "Backend is running!"}


# TODO: Trocar print por logging
