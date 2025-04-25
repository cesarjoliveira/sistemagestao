import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Login({ setUsuario }) {
  const [form, setForm] = useState({ email: "", senha: "" });
  const [erro, setErro] = useState("");
  const navigate = useNavigate();

  const API = "https://sistemagestao-production-b109.up.railway.app";

  const fazerLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(`${API}/login`, form);
      const { token, role } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("role", role);

      setUsuario({ role });

      console.log("✅ Login realizado, navegando...");

      setTimeout(() => {
        navigate("/");
      }, 100);
    } catch (err) {
      console.error("🔴 Erro ao fazer login:", err.response ? err.response.data : err.message);
      setErro("Email ou senha inválidos");
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #000080 0%, #1a1a99 50%, #3333cc 100%)",
      color: "#fff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px"
    }}>
      <div style={{
        background: "#fff",
        color: "#000080",
        padding: "40px",
        borderRadius: "12px",
        width: "100%",
        maxWidth: "400px",
        boxShadow: "0 8px 16px rgba(0,0,0,0.2)"
      }}>
        <h1 style={{ textAlign: "center", marginBottom: "20px" }}>Login</h1>
        <form onSubmit={fazerLogin} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
            style={inputStyle}
          />
          <input
            type="password"
            placeholder="Senha"
            value={form.senha}
            onChange={(e) => setForm({ ...form, senha: e.target.value })}
            required
            style={inputStyle}
          />
          <button type="submit" style={buttonPrimary}>
            Entrar
          </button>
        </form>

        {erro && <p style={{ color: "red", marginTop: "15px", textAlign: "center" }}>{erro}</p>}
      </div>
    </div>
  );
}

// Estilos padrões
const inputStyle = {
  padding: "12px",
  borderRadius: "8px",
  border: "1px solid #ccc",
  fontSize: "16px",
};

const buttonPrimary = {
  padding: "12px",
  borderRadius: "8px",
  background: "#000080",
  color: "#fff",
  fontWeight: "bold",
  border: "none",
  cursor: "pointer",
  fontSize: "16px",
};

export default Login;
