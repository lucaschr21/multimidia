import logging
import threading
from typing import Any, Dict, List

from src.models.subtitle import SubtitleSegment
from src.services.diarization import DiarizationService, load_diarization_service
from src.services.rendering import RenderingService, load_rendering_service
from src.services.transcription import TranscriptionService, load_transcription_service


class SubtitleService:
    """
    Serviço orquestrador com carregamento preguiçoso granular.
    """

    def __init__(self):
        """
        Construtor. Inicializa os serviços dependentes como None.
        Eles serão carregados sob demanda pelos métodos.
        """
        logging.info(
            "Iniciando SubtitleService (orquestrador) - Instância criada, dependências ainda não carregadas."
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
                    logging.info(
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
                    logging.info(
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
                    logging.info(
                        "SubtitleService: Carregando RenderingService sob demanda..."
                    )
                    self._rendering_service = load_rendering_service()
        return self._rendering_service

    def generate_subtitle_data(self, video_file_path: str) -> List[Dict[str, Any]]:
        """
        Orquestra a transcrição e diarização.
        Carrega os serviços necessários se ainda não estiverem carregados.
        """
        logging.info("SubtitleService: Solicitando transcrição...")
        transcription_result = self.transcription_service.transcribe_video(
            video_file_path
        )
        whisper_segments = transcription_result.get("segments", [])

        if not whisper_segments:
            logging.warning("SubtitleService: Transcrição não retornou segmentos.")
            return []

        logging.info("SubtitleService: Solicitando diarização...")
        diarization_segments = self.diarization_service.diarize_video(video_file_path)

        if not diarization_segments:
            logging.warning("SubtitleService: Diarização não retornou segmentos.")
            for seg in whisper_segments:
                seg["speaker"] = "UNKNOWN"
            return whisper_segments

        logging.info("SubtitleService: Fundindo resultados...")
        final_subtitles = []
        for segment in whisper_segments:
            segment_start = segment["start"]
            segment_end = segment["end"]
            segment_text = segment["text"]
            speaker = self._find_dominant_speaker(
                segment_start, segment_end, diarization_segments
            )
            final_subtitles.append(
                {
                    "start": round(segment_start, 3),
                    "end": round(segment_end, 3),
                    "text": segment_text.strip(),
                    "speaker": speaker,
                }
            )

        logging.info("SubtitleService: Geração de JSON concluída.")
        return final_subtitles

    def _find_dominant_speaker(
        self,
        segment_start: float,
        segment_end: float,
        diarization_result: List[Dict[str, Any]],
    ) -> str:
        """
        Função auxiliar para encontrar o interlocutor dominante em um segmento de texto.
        """
        speaker_overlap = {}
        for turn in diarization_result:
            turn_start = turn["start"]
            turn_end = turn["end"]
            speaker = turn["speaker"]
            overlap_start = max(segment_start, turn_start)
            overlap_end = min(segment_end, turn_end)
            overlap_duration = overlap_end - overlap_start
            if overlap_duration > 0:
                speaker_overlap[speaker] = (
                    speaker_overlap.get(speaker, 0) + overlap_duration
                )
        if not speaker_overlap:
            return "UNKNOWN"
        return max(speaker_overlap, key=speaker_overlap.get)

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
        logging.info("SubtitleService: Solicitando renderização de vídeo...")

        try:
            self.rendering_service.render_video_with_subtitles(
                original_video_path=original_video_path,
                output_video_path=output_video_path,
                subtitles_data=subtitles_data,
                style_options=style_options,
            )
            logging.info("SubtitleService: Renderização de vídeo concluída.")
        except Exception as e:
            logging.error(
                f"SubtitleService: Falha na renderização - {e}", exc_info=True
            )
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
