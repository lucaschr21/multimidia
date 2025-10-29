import React, { useState } from "react";
import { FiPlus } from "react-icons/fi";
import ModalAdicionarInterlocutor from "./ModalAdicionarInterlocutor";
import InterlocutorItem from "./InterlocutorItem";

function CardInterlocutores({
  interlocutores,
  onAdicionar,
  onAtualizar,
  onApagar,
}) {
  const [showModal, setShowModal] = useState(false);
  const [interlocutorParaEditar, setInterlocutorParaEditar] = useState(null);

  const fecharModal = () => {
    setShowModal(false);
    setInterlocutorParaEditar(null);
  };

  const abrirModalCriacao = () => {
    setInterlocutorParaEditar(null);
    setShowModal(true);
  };

  const abrirModalEdicao = (interlocutor) => {
    setInterlocutorParaEditar(interlocutor);
    setShowModal(true);
  };

  return (
    <>
      <div className="card shadow-sm border-0 h-100">
        <div className="card-header bg-white d-flex justify-content-between align-items-center py-3">
          <h5 className="mb-0 fw-semibold">Interlocutores e Vozes</h5>
          <button
            className="btn btn-dark btn-sm d-flex align-items-center gap-1"
            onClick={abrirModalCriacao}
          >
            <FiPlus size="1.1em" />
            Adicionar
          </button>
        </div>

        <div className="card-body">
          <div className="row g-3">
            {interlocutores.map((interlocutor) => (
              <div className="col-md-6" key={interlocutor.id}>
                <InterlocutorItem
                  interlocutor={interlocutor}
                  onApagar={onApagar}
                  onEditar={abrirModalEdicao}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <ModalAdicionarInterlocutor
        show={showModal}
        onClose={fecharModal}
        onAdicionar={onAdicionar}
        onAtualizar={onAtualizar}
        interlocutorParaEditar={interlocutorParaEditar}
      />
    </>
  );
}

export default CardInterlocutores;
