import React, { useState, useEffect, useRef } from "react";
import { FiMic, FiPlay, FiPause, FiDownload } from "react-icons/fi";

const formatTime = (totalSegundos) => {
  const minutos = Math.floor(totalSegundos / 60);
  const segundos = Math.round(totalSegundos % 60);
  return `${minutos}:${segundos.toString().padStart(2, "0")}`;
};

function AudioPlayer({ src, duration }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  const audioRef = useRef(null);

  useEffect(() => {
    const audioEl = audioRef.current;

    const handleTimeUpdate = () => {
      setCurrentTime(audioEl.currentTime);
    };
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(duration);
    };

    audioEl.addEventListener("timeupdate", handleTimeUpdate);
    audioEl.addEventListener("ended", handleEnded);

    return () => {
      audioEl.removeEventListener("timeupdate", handleTimeUpdate);
      audioEl.removeEventListener("ended", handleEnded);
    };
  }, [duration]);

  useEffect(() => {
    setCurrentTime(0);
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.load();
    }
  }, [src]);

  // Função do botão Play/Pause (real)
  const handlePlayPause = () => {
    const audioEl = audioRef.current;
    if (isPlaying) {
      audioEl.pause();
      setIsPlaying(false);
    } else {
      if (currentTime >= duration) {
        audioEl.currentTime = 0;
      }
      audioEl.play();
      setIsPlaying(true);
    }
  };

  const duracaoFormatada = formatTime(duration);
  const tempoAtualFormatado = formatTime(currentTime);
  const progressPercentage = (currentTime / duration) * 100;

  return (
    <div
      className="card shadow-sm border-0"
      style={{ backgroundColor: "#f5f3ff" }}
    >
      <div className="card-body p-4 d-flex flex-column gap-3">
        {/* A tag <audio> real (invisível) */}
        <audio ref={audioRef} src={src} preload="metadata"></audio>

        <h5
          className="fw-semibold d-flex align-items-center gap-2 mb-0"
          style={{ color: "#8b5cf6" }}
        >
          <FiMic /> Player de Áudio
        </h5>

        {/* Player (UI) */}
        <div className="d-flex align-items-center gap-3">
          <button
            className="btn btn-link p-0"
            onClick={handlePlayPause}
            style={{ color: "#8b5cf6", fontSize: "1.5em" }}
          >
            {isPlaying ? <FiPause /> : <FiPlay />}
          </button>
          <span
            className="small fw-semibold"
            style={{ color: "#8b5cf6", minWidth: "35px" }}
          >
            {tempoAtualFormatado}
          </span>
          <div
            className="progress w-100"
            style={{ height: "8px", backgroundColor: "#fff" }}
          >
            <div
              className="progress-bar"
              role="progressbar"
              style={{
                width: `${progressPercentage}%`,
                backgroundColor: "#8b5cf6",
              }}
            ></div>
          </div>
          <span
            className="small fw-semibold"
            style={{ color: "#8b5cf6", minWidth: "35px" }}
          >
            {duracaoFormatada}
          </span>
        </div>

        <a
          href={src}
          download="narracao.mp3"
          className="btn btn-dark w-100 d-flex align-items-center justify-content-center gap-2 fw-semibold py-2"
          style={{ backgroundColor: "#181123" }}
        >
          <FiDownload />
          Baixar Áudio com Múltiplas Vozes (MP3)
        </a>
      </div>
    </div>
  );
}

export default AudioPlayer;
