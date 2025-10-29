import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FiChevronLeft } from "react-icons/fi";
import CardInterlocutores from "../componentes/CardInterlocutores";
import CardDialogos from "../componentes/CardDialogos";
import CardConfiguracoes from "../componentes/CardConfiguracoes";

const dadosIniciaisInterlocutores = [
  { id: 1, nome: "Narrador", tipo: "BR Masculino", cor: "#0d6efd" },
  { id: 2, nome: "Personagem1", tipo: "BR Feminino", cor: "#198754" },
];

const dadosIniciaisDialogos = [
  {
    id: 101,
    numero: 1,
    texto: "Olá! Bem-vindo ao sistema de narração com múltiplas vozes.",
    interlocutorId: 1,
  },
  {
    id: 102,
    numero: 2,
    texto:
      "Agora você pode criar diálogos realistas com diferentes interlocutores!",
    interlocutorId: 2,
  },
];

function PaginaNarracao() {
  const [interlocutores, setInterlocutores] = useState(
    dadosIniciaisInterlocutores
  );
  const [dialogos, setDialogos] = useState(dadosIniciaisDialogos);

  const handleAdicionarInterlocutor = (novo) => {
    setInterlocutores((lista) => [...lista, { ...novo, id: Date.now() }]);
  };
  const handleAtualizarInterlocutor = (atualizado) => {
    setInterlocutores((lista) =>
      lista.map((item) => (item.id === atualizado.id ? atualizado : item))
    );
  };
  const handleApagarInterlocutor = (id) => {
    const isBeingUsed = dialogos.some(
      (dialogo) => dialogo.interlocutorId === id
    );
    if (isBeingUsed) {
      alert(
        "Não é possível apagar este interlocutor!\n\nEle está sendo usado em um ou mais diálogos. Por favor, mude o narrador dessas falas antes de apagar."
      );
      return;
    }
    if (interlocutores.length <= 1) {
      alert(
        "Não é possível apagar o último interlocutor.\n\nVocê precisa ter pelo menos um narrador disponível."
      );
      return;
    }
    if (window.confirm("Tem certeza que deseja apagar este interlocutor?")) {
      setInterlocutores((lista) => lista.filter((item) => item.id !== id));
    }
  };
  const handleAdicionarFala = () => {
    if (interlocutores.length === 0) {
      alert("Adicione um interlocutor primeiro.");
      return;
    }

    const novaFala = {
      id: Date.now(),
      numero: dialogos.length + 1,
      texto: "",
      interlocutorId: interlocutores[0].id,
    };
    setDialogos((lista) => [...lista, novaFala]);
  };

  const handleAtualizarFala = (id, camposAtualizados) => {
    setDialogos((lista) =>
      lista.map((fala) =>
        fala.id === id ? { ...fala, ...camposAtualizados } : fala
      )
    );
  };

  const handleApagarFala = (id) => {
    setDialogos((lista) =>
      lista
        .filter((fala) => fala.id !== id)
        .map((fala, index) => ({ ...fala, numero: index + 1 }))
    );
  };

  return (
    <div
      className="container-fluid py-4 px-md-5 bg-light"
      style={{ minHeight: "100vh" }}
    >
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-0">
            Geração de Narração com Múltiplas Vozes
          </h2>
          <p className="text-muted mb-0">
            Crie diálogos realistas com diferentes interlocutores e vozes
          </p>
        </div>
        <Link
          to="/"
          className="btn btn-outline-secondary d-flex align-items-center gap-1 fw-semibold"
        >
          <FiChevronLeft size="1.2em" /> Voltar
        </Link>
      </div>

      <div className="row g-4">
        <div className="col-lg-8 d-flex flex-column gap-4">
          <CardInterlocutores
            interlocutores={interlocutores}
            onAdicionar={handleAdicionarInterlocutor}
            onAtualizar={handleAtualizarInterlocutor}
            onApagar={handleApagarInterlocutor}
          />
          <CardDialogos
            dialogos={dialogos}
            interlocutores={interlocutores}
            onAdicionarFala={handleAdicionarFala}
            onAtualizarFala={handleAtualizarFala}
            onApagarFala={handleApagarFala}
          />
        </div>

        <div className="col-lg-4">
          <CardConfiguracoes />
        </div>
      </div>
    </div>
  );
}

export default PaginaNarracao;
