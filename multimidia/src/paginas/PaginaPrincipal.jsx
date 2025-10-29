import React from "react";
import Cabecalho from "../componentes/Cabecalho";
import SecaoAudio from "../componentes/SecaoAudio";
import SecaoVideo from "../componentes/SecaoVideo";
import BannerRecursos from "../componentes/BannerRecursos";

function PaginaPrincipal() {
  return (
    <div className="App bg-light" style={{ minHeight: "100vh" }}>
      <Cabecalho />

      <main className="container py-5">
        <div className="row g-5">
          <div className="col-lg-6">
            <SecaoVideo />
          </div>

          <div className="col-lg-6">
            <SecaoAudio />
          </div>
        </div>

        <div className="mt-5">
          <BannerRecursos />
        </div>
      </main>
    </div>
  );
}
export default PaginaPrincipal;
