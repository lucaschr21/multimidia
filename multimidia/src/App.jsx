import React from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "./componentes/Layout";
import PaginaPrincipal from "./paginas/PaginaPrincipal";
import PaginaNarracao from "./paginas/PaginaNarracao";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<PaginaPrincipal />} />
        <Route path="narracao" element={<PaginaNarracao />} />
      </Route>
    </Routes>
  );
}

export default App;
