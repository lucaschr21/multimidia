import React, { useState, useEffect } from "react";

function ModalAdicionarInterlocutor({
  show,
  onClose,
  onAdicionar,
  onAtualizar,
  interlocutorParaEditar,
}) {
  const isEditMode = interlocutorParaEditar !== null;

  const cores = [
    "#0d6efd",
    "#20c997",
    "#f59e0b",
    "#dc3545",
    "#8b5cf6",
    "#e11d8c",
    "#0dcaf0",
    "#198754",
    "#fd7e14",
    "#6610f2",
  ];

  const [nome, setNome] = useState("");
  const [tipo, setTipo] = useState("as Masculino");
  const [corSelecionada, setCorSelecionada] = useState(cores[2]);

  useEffect(() => {
    if (show) {
      if (isEditMode) {
        setNome(interlocutorParaEditar.nome);
        setTipo(interlocutorParaEditar.tipo);
        setCorSelecionada(interlocutorParaEditar.cor);
      } else {
        setNome("");
        setTipo("as Masculino");
        setCorSelecionada(cores[2]);
      }
    }
  }, [show, interlocutorParaEditar, isEditMode]);

  const handleSubmit = () => {
    if (!nome) {
      alert("Por favor, insira um nome.");
      return;
    }

    const dadosDoInterlocutor = {
      nome: nome,
      tipo: tipo,
      cor: corSelecionada,
    };

    if (isEditMode) {
      onAtualizar({ ...dadosDoInterlocutor, id: interlocutorParaEditar.id });
    } else {
      onAdicionar(dadosDoInterlocutor);
    }

    onClose();
  };

  if (!show) {
    return null;
  }

  return (
    <>
      <div className="modal-backdrop fade show"></div>
      <div
        className="modal fade show"
        style={{ display: "block" }}
        tabIndex="-1"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title fw-semibold">
                {isEditMode
                  ? "Atualizar Interlocutor"
                  : "Adicionar Interlocutor"}
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
              ></button>
            </div>

            <div className="modal-body d-flex flex-column gap-3">
              <div>
                <label htmlFor="nome" className="form-label fw-semibold">
                  Nome do Interlocutor
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="nome"
                  placeholder="Ex: Narrador, Personagem1..."
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="voz" className="form-label fw-semibold">
                  Voz
                </label>
                <select
                  id="voz"
                  className="form-select"
                  value={tipo}
                  onChange={(e) => setTipo(e.target.value)}
                >
                  <option value="as Masculino">
                    BR Ricardo (BR - Masculino)
                  </option>
                  <option value="as Feminino">
                    BR Francisca (BR - Feminino)
                  </option>
                  <option value="as Masculino">
                    PT Joaquim (PT - Masculino)
                  </option>
                </select>
              </div>

              <div>
                <label htmlFor="cor" className="form-label fw-semibold">
                  Cor de Identificação
                </label>
                <div className="d-flex align-items-center border rounded p-2">
                  <div
                    className="rounded"
                    style={{
                      width: "30px",
                      height: "30px",
                      backgroundColor: corSelecionada,
                    }}
                  ></div>
                  <input
                    type="text"
                    className="form-control border-0"
                    id="cor"
                    value={corSelecionada}
                    onChange={(e) => setCorSelecionada(e.target.value)}
                    style={{ boxShadow: "none" }}
                  />
                </div>
                <div className="d-flex flex-wrap gap-2 mt-2">
                  {cores.map((cor) => (
                    <div
                      key={cor}
                      onClick={() => setCorSelecionada(cor)}
                      className="rounded"
                      style={{
                        width: "30px",
                        height: "30px",
                        backgroundColor: cor,
                        cursor: "pointer",
                        border:
                          corSelecionada === cor ? "3px solid #fff" : "none",
                        boxShadow:
                          corSelecionada === cor ? "0 0 0 2px #000" : "none",
                      }}
                    ></div>
                  ))}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-dark w-100"
                onClick={handleSubmit}
              >
                {isEditMode ? "Atualizar" : "Adicionar"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ModalAdicionarInterlocutor;
