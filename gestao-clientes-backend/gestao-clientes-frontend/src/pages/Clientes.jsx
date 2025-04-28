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

  const [novoRua, setNovoRua] = useState("");
  const [novoNumero, setNovoNumero] = useState("");
  const [novoBairro, setNovoBairro] = useState("");
  const [novoCidade, setNovoCidade] = useState("");
  const [novoEstado, setNovoEstado] = useState("");
  const [novoCep, setNovoCep] = useState("");
  const [novoComplemento, setNovoComplemento] = useState("");

  const [clienteAberto, setClienteAberto] = useState(null);
  const [enderecoAberto, setEnderecoAberto] = useState(null);

  const [editando, setEditando] = useState(false);

  useEffect(() => {
    carregarClientes();
  }, []);

  const carregarClientes = async () => {
    try {
      setLoadingClientes(true);
      const res = await apiRailway.get('/clientes', {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
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
    if (!novoNome || !novoDocumento || !novoRua || !novoNumero || !novoBairro || !novoCidade || !novoEstado || !novoCep) {
      toast.error("Preencha todos os campos obrigatórios!");
      return;
    }

    try {
      // 1. Cadastrar Cliente
      const resCliente = await apiRailway.post('/clientes', {
        nome: novoNome,
        documento: novoDocumento,
        email: novoEmail
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });

      const clienteId = resCliente.data[0].id;

      // 2. Cadastrar Endereço
      await apiRailway.post('/enderecos', {
        cliente_id: clienteId,
        rua: novoRua,
        numero: novoNumero,
        bairro: novoBairro,
        cidade: novoCidade,
        estado: novoEstado,
        cep: novoCep,
        complemento: novoComplemento
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });

      toast.success("Cliente e endereço cadastrados com sucesso!");
      resetarFormulario();
      carregarClientes();
    } catch (error) {
      console.error("Erro ao cadastrar cliente:", error);
      toast.error("Erro ao cadastrar cliente!");
    }
  };

  const resetarFormulario = () => {
    setNovoNome("");
    setNovoDocumento("");
    setNovoEmail("");
    setNovoRua("");
    setNovoNumero("");
    setNovoBairro("");
    setNovoCidade("");
    setNovoEstado("");
    setNovoCep("");
    setNovoComplemento("");
  };

  const abrirCliente = async (cliente) => {
    try {
      const res = await apiRailway.get(`/enderecos/${cliente.id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });

      setClienteAberto({ ...cliente });
      setEnderecoAberto(res.data[0] || {});
      setEditando(false);
    } catch (error) {
      console.error("Erro ao carregar endereço:", error);
      toast.error("Erro ao carregar endereço!");
    }
  };

  const fecharCliente = () => {
    setClienteAberto(null);
    setEnderecoAberto(null);
    setEditando(false);
  };

  const salvarEdicao = async () => {
    try {
      await apiRailway.put(`/clientes/${clienteAberto.id}`, {
        nome: clienteAberto.nome,
        documento: clienteAberto.documento,
        email: clienteAberto.email
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });

      await apiRailway.put(`/enderecos/${enderecoAberto.id}`, {
        rua: enderecoAberto.rua,
        numero: enderecoAberto.numero,
        bairro: enderecoAberto.bairro,
        cidade: enderecoAberto.cidade,
        estado: enderecoAberto.estado,
        cep: enderecoAberto.cep,
        complemento: enderecoAberto.complemento
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });

      toast.success("Cliente e endereço atualizados com sucesso!");
      setEditando(false);
      carregarClientes();
    } catch (error) {
      console.error("Erro ao salvar edição:", error);
      toast.error("Erro ao salvar edição!");
    }
  };

  return (
    <div style={backgroundStyle}>
      <Toaster position="top-center" reverseOrder={false} />
      <div style={cardStyle}>
        <h1 style={{ textAlign: "center", marginBottom: "20px" }}>Clientes</h1>

        {/* Busca */}
        <div style={{ marginBottom: "30px" }}>
          <h2>Buscar Cliente</h2>
          <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
            <input type="text" placeholder="Documento" value={documentoBusca} onChange={(e) => setDocumentoBusca(e.target.value)} style={inputStyle} />
            <input type="text" placeholder="Nome" value={nomeBusca} onChange={(e) => setNomeBusca(e.target.value)} style={inputStyle} />
            <button style={buttonPrimary} onClick={carregarClientes}>Atualizar Lista</button>
          </div>

          {/* Lista de Clientes */}
          {loadingClientes && <p>🔄 Carregando clientes...</p>}
          {!loadingClientes && (
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Documento</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtrarClientes().map(cliente => (
                  <tr key={cliente.id}>
                    <td>{cliente.nome}</td>
                    <td>{cliente.documento}</td>
                    <td>
                      {clienteAberto?.id === cliente.id ? (
                        <button style={buttonCancel} onClick={fecharCliente}>Fechar</button>
                      ) : (
                        <button style={buttonPrimary} onClick={() => abrirCliente(cliente)}>Abrir</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Dados do Cliente Aberto */}
        {clienteAberto && enderecoAberto && (
          <div style={dadosClienteStyle}>
            <h2>Dados do Cliente</h2>
            <input value={clienteAberto.nome} onChange={(e) => setClienteAberto({ ...clienteAberto, nome: e.target.value })} style={inputStyle} />
            <input value={clienteAberto.documento} onChange={(e) => setClienteAberto({ ...clienteAberto, documento: e.target.value })} style={inputStyle} />
            <input value={clienteAberto.email || ""} onChange={(e) => setClienteAberto({ ...clienteAberto, email: e.target.value })} style={inputStyle} />

            <h3>Endereço:</h3>
            <input value={enderecoAberto.rua} onChange={(e) => setEnderecoAberto({ ...enderecoAberto, rua: e.target.value })} style={inputStyle} />
            <input value={enderecoAberto.numero} onChange={(e) => setEnderecoAberto({ ...enderecoAberto, numero: e.target.value })} style={inputStyle} />
            <input value={enderecoAberto.bairro} onChange={(e) => setEnderecoAberto({ ...enderecoAberto, bairro: e.target.value })} style={inputStyle} />
            <input value={enderecoAberto.cidade} onChange={(e) => setEnderecoAberto({ ...enderecoAberto, cidade: e.target.value })} style={inputStyle} />
            <input value={enderecoAberto.estado} onChange={(e) => setEnderecoAberto({ ...enderecoAberto, estado: e.target.value })} style={inputStyle} />
            <input value={enderecoAberto.cep} onChange={(e) => setEnderecoAberto({ ...enderecoAberto, cep: e.target.value })} style={inputStyle} />
            <input value={enderecoAberto.complemento || ""} onChange={(e) => setEnderecoAberto({ ...enderecoAberto, complemento: e.target.value })} style={inputStyle} />

            <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
              <button style={buttonSuccess} onClick={salvarEdicao}>Salvar</button>
              <button style={buttonCancel} onClick={fecharCliente}>Cancelar</button>
            </div>
          </div>
        )}

        {/* Cadastro Novo Cliente */}
        <div style={{ marginTop: "40px" }}>
          <h2>Cadastrar Novo Cliente</h2>
          {/* Formulário aqui igual ao que já montamos antes */}
        </div>
      </div>
    </div>
  );
}

// Estilos
const backgroundStyle = { minHeight: "100vh", background: "linear-gradient(135deg, #000080 0%, #1a1a99 50%, #3333cc 100%)", padding: "40px", color: "#fff" };
const cardStyle = { background: "#fff", color: "#000080", borderRadius: "12px", maxWidth: "1100px", margin: "0 auto", padding: "30px", boxShadow: "0 8px 16px rgba(0,0,0,0.2)" };
const inputStyle = { padding: "10px", width: "100%", borderRadius: "8px", border: "1px solid #ccc", fontSize: "16px" };
const tableStyle = { width: "100%", marginTop: "20px", background: "#f9f9f9", color: "#000", borderRadius: "8px", overflow: "hidden", borderCollapse: "collapse" };
const buttonPrimary = { padding: "8px 12px", borderRadius: "8px", background: "#000080", color: "#fff", border: "none", cursor: "pointer", fontWeight: "bold", fontSize: "14px" };
const buttonSuccess = { padding: "12px 20px", borderRadius: "8px", background: "#28a745", color: "#fff", border: "none", fontWeight: "bold", fontSize: "16px" };
const buttonCancel = { padding: "12px 20px", borderRadius: "8px", background: "#ccc", color: "#333", border: "none", fontWeight: "bold", fontSize: "16px" };
const dadosClienteStyle = { background: "#f1f1f1", padding: "20px", borderRadius: "8px", marginTop: "20px", color: "#000" };

export default Clientes;
