import React, { useState } from "react";
import { FiInfo } from "react-icons/fi";
import { BsSoundwave } from "react-icons/bs";

function CardConfiguracoes() {
  const [velocidade, setVelocidade] = useState(1.0);

  const handleVelocidadeChange = (event) => {
    setVelocidade(parseFloat(event.target.value));
  };

  const min = 0.5;
  const max = 2.0;
  const fillPercentage = ((velocidade - min) / (max - min)) * 100;

  const sliderStyle = {
    "--fill-percentage": `${fillPercentage}%`,
  };

  return (
    <div className="card shadow-sm border-0 sticky-top" style={{ top: "20px" }}>
      <div className="card-header bg-white py-3">
        <h5 className="mb-0 fw-semibold d-flex align-items-center gap-2">
          <BsSoundwave />
          Configurações Globais
        </h5>
      </div>
      <div className="card-body d-flex flex-column gap-4">
        <div>
          <div className="d-flex justify-content-between align-items-center mb-1">
            <label htmlFor="velocidade" className="form-label mb-0 fw-semibold">
              Velocidade Geral
            </label>
            <span className="badge text-bg-dark" style={{ minWidth: "40px" }}>
              {velocidade.toFixed(1)}x
            </span>
          </div>

          <input
            type="range"
            className="custom-slider-black"
            style={sliderStyle}
            id="velocidade"
            min={min}
            max={max}
            step="0.1"
            value={velocidade}
            onChange={handleVelocidadeChange}
          />
          <div className="d-flex justify-content-between text-muted small">
            <span>Lento (0.5x)</span>
            <span>Normal (1.0x)</span>
            <span>Rápido (2.0x)</span>
          </div>
        </div>

        <button className="btn btn-dark btn-lg w-100 py-3 fw-semibold">
          Gerar Narração
        </button>

        <div
          className="alert alert-primary d-flex align-items-start gap-2 small"
          role="alert"
        >
          <FiInfo className="flex-shrink-0" size="1.5em" />
          <div>
            Cada fala será narrada com a voz do interlocutor selecionado,
            criando um diálogo natural.
          </div>
        </div>

        <div
          className="alert d-flex align-items-start gap-2 small"
          style={{ backgroundColor: "#f3e8ff", color: "#6b21a8" }}
          role="alert"
        >
          <FiInfo className="flex-shrink-0" size="1.5em" />
          <div>
            Adicione interlocutores e atribua vozes diferentes para cada um.
          </div>
        </div>
      </div>
    </div>
  );
}

export default CardConfiguracoes;
