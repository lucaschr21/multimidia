import React from "react";
import { FiEdit2, FiTrash2 } from "react-icons/fi";

function InterlocutorItem({ interlocutor, onApagar, onEditar }) {
  const { id, nome, tipo, cor } = interlocutor;

  const handleApagar = () => {
    if (window.confirm(`Tem certeza que deseja apagar "${nome}"?`)) {
      onApagar(id);
    }
  };

  const handleEditar = () => {
    onEditar(interlocutor);
  };

  return (
    <div
      className="d-flex justify-content-between align-items-center p-2 rounded h-100"
      style={{ backgroundColor: `${cor}20` }}
    >
      <div>
        <div
          className="d-inline-block rounded-circle me-2"
          style={{
            width: "10px",
            height: "10px",
            backgroundColor: cor,
            verticalAlign: "middle",
          }}
        ></div>
        <span className="fw-semibold">{nome}</span>
        <span className="text-muted ms-1">({tipo})</span>
      </div>
      <div>
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
