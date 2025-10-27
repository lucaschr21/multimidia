import whisper
import os
import torch
from typing import Dict, Any

# Importa as configurações do nosso arquivo de ambiente
from src.env import TRANSCRIPTION_MODEL


class TranscriptionService:
    def __init__(self):
        """
        Construtor da classe.
        É executado quando 'load_transcription_service()' é chamado.
        """

        self.model_type = TRANSCRIPTION_MODEL
        print(
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
                print(
                    f"GPU (ROCm/CUDA) detectada! Carregando modelo '{self.model_type}' no dispositivo: {self.device}"
                )
            else:
                self.device = "cpu"
                self.use_fp16 = False
                print(
                    f"GPU não detectada. Carregando modelo '{self.model_type}' no dispositivo: {self.device}"
                )
        except Exception as e:
            print(f"Erro ao verificar PyTorch/GPU: {e}. Forçando CPU.")
            self.device = "cpu"
            self.use_fp16 = False

        try:
            self.model = whisper.load_model(self.model_type, device=self.device)
            print(f"Modelo Whisper '{self.model_type}' carregado com sucesso.")
        except Exception as e:
            print(f"Erro fatal ao carregar o modelo Whisper: {e}")
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

        print(f"Iniciando transcrição para: {video_file_path}...")

        try:
            result = self.model.transcribe(video_file_path, fp16=self.use_fp16)

            print("Transcrição concluída.")
            return result

        except Exception as e:
            print(f"Erro durante a execução da transcrição: {e}")
            raise e


transcriptionService: TranscriptionService | None = None


def load_transcription_service():
    """
    Função chamada pelo 'lifespan' do FastAPI para criar e carregar
    a instância do serviço.
    """
    global transcriptionService
    if transcriptionService is None:
        transcriptionService = TranscriptionService()
