from typing import List, Dict, Any

# Importa as *instâncias globais* (que serão 'None' até o lifespan rodar)
# e as *classes* (para type hinting) dos serviços "trabalhadores"
from src.services.transcription import transcriptionService, TranscriptionService
from src.services.diarization import diarizationService, DiarizationService
from src.services.rendering import renderingService, RenderingService

# --- Classe SubtitleService ---


class SubtitleService:
    def __init__(
        self,
        transcription_service: TranscriptionService,
        diarization_service: DiarizationService,
        rendering_service: RenderingService,
    ):
        """
        Construtor. Recebe os 3 serviços "trabalhadores" dos quais depende.
        """
        print("Iniciando SubtitleService (orquestrador)...")
        self.transcription_service = transcription_service
        self.diarization_service = diarization_service
        self.rendering_service = rendering_service

    # --- Método 1: Geração de JSON ---

    def generate_subtitle_data(self, video_file_path: str) -> List[Dict[str, Any]]:
        """
        Orquestra a transcrição e diarização para gerar o JSON de legendas.
        """

        # Passo 1: Transcrição (Whisper)
        print("SubtitleService: Solicitando transcrição...")
        # Chama o método da instância injetada
        transcription_result = self.transcription_service.transcribe_video(
            video_file_path
        )
        whisper_segments = transcription_result.get("segments", [])

        if not whisper_segments:
            print("SubtitleService: Transcrição não retornou segmentos.")
            return []

        # Passo 2: Diarização (Pyannote)
        print("SubtitleService: Solicitando diarização...")
        diarization_segments = self.diarization_service.diarize_video(video_file_path)

        if not diarization_segments:
            print("SubtitleService: Diarização não retornou segmentos.")
            # Se a diarização falhar, retorna a transcrição sem interlocutor
            for seg in whisper_segments:
                seg["speaker"] = "UNKNOWN"
            return whisper_segments

        # Passo 3: Fusão dos Resultados
        print("SubtitleService: Fundindo resultados...")

        final_subtitles = []
        for segment in whisper_segments:
            segment_start = segment["start"]
            segment_end = segment["end"]
            segment_text = segment["text"]

            # Encontra o interlocutor dominante para este segmento de texto
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

        print("SubtitleService: Geração de JSON concluída.")
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

            # Calcula a sobreposição (intersecção) entre o segmento de texto e o de fala
            overlap_start = max(segment_start, turn_start)
            overlap_end = min(segment_end, turn_end)
            overlap_duration = overlap_end - overlap_start

            if overlap_duration > 0:
                speaker_overlap[speaker] = (
                    speaker_overlap.get(speaker, 0) + overlap_duration
                )

        # Se não houver sobreposição, retorna "Desconhecido"
        if not speaker_overlap:
            return "UNKNOWN"

        # Retorna o interlocutor com o maior tempo de fala no segmento
        return max(speaker_overlap, key=speaker_overlap.get)

    # --- Método 2: Geração de Vídeo ---

    def render_final_video(
        self,
        original_video_path: str,
        output_video_path: str,
        subtitles_data: List[Dict[str, Any]],
        style_options: Dict[str, Any],
    ):
        """
        Orquestra a renderização do vídeo final delegando ao RenderingService.
        """

        print("SubtitleService: Solicitando renderização de vídeo...")

        try:
            # Apenas delega o trabalho para o serviço especialista
            self.rendering_service.render_video_with_subtitles(
                original_video_path=original_video_path,
                output_video_path=output_video_path,
                subtitles_data=subtitles_data,
                style_options=style_options,
            )
            print("SubtitleService: Renderização de vídeo concluída.")
        except Exception as e:
            print(f"SubtitleService: Falha na renderização - {e}")
            raise e


# --- Gerenciamento da Instância (para 'lifespan') ---

# A instância global começa como 'None'.
subtitleService: SubtitleService | None = None


def load_subtitle_service():
    """
    Função chamada pelo 'lifespan' (depois dos outros serviços)
    para criar a instância do serviço "gerente".
    """
    global subtitleService
    if subtitleService is None:
        if (
            transcriptionService is None
            or diarizationService is None
            or renderingService is None
        ):
            raise RuntimeError(
                "Serviços 'trabalhadores' não foram carregados antes do 'SubtitleService'."
            )

        subtitleService = SubtitleService(
            transcription_service=transcriptionService,
            diarization_service=diarizationService,
            rendering_service=renderingService,
        )
