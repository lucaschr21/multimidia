import React from "react";
import { FiPlus } from "react-icons/fi";
import DialogoItem from "./DialogoItem";

function CardDialogos({
  dialogos,
  interlocutores,
  onAdicionarFala,
  onAtualizarFala,
  onApagarFala,
  onCarregarExemplo,
  totalFalas,
  totalPalavras,
  totalCaracteres,
  duracaoEstimada,
}) {
  const duracaoFormatada = `~${Math.round(duracaoEstimada)}s de áudio`;

  return (
    <section className="card shadow-sm border-0">
      <div className="card-header bg-white d-flex justify-content-between align-items-center py-3">
        <h5 className="mb-0 fw-semibold">Diálogos / Falas</h5>
        <div>
          <button
            className="btn btn-outline-secondary btn-sm me-2"
            onClick={onCarregarExemplo}
          >
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
          <p className="text-center text-muted">
            Nenhuma fala adicionada. Clique em "Adicionar Fala" ou "Exemplo".
          </p>
        )}
      </div>

      {totalFalas > 0 && (
        <div className="card-footer bg-white d-flex justify-content-between text-muted small py-2 px-3">
          <div className="d-flex flex-wrap gap-2 gap-md-3">
            <span>{totalFalas} falas</span>
            <span className="d-none d-md-inline">•</span>
            <span>{totalPalavras} palavras</span>
            <span className="d-none d-md-inline">•</span>
            <span>{totalCaracteres} caracteres</span>
          </div>

          <div>
            <span className="fw-semibold">{duracaoFormatada}</span>
          </div>
        </div>
      )}
    </section>
  );
}

export default CardDialogos;
