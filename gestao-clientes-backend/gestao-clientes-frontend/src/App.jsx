import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Clientes from "./pages/Clientes";
import Pedidos from "./pages/Pedidos";
import Entregas from "./pages/Entregas";

function App() {
  return (
    <BrowserRouter>
      <nav style={{ display: "flex", gap: 10, padding: 20 }}>
        <Link to="/">Clientes</Link>
        <Link to="/pedidos">Pedidos</Link>
        <Link to="/entregas">Entregas</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Clientes />} />
        <Route path="/pedidos" element={<Pedidos />} />
        <Route path="/entregas" element={<Entregas />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
