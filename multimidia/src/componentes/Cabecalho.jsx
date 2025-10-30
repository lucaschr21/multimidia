import React from "react";
import { FaRegUserCircle } from "react-icons/fa";
import { TbMovie } from "react-icons/tb";

function Cabecalho() {
  return (
    <nav className="navbar bg-white border-bottom shadow-sm">
      <div className="container-fluid px-4">
        <a className="navbar-brand d-flex align-items-center" href="/">
          <TbMovie className="text-primary" size="2em" />
          <span className="fs-5 fw-bold ms-2">SubLegend</span>
        </a>
      </div>
    </nav>
  );
}

export default Cabecalho;
