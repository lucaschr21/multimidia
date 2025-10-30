import logging
import os
import shutil
import uuid

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from fastapi.responses import FileResponse
from starlette.background import BackgroundTask

from src.models.subtitle import RenderRequest
from src.services.subtitle import SubtitleService, load_subtitle_service

UPLOADS_DIR = "uploads"
OUTPUT_DIR = "output"

os.makedirs(UPLOADS_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)


def get_subtitle_service() -> SubtitleService:
    """
    Dependência do FastAPI que aciona o "Lazy Loading".
    """
    try:
        service_instance = load_subtitle_service()
        return service_instance
    except Exception as e:
        logging.error(f"API: Falha crítica ao carregar serviços: {e}", exc_info=True)
        raise HTTPException(
            status_code=503, detail=f"Serviço indisponível. Erro no carregamento: {e}"
        )


router = APIRouter()


@router.post("/generate")
async def generate_subtitles_route(
    file: UploadFile = File(...),
    service: SubtitleService = Depends(get_subtitle_service),
):
    """
    Endpoint para upload de vídeo (Etapa 1).
    Salva o vídeo em 'uploads/' e retorna dados + caminho.
    """
    if not file.content_type.startswith("video/"):
        raise HTTPException(
            status_code=400,
            detail="Tipo de arquivo inválido. Por favor, envie um vídeo.",
        )

    persistent_video_path = None
    try:
        suffix = os.path.splitext(file.filename)[1]
        video_filename = f"{uuid.uuid4()}{suffix}"
        persistent_video_path = os.path.join(UPLOADS_DIR, video_filename)

        logging.info(f"API: Salvando upload em {persistent_video_path}")
        with open(persistent_video_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

    except Exception as e:
        logging.error(f"API: Erro ao salvar arquivo de upload: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Erro ao salvar arquivo: {e}")
    finally:
        await file.close()

    try:
        logging.info(
            f"API: Chamando SubtitleService.generate_subtitle_data para {persistent_video_path}"
        )
        subtitle_json = service.generate_subtitle_data(persistent_video_path)
        logging.info("API: Geração de dados concluída.")

        return {"segments": subtitle_json, "video_path": persistent_video_path}

    except Exception as e:
        if persistent_video_path and os.path.exists(persistent_video_path):
            logging.warning(
                f"API: Removendo arquivo de upload devido a erro no processamento: {persistent_video_path}"
            )
            os.remove(persistent_video_path)

        logging.error(
            f"API: Erro durante o processamento de geração: {e}", exc_info=True
        )
        raise HTTPException(status_code=500, detail=f"Erro interno do servidor: {e}")


@router.post("/render", response_class=FileResponse)
async def render_subtitles_route(
    request_data: RenderRequest,
    service: SubtitleService = Depends(get_subtitle_service),
):
    """
    Endpoint para renderizar o vídeo (Etapa 2).
    Renderiza o vídeo, retorna para download e limpa os arquivos.
    """
    original_video_path = request_data.video_path
    output_video_path = None

    if not os.path.exists(original_video_path):
        logging.error(
            f"API: Arquivo de vídeo original não encontrado para renderização: {original_video_path}"
        )
        raise HTTPException(
            status_code=404,
            detail="Arquivo de vídeo original não encontrado. Pode ter expirado ou sido removido.",
        )

    try:
        output_filename = f"{uuid.uuid4()}_rendered.mp4"
        output_video_path = os.path.join(OUTPUT_DIR, output_filename)

        logging.info(
            f"API: Chamando SubtitleService.render_final_video para {original_video_path} -> {output_video_path}"
        )

        service.render_final_video(
            original_video_path=original_video_path,
            output_video_path=output_video_path,
            subtitles_data=request_data.subtitles,
            style_options=request_data.styles.model_dump(),
        )

        logging.info(
            f"API: Renderização concluída. Preparando envio do arquivo: {output_video_path}"
        )

        combined_cleanup_task = BackgroundTask(
            lambda path_out, path_in: (
                os.remove(path_out) if os.path.exists(path_out) else None,
                os.remove(path_in) if os.path.exists(path_in) else None,
            ),
            output_video_path,
            original_video_path,
        )
        logging.info(
            f"API: Agendada limpeza dos arquivos: {output_video_path} e {original_video_path}"
        )

        return FileResponse(
            path=output_video_path,
            media_type="video/mp4",
            filename="video_legendado.mp4",
            background=combined_cleanup_task,
        )

    except Exception as e:
        if output_video_path and os.path.exists(output_video_path):
            logging.warning(
                f"API: Removendo arquivo de saída devido a erro na renderização: {output_video_path}"
            )
            os.remove(output_video_path)

        logging.error(f"API: Erro durante a renderização: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Erro interno do servidor: {e}")
