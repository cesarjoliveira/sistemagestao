import { BrowserRouter, Routes, Route, Link, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Clientes from "./pages/Clientes";
import Pedidos from "./pages/Pedidos";
import Entregas from "./pages/Entregas";
import Login from "./pages/Login";
import CadastroUsuario from "./pages/CadastroUsuario";
import Negado from "./pages/Negado";
import { PrivateRoute } from "./components/PrivateRoute";

function App() {
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role) {
      setUsuario({ role });
    }
  }, []);

  return (
    <BrowserRouter>
      <nav style={{ display: "flex", gap: 10, padding: 20 }}>
        {!usuario && <Link to="/login">Login</Link>}
        {usuario && (
          <>
            {["vendedor", "admin"].includes(usuario.role) && <Link to="/">Clientes</Link>}
            {["vendedor", "emissor", "admin"].includes(usuario.role) && <Link to="/pedidos">Pedidos</Link>}
            {usuario && usuario.role === "admin" && <Link to="/usuarios">Cadastrar Usuário</Link>}
            {["logistica", "admin"].includes(usuario.role) && <Link to="/entregas">Entregas</Link>}
            <button onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("role");
              setUsuario(null);
              window.location.href = "/login";
            }}>Logout</button>
          </>
        )}
      </nav>
      <Routes>
        <Route path="/login" element={<Login setUsuario={setUsuario} />} />
        <Route path="/negado" element={<Negado />} />
        <Route path="/" element={
          <PrivateRoute usuario={usuario} roles={["vendedor", "admin"]}>
            <Clientes />
          </PrivateRoute>
        } />
        <Route path="/pedidos" element={
          <PrivateRoute usuario={usuario} roles={["vendedor", "emissor", "admin"]}>
            <Pedidos />
          </PrivateRoute>
        } />
        <Route path="/entregas" element={
          <PrivateRoute usuario={usuario} roles={["logistica", "admin"]}>
            <Entregas />
          </PrivateRoute>
        } />
            <Route path="/usuarios" element={
      <PrivateRoute usuario={usuario} roles={["admin"]}>
        <CadastroUsuario />
      </PrivateRoute>
    } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
