import os
import shutil
import uuid
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from fastapi.responses import FileResponse
from starlette.background import BackgroundTask

from src.services.subtitle import subtitleService, SubtitleService
from src.models.subtitle import RenderRequest

UPLOADS_DIR = "uploads"
OUTPUT_DIR = "output"

os.makedirs(UPLOADS_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)


def get_subtitle_service() -> SubtitleService:
    """
    Função de dependência do FastAPI.
    Verifica se o serviço foi carregado pelo 'lifespan' e o injeta na rota.
    """
    if subtitleService is None:
        raise HTTPException(
            status_code=503, detail="Serviço de legendas não está inicializado."
        )
    return subtitleService


router = APIRouter()


@router.post("/generate")
async def generate_subtitles_route(
    file: UploadFile = File(...),
    service: SubtitleService = Depends(get_subtitle_service),
):
    """
    Endpoint para upload de vídeo (Etapa 1).
    1. Recebe um vídeo.
    2. Salva-o permanentemente em 'uploads/'.
    3. Gera os dados (transcrição + diarização).
    4. Retorna o JSON de legendas E o caminho do arquivo salvo.
    """

    if not file.content_type.startswith("video/"):
        raise HTTPException(
            status_code=400,
            detail="Tipo de arquivo inválido. Por favor, envie um vídeo.",
        )

    try:
        suffix = os.path.splitext(file.filename)[1]
        video_filename = f"{uuid.uuid4()}{suffix}"
        persistent_video_path = os.path.join(UPLOADS_DIR, video_filename)

        with open(persistent_video_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao salvar arquivo: {e}")
    finally:
        file.file.close()

    try:
        print(
            f"API: Chamando SubtitleService.generate_subtitle_data para {persistent_video_path}"
        )

        subtitle_json = service.generate_subtitle_data(persistent_video_path)

        print("API: Geração de dados concluída.")

        return {"segments": subtitle_json, "video_path": persistent_video_path}

    except Exception as e:
        if os.path.exists(persistent_video_path):
            os.remove(persistent_video_path)

        print(f"API: Erro durante o processamento: {e}")
        raise HTTPException(status_code=500, detail=f"Erro interno do servidor: {e}")


@router.post("/render", response_class=FileResponse)
async def render_subtitles_route(
    request_data: RenderRequest,
    service: SubtitleService = Depends(get_subtitle_service),
):
    """
    Endpoint para renderizar o vídeo (Etapa 2).
    1. Recebe o JSON de legendas editadas, estilos e o caminho do vídeo original.
    2. Chama o serviço de renderização.
    3. Retorna o vídeo final (.mp4) para download.
    """

    original_video_path = request_data.video_path

    if not os.path.exists(original_video_path):
        raise HTTPException(
            status_code=404,
            detail="Arquivo de vídeo original não encontrado. Pode ter expirado.",
        )

    output_filename = f"{uuid.uuid4()}_rendered.mp4"
    output_video_path = os.path.join(OUTPUT_DIR, output_filename)

    try:
        print(
            f"API: Chamando SubtitleService.render_final_video para {original_video_path}"
        )

        service.render_final_video(
            original_video_path=original_video_path,
            output_video_path=output_video_path,
            subtitles_data=request_data.subtitles,
            style_options=request_data.styles.model_dump(),
        )

        print(f"API: Renderização concluída. Enviando arquivo: {output_video_path}")

        delete_task = BackgroundTask(os.remove, output_video_path)

        return FileResponse(
            path=output_video_path,
            media_type="video/mp4",
            filename="video_legendado.mp4",
            background=delete_task,
        )

    except Exception as e:
        if os.path.exists(output_video_path):
            os.remove(output_video_path)

        print(f"API: Erro durante a renderização: {e}")
        raise HTTPException(status_code=500, detail=f"Erro interno do servidor: {e}")
