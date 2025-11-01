import logging
import os
import threading
from typing import Any, Dict

import torch
import whisper

from src import env


class TranscriptionService:
    def __init__(self):
        """
        Construtor da classe.
        É executado quando 'load_transcription_service()' é chamado.
        """
        self.model_type = env.TRANSCRIPTION_MODEL
        logging.info(
            f"Iniciando TranscriptionService (carregando modelo '{self.model_type}')..."
        )

        self.device = None
        self.use_fp16 = False
        self.model = None

        self._load_model()

    def _load_model(self):
        """
        Método privado para carregar o modelo Whisper.
        """
        try:
            if torch.cuda.is_available():
                self.device = "cuda"
                self.use_fp16 = True
                logging.info(
                    f"GPU (ROCm/CUDA) detectada! Carregando modelo '{self.model_type}' no dispositivo: {self.device}"
                )
            else:
                self.device = "cpu"
                self.use_fp16 = False
                logging.info(
                    f"GPU não detectada. Carregando modelo '{self.model_type}' no dispositivo: {self.device}"
                )
        except Exception as e:
            logging.warning(f"Erro ao verificar PyTorch/GPU: {e}. Forçando CPU.")
            self.device = "cpu"
            self.use_fp16 = False

        try:
            self.model = whisper.load_model(self.model_type, device=self.device)
            logging.info(f"Modelo Whisper '{self.model_type}' carregado com sucesso.")
        except Exception as e:
            logging.error(
                f"Erro fatal ao carregar o modelo Whisper: {e}", exc_info=True
            )
            raise RuntimeError(
                f"Não foi possível carregar o modelo Whisper '{self.model_type}'."
            ) from e

    def transcribe_video(self, video_file_path: str) -> Dict[str, Any]:
        """
        Método público do serviço para transcrever um arquivo.
        """
        if self.model is None:
            raise RuntimeError("Modelo Whisper não foi carregado corretamente.")

        if not os.path.exists(video_file_path):
            raise FileNotFoundError(
                f"Arquivo não encontrado no serviço: {video_file_path}"
            )

        logging.info(f"Iniciando transcrição para: {video_file_path}...")

        try:
            result = self.model.transcribe(video_file_path, fp16=self.use_fp16)
            logging.info("Transcrição concluída.")
            return result
        except Exception as e:
            logging.error(f"Erro durante a execução da transcrição: {e}", exc_info=True)
            raise e


transcriptionService: TranscriptionService | None = None

_transcription_lock = threading.Lock()


def load_transcription_service():
    """
    Função chamada pela rota (via Injeção de Dependência) para carregar
    o serviço na primeira requisição.

    Usa um Lock para garantir que o modelo seja carregado apenas uma vez,
    mesmo sob requisições concorrentes.
    """
    global transcriptionService

    if transcriptionService is None:
        with _transcription_lock:
            if transcriptionService is None:
                transcriptionService = TranscriptionService()

    return transcriptionService
