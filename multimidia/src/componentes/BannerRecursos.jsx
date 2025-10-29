import { FiCheck } from "react-icons/fi";

function BannerRecursos() {
  return (
    <div
      className="card shadow-sm border-0"
      style={{ backgroundColor: "#f5f3ff" }}
    >
      <div className="card-body p-4 p-md-5">
        <h4 className="text-center fw-semibold mb-4">Recursos Disponíveis</h4>

        <div className="row text-center">
          <div className="col-md-4 mb-3 mb-md-0">
            <div className="d-flex align-items-center justify-content-center gap-2">
              <FiCheck className="text-success" size="1.2em" />
              <span>Processamento com IA</span>
            </div>
          </div>

          <div className="col-md-4 mb-3 mb-md-0">
            <div className="d-flex align-items-center justify-content-center gap-2">
              <FiCheck className="text-success" size="1.2em" />
              <span>Edição Completa</span>
            </div>
          </div>

          <div className="col-md-4">
            <div className="d-flex align-items-center justify-content-center gap-2">
              <FiCheck className="text-success" size="1.2em" />
              <span>Export em Alta Qualidade</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BannerRecursos;
