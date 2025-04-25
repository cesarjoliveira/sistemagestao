import { useState, useEffect } from "react";
import API from "../api";

function CadastroUsuario() {
  const [form, setForm] = useState({ email: "", senha: "", role: "" });
  const [mensagem, setMensagem] = useState("");
  const [usuarios, setUsuarios] = useState([]);

  useEffect(() => {
    listarUsuarios();
  }, []);

  const cadastrar = async (e) => {
    e.preventDefault();
    try {
      await API.post("/usuarios", form);
      setMensagem("Usuário criado com sucesso!");
      setForm({ email: "", senha: "", role: "" });
      listarUsuarios(); // Atualiza lista depois de cadastrar
    } catch (err) {
      setMensagem(err.response?.data?.error || "Erro ao cadastrar usuário.");
    }
  };

  const listarUsuarios = async () => {
    try {
      const res = await API.get("/usuarios");
      setUsuarios(res.data);
    } catch (err) {
      setMensagem("Erro ao listar usuários.");
    }
  };

  const desativarUsuario = async (id) => {
    const confirmacao = window.confirm("Tem certeza? Isso é irreversível!");
    if (!confirmacao) return;

    try {
      await API.put(`/usuarios/${id}/desativar`);
      setMensagem("Usuário desativado com sucesso!");
      listarUsuarios();
    } catch (err) {
      setMensagem("Erro ao desativar usuário.");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Usuários</h1>

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
        <button type="submit">Cadastrar Usuário</button>
      </form>

      {mensagem && <p>{mensagem}</p>}

      <h2>Usuários Ativos</h2>
      <table border="1" cellPadding="10" style={{ marginTop: 20 }}>
        <thead>
          <tr>
            <th>Email</th>
            <th>Função</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((u) => (
            <tr key={u.id}>
              <td>{u.email}</td>
              <td>{u.role}</td>
              <td>
                <button onClick={() => desativarUsuario(u.id)}>Excluir</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default CadastroUsuario;
