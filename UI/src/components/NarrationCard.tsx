import { LuAudioLines, LuMic, LuGauge, LuDownload } from "react-icons/lu";
import { IoVolumeMediumOutline } from "react-icons/io5";

// --- ADIÇÃO 1: Interface de Props ---
// Define que este componente espera receber uma função chamada 'onSelect'
interface NarrationCardProps {
  onSelect: () => void;
}

// --- ADIÇÃO 2: Recebe a prop 'onSelect' ---
// Mudamos de 'function NarrationCard()' para receber '{ onSelect }'
function NarrationCard({ onSelect }: NarrationCardProps) {
  return (
    <div className="feature-card">
      <div className="icon-wrapper icon-narracao">
        <IoVolumeMediumOutline />
      </div>
      <h3>Narração de Texto</h3>
      <p className="feature-description">
        Converta texto em áudio natural com vozes em português
      </p>

      <div className="layout-column">
        <div className="card card-large card-upload">
          <LuAudioLines className="card-large-icon" />
          <p>
            <strong>Crie narrações profissionais a partir de texto</strong>
          </p>
          <p className="text-muted">ou clique para selecionar</p>

          {/* --- ADIÇÃO 3: Adiciona o onClick ao botão --- */}
          <button className="button-primary" onClick={onSelect}>
            Selecionar Arquivo
          </button>
        </div>

        <div className="card card-small">
          <LuMic className="card-small-icon icon-purple" />
          <div>
            <h4>Vozes Naturais</h4>
            <p className="text-muted">
              Múltiplas vozes em português brasileiro e europeu
            </p>
          </div>
        </div>

        <div className="card card-small">
          <LuGauge className="card-small-icon icon-purple" />
          <div>
            <h4>Controle de Velocidade</h4>
            <p className="text-muted">
              Ajuste a velocidade de narração conforme necessário
            </p>
          </div>
        </div>

        <div className="card card-small">
          <LuDownload className="card-small-icon icon-purple" />
          <div>
            <h4>Download em MP3</h4>
            <p className="text-muted">
              Baixe seu áudio narrado em alta qualidade
            </p>
          </div>
        </div>

        <p className="text-footer-column">
          Cole seu texto ou importe de arquivos TXT, DOCX
        </p>
      </div>
    </div>
  );
}

export default NarrationCard;
