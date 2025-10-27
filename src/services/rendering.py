import logging
import os
import subprocess
import tempfile
import threading
from typing import Any, Dict, List

from src.models.subtitle import SubtitleSegment


def _format_time_ass(seconds: float) -> str:
    """Converte segundos (float) para o formato H:MM:SS.ss do ASS"""
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    sec = int(seconds % 60)
    hundredths = int((seconds - int(seconds)) * 100)
    return f"{hours}:{minutes:02}:{sec:02}.{hundredths:02}"


def _format_color_ass(hex_color: str) -> str:
    """Converte cor Hex (#RRGGBB) para o formato ASS (&HBBGGRR)"""
    if not hex_color.startswith("#") or len(hex_color) != 7:
        hex_color = "#FFFFFF"
    r = hex_color[1:3]
    g = hex_color[3:5]
    b = hex_color[5:7]
    return f"&H00{b}{g}{r}"


class AssSubtitleGenerator:
    """
    Gera o conteúdo de um arquivo de legenda .ass a partir
    de dados de legenda e definições de estilo.
    """

    def __init__(self, style_options: Dict[str, Any]):
        self.styles = self._generate_style_header(style_options)
        self.events = self._generate_events_header()

    def _generate_style_header(self, options: Dict[str, Any]) -> str:
        default_font = options.get("default", {}).get("font_name", "Arial")
        default_size = options.get("default", {}).get("font_size", "28")
        default_color = _format_color_ass(
            options.get("default", {}).get("font_color", "#FFFFFF")
        )

        header = "[V4+ Styles]\n"
        header += "Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding\n"
        header += f"Style: Default,{default_font},{default_size},{default_color},&H000000FF,&H00000000,&H00000000,0,0,0,0,100,100,0,0,1,2,1,2,10,10,10,1\n"

        speaker_styles = options.get("speakers", {})
        for speaker_id, style in speaker_styles.items():
            style_name = speaker_id
            color = _format_color_ass(
                style.get(
                    "color", options.get("default", {}).get("font_color", "#FFFFFF")
                )
            )
            size = style.get("font_size", default_size)
            header += f"Style: {style_name},{default_font},{size},{color},&H000000FF,&H00000000,&H00000000,0,0,0,0,100,100,0,0,1,2,1,2,10,10,10,1\n"

        return header + "\n"

    def _generate_events_header(self) -> str:
        header = "[Events]\n"
        header += "Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n"
        return header

    def add_dialogue(self, subtitle: SubtitleSegment, speaker_styles: Dict[str, Any]):
        """
        Adiciona uma linha de diálogo.
        Recebe um objeto Pydantic 'SubtitleSegment', não um dicionário.
        """

        start = _format_time_ass(subtitle.start)
        end = _format_time_ass(subtitle.end)
        text = subtitle.text
        speaker_id = subtitle.speaker

        style_name = speaker_id if speaker_id in speaker_styles else "Default"
        speaker_name = speaker_styles.get(speaker_id, {}).get("name", "")

        if speaker_name:
            text = f"{{\\b1}}{speaker_name}:{{\\b0}} {text}"

        text = text.replace("\n", "\\N")
        self.events += (
            f"Dialogue: 0,{start},{end},{style_name},{speaker_name},0,0,0,,{text}\n"
        )

    def get_content(self) -> str:
        return self.styles + self.events


class RenderingService:
    def __init__(self):
        logging.info("Iniciando RenderingService...")

    def render_video_with_subtitles(
        self,
        original_video_path: str,
        output_video_path: str,
        subtitles_data: List[SubtitleSegment],
        style_options: Dict[str, Any],
    ):
        """
        Renderiza (queima) legendas estilizadas em um vídeo usando ffmpeg.
        """
        if not os.path.exists(original_video_path):
            raise FileNotFoundError(
                f"Vídeo original não encontrado: {original_video_path}"
            )

        logging.info("RenderService: Gerando arquivo de legenda .ass...")

        ass_gen = AssSubtitleGenerator(style_options)
        speaker_styles = style_options.get("speakers", {})

        for subtitle_segment in subtitles_data:
            ass_gen.add_dialogue(subtitle_segment, speaker_styles)
        ass_content = ass_gen.get_content()

        temp_ass_path = None
        try:
            with tempfile.NamedTemporaryFile(
                mode="w", suffix=".ass", encoding="utf-8", delete=False
            ) as temp_ass_file:
                temp_ass_file.write(ass_content)
                temp_ass_path = temp_ass_file.name

            logging.info(f"RenderService: Arquivo .ass salvo em: {temp_ass_path}")
            logging.info(
                "RenderService: Iniciando renderização com ffmpeg (via subprocess)..."
            )

            ffmpeg_command = [
                "ffmpeg",
                "-i",
                original_video_path,
                "-vf",
                f"ass={temp_ass_path}",
                "-c:v",
                "libx264",
                "-crf",
                "23",
                "-preset",
                "fast",
                "-c:a",
                "copy",
                output_video_path,
                "-y",
            ]

            subprocess.run(ffmpeg_command, capture_output=True, text=True, check=True)

            logging.info(
                f"RenderService: Renderização concluída! Vídeo salvo em: {output_video_path}"
            )

        except subprocess.CalledProcessError as e:
            logging.error("Erro durante a renderização do ffmpeg:")
            logging.error(e.stderr)
            raise RuntimeError(f"Falha no FFMPEG: {e.stderr}")

        except Exception as e:
            logging.error(f"Um erro inesperado ocorreu: {e}", exc_info=True)
            raise e

        finally:
            if temp_ass_path and os.path.exists(temp_ass_path):
                os.remove(temp_ass_path)
                logging.info(
                    f"RenderService: Arquivo .ass temporário removido: {temp_ass_path}"
                )


renderingService: RenderingService | None = None

_rendering_lock = threading.Lock()


def load_rendering_service():
    """
    Função chamada pela rota (via Injeção de Dependência) para carregar
    o serviço na primeira requisição.
    """
    global renderingService

    if renderingService is None:
        with _rendering_lock:
            if renderingService is None:
                renderingService = RenderingService()

    return renderingService
