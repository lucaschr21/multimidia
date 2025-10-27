import React from "react";
import { FaRegUserCircle } from "react-icons/fa";
import { TbMovie } from "react-icons/tb";

function Header() {
  return (
    <nav className="navbar bg-white border-bottom shadow-sm">
      <div className="container-fluid px-4">
        <a className="navbar-brand d-flex align-items-center" href="/">
          <TbMovie className="text-primary" size="2em" />
          <span className="fs-5 fw-bold ms-2">SubLegend</span>
        </a>

        <div>
          <FaRegUserCircle
            className="text-secondary"
            size="1.8em"
            style={{ cursor: "pointer" }}
          />
        </div>
      </div>
    </nav>
  );
}

export default Header;
