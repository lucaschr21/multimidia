import os
import torch
import whisper
from pyannote.audio import Pipeline
from typing import List, Dict, Any

from src.env import DIARIZATION_MODEL, TARGET_SAMPLE_RATE, HF_TOKEN


class DiarizationService:
    def __init__(self):
        """
        Construtor da classe.
        É executado quando 'load_diarization_service()' é chamado.
        """

        self.model_id = DIARIZATION_MODEL
        self.sample_rate = TARGET_SAMPLE_RATE
        self.hf_token = HF_TOKEN

        print(f"Iniciando DiarizationService (carregando modelo '{self.model_id}')...")

        self.device = None
        self.pipeline = None

        self._load_model()

    def _load_model(self):
        """
        Método privado para detectar dispositivo e carregar o modelo Pyannote.
        """
        try:
            if torch.cuda.is_available():
                self.device = torch.device("cuda")
                print(
                    f"GPU (ROCm/CUDA) detectada! Carregando modelo Pyannote '{self.model_id}' na GPU."
                )
            else:
                self.device = torch.device("cpu")
                print(
                    f"GPU não detectada. Carregando modelo Pyannote '{self.model_id}' na CPU."
                )
        except Exception as e:
            print(f"Erro ao verificar PyTorch/GPU: {e}. Forçando CPU.")
            self.device = torch.device("cpu")

        try:
            self.pipeline = Pipeline.from_pretrained(self.model_id, token=self.hf_token)

            self.pipeline.to(self.device)
            print(
                f"Modelo Pyannote '{self.model_id}' carregado com sucesso no dispositivo: {self.device}."
            )

        except Exception as e:
            print(f"Erro fatal ao carregar o modelo Pyannote: {e}")
            raise RuntimeError(
                f"Não foi possível carregar o modelo Pyannote '{self.model_id}'."
            ) from e

    def diarize_video(self, video_file_path: str) -> List[Dict[str, Any]]:
        """
        Método público para processar um arquivo e retornar os segmentos de fala.
        Usa o método de pré-carregamento de áudio para evitar erros.
        """
        if self.pipeline is None:
            raise RuntimeError("Modelo Pyannote não foi carregado corretamente.")

        if not os.path.exists(video_file_path):
            raise FileNotFoundError(
                f"Arquivo não encontrado no serviço: {video_file_path}"
            )

        print(f"Iniciando diarização para: {video_file_path}...")

        try:
            print(f"Pré-carregando e reamostrando áudio para {self.sample_rate}Hz...")

            waveform_numpy = whisper.load_audio(video_file_path, sr=self.sample_rate)
            waveform_tensor = torch.from_numpy(waveform_numpy)
            waveform_tensor = waveform_tensor.unsqueeze(0).to(self.device)

            audio_data = {"waveform": waveform_tensor, "sample_rate": self.sample_rate}

            print("Áudio pré-carregado. Executando pipeline Pyannote...")

            diarization_result = self.pipeline(audio_data)

            segments = []
            for turn, speaker in diarization_result.speaker_diarization:
                segments.append(
                    {
                        "speaker": speaker,
                        "start": round(turn.start, 3),
                        "end": round(turn.end, 3),
                    }
                )

            print("Diarização concluída.")
            return segments

        except Exception as e:
            print(f"Erro durante a execução da diarização: {e}")
            raise e


diarizationService: DiarizationService | None = None


def load_diarization_service():
    """
    Função chamada pelo 'lifespan' do FastAPI para criar e carregar
    a instância do serviço.
    """
    global diarizationService
    if diarizationService is None:
        diarizationService = DiarizationService()
