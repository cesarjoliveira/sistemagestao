import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Login({ setUsuario }) {
  const [form, setForm] = useState({ email: "", senha: "" });
  const [erro, setErro] = useState("");
  const navigate = useNavigate();

  const API = "https://sistemagestao-production-b109.up.railway.app"; // ou seu Railway backend

  const fazerLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API}/login`, form);

      // 🚀 NOVO: salva token e role separados
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);

      // 🚀 NOVO: atualiza o usuário logado no app
      setUsuario({ role: res.data.role });

      navigate("/");
    } catch (err) {
      console.error("Erro ao fazer login:", err);
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
