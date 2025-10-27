// import React from "react";
// import Recurso from "./Recurso"; // CORRIGIDO: Importando seu arquivo 'Recurso.jsx'
// import { FiMic, FiZap, FiDownload, FiSave } from "react-icons/fi";
// import { BsSoundwave } from "react-icons/bs";
// import { FaRegSmile } from "react-icons/fa";

// function SecaoAudio() {
//   const iconeVozes = <FaRegSmile style={{ color: "#8b5cf6" }} />;
//   const iconeVelocidade = <FiZap style={{ color: "#f59e0b" }} />;
//   const iconeDownload = <FiSave style={{ color: "#8b5cf6" }} />;

//   return (
//     <div className="d-flex flex-column gap-3">
//       <div className="text-center">
//         <div
//           className="d-inline-flex align-items-center justify-content-center rounded-circle mx-auto mb-3"
//           style={{ width: "60px", height: "60px", backgroundColor: "#f3e8ff" }}
//         >
//           <FiMic style={{ color: "#9333ea", fontSize: "2.2em" }} />
//         </div>
//         <h2 className="fw-semibold mt-2">Narração de Texto</h2>
//         <p className="text-muted">
//           Converta texto em áudio natural com vozes em português
//         </p>
//       </div>

//       <div
//         className="card shadow-sm"
//         style={{ border: "2px dashed #ddd", backgroundColor: "#fafafa" }}
//       >
//         <div className="card-body p-5 text-center d-flex flex-column align-items-center">
//           <BsSoundwave className="text-muted" size="3em" />
//           <p className="fs-5 fw-semibold mt-3">
//             Crie narrações profissionais a partir de texto
//           </p>
//           <p className="text-muted mb-4">Text-to-Speech com vozes naturais</p>

//           <button
//             className="btn btn-outline-dark btn-lg px-5"
//             style={{ borderRadius: "50px", fontWeight: 500 }}
//           >
//             Começar Narração
//           </button>
//         </div>
//       </div>

//       <div className="card shadow-sm border-0">
//         <div className="card-body p-2">

//           <Recurso
//             icon={iconeVozes}
//             title="Vozes Naturais"
//             description="Múltiplas vozes em português brasileiro e europeu"
//           />
//         </div>
//       </div>
//       <div className="card shadow-sm border-0">
//         <div className="card-body p-2">
//           <Recurso
//             icon={iconeVelocidade}
//             title="Controle de Velocidade"
//             description="Ajuste a velocidade da narração conforme necessário"
//           />
//         </div>
//       </div>
//       <div className="card shadow-sm border-0">
//         <div className="card-body p-2">
//           <Recurso
//             icon={iconeDownload}
//             title="Download em MP3"
//             description="Baixe seu áudio narrado em alta qualidade"
//           />
//         </div>
//       </div>
//       <p className="text-center text-muted small">
//         Cole seu texto ou importe de arquivos TXT, DOCX
//       </p>
//     </div>
//   );
// }
// export default SecaoAudio;
