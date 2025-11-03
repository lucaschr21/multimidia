// components/editor/VideoEditor.tsx
import { useState, useEffect } from 'react';
import './Editor.css';

// --- Componentes ---
import VideoPlayer from './VideoPlayer';
import SubtitleList from './SubtitleList';
import StyleEditor from './StyleEditor';
import SubtitleDisplay from './SubtitleDisplay';

// --- Definição dos Tipos ---
export interface Subtitle {
  id: number;
  startTime: number;
  endTime: number;
  text: string;
  speaker: string;
}

export interface SubtitleStyle {
  fontSize: number;
  color: string;
}
// ----------------------------

// Tipos do Backend (para formatar a requisição)
interface BackEndSubtitleSegment {
  start: number;
  end: number;
  text: string;
  speaker: string;
}

interface BackEndStyleOptions {
  default: {
    font_name: string;
    font_size: string;
    font_color: string;
  };
  speakers: {}; // Não estamos usando, mas o modelo espera
}

interface RenderRequest {
  video_path: string;
  subtitles: BackEndSubtitleSegment[];
  styles: BackEndStyleOptions;
}
// ----------------------------


interface VideoEditorProps {
  file: File;
  onGoBack: () => void;
}

function VideoEditor({ file, onGoBack }: VideoEditorProps) {
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [subtitles, setSubtitles] = useState<Subtitle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Caminho do vídeo no servidor (recebido do /generate)
  const [videoPath, setVideoPath] = useState<string>(''); 

  // Novo estado para o botão de renderizar
  const [isRendering, setIsRendering] = useState(false);

  const [styles, setStyles] = useState<SubtitleStyle>({
    fontSize: 24,
    color: '#FFFFFF',
  });

  // (A função useEffect fetchSubtitles permanece a mesma de antes)
  useEffect(() => {
    const url = URL.createObjectURL(file);
    setVideoUrl(url);

    const fetchSubtitles = async () => {
      setIsLoading(true);
      setError(null);
      
      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await fetch('/api/subtitles/generate', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errorText = await response.text();
          let errorMessage = errorText;
          try {
            const errData = JSON.parse(errorText);
            errorMessage = errData.detail || errData.message || errorText;
          } catch (e) { /* Não era JSON */ }
          if (!errorMessage) {
            errorMessage = `Falha ao gerar legendas: ${response.statusText}`;
          }
          throw new Error(errorMessage);
        }

        const data = await response.json(); 

        if (!data || !Array.isArray(data.segments)) {
          throw new Error("Resposta da API inválida: 'segments' não é um array.");
        }

        const formattedSubtitles: Subtitle[] = data.segments.map((seg: any, index: number) => ({
          id: index + 1,
          startTime: seg.start,
          endTime: seg.end,
          text: seg.text,
          speaker: seg.speaker,
        }));

        setSubtitles(formattedSubtitles);
        setVideoPath(data.video_path); // Salva o caminho
        
      } catch (err) {
        setError(err instanceof Error ? err.message : "Um erro desconhecido ocorreu.");
        setSubtitles([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubtitles();

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);


  const handleSubtitleTextChange = (id: number, newText: string) => {
    setSubtitles(prev =>
      prev.map(sub => (sub.id === id ? { ...sub, text: newText } : sub))
    );
  };

  
  // --- NOVA FUNÇÃO PARA RENDERIZAR E BAIXAR O VÍDEO ---
  const handleRenderVideo = async () => {
    setIsRendering(true);
    setError(null); // Limpa erros antigos

    // 1. Formatar legendas para o padrão do backend (start/end)
    const formattedSubtitles: BackEndSubtitleSegment[] = subtitles.map(sub => ({
      start: sub.startTime,
      end: sub.endTime,
      text: sub.text,
      speaker: sub.speaker,
    }));

    // 2. Formatar estilos para o padrão do backend (StyleOptions)
    const payloadStyles: BackEndStyleOptions = {
      default: {
        font_name: "Arial", // O backend espera isso (do models.py)
        font_size: String(styles.fontSize), // O backend espera uma string
        font_color: styles.color,
      },
      speakers: {}, // O front-end não edita isso, enviamos vazio
    };

    // 3. Montar o corpo da requisição (RenderRequest)
    const renderPayload: RenderRequest = {
      video_path: videoPath, // O caminho que salvamos do passo 1
      subtitles: formattedSubtitles,
      styles: payloadStyles,
    };

    try {
      const response = await fetch('/api/subtitles/render', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(renderPayload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = errorText;
        try {
          const errData = JSON.parse(errorText);
          errorMessage = errData.detail || errData.message || errorText;
        } catch (e) { /* Não era JSON */ }
        throw new Error(errorMessage || `Erro na renderização: ${response.statusText}`);
      }

      // 4. Se a resposta for OK, ela é um arquivo de vídeo (Blob)
      const videoBlob = await response.blob();
      
      // 5. Criar um link de download temporário e clicar nele
      const downloadUrl = URL.createObjectURL(videoBlob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = downloadUrl;
      // O backend define este nome em 'src/routes/subtitle.py'
      a.download = 'video_legendado.mp4'; 
      document.body.appendChild(a);
      a.click();
      
      // Limpar o link temporário
      URL.revokeObjectURL(downloadUrl);
      a.remove();

    } catch (err) {
      setError(err instanceof Error ? err.message : "Um erro desconhecido ocorreu na renderização.");
    } finally {
      setIsRendering(false);
    }
  };
  // --- FIM DA NOVA FUNÇÃO ---


  return (
    <div className="editor-container">
      {/* Coluna Principal (Vídeo) */}
      <div className="editor-main-column">
        {/* ... (Header e Video Player Wrapper) ... */}
        <div className="editor-header">
          <h3>Editar Legendas</h3>
          <button onClick={onGoBack}>Voltar</button>
        </div>
        
        <div className="video-player-wrapper">
          {/* ... (isLoading, error, VideoPlayer, SubtitleDisplay) ... */}
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
            style={styles}
          />
        </div>
      </div>

      {/* Coluna Lateral (Editores) */}
      <div className="editor-sidebar-column">
        <div className="editor-header">
          <h3>Ferramentas</h3>
        </div>
        <div className="editor-scrollable-content">
          <StyleEditor
            styles={styles}
            onStyleChange={setStyles}
          />
          
          <hr />

          <SubtitleList
            subtitles={subtitles}
            onTextChange={handleSubtitleTextChange}
          />
        </div>
        
        {/* --- ADICIONE ESTA SEÇÃO NO FINAL DA COLUNA LATERAL --- */}
        <div className="editor-footer">
          <button 
            className="button-render"
            onClick={handleRenderVideo}
            disabled={isLoading || isRendering} // Desativa se estiver carregando OU renderizando
          >
            {isRendering ? "Renderizando..." : "Renderizar e Baixar"}
          </button>
        </div>
        {/* --------------------------------------------------- */}
      </div>
    </div>
  );
}

export default VideoEditor;