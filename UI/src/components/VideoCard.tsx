import { useRef, useState, type DragEvent } from "react";
import {
  LuUpload,
  LuCaptions,
  LuUsers,
  LuPalette,
} from "react-icons/lu";
import { IoGridOutline } from "react-icons/io5"; 

interface VideoCardProps {
  onVideoSelect: (file: File) => void;
}

function VideoCard({ onVideoSelect }: VideoCardProps) {

  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onVideoSelect(file); 
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click(); 
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault(); 
    setIsDragging(true);
  };

  const handleDragEnter = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault(); 
    setIsDragging(false);

    const files = event.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      
      if (file.type.startsWith("video/")) {
        onVideoSelect(file); 
      } else {
        alert("Por favor, arraste apenas arquivos de vídeo.");
      }
    }
  };

  return (
    <div className="feature-card">
      <div className="icon-wrapper icon-legendagem">
        <IoGridOutline />
      </div>
      <h3>Legendagem de Vídeos</h3>
      <p className="feature-description">
        Envie seu vídeo e gere legendas automáticas com identificação de interlocutores
      </p>

      <div className="layout-column">
        
        <div 
          className={`card card-large card-upload ${isDragging ? 'dragging' : ''}`}
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <LuUpload className="card-large-icon" />
          <p><strong>Arraste e solte seu vídeo aqui</strong></p>
          <p className="text-muted">ou clique para selecionar</p>
          
          <button className="button-primary" onClick={handleButtonClick}>
            Selecionar Vídeo
          </button>
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="video/mp4,video/x-m4v,video/*"
            style={{ display: "none" }}
          />
        </div>

        <div className="card card-small">
          <LuCaptions className="card-small-icon icon-purple" />
          <div>
            <h4>Legendas Automáticas</h4>
            <p className="text-muted">Geração automática com reconhecimento de fala</p>
          </div>
        </div>

        <div className="card card-small">
          <LuUsers className="card-small-icon icon-purple" />
          <div>
            <h4>Identificação de Vozes</h4>
            <p className="text-muted">Reconhecimento automático de interlocutores</p>
          </div>
        </div>

        <div className="card card-small">
          <LuPalette className="card-small-icon icon-purple" />
          <div>
            <h4>Personalização Total</h4>
            <p className="text-muted">Edite texto, estilo, cores e muito mais</p>
          </div>
        </div>
        
        <p className="text-footer-column">Formatos suportados: MP4, MOV, AVI, WebM</p>
      </div>
    </div>
  );
}

export default VideoCard;