// components/editor/SubtitleList.tsx
import type { Subtitle } from './VideoEditor';

interface SubtitleListProps {
  subtitles: Subtitle[];
  onTextChange: (id: number, text: string) => void;
}

// Função para formatar o tempo (sem alteração)
function formatTime(time: number) {
  const minutes = Math.floor(time / 60).toString().padStart(2, '0');
  const seconds = Math.floor(time % 60).toString().padStart(2, '0');
  const milliseconds = (time % 1).toFixed(3).substring(2);
  return `${minutes}:${seconds}.${milliseconds}`;
}

function SubtitleList({ subtitles, onTextChange }: SubtitleListProps) {
  return (
    <div className="subtitle-list">
      <h4>Legendas</h4>
      {subtitles.map(sub => (
        <div key={sub.id} className="subtitle-item">
          <div className="subtitle-item-header">
            {/* 1. Tag do Interlocutor Adicionada */}
            <span className="speaker-tag">{sub.speaker}</span>
            {/* 2. Tag de Tempo (agora com classe) */}
            <span className="time-tag">
              {`${formatTime(sub.startTime)} -> ${formatTime(sub.endTime)}`}
            </span>
          </div>
          <textarea
            value={sub.text}
            onChange={(e) => onTextChange(sub.id, e.target.value)}
          />
        </div>
      ))}
    </div>
  );
}

export default SubtitleList;