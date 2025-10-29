import React, { useState, useEffect } from "react";
import { FiTrash2, FiCheck } from "react-icons/fi";

function DialogoItem({ dialogo, interlocutores, onApagar, onAtualizar }) {
  const [texto, setTexto] = useState(dialogo.texto);

  useEffect(() => {
    setTexto(dialogo.texto);
  }, [dialogo.texto]);

  const handleTextChange = (e) => {
    setTexto(e.target.value);
  };
  const handleTextBlur = () => {
    if (texto !== dialogo.texto) {
      onAtualizar(dialogo.id, { texto: texto });
    }
  };

  const handleDropdownSelect = (newId) => {
    onAtualizar(dialogo.id, { interlocutorId: newId });
  };

  const handleApagarClick = () => {
    onApagar(dialogo.id);
  };

  const interlocutorSelecionado =
    interlocutores.find((i) => i.id === dialogo.interlocutorId) ||
    interlocutores[0] ||
    {};
  const tag = interlocutorSelecionado.nome || "Apagado";
  const cor = interlocutorSelecionado.cor || "#dc3545";
  const tipo = interlocutorSelecionado.tipo || "";

  return (
    <div className="border rounded p-3 position-relative">
      <div className="d-flex align-items-center gap-2 mb-2">
        <span className="badge rounded-pill text-bg-secondary fw-normal">
          #{dialogo.numero}
        </span>
        <span
          className={`badge rounded-pill`}
          style={{ backgroundColor: cor, color: "#fff" }}
        >
          {tag}
        </span>

        <button
          className="btn btn-sm btn-link text-danger position-absolute"
          style={{ top: "5px", right: "5px" }}
          onClick={handleApagarClick}
        >
          <FiTrash2 />
        </button>
      </div>

      <textarea
        className="form-control border-0 p-0"
        value={texto}
        onChange={handleTextChange}
        onBlur={handleTextBlur}
        rows="3"
        style={{ resize: "none", boxShadow: "none" }}
      ></textarea>

      <hr className="my-2" />

      <div className="dropdown w-100">
        <button
          className="btn w-100 d-flex align-items-center justify-content-between p-2"
          type="button"
          data-bs-toggle="dropdown"
          aria-expanded="false"
          style={{
            backgroundColor: "#f8f9fa",
            border: "1px solid #eee",
            borderRadius: "0.375rem",
            textAlign: "left",
          }}
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
            <span className="fw-semibold">{tag}</span>
            <span className="text-muted ms-1">({tipo})</span>
          </div>
        </button>

        <ul className="dropdown-menu w-100">
          {interlocutores.map((interlocutor) => (
            <li key={interlocutor.id}>
              <button
                className="dropdown-item d-flex align-items-center justify-content-between"
                type="button"
                onClick={() => handleDropdownSelect(interlocutor.id)}
              >
                <div>
                  <div
                    className="d-inline-block rounded-circle me-2"
                    style={{
                      width: "10px",
                      height: "10px",
                      backgroundColor: interlocutor.cor,
                      verticalAlign: "middle",
                    }}
                  ></div>
                  <span className="fw-semibold">{interlocutor.nome}</span>
                  <span className="text-muted ms-1">({interlocutor.tipo})</span>
                </div>

                {interlocutor.id === dialogo.interlocutorId && (
                  <FiCheck className="text-success" size="1.2em" />
                )}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default DialogoItem;
