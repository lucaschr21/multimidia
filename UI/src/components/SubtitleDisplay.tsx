// components/editor/SubtitleDisplay.tsx
import type { Subtitle, SubtitleStyle } from './VideoEditor';

interface SubtitleDisplayProps {
  subtitles: Subtitle[];
  currentTime: number;
  style: SubtitleStyle;
}

function SubtitleDisplay({ subtitles, currentTime, style }: SubtitleDisplayProps) {
  // Encontra a legenda ativa (sem alteração)
  const activeSubtitle = subtitles.find(
    sub => currentTime >= sub.startTime && currentTime <= sub.endTime
  );

  if (!activeSubtitle) {
    return null; 
  }

  // Lógica de 'opacityHex' REMOVIDA
  
  return (
    <div
      className="subtitle-display"
      style={{
        fontSize: `${style.fontSize}px`,
        color: style.color,
        // Cor de fundo e opacidade agora vêm do 'Editor.css'
      }}
    >
      {activeSubtitle.text}
    </div>
  );
}

export default SubtitleDisplay;