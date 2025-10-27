import Cabecalho from "./componentes/Cabecalho";
import "./index.css";

function App() {
  return (
    <div className="App bg-light" style={{ minHeight: "100vh" }}>
      <Cabecalho />

      <main className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-8">{/* <SecaoAudio /> */}</div>
        </div>
      </main>
    </div>
  );
}

export default App;
