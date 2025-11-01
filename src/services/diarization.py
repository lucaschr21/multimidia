import logging
import os
import threading
from typing import Any, Dict, List

import torch
import whisper
from pyannote.audio import Pipeline

from src import env


class DiarizationService:
    def __init__(self):
        """
        Construtor da classe.
        É executado quando 'load_diarization_service()' é chamado.
        """
        self.model_id = env.DIARIZATION_MODEL
        self.sample_rate = env.TARGET_SAMPLE_RATE
        self.hf_token = env.HF_TOKEN

        logging.info(
            f"Iniciando DiarizationService (carregando modelo '{self.model_id}')..."
        )

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
                logging.info(
                    f"GPU (ROCm/CUDA) detectada! Carregando modelo Pyannote '{self.model_id}' na GPU."
                )
            else:
                self.device = torch.device("cpu")
                logging.info(
                    f"GPU não detectada. Carregando modelo Pyannote '{self.model_id}' na CPU."
                )
        except Exception as e:
            logging.warning(f"Erro ao verificar PyTorch/GPU: {e}. Forçando CPU.")
            self.device = torch.device("cpu")

        try:
            self.pipeline = Pipeline.from_pretrained(self.model_id, token=self.hf_token)

            self.pipeline.to(self.device)
            logging.info(
                f"Modelo Pyannote '{self.model_id}' carregado com sucesso no dispositivo: {self.device}."
            )

        except Exception as e:
            logging.error(
                f"Erro fatal ao carregar o modelo Pyannote: {e}", exc_info=True
            )
            raise RuntimeError(
                f"Não foi possível carregar o modelo Pyannote '{self.model_id}'."
            ) from e

    def diarize_video(self, video_file_path: str) -> List[Dict[str, Any]]:
        """
        Método público para processar um arquivo e retornar os segmentos de fala.
        """
        if self.pipeline is None:
            raise RuntimeError("Modelo Pyannote não foi carregado corretamente.")

        if not os.path.exists(video_file_path):
            raise FileNotFoundError(
                f"Arquivo não encontrado no serviço: {video_file_path}"
            )

        logging.info(f"Iniciando diarização para: {video_file_path}...")

        try:
            logging.info(
                f"Pré-carregando e reamostrando áudio para {self.sample_rate}Hz..."
            )

            waveform_numpy = whisper.load_audio(video_file_path, sr=self.sample_rate)
            waveform_tensor = torch.from_numpy(waveform_numpy)
            waveform_tensor = waveform_tensor.unsqueeze(0).to(self.device)

            audio_data = {"waveform": waveform_tensor, "sample_rate": self.sample_rate}

            logging.info("Áudio pré-carregado. Executando pipeline Pyannote...")

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

            logging.info("Diarização concluída.")
            return segments

        except Exception as e:
            logging.error(f"Erro durante a execução da diarização: {e}", exc_info=True)
            raise e


diarizationService: DiarizationService | None = None

_diarization_lock = threading.Lock()


def load_diarization_service():
    """
    Função chamada pela rota (via Injeção de Dependência) para carregar
    o serviço na primeira requisição.

    Usa um Lock para garantir que o modelo seja carregado apenas uma vez.
    """
    global diarizationService

    if diarizationService is None:
        with _diarization_lock:
            if diarizationService is None:
                diarizationService = DiarizationService()

    return diarizationService
