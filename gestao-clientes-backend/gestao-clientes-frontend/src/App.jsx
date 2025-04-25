import { BrowserRouter, Routes, Route, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Clientes from "./pages/Clientes";
import Pedidos from "./pages/Pedidos";
import Entregas from "./pages/Entregas";
import Login from "./pages/Login";
import Negado from "./pages/Negado";
import { PrivateRoute } from "./components/PrivateRoute";

function App() {
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
  
    if (token && role) {
      setUsuario({ role });
    }
  }, []);

  const logout = () => {
    localStorage.removeItem("usuario");
    setUsuario(null);
    window.location.href = "/login"; // força redirect
  };

  return (
    <BrowserRouter>
      <nav style={{ display: "flex", gap: 10, padding: 20 }}>
        {!usuario && <Link to="/login">Login</Link>}
        {usuario && (
          <>
            {["vendedor", "admin"].includes(usuario.role) && <Link to="/">Clientes</Link>}
            {["vendedor", "emissor", "admin"].includes(usuario.role) && <Link to="/pedidos">Pedidos</Link>}
            {["logistica", "admin"].includes(usuario.role) && <Link to="/entregas">Entregas</Link>}
            <button onClick={logout}>Logout</button>
          </>
        )}
      </nav>
      <Routes>
        <Route path="/login" element={<Login setUsuario={setUsuario} />} />
        <Route path="/negado" element={<Negado />} />
        <Route path="/" element={
          <PrivateRoute roles={["vendedor", "admin"]}>
            <Clientes />
          </PrivateRoute>
        } />
        <Route path="/pedidos" element={
          <PrivateRoute roles={["vendedor", "emissor", "admin"]}>
            <Pedidos />
          </PrivateRoute>
        } />
        <Route path="/entregas" element={
          <PrivateRoute roles={["logistica", "admin"]}>
            <Entregas />
          </PrivateRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
