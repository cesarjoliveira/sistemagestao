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
      setMensagem("✅ Usuário criado com sucesso!");
      setForm({ email: "", senha: "", role: "" });
      listarUsuarios();
    } catch (err) {
      setMensagem("❌ " + (err.response?.data?.error || "Erro ao cadastrar usuário."));
    }
  };

  const listarUsuarios = async () => {
    try {
      const res = await API.get("/usuarios");
      setUsuarios(res.data);
    } catch (err) {
      setMensagem("❌ Erro ao listar usuários.");
    }
  };

  const desativarUsuario = async (id) => {
    const confirmacao = window.confirm("Tem certeza que deseja excluir? Esta ação é irreversível.");
    if (!confirmacao) return;

    try {
      await API.put(`/usuarios/${id}/desativar`);
      setMensagem("✅ Usuário desativado com sucesso!");
      listarUsuarios();
    } catch (err) {
      setMensagem("❌ Erro ao desativar usuário.");
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #000080 0%, #1a1a99 50%, #3333cc 100%)",
      color: "#fff",
      padding: "40px"
    }}>
      <div style={{
        background: "#fff",
        color: "#000080",
        borderRadius: "12px",
        maxWidth: "800px",
        margin: "0 auto",
        padding: "30px",
        boxShadow: "0 8px 16px rgba(0,0,0,0.2)"
      }}>
        <h1 style={{ textAlign: "center", marginBottom: "20px" }}>Gerenciamento de Usuários</h1>

        <form onSubmit={cadastrar} style={{
          display: "flex",
          flexDirection: "column",
          gap: "15px",
          marginBottom: "30px"
        }}>
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
          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            required
            style={inputStyle}
          >
            <option value="">Selecione o papel</option>
            <option value="vendedor">Vendedor</option>
            <option value="emissor">Emissor de NF</option>
            <option value="logistica">Logística</option>
            <option value="admin">Administrador</option>
          </select>
          <button type="submit" style={buttonPrimary}>
            Cadastrar Usuário
          </button>
        </form>

        {mensagem && (
          <div style={{ marginBottom: "20px", textAlign: "center", fontWeight: "bold" }}>
            {mensagem}
          </div>
        )}

        <h2 style={{ textAlign: "center", marginBottom: "10px" }}>Usuários Ativos</h2>

        <table style={tableStyle}>
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
                  <button style={buttonDanger} onClick={() => desativarUsuario(u.id)}>
                    Desativar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Estilos prontos
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

const buttonDanger = {
  padding: "8px 12px",
  borderRadius: "8px",
  background: "#ff4d4d",
  color: "#fff",
  border: "none",
  cursor: "pointer",
  fontSize: "14px",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  marginTop: "20px",
  background: "#f9f9f9",
  color: "#000",
  borderRadius: "8px",
  overflow: "hidden",
};

export default CadastroUsuario;