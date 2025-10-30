import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FiChevronLeft } from "react-icons/fi";
import axios from "axios";
import CardInterlocutores from "../componentes/CardInterlocutores";
import CardDialogos from "../componentes/CardDialogos";
import CardConfiguracoes from "../componentes/CardConfiguracoes";
import AudioPlayer from "../componentes/AudioPlayer";
import Toast from "../componentes/Toast";

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
const exemplosDialogos = [
  { id: 201, numero: 1, texto: "Era uma vez...", interlocutorId: 1 },
  { id: 202, numero: 2, texto: "Eu sempre quis...", interlocutorId: 2 },
  { id: 203, numero: 3, texto: "Com dedicação...", interlocutorId: 1 },
];
const charsPorSegundoNormal = 16.0;

const N8N_WEBHOOK_URL_GERAR =
  "https://n8n.belembioenergia.com.br/webhook-test/9a1e2975-a921-4505-9533-1dc28c896b91";

function PaginaNarracao() {
  const [interlocutores, setInterlocutores] = useState(
    dadosIniciaisInterlocutores
  );
  const [dialogos, setDialogos] = useState(dadosIniciaisDialogos);
  const [velocidade, setVelocidade] = useState(1.0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioResult, setAudioResult] = useState(null);
  const [toast, setToast] = useState(null);

  const handleAdicionarInterlocutor = (novo) => {
    setInterlocutores((lista) => [...lista, { ...novo, id: Date.now() }]);
    setToast({ message: "Interlocutor adicionado!", type: "success" });
  };
  const handleAtualizarInterlocutor = (atualizado) => {
    setInterlocutores((lista) =>
      lista.map((item) => (item.id === atualizado.id ? atualizado : item))
    );
    setToast({ message: "Interlocutor atualizado!", type: "success" });
  };
  const handleApagarInterlocutor = (id) => {
    const isBeingUsed = dialogos.some(
      (dialogo) => dialogo.interlocutorId === id
    );
    if (isBeingUsed) {
      setToast({
        message:
          "Este interlocutor possui falas. Remova ou reatribua as falas primeiro.",
        type: "warning",
      });
      return;
    }
    if (interlocutores.length <= 1) {
      setToast({
        message: "Não é possível apagar o último interlocutor.",
        type: "warning",
      });
      return;
    }
    setInterlocutores((lista) => lista.filter((item) => item.id !== id));
    setToast({ message: "Interlocutor apagado.", type: "success" });
  };
  const handleAdicionarFala = () => {
    if (interlocutores.length === 0) {
      setToast({
        message: "Adicione um interlocutor primeiro.",
        type: "warning",
      });
      return;
    }
    const novaFala = {
      id: Date.now(),
      numero: dialogos.length + 1,
      texto: "",
      interlocutorId: interlocutores[0].id,
    };
    setDialogos((lista) => [...lista, novaFala]);
    setAudioResult(null);
  };
  const handleAtualizarFala = (id, camposAtualizados) => {
    setDialogos((lista) =>
      lista.map((fala) =>
        fala.id === id ? { ...fala, ...camposAtualizados } : fala
      )
    );
    setAudioResult(null);
  };
  const handleApagarFala = (id) => {
    setDialogos((lista) =>
      lista
        .filter((fala) => fala.id !== id)
        .map((fala, index) => ({ ...fala, numero: index + 1 }))
    );
    setAudioResult(null);
    setToast({ message: "Fala apagada.", type: "success" });
  };
  const handleCarregarExemplo = () => {
    if (
      window.confirm(
        "Isso irá substituir seus diálogos atuais pelos de exemplo. Deseja continuar?"
      )
    ) {
      setInterlocutores(dadosIniciaisInterlocutores);
      setDialogos(exemplosDialogos);
      setAudioResult(null);
      setToast({ message: "Exemplo carregado!", type: "success" });
    }
  };

  const handleGerarNarracao = async () => {
    setIsGenerating(true);
    setAudioResult(null);
    setToast(null);

    const mapaDeVozes = new Map(interlocutores.map((i) => [i.id, i.tipo]));
    const falasParaEnviar = dialogos.map((fala) => ({
      texto: fala.texto,
      voz: mapaDeVozes.get(fala.interlocutorId),
    }));
    const payload = {
      velocidade: velocidade,
      falas: falasParaEnviar,
    };

    try {
      const response = await axios.post(N8N_WEBHOOK_URL_GERAR, payload);

      console.log("RESPOSTA COMPLETA DO N8N:", response);
      console.log("DADOS DA RESPOSTA (response.data):", response.data);
      // ------------------------------------

      let responseData = response.data;
      if (Array.isArray(responseData) && responseData.length > 0) {
        responseData = responseData[0];
      }

      const { audioUrl, duration } = responseData;

      if (!audioUrl || duration === undefined) {
        throw new Error("Resposta inesperada do servidor n8n.");
      }

      setAudioResult({ src: audioUrl, duration: duration });
      setToast({ message: "Narração gerada com sucesso!", type: "success" });
    } catch (error) {
      console.error("Erro ao gerar narração:", error);
      if (error.message.includes("Resposta inesperada")) {
        setToast({
          message:
            "Erro: O n8n enviou dados num formato que o React não entendeu.",
          type: "warning",
        });
      } else {
        setToast({
          message: "Falha ao gerar o áudio. Tente novamente.",
          type: "warning",
        });
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const totalFalas = dialogos.length;
  const todoTexto = dialogos.map((fala) => fala.texto).join(" ");
  const totalCaracteres = todoTexto.length;
  const totalPalavras =
    todoTexto.trim() === "" ? 0 : todoTexto.trim().split(/\s+/).length;
  const duracaoEstimada =
    totalCaracteres / (charsPorSegundoNormal * velocidade);

  return (
    <div
      className="container-fluid py-4 px-md-5 bg-light"
      style={{ minHeight: "calc(100vh - 56px)" }}
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
            onCarregarExemplo={handleCarregarExemplo}
            totalFalas={totalFalas}
            totalPalavras={totalPalavras}
            totalCaracteres={totalCaracteres}
            duracaoEstimada={duracaoEstimada}
          />
          {audioResult && (
            <AudioPlayer
              src={audioResult.src}
              duration={audioResult.duration}
            />
          )}
        </div>

        <div className="col-lg-4">
          <CardConfiguracoes
            velocidade={velocidade}
            setVelocidade={setVelocidade}
            isGenerating={isGenerating}
            onGerarNarracao={handleGerarNarracao}
            totalFalas={totalFalas}
          />
        </div>
      </div>

      {toast && (
        <Toast
          mensagem={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

export default PaginaNarracao;
