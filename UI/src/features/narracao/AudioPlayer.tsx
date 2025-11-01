import React, { useState, useRef, useEffect } from "react";
import { Play, Pause } from "lucide-react";

const formatTime = (timeInSeconds: number): string => {
  const seconds = Math.floor(timeInSeconds % 60);
  const minutes = Math.floor(timeInSeconds / 60);
  return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
};

interface AudioPlayerProps {
  src: string;
  estimatedDuration: number;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  src,
  estimatedDuration,
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
    };
  }, []);

  const duration = audioRef.current?.duration || estimatedDuration;
  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="custom-audio-player">
      <audio ref={audioRef} src={src} className="hidden-audio-element" />

      <button onClick={togglePlayPause} className="play-pause-btn">
        {isPlaying ? <Pause size={18} /> : <Play size={18} />}
      </button>

      <span className="time-display current-time">
        {formatTime(currentTime)}
      </span>

      <div className="progress-bar-wrapper">
        <div
          className="progress-bar-fill-audio"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      <span className="time-display total-time">
        {formatTime(estimatedDuration)}
      </span>
    </div>
  );
};
