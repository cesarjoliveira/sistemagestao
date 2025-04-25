import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Login({ setUsuario }) {
  const [form, setForm] = useState({ email: "", senha: "" });
  const [erro, setErro] = useState("");
  const navigate = useNavigate();

  const API = "https://sistemagestao-production-b109.up.railway.app"; // 🚀 sua API correta

  const fazerLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(`${API}/login`, form);
      const { token, role } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("role", role);

      setUsuario({ role }); // 🔵 Atualiza o usuário no App.jsx

      console.log("✅ Login realizado, navegando...");
      
      // 🔥 Aguarda um pequeno tempo para garantir que o usuário foi salvo
      setTimeout(() => {
        navigate("/");
        setUsuario({ role: res.data.role });

      }, 100); // Pequeno delay para dar tempo do React atualizar o estado
    } catch (err) {
      console.error("🔴 Erro ao fazer login:", err.response ? err.response.data : err.message);
      setErro("Email ou senha inválidos");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Login</h1>
      <form onSubmit={fazerLogin}>
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <input
          type="password"
          placeholder="Senha"
          value={form.senha}
          onChange={(e) => setForm({ ...form, senha: e.target.value })}
          required
        />
        <button type="submit">Entrar</button>
      </form>

      {erro && <p style={{ color: "red" }}>{erro}</p>}
    </div>
  );
}

export default Login;
