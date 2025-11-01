import React, { useState, useMemo, useEffect } from 'react';
import './Narracao.css';
import type { Interlocutor, Fala } from './types';
import {
  ChevronLeft,
  Edit2,
  Settings,
  Info,
  MicVocal, 
  Download,
} from 'lucide-react';
import { AddInterlocutorModal } from './AddInterlocutorModal';
import { Toast, type ToastData } from './toast'; 
import { AudioPlayer } from './AudioPlayer'; 
import { VOICE_MAP } from './voiceData';

// --- Interface de Props ---
interface NarracaoProps {
  onGoBack: () => void;
}

// --- DADOS INICIAIS ---
const INITIAL_INTERLOCUTOR: Interlocutor = {
  id: 'id-narrador-unico',
  nome: 'Narrador',
  voz: 'alloy', 
  cor: '#3B82F6', 
};

const INITIAL_FALA: Fala = { 
  id: 'fala-unica', 
  interlocutorId: 'id-narrador-unico', 
  texto: 'Olá! Bem-vindo ao sistema de narração com múltiplas vozes.' 
};
// --- FIM DOS DADOS ---


export const Narracao: React.FC<NarracaoProps> = ({ onGoBack }) => {
  const [interlocutores, setInterlocutores] =
    useState<Interlocutor[]>([INITIAL_INTERLOCUTOR]); 
  const [fala, setFala] = useState<Fala>(INITIAL_FALA);
  
  const [velocidade, setVelocidade] = useState(1.0);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [interlocutorParaEditar, setInterlocutorParaEditar] =
    useState<Interlocutor | null>(null);
  const [toast, setToast] = useState<ToastData | null>(null);
  const [progress, setProgress] = useState(0);
  const [loadingStatus, setLoadingStatus] = useState("");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const interlocutorUnico = interlocutores[0];

  // --- handleGerarNarracao ---
  const handleGerarNarracao = async () => {
    console.log('Iniciando geração...');
    setIsLoading(true);
    setProgress(0);
    setLoadingStatus("Conectando ao n8n...");
    setAudioUrl(null); 

    const n8nWebhookUrl = "https://n8n.belembioenergia.com.br/webhook/9a1e2975-a921-4505-9533-1dc28c896b91";

    const falaUnica = fala; 
    const interlocutorUnico = interlocutores[0];

    if (!falaUnica || !interlocutorUnico) {
      setToast({ message: "Erro: Não foi possível encontrar a fala ou o interlocutor.", type: "warning" });
      setIsLoading(false);
      return;
    }

    const dadosParaEnviar = {
      velocidade: velocidade,
      vc_type: interlocutorUnico.voz, 
      text: falaUnica.texto        
    };

    try {
      setLoadingStatus("Processando múltiplas vozes...");
      setProgress(25);

      const response = await fetch(n8nWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dadosParaEnviar) 
      });

      if (!response.ok) {
        throw new Error(`Erro na requisição: ${response.statusText}`);
      }
      
      setLoadingStatus("Recebendo áudio...");
      setProgress(80); 
      const audioBlob = await response.blob();
      const urlDoAudioReal = URL.createObjectURL(audioBlob);

      setLoadingStatus("Geração concluída!");
      setProgress(100);
      
      setTimeout(() => {
        setIsLoading(false);
        setAudioUrl(urlDoAudioReal);
      }, 500);

    } catch (error) {
      console.error("Erro ao gerar áudio:", error);
      setIsLoading(false);
      setProgress(0);
      setToast({ 
        message: "Erro ao gerar o áudio. Verifique o n8n.", 
        type: 'warning' 
      });
    }
  };
  // --- FIM de handleGerarNarracao ---


  const { totalPalavras, totalCaracteres } = useMemo(() => {
    const textoCompleto = fala.texto;
    return {
      totalPalavras: textoCompleto.split(/\s+/).filter(Boolean).length,
      totalCaracteres: textoCompleto.length,
    };
  }, [fala]);

  const audioDuration = useMemo(() => {
    const baseDuration = totalCaracteres / 15;
    if (velocidade === 0) return 0;
    return Math.round(baseDuration / velocidade);
  }, [totalCaracteres, velocidade]);

  // --- CORRIGIDO: Agora depende de 'fala' (singular) ---
  useEffect(() => {
    setAudioUrl(null);
  }, [fala, interlocutores, velocidade]);


  // --- FUNÇÕES DE INTERLOCUTORES ---
  const handleEditInterlocutor = (
    id: string,
    data: Omit<Interlocutor, 'id'>
  ) => {
    setInterlocutores((atuais) =>
      atuais.map((p) => (p.id === id ? { id, ...data } : p))
    );
    setToast({
      message: "Interlocutor atualizado!",
      type: 'success'
    });
  };
  
  const handleOpenEditModal = (interlocutor: Interlocutor) => {
    setInterlocutorParaEditar(interlocutor);
    setIsModalOpen(true);
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setInterlocutorParaEditar(null);
  };


  return (
    <div className="narracao-container">
      {isLoading && (
        <div className="loading-overlay">
          <div className="progress-modal-content">
            <span className="progress-status-text">{loadingStatus}</span>
            <div className="progress-bar-container">
              <div 
                className="progress-bar-fill" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <span className="progress-percentage-text">
              {progress}% concluído
            </span>
          </div>
        </div>
      )}

      <header className="narracao-header">
         <div>
          <h1>Geração de Narração com Múltiplas Vozes</h1>
          <p>Crie diálogos realistas com diferentes interlocutores e vozes</p>
        </div>
        <button className="btn btn-secondary" onClick={onGoBack}>
          <ChevronLeft size={16} /> Voltar
        </button>
      </header>
      <main className="narracao-main">
        <div className="narracao-col-left">
          
          <section className="card">
             <div className="card-header">
              <h2>Interlocutores e Vozes</h2>
            </div>
            {/* Exibe o único interlocutor */}
            <div className="interlocutores-list">
              <div key={interlocutorUnico.id} className="interlocutor-item">
                <span className="dot" style={{ backgroundColor: interlocutorUnico.cor }} />
                <div className="interlocutor-info">
                  <strong>{interlocutorUnico.nome}</strong>
                  <span>{VOICE_MAP[interlocutorUnico.voz] || interlocutorUnico.voz}</span>
                </div>
                <div className="interlocutor-actions">
                  <button
                    className="btn-icon"
                    onClick={() => handleOpenEditModal(interlocutorUnico)}
                  >
                    <Edit2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section className="card">
            <div className="card-header">
              <h2>Diálogos / Falas</h2>
              <div className="card-header-actions">
                {/* Botões removidos */}
              </div>
            </div>
            {/* Exibe a única fala */}
            <div className="falas-list">
              <div key={fala.id} className="fala-item">
                <div className="fala-header">
                  <span className="fala-numero">#1</span>
                  <span
                    className="fala-tag"
                    style={{
                      backgroundColor: `${interlocutorUnico.cor}20`,
                      color: interlocutorUnico.cor,
                    }}
                  >
                    {interlocutorUnico.nome}
                  </span>
                </div>
                <textarea
                  className="fala-textarea"
                  value={fala.texto}
                  onChange={(e) => {
                    const novoTexto = e.target.value;
                    // Atualiza o estado da fala singular
                    setFala(falaAtual => ({ ...falaAtual, texto: novoTexto }));
                  }}
                  rows={3}
                />
              </div>
            </div>

            <footer className="card-status-bar">
              <span>1 fala</span>
              <span className="dot-separator">•</span>
              <span>{totalPalavras} palavras</span>
              <span className="dot-separator">•</span>
              <span>{totalCaracteres} caracteres</span>
              <span className="time-separator">
                ~{audioDuration}s de áudio
              </span>
            </footer>
          </section>

          {/* CARD DO PLAYER DE ÁUDIO (REAL) */}
          {audioUrl && (
            <section className="card player-card">
              <div className="player-header">
                <MicVocal size={18} />
                <h2>Player de Áudio</h2>
              </div>
              
              <AudioPlayer 
                src={audioUrl} 
                estimatedDuration={audioDuration} 
              />
              
              <a 
                href={audioUrl} 
                download="narracao_sublegend.mp3"
                className="btn btn-primary btn-download"
              >
                <Download size={16} />
                Baixar Áudio com Múltiplas Vozes (MP3)
              </a>
            </section>
          )}

        </div>

        {/* Coluna da Direita (Configurações Globais) */}
        <div className="narracao-col-right">
           <section className="card">
            <div className="card-header">
              <h2>
                <Settings size={18} /> Configurações Globais
              </h2>
            </div>
            <div className="settings-item">
              <div className="settings-label">
                <label>Velocidade Geral</label>
                <span>{velocidade.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={velocidade}
                onChange={(e) => setVelocidade(parseFloat(e.target.value))}
                className="slider"
              />
              <div className="settings-slider-labels">
                <span>Lento</span>
                <span>Normal</span>
                <span>Rápido</span>
              </div>
            </div>
          </section>
          <button
            className="btn btn-primary btn-gerar"
            onClick={handleGerarNarracao}
            disabled={isLoading}
          >
            {isLoading ? 'Gerando...' : 'Gerar Narração'}
          </button>
          
          
        </div>
      </main>

      <AddInterlocutorModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onEdit={handleEditInterlocutor}
        interlocutorExistente={interlocutorParaEditar}
      />
      
      <Toast 
        toast={toast} 
        onClose={() => setToast(null)} 
      />
    </div>
  );
};