function Recurso({ icon, title, description }) {
  return (
    <div className="d-flex align-items-center gap-3 p-2">
      <div className="flex-shrink-0" style={{ fontSize: "1.8em" }}>
        {icon}
      </div>
      <div>
        <h5 className="fw-semibold mb-0 fs-6">{title}</h5>
        <p className="text-muted mb-0 small" style={{ marginTop: "2px" }}>
          {description}
        </p>
      </div>
    </div>
  );
}

export default Recurso;
