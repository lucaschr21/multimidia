from pydantic import BaseModel
from typing import List, Dict


class SubtitleSegment(BaseModel):
    """
    Define a estrutura de um único segmento de legenda.
    Isto é usado tanto para a saída do '/generate' quanto para a entrada do '/render'.
    """

    start: float
    end: float
    text: str
    speaker: str


class GenerateResponse(BaseModel):
    """
    Define a resposta que a rota /generate envia ao frontend.
    """

    segments: List[SubtitleSegment]
    video_path: str


class DefaultStyle(BaseModel):
    """Define os estilos padrão de fonte."""

    font_name: str = "Arial"
    font_size: str = "28"
    font_color: str = "#FFFFFF"


class SpeakerStyle(BaseModel):
    """Define o estilo para um interlocutor específico (editado pelo usuário)."""

    name: str
    color: str


class StyleOptions(BaseModel):
    """Agrupa todas as opções de estilo enviadas pelo frontend."""

    default: DefaultStyle
    speakers: Dict[str, SpeakerStyle]


class RenderRequest(BaseModel):
    """
    Define o corpo (body) completo que a rota de renderização (/render) espera.
    """

    video_path: str

    subtitles: List[SubtitleSegment]

    styles: StyleOptions
