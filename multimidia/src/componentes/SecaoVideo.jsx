import Recurso from "./Recurso";
import {
  FiUploadCloud,
  FiCheckSquare,
  FiEdit,
  FiMic,
  FiVideo,
} from "react-icons/fi";

function SecaoVideo() {
  const iconeLegendas = <FiCheckSquare style={{ color: "#d946ef" }} />;
  const iconeIdentificacao = <FiMic style={{ color: "#8b5cf6" }} />;
  const iconePersonalizacao = <FiEdit style={{ color: "#ef4444" }} />;

  return (
    <div className="d-flex flex-column gap-3">
      {" "}
      <div className="text-center">
        <div
          className="d-inline-flex align-items-center justify-content-center rounded-circle mx-auto mb-3"
          style={{ width: "60px", height: "60px", backgroundColor: "#e0f2fe" }}
        >
          <FiVideo style={{ color: "#0284c7", fontSize: "2.2em" }} />{" "}
        </div>
        <h2 className="fw-semibold mt-2">Legendagem de Vídeos</h2>
        <p className="text-muted">
          Envie seu vídeo e gere legendas automáticas com identificação de
          interlocutores
        </p>
      </div>
      <div
        className="card shadow-sm"
        style={{ border: "2px dashed #ddd", backgroundColor: "#fafafa" }}
      >
        <div className="card-body p-5 text-center d-flex flex-column align-items-center">
          <FiUploadCloud className="text-muted" size="3em" />
          <p className="fs-5 fw-semibold mt-3">
            Arraste e solte seu vídeo aqui
          </p>
          <p className="text-muted mb-4">ou clique para selecionar</p>

          <button
            className="btn btn-outline-dark btn-lg px-5"
            style={{ borderRadius: "50px", fontWeight: 500 }}
          >
            Selecionar Vídeo
          </button>
        </div>
      </div>
      <div className="card shadow-sm border-0">
        <div className="card-body p-2">
          <Recurso
            icon={iconeLegendas}
            title="Legendas Automáticas"
            description="Geração automática com reconhecimento de fala"
          />
        </div>
      </div>
      <div className="card shadow-sm border-0">
        <div className="card-body p-2">
          <Recurso
            icon={iconeIdentificacao}
            title="Identificação de Vozes"
            description="Reconhecimento automático de interlocutores"
          />
        </div>
      </div>
      <div className="card shadow-sm border-0">
        <div className="card-body p-2">
          <Recurso
            icon={iconePersonalizacao}
            title="Personalização Total"
            description="Edite texto, estilo, cores e muito mais"
          />
        </div>
      </div>
      <p className="text-center text-muted small">
        Formatos suportados: MP4, MOV, AVI, WebM
      </p>
    </div>
  );
}

export default SecaoVideo;
