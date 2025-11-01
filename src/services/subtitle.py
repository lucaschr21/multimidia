import logging
import threading
from typing import Any, Dict, List

from src.models.subtitle import SubtitleSegment
from src.services.diarization import DiarizationService, load_diarization_service
from src.services.rendering import RenderingService, load_rendering_service

from src.services.transcription import TranscriptionService, load_transcription_service

logger = logging.getLogger(__name__)


class SubtitleService:
    """
    Serviço orquestrador que coordena os serviços de transcrição,
    diarização e renderização.
    """

    def __init__(self):
        """
        Construtor. Inicializa os serviços dependentes como None.
        Eles serão carregados sob demanda pelos métodos.
        """
        logger.info(
            "Instância de SubtitleService criada (dependências não carregadas)."
        )
        self._transcription_service: TranscriptionService | None = None
        self._diarization_service: DiarizationService | None = None
        self._rendering_service: RenderingService | None = None
        self._transcription_lock = threading.Lock()
        self._diarization_lock = threading.Lock()
        self._rendering_lock = threading.Lock()

    @property
    def transcription_service(self) -> TranscriptionService:
        """Carrega o TranscriptionService sob demanda."""
        if self._transcription_service is None:
            with self._transcription_lock:
                if self._transcription_service is None:
                    logger.info(
                        "SubtitleService: Carregando TranscriptionService sob demanda..."
                    )
                    self._transcription_service = load_transcription_service()
        return self._transcription_service

    @property
    def diarization_service(self) -> DiarizationService:
        """Carrega o DiarizationService sob demanda."""
        if self._diarization_service is None:
            with self._diarization_lock:
                if self._diarization_service is None:
                    logger.info(
                        "SubtitleService: Carregando DiarizationService sob demanda..."
                    )
                    self._diarization_service = load_diarization_service()
        return self._diarization_service

    @property
    def rendering_service(self) -> RenderingService:
        """Carrega o RenderingService sob demanda."""
        if self._rendering_service is None:
            with self._rendering_lock:
                if self._rendering_service is None:
                    logger.info(
                        "SubtitleService: Carregando RenderingService sob demanda..."
                    )
                    self._rendering_service = load_rendering_service()
        return self._rendering_service

    def generate_subtitle_data(self, video_file_path: str) -> List[Dict[str, Any]]:
        """
        Orquestra a transcrição e diarização, funda os resultados
        e mapeia os IDs de speaker para "Interlocutor X".
        """

        logger.info("SubtitleService: Solicitando transcrição...")
        transcription_result = self.transcription_service.transcribe_video(
            video_file_path
        )
        whisper_segments = transcription_result.get("segments", [])
        if not whisper_segments:
            logger.warning("SubtitleService: Transcrição não retornou segmentos.")
            return []

        logger.info("SubtitleService: Solicitando diarização...")
        diarization_segments = self.diarization_service.diarize_video(video_file_path)

        if not diarization_segments:
            logger.warning(
                "SubtitleService: Diarização não retornou segmentos. Marcando todos como 'Desconhecido'."
            )
            return [
                {
                    "start": round(seg["start"], 3),
                    "end": round(seg["end"], 3),
                    "text": seg.get("text", "").strip(),
                    "speaker": "Desconhecido",
                }
                for seg in whisper_segments
            ]

        logger.info("SubtitleService: Fundindo resultados...")
        intermediate_subtitles = []
        for segment in whisper_segments:
            speaker_id = self._find_dominant_speaker(
                segment["start"], segment["end"], diarization_segments
            )
            intermediate_subtitles.append(
                {
                    "start": round(segment["start"], 3),
                    "end": round(segment["end"], 3),
                    "text": segment.get("text", "").strip(),
                    "speaker": speaker_id,
                }
            )

        logger.info("SubtitleService: Mapeando IDs de speaker para 'Interlocutor X'...")
        speaker_map: Dict[str, str] = {}
        interlocutor_count = 1
        final_subtitles = []

        for segment in intermediate_subtitles:
            original_speaker_id = segment["speaker"]

            if original_speaker_id == "UNKNOWN":
                mapped_speaker_name = "Desconhecido"
            elif original_speaker_id in speaker_map:
                mapped_speaker_name = speaker_map[original_speaker_id]
            else:
                mapped_speaker_name = f"Interlocutor {interlocutor_count}"
                speaker_map[original_speaker_id] = mapped_speaker_name
                interlocutor_count += 1

            final_subtitles.append(
                {
                    "start": segment["start"],
                    "end": segment["end"],
                    "text": segment["text"],
                    "speaker": mapped_speaker_name,
                }
            )

        logger.info("SubtitleService: Geração de dados (com mapeamento) concluída.")
        return final_subtitles

    def _find_dominant_speaker(
        self,
        segment_start: float,
        segment_end: float,
        diarization_result: List[Dict[str, Any]],
    ) -> str:
        """
        Função auxiliar para encontrar o interlocutor dominante em um segmento de texto.
        Retorna 'UNKNOWN' se não houver overlap.
        """
        speaker_overlap = {}
        max_overlap = 0
        dominant_speaker = "UNKNOWN"
        for turn in diarization_result:
            turn_start = turn["start"]
            turn_end = turn["end"]
            speaker = turn["speaker"]
            overlap = max(
                0, min(segment_end, turn_end) - max(segment_start, turn_start)
            )
            if overlap > 0:
                current_total = speaker_overlap.get(speaker, 0) + overlap
                speaker_overlap[speaker] = current_total
                if current_total > max_overlap:
                    max_overlap = current_total
                    dominant_speaker = speaker
        return dominant_speaker

    def render_final_video(
        self,
        original_video_path: str,
        output_video_path: str,
        subtitles_data: List[SubtitleSegment],
        style_options: Dict[str, Any],
    ):
        """
        Orquestra a renderização do vídeo final.
        Carrega o RenderingService se ainda não estiver carregado.
        """
        logger.info("SubtitleService: Solicitando renderização de vídeo...")
        try:
            self.rendering_service.render_video_with_subtitles(
                original_video_path=original_video_path,
                output_video_path=output_video_path,
                subtitles_data=subtitles_data,
                style_options=style_options,
            )
            logger.info("SubtitleService: Renderização de vídeo concluída.")
        except Exception as e:
            logger.error("SubtitleService: Falha na renderização", exc_info=True)
            raise e


subtitleService: SubtitleService | None = None
_subtitle_lock = threading.Lock()


def load_subtitle_service():
    """
    Função chamada pela rota. Agora ela APENAS cria a instância
    do SubtitleService (se não existir). O carregamento real
    dos modelos de IA é delegado para os métodos do serviço.
    """
    global subtitleService
    if subtitleService is None:
        with _subtitle_lock:
            if subtitleService is None:
                subtitleService = SubtitleService()
    return subtitleService
