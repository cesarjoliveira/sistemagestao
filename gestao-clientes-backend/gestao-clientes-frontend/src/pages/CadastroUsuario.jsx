import { useState } from "react";
import API from "../api";

function CadastroUsuario() {
  const [form, setForm] = useState({ email: "", senha: "", role: "" });
  const [mensagem, setMensagem] = useState("");

  const cadastrar = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/usuarios", form);
      setMensagem("Usuário criado com sucesso!");
      setForm({ email: "", senha: "", role: "" });
    } catch (err) {
      setMensagem(err.response?.data?.error || "Erro ao cadastrar usuário.");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Cadastrar Novo Usuário</h1>
      <form onSubmit={cadastrar} style={{ display: "flex", flexDirection: "column", width: 300, gap: 10 }}>
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
        <select
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
          required
        >
          <option value="">Selecione o papel</option>
          <option value="vendedor">Vendedor</option>
          <option value="emissor">Emissor de NF</option>
          <option value="logistica">Logística</option>
          <option value="admin">Administrador</option>
        </select>
        <button type="submit">Cadastrar</button>
      </form>
      {mensagem && <p>{mensagem}</p>}
    </div>
  );
}

export default CadastroUsuario;
