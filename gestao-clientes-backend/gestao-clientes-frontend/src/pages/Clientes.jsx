import { useState, useEffect } from "react";
import { apiRailway } from "../services/axiosInstances";
import toast, { Toaster } from "react-hot-toast";

function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [documentoBusca, setDocumentoBusca] = useState("");
  const [nomeBusca, setNomeBusca] = useState("");
  const [loadingClientes, setLoadingClientes] = useState(false);

  const [novoNome, setNovoNome] = useState("");
  const [novoDocumento, setNovoDocumento] = useState("");
  const [novoEmail, setNovoEmail] = useState("");

  const [editandoId, setEditandoId] = useState(null);
  const [editNome, setEditNome] = useState("");
  const [editDocumento, setEditDocumento] = useState("");
  const [editEmail, setEditEmail] = useState("");

  useEffect(() => {
    carregarClientes();
  }, []);

  const carregarClientes = async () => {
    try {
      setLoadingClientes(true);
      const res = await apiRailway.get('/clientes', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });
      setClientes(res.data);
    } catch (error) {
      console.error("Erro ao carregar clientes:", error);
    } finally {
      setLoadingClientes(false);
    }
  };

  const filtrarClientes = () => {
    if (!documentoBusca && !nomeBusca) return clientes;

    return clientes.filter(cliente => {
      const nomeOk = nomeBusca ? cliente.nome.toLowerCase().includes(nomeBusca.toLowerCase()) : true;
      const documentoOk = documentoBusca ? cliente.documento.includes(documentoBusca) : true;
      return nomeOk && documentoOk;
    });
  };

  const cadastrarCliente = async () => {
    if (!novoNome || !novoDocumento) {
      toast.error("Nome e Documento são obrigatórios!");
      return;
    }

    try {
      await apiRailway.post('/clientes', {
        nome: novoNome,
        documento: novoDocumento,
        email: novoEmail
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });

      toast.success("Cliente cadastrado com sucesso!");
      setNovoNome("");
      setNovoDocumento("");
      setNovoEmail("");
      carregarClientes();
    } catch (error) {
      console.error("Erro ao cadastrar cliente:", error);
      toast.error("Erro ao cadastrar cliente!");
    }
  };

  const iniciarEdicao = (cliente) => {
    setEditandoId(cliente.id);
    setEditNome(cliente.nome);
    setEditDocumento(cliente.documento);
    setEditEmail(cliente.email);
  };

  const cancelarEdicao = () => {
    setEditandoId(null);
    setEditNome("");
    setEditDocumento("");
    setEditEmail("");
  };

  const salvarEdicao = async () => {
    if (!editNome || !editDocumento) {
      toast.error("Nome e Documento são obrigatórios!");
      return;
    }

    try {
      await apiRailway.put(`/clientes/${editandoId}`, {
        nome: editNome,
        documento: editDocumento,
        email: editEmail
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });

      toast.success("Cliente atualizado com sucesso!");
      cancelarEdicao();
      carregarClientes();
    } catch (error) {
      console.error("Erro ao atualizar cliente:", error);
      toast.error("Erro ao atualizar cliente!");
    }
  };

  return (
    <div style={backgroundStyle}>
      <Toaster position="top-center" reverseOrder={false} />
      <div style={cardStyle}>
        <h1 style={{ textAlign: "center", marginBottom: "20px" }}>Clientes</h1>

        {/* Busca de clientes */}
        <div style={{ marginBottom: "30px" }}>
          <h2>Buscar Cliente</h2>
          <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
            <input
              type="text"
              placeholder="Documento"
              value={documentoBusca}
              onChange={(e) => setDocumentoBusca(e.target.value)}
              style={inputStyle}
            />
            <input
              type="text"
              placeholder="Nome"
              value={nomeBusca}
              onChange={(e) => setNomeBusca(e.target.value)}
              style={inputStyle}
            />
            <button style={buttonPrimary} onClick={carregarClientes}>Atualizar Lista</button>
          </div>

          {/* Lista de clientes */}
          {loadingClientes && <p>🔄 Carregando clientes...</p>}
          {!loadingClientes && (
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Documento</th>
                  <th>Email</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtrarClientes().map(cliente => (
                  <tr key={cliente.id}>
                    {editandoId === cliente.id ? (
                      <>
                        <td><input value={editNome} onChange={(e) => setEditNome(e.target.value)} style={inputStyle} /></td>
                        <td><input value={editDocumento} onChange={(e) => setEditDocumento(e.target.value)} style={inputStyle} /></td>
                        <td><input value={editEmail} onChange={(e) => setEditEmail(e.target.value)} style={inputStyle} /></td>
                        <td>
                          <button style={buttonSuccess} onClick={salvarEdicao}>Salvar</button>
                          <button style={buttonCancel} onClick={cancelarEdicao}>Cancelar</button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td>{cliente.nome}</td>
                        <td>{cliente.documento}</td>
                        <td>{cliente.email || "-"}</td>
                        <td>
                          <button style={buttonPrimary} onClick={() => iniciarEdicao(cliente)}>Editar</button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Cadastro de novo cliente */}
        <div style={{ marginTop: "40px" }}>
          <h2>Cadastrar Novo Cliente</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxWidth: "400px" }}>
            <input
              type="text"
              placeholder="Nome"
              value={novoNome}
              onChange={(e) => setNovoNome(e.target.value)}
              style={inputStyle}
            />
            <input
              type="text"
              placeholder="Documento"
              value={novoDocumento}
              onChange={(e) => setNovoDocumento(e.target.value)}
              style={inputStyle}
            />
            <input
              type="email"
              placeholder="Email (opcional)"
              value={novoEmail}
              onChange={(e) => setNovoEmail(e.target.value)}
              style={inputStyle}
            />
            <button style={buttonSuccess} onClick={cadastrarCliente}>Cadastrar Cliente</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ----- ESTILOS -----
const backgroundStyle = { minHeight: "100vh", background: "linear-gradient(135deg, #000080 0%, #1a1a99 50%, #3333cc 100%)", padding: "40px", color: "#fff" };
const cardStyle = { background: "#fff", color: "#000080", borderRadius: "12px", maxWidth: "1100px", margin: "0 auto", padding: "30px", boxShadow: "0 8px 16px rgba(0,0,0,0.2)" };
const inputStyle = { padding: "10px", width: "100%", borderRadius: "8px", border: "1px solid #ccc", fontSize: "16px" };
const tableStyle = { width: "100%", marginTop: "20px", background: "#f9f9f9", color: "#000", borderRadius: "8px", overflow: "hidden", borderCollapse: "collapse" };
const buttonPrimary = { padding: "8px 12px", borderRadius: "8px", background: "#000080", color: "#fff", border: "none", cursor: "pointer", fontWeight: "bold", fontSize: "14px" };
const buttonSuccess = { padding: "8px 12px", borderRadius: "8px", background: "#28a745", color: "#fff", border: "none", cursor: "pointer", fontWeight: "bold", fontSize: "14px" };
const buttonCancel = { padding: "8px 12px", borderRadius: "8px", background: "#ccc", color: "#333", border: "none", fontWeight: "bold", fontSize: "14px" };

export default Clientes;
