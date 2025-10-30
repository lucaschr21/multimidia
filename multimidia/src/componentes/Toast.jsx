import React, { useEffect } from "react";

import { FiCheckCircle, FiAlertCircle } from "react-icons/fi";

function Toast({ mensagem, onClose, type = "success" }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => {
      clearTimeout(timer);
    };
  }, [onClose]);

  const icon =
    type === "success" ? (
      <FiCheckCircle strokeWidth={3} />
    ) : (
      <FiAlertCircle strokeWidth={3} />
    ); // O '!'

  return (
    <div
      className="toast show align-items-center text-bg-light border-0"
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      style={{
        position: "fixed",
        bottom: "1.5rem",
        right: "1.5rem",
        zIndex: 1100,
        backgroundColor: "#fff",
        color: "#212529",
      }}
    >
      <div className="d-flex align-items-center">
        <div className="toast-body d-flex align-items-center gap-2">
          <div
            className="d-flex align-items-center justify-content-center"
            style={{
              backgroundColor: "#212529",
              color: "#fff",
              borderRadius: "50%",
              width: "24px",
              height: "24px",
              flexShrink: 0,
            }}
          >
            {icon}
          </div>

          <span className="fw-semibold">{mensagem}</span>
        </div>
        <button
          type="button"
          className="btn-close me-2 m-auto"
          onClick={onClose}
          aria-label="Close"
        ></button>
      </div>
    </div>
  );
}

export default Toast;
