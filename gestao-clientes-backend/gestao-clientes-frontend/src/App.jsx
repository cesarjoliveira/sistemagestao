import { BrowserRouter, Routes, Route, Link, Navigate, useNavigate } from "react-router-dom";
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
  const navigate = useNavigate(); // adicionado para logout sem reload

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role) {
      setUsuario({ role });
    }
  }, []);

  const fazerLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setUsuario(null);
    navigate("/login");
  };

  return (
    <div>
      <nav style={{
        display: "flex",
        alignItems: "center",
        justifyContent: usuario ? "space-between" : "center",
        padding: "15px 30px",
        background: "linear-gradient(135deg, #000080 0%, #1a1a99 50%, #3333cc 100%)",
        color: "#fff",
        boxShadow: "0 4px 6px rgba(0,0,0,0.2)"
      }}>
        <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
          {!usuario && <Link to="/login" style={linkStyle}>Login</Link>}
          {usuario && (
            <>
              {["vendedor", "admin"].includes(usuario.role) && <Link to="/" style={linkStyle}>Clientes</Link>}
              {["vendedor", "emissor", "admin"].includes(usuario.role) && <Link to="/pedidos" style={linkStyle}>Pedidos</Link>}
              {["logistica", "admin"].includes(usuario.role) && <Link to="/entregas" style={linkStyle}>Entregas</Link>}
              {usuario.role === "admin" && <Link to="/usuarios" style={linkStyle}>Usuários</Link>}
            </>
          )}
        </div>

        {usuario && (
          <button onClick={fazerLogout} style={logoutButton}>
            Logout
          </button>
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
    </div>
  );
}

// Estilos para os links
const linkStyle = {
  color: "#fff",
  textDecoration: "none",
  fontSize: "16px",
  fontWeight: "bold",
};

// Estilo para o botão de logout
const logoutButton = {
  background: "#ff4d4d",
  color: "#fff",
  padding: "10px 20px",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "bold",
  fontSize: "14px",
};

export default App;
