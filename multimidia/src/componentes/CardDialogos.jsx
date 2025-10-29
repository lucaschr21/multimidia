import React from "react";
import { FiPlus } from "react-icons/fi";
import DialogoItem from "./DialogoItem";

function CardDialogos({
  dialogos,
  interlocutores,
  onAdicionarFala,
  onAtualizarFala,
  onApagarFala,
}) {
  return (
    <div className="card shadow-sm border-0">
      <div className="card-header bg-white d-flex justify-content-between align-items-center py-3">
        <h5 className="mb-0 fw-semibold">Diálogos / Falas</h5>
        <div>
          <button className="btn btn-outline-secondary btn-sm me-2">
            Exemplo
          </button>
          <button
            className="btn btn-dark btn-sm d-flex align-items-center gap-1 d-inline-flex"
            onClick={onAdicionarFala}
          >
            <FiPlus size="1.1em" />
            Adicionar Fala
          </button>
        </div>
      </div>
      <div className="card-body d-flex flex-column gap-3">
        {dialogos.map((dialogo) => (
          <DialogoItem
            key={dialogo.id}
            dialogo={dialogo}
            interlocutores={interlocutores}
            onApagar={onApagarFala}
            onAtualizar={onAtualizarFala}
          />
        ))}

        {dialogos.length === 0 && (
          <p className="text-center text-muted">Nenhuma fala adicionada.</p>
        )}
      </div>
    </div>
  );
}

export default CardDialogos;
