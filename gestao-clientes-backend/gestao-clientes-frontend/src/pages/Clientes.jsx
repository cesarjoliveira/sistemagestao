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
  const [enderecoAtual, setEnderecoAtual] = useState(null);
  const [enderecoNovo, setEnderecoNovo] = useState(null);

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

  const cadastrarCliente = async () => {
    if (!novoNome || !novoDocumento || !novoEmail || !novoRua || !novoNumero || !novoBairro || !novoCidade || !novoEstado || !novoCep) {
      toast.error("Preencha todos os campos obrigatórios!");
      return;
    }
  
    try {
      // 1. Cadastrar o cliente
      await apiRailway.post('/clientes', {
        nome: novoNome,
        documento: novoDocumento,
        email: novoEmail
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
  
      // 2. Buscar o cliente recém-cadastrado para pegar o id
      const resBusca = await apiRailway.get('/clientes', {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
  
      const clienteCadastrado = resBusca.data.find(c => c.documento === novoDocumento);
  
      if (!clienteCadastrado) {
        throw new Error("Não foi possível localizar o cliente recém-cadastrado.");
      }
  
      // 3. Cadastrar o endereço
      await apiRailway.post('/enderecos', {
        cliente_id: clienteCadastrado.id,
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
      if (error.response && error.response.status === 409) {
        toast.error(error.response.data.error || "Documento ou Email já cadastrado.");
      } else {
        console.error("Erro ao cadastrar cliente:", error);
        toast.error("Erro ao cadastrar cliente!");
      }
    }
  };

  const abrirCliente = async (cliente) => {
    try {
      const res = await apiRailway.get(`/enderecos/${cliente.id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });

      const enderecosOrdenados = res.data.sort((a, b) => new Date(b.atualizado_em) - new Date(a.atualizado_em));
      const enderecoMaisRecente = enderecosOrdenados[0];

      setClienteAberto({ ...cliente });
      setEnderecoAtual(enderecoMaisRecente || null);
      setEnderecoNovo(enderecoMaisRecente ? { ...enderecoMaisRecente } : {
        rua: "",
        numero: "",
        bairro: "",
        cidade: "",
        estado: "",
        cep: "",
        complemento: "",
        cliente_id: cliente.id
      });

    } catch (error) {
      console.error("Erro ao abrir cliente:", error);
      toast.error("Erro ao carregar endereço do cliente!");
    }
  };

  const fecharCliente = () => {
    setClienteAberto(null);
    setEnderecoAtual(null);
    setEnderecoNovo(null);
  };

  const salvarEdicao = async () => {
    if (!clienteAberto.nome || !clienteAberto.documento || !clienteAberto.email) {
      toast.error("Preencha todos os campos do cliente!");
      return;
    }
    if (!enderecoNovo.rua || !enderecoNovo.numero || !enderecoNovo.bairro || !enderecoNovo.cidade || !enderecoNovo.estado || !enderecoNovo.cep) {
      toast.error("Preencha todos os campos obrigatórios do endereço!");
      return;
    }

    const enderecoAntigoTexto = enderecoAtual
      ? `${enderecoAtual.rua}, ${enderecoAtual.numero} - ${enderecoAtual.bairro} - ${enderecoAtual.cidade}/${enderecoAtual.estado} - CEP ${enderecoAtual.cep}`
      : "(Sem endereço anterior)";

    const enderecoNovoTexto = `${enderecoNovo.rua}, ${enderecoNovo.numero} - ${enderecoNovo.bairro} - ${enderecoNovo.cidade}/${enderecoNovo.estado} - CEP ${enderecoNovo.cep}`;

    const confirmar = window.confirm(
      `⚠️ Você está alterando o endereço:\n\nDE: ${enderecoAntigoTexto}\n\nPARA: ${enderecoNovoTexto}\n\nDeseja confirmar a alteração?`
    );

    if (!confirmar) return;

    try {
      await apiRailway.put(`/clientes/${clienteAberto.id}`, {
        nome: clienteAberto.nome,
        documento: clienteAberto.documento,
        email: clienteAberto.email
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });

      await apiRailway.post('/enderecos', {
        cliente_id: enderecoNovo.cliente_id,
        rua: enderecoNovo.rua,
        numero: enderecoNovo.numero,
        bairro: enderecoNovo.bairro,
        cidade: enderecoNovo.cidade,
        estado: enderecoNovo.estado,
        cep: enderecoNovo.cep,
        complemento: enderecoNovo.complemento
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });

      toast.success("Alterações salvas com sucesso!");
      fecharCliente();
      carregarClientes();
    } catch (error) {
      console.error("Erro ao salvar alterações:", error);
      toast.error("Erro ao salvar alterações!");
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
                      <button style={buttonPrimary} onClick={() => abrirCliente(cliente)}>Abrir</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Cliente Aberto para Edição */}
        {clienteAberto && enderecoNovo && (
          <div style={dadosClienteStyle}>
            <h2>Editar Cliente e Endereço</h2>

            <label>Nome:</label>
            <input type="text" value={clienteAberto.nome} onChange={(e) => setClienteAberto({ ...clienteAberto, nome: e.target.value })} style={inputStyle} />

            <label>Documento:</label>
            <input type="text" value={clienteAberto.documento} onChange={(e) => setClienteAberto({ ...clienteAberto, documento: e.target.value })} style={inputStyle} />

            <label>Email:</label>
            <input type="email" value={clienteAberto.email} onChange={(e) => setClienteAberto({ ...clienteAberto, email: e.target.value })} style={inputStyle} />

            <h3>Endereço</h3>

            <label>Rua:</label>
            <input type="text" value={enderecoNovo.rua} onChange={(e) => setEnderecoNovo({ ...enderecoNovo, rua: e.target.value })} style={inputStyle} />

            <label>Número:</label>
            <input type="text" value={enderecoNovo.numero} onChange={(e) => setEnderecoNovo({ ...enderecoNovo, numero: e.target.value })} style={inputStyle} />

            <label>Bairro:</label>
            <input type="text" value={enderecoNovo.bairro} onChange={(e) => setEnderecoNovo({ ...enderecoNovo, bairro: e.target.value })} style={inputStyle} />

            <label>Cidade:</label>
            <input type="text" value={enderecoNovo.cidade} onChange={(e) => setEnderecoNovo({ ...enderecoNovo, cidade: e.target.value })} style={inputStyle} />

            <label>Estado:</label>
            <input type="text" value={enderecoNovo.estado} onChange={(e) => setEnderecoNovo({ ...enderecoNovo, estado: e.target.value })} style={inputStyle} />

            <label>CEP:</label>
            <input type="text" value={enderecoNovo.cep} onChange={(e) => setEnderecoNovo({ ...enderecoNovo, cep: e.target.value })} style={inputStyle} />

            <label>Complemento (opcional):</label>
            <input type="text" value={enderecoNovo.complemento || ""} onChange={(e) => setEnderecoNovo({ ...enderecoNovo, complemento: e.target.value })} style={inputStyle} />

            <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
              <button style={buttonSuccess} onClick={salvarEdicao}>Salvar Alterações</button>
              <button style={buttonCancel} onClick={fecharCliente}>Cancelar</button>
            </div>
          </div>
        )}

        {/* Cadastro Novo Cliente */}
        <div style={{ marginTop: "40px" }}>
          <h2>Cadastrar Novo Cliente</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxWidth: "600px" }}>
            <label>Nome:</label>
            <input type="text" value={novoNome} onChange={(e) => setNovoNome(e.target.value)} style={inputStyle} />

            <label>Documento:</label>
            <input type="text" value={novoDocumento} onChange={(e) => setNovoDocumento(e.target.value)} style={inputStyle} />

            <label>Email:</label>
            <input type="email" value={novoEmail} onChange={(e) => setNovoEmail(e.target.value)} style={inputStyle} />

            <h3>Endereço</h3>

            <label>Rua:</label>
            <input type="text" value={novoRua} onChange={(e) => setNovoRua(e.target.value)} style={inputStyle} />

            <label>Número:</label>
            <input type="text" value={novoNumero} onChange={(e) => setNovoNumero(e.target.value)} style={inputStyle} />

            <label>Bairro:</label>
            <input type="text" value={novoBairro} onChange={(e) => setNovoBairro(e.target.value)} style={inputStyle} />

            <label>Cidade:</label>
            <input type="text" value={novoCidade} onChange={(e) => setNovoCidade(e.target.value)} style={inputStyle} />

            <label>Estado:</label>
            <input type="text" value={novoEstado} onChange={(e) => setNovoEstado(e.target.value)} style={inputStyle} />

            <label>CEP:</label>
            <input type="text" value={novoCep} onChange={(e) => setNovoCep(e.target.value)} style={inputStyle} />

            <label>Complemento (opcional):</label>
            <input type="text" value={novoComplemento} onChange={(e) => setNovoComplemento(e.target.value)} style={inputStyle} />

            <button style={buttonSuccess} onClick={cadastrarCliente}>Cadastrar Cliente</button>
          </div>
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
