import { FiEdit2, FiTrash2 } from "react-icons/fi";

function InterlocutorItem({ interlocutor, onApagar, onEditar }) {
  const { id, nome, tipo, cor } = interlocutor;

  const handleApagar = () => {
    onApagar(id);
  };

  const handleEditar = () => {
    onEditar(interlocutor);
  };

  return (
    <div className="d-flex justify-content-between align-items-center p-2 rounded h-100 bg-white border shadow-sm">
      <div className="d-flex align-items-center" style={{ gap: "0.6rem" }}>
        <div
          className="d-inline-block rounded-circle"
          style={{
            width: "12px",
            height: "12px",
            backgroundColor: cor,
            flexShrink: 0,
          }}
        ></div>

        <div>
          <div
            className="fw-semibold"
            style={{ lineHeight: 1.2, fontSize: "0.95rem" }} // 'lineHeight' junta os textos
          >
            {nome}
          </div>
          <div
            className="text-muted"
            style={{ lineHeight: 1.2, fontSize: "0.8rem" }} // 'small' e 'lineHeight'
          >
            ({tipo})
          </div>
        </div>
      </div>

      <div className="d-flex">
        <button
          className="btn btn-sm btn-link text-secondary"
          onClick={handleEditar}
        >
          <FiEdit2 size="0.9em" />
        </button>
        <button
          className="btn btn-sm btn-link text-danger"
          onClick={handleApagar}
        >
          <FiTrash2 size="0.9em" />
        </button>
      </div>
    </div>
  );
}

export default InterlocutorItem;
