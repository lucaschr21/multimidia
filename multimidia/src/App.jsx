import React from "react";
import { Routes, Route } from "react-router-dom";

import PaginaPrincipal from "./paginas/PaginaPrincipal";
import PaginaNarracao from "./paginas/PaginaNarracao";

function App() {
  return (
    <Routes>
      <Route path="/" element={<PaginaPrincipal />} />
      <Route path="/narracao" element={<PaginaNarracao />} />
    </Routes>
  );
}

export default App;
