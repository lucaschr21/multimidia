// components/editor/VideoEditor.tsx
import { useState, useEffect } from 'react';
import './Editor.css';

// --- Componentes ---
import VideoPlayer from './VideoPlayer';
import SubtitleList from './SubtitleList';
import StyleEditor from './StyleEditor';
import SubtitleDisplay from './SubtitleDisplay';

// --- Definição dos Tipos (Atualizada) ---
export interface Subtitle {
  id: number;
  startTime: number;
  endTime: number;
  text: string;
  speaker: string; // Adicionamos o interlocutor
}

export interface SubtitleStyle {
  fontSize: number;
  color: string;
  // Opacidade e Cor de Fundo removidos, conforme solicitado
}
// ------------------------------------------

interface VideoEditorProps {
  file: File;
  onGoBack: () => void;
}

function VideoEditor({ file, onGoBack }: VideoEditorProps) {
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [subtitles, setSubtitles] = useState<Subtitle[]>([]);
  
  // 1. Estados de Carregamento e Erro
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 2. Estado de Estilo Simplificado
  const [styles, setStyles] = useState<SubtitleStyle>({
    fontSize: 24,
    color: '#FFFFFF',
  });

  // 3. Efeito para carregar o vídeo E buscar as legendas da API
  useEffect(() => {
    const url = URL.createObjectURL(file);
    setVideoUrl(url);

    // Função assíncrona para chamar o backend
    const fetchSubtitles = async () => {
      setIsLoading(true);
      setError(null);
      
      const formData = new FormData();
      // 'video_file' deve ser o nome que o backend espera
      formData.append('video_file', file); 

      try {
        // Assumindo que seu backend roda em /api/v1/subtitles/generate
        const response = await fetch('/api/subtitles/generate', {
          method: 'POST',
          body: formData,
        });

        // --- INÍCIO DA CORREÇÃO ---
        if (!response.ok) {
          // A resposta NÃO foi 200 (ex: 400, 404, 500)
          // Vamos tentar ler a resposta como texto primeiro, é mais seguro.
          const errorText = await response.text();
          let errorMessage = errorText;

          // Tenta analisar o texto como JSON, mas sem quebrar se não for.
          try {
            const errData = JSON.parse(errorText);
            errorMessage = errData.detail || errData.message || errorText;
          } catch (e) {
            // Falhou em analisar o JSON, então era só texto.
            // A variável 'errorMessage' já contém o 'errorText'.
          }
          
          // Se a mensagem ainda estiver vazia, use o statusText
          if (!errorMessage) {
            errorMessage = `Falha ao gerar legendas: ${response.statusText}`;
          }

          throw new Error(errorMessage);
        }
        // --- FIM DA CORREÇÃO ---

        // Se chegamos aqui, a resposta FOI 200 (OK).
        // Aqui, esperamos que a resposta seja JSON.
        const data = await response.json();

        // Mapeia a resposta da API para a interface do Front-end
        const formattedSubtitles: Subtitle[] = data.map((seg: any, index: number) => ({
          id: index + 1, // Gera um ID
          startTime: seg.start, // Mapeia 'start' -> 'startTime'
          endTime: seg.end,     // Mapeia 'end' -> 'endTime'
          text: seg.text,
          speaker: seg.speaker, // Recebe o interlocutor
        }));

        setSubtitles(formattedSubtitles);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Um erro desconhecido ocorreu.");
        setSubtitles([]); // Limpa legendas em caso de erro
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubtitles(); // Chama a função

    // Limpa a URL do objeto quando o componente é desmontado
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]); // Executa sempre que o arquivo mudar

  // Função para atualizar o texto de uma legenda (sem alteração)
  const handleSubtitleTextChange = (id: number, newText: string) => {
    setSubtitles(prev =>
      prev.map(sub => (sub.id === id ? { ...sub, text: newText } : sub))
    );
  };

  return (
    <div className="editor-container">
      {/* Coluna Principal (Vídeo) */}
      <div className="editor-main-column">
        <div className="editor-header">
          <h3>Editar Legendas</h3>
          <button onClick={onGoBack}>Voltar</button>
        </div>
        
        <div className="video-player-wrapper">
          {/* 4. Mostra feedback de carregamento e erro sobre o player */}
          {isLoading && (
            <div className="loading-overlay">
              <p>Processando vídeo... Isso pode levar alguns minutos.</p>
            </div>
          )}
          {error && (
            <div className="error-overlay">
              <p>Erro ao processar: {error}</p>
            </div>
          )}

          <VideoPlayer
            src={videoUrl}
            onTimeUpdate={setCurrentTime}
          />
          <SubtitleDisplay
            subtitles={subtitles}
            currentTime={currentTime}
            style={styles} // Passa o estilo simplificado
          />
        </div>
      </div>

      {/* Coluna Lateral (Editores) */}
      <div className="editor-sidebar-column">
        <div className="editor-header">
          <h3>Ferramentas</h3>
        </div>
        <div className="editor-scrollable-content">
          {/* Editor de Estilo (simplificado) */}
          <StyleEditor
            styles={styles}
            onStyleChange={setStyles}
          />
          
          <hr />

          {/* Editor da Lista de Legendas */}
          <SubtitleList
            subtitles={subtitles}
            onTextChange={handleSubtitleTextChange}
          />
        </div>
      </div>
    </div>
  );
}

export default VideoEditor;