import React, { useState, useEffect } from "react";
import type { Interlocutor } from "./types";
import { X } from "lucide-react";
import { VOICE_LIST } from "./voiceData";

const PRESET_CORES = [
  "#3B82F6",
  "#10B981",
  "#f59e0b",
  "#EF4444",
  "#8B5CF6",
  "#EC4899",
  "#06B6D4",
  "#84CC16",
  "#F97316",
  "#6366F1",
];

// --- Tipos das Props (onAdd foi REMOVIDO) ---
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  // onAdd: (data: Omit<Interlocutor, 'id'>) => void; // Removido
  onEdit: (id: string, data: Omit<Interlocutor, "id">) => void;
  interlocutorExistente: Interlocutor | null;
}

export const AddInterlocutorModal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  // onAdd, // Removido
  onEdit,
  interlocutorExistente,
}) => {
  const [nome, setNome] = useState("");
  const [voz, setVoz] = useState(VOICE_LIST[0].value);
  const [cor, setCor] = useState(PRESET_CORES[2]);

  // Como não há mais "Adicionar", isEditing será sempre true quando abrir
  const isEditing = !!interlocutorExistente;

  useEffect(() => {
    if (isEditing && isOpen) {
      setNome(interlocutorExistente.nome);
      setVoz(interlocutorExistente.voz);
      setCor(interlocutorExistente.cor);
    }
    // O 'else' (modo Adicionar) foi removido
  }, [isOpen, interlocutorExistente, isEditing]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) {
      alert("Por favor, insira um nome para o interlocutor.");
      return;
    }

    const data = { nome, voz, cor };

    // Como só podemos editar, removemos o 'else'
    if (isEditing) {
      onEdit(interlocutorExistente!.id, data);
    }

    onClose();
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content">
        <div className="modal-header">
          {/* O título agora é sempre "Editar" */}
          <h2>Editar Interlocutor</h2>
          <button className="btn-icon" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form className="modal-body" onSubmit={handleSubmit}>
          {/* Nome */}
          <div className="form-group">
            <label htmlFor="nome">Nome do Interlocutor</label>
            <input
              type="text"
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Narrador, Personagem1..."
            />
          </div>

          {/* Voz */}
          <div className="form-group">
            <label htmlFor="voz">Voz</label>
            <div className="select-wrapper">
              <select
                id="voz"
                value={voz}
                onChange={(e) => setVoz(e.target.value)}
              >
                {VOICE_LIST.map((v) => (
                  <option key={v.value} value={v.value}>
                    {v.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Cor */}
          <div className="form-group">
            <label htmlFor="cor">Cor de Identificação</label>
            <div className="color-picker">
              <div className="color-preview" style={{ backgroundColor: cor }} />
              <input
                type="text"
                id="cor"
                value={cor}
                onChange={(e) => setCor(e.target.value)}
                placeholder="#f59e0b"
              />
            </div>
            <div className="color-palette">
              {PRESET_CORES.map((presetCor) => (
                <div
                  key={presetCor}
                  className={`color-swatch ${
                    presetCor === cor ? "selected" : ""
                  }`}
                  style={{ backgroundColor: presetCor }}
                  onClick={() => setCor(presetCor)}
                />
              ))}
            </div>
          </div>

          <div className="modal-footer">
            {/* O botão agora é sempre "Salvar" */}
            <button type="submit" className="btn btn-primary btn-full">
              Salvar Alterações
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
