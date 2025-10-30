import React from "react";
import { Outlet } from "react-router-dom";
import Cabecalho from "./Cabecalho";

function Layout() {
  return (
    <div className="App bg-light" style={{ minHeight: "100vh" }}>
      <Cabecalho />

      <Outlet />
    </div>
  );
}

export default Layout;
