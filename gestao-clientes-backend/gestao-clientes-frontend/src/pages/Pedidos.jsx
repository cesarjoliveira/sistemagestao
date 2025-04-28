import { useState, useEffect } from "react";
import { apiRailway, apiSupabase } from "../services/axiosInstances";
import toast, { Toaster } from "react-hot-toast";

function Pedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [pedidoSelecionado, setPedidoSelecionado] = useState(null);
  const [itensPedido, setItensPedido] = useState([]);
  const [clienteSelecionado, setClienteSelecionado] = useState(null);

  const [documentoBusca, setDocumentoBusca] = useState("");
  const [nomeBusca, setNomeBusca] = useState("");
  const [clientes, setClientes] = useState([]);
  const [loadingClientes, setLoadingClientes] = useState(false);

  const [dataFiltro, setDataFiltro] = useState("");

  useEffect(() => {
    carregarPedidos();
  }, []);

  const carregarPedidos = async () => {
    try {
      const res = await apiSupabase.post('rpc/buscar_pedidos_com_nome_cliente', {});
      setPedidos(res.data);
    } catch (error) {
      console.error("Erro ao carregar pedidos:", error);
    }
  };

  const buscarClientes = async () => {
    if (!documentoBusca && !nomeBusca) {
      toast.error("Preencha Documento ou Nome para buscar!");
      return;
    }

    try {
      setLoadingClientes(true);
      const res = await apiRailway.get('/clientes', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });
      const todosClientes = res.data;

      const filtrados = todosClientes.filter(c =>
        (documentoBusca && c.documento.includes(documentoBusca)) ||
        (nomeBusca && c.nome.toLowerCase().includes(nomeBusca.toLowerCase()))
      );

      setClientes(filtrados);
    } catch (error) {
      console.error("Erro ao buscar clientes:", error);
    } finally {
      setLoadingClientes(false);
    }
  };

  const selecionarCliente = (cliente) => {
    setClienteSelecionado(cliente);
    setClientes([]);
    setDocumentoBusca(cliente.documento);
    setNomeBusca(cliente.nome);
  };

  const filtrarPedidos = () => {
    if (!clienteSelecionado && !dataFiltro) {
      return pedidos;
    }

    return pedidos.filter(p => {
      const clienteOk = clienteSelecionado ? p.cliente_id === clienteSelecionado.id : true;
      const dataOk = dataFiltro ? new Date(p.created_at).toLocaleDateString('pt-BR') === new Date(dataFiltro).toLocaleDateString('pt-BR') : true;
      return clienteOk && dataOk;
    });
  };

  const abrirPedido = async (pedido) => {
    setPedidoSelecionado(pedido);

    try {
      const res = await apiSupabase.post('rpc/buscar_itens_com_produto', { pedidoid: pedido.id });
      setItensPedido(res.data);
    } catch (error) {
      console.error("Erro ao carregar itens do pedido:", error);
    }
  };

  const fecharDetalhes = () => {
    setPedidoSelecionado(null);
    setItensPedido([]);
  };

  return (
    <div style={backgroundStyle}>
      <Toaster position="top-center" reverseOrder={false} />
      <div style={cardStyle}>
        <h1 style={{ textAlign: "center", marginBottom: "20px" }}>Pedidos</h1>

        {/* Filtro de Cliente e Data */}
        <div style={{ marginBottom: "20px" }}>
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
              placeholder="Nome do Cliente"
              value={nomeBusca}
              onChange={(e) => setNomeBusca(e.target.value)}
              style={inputStyle}
            />
            <button style={buttonPrimary} onClick={buscarClientes}>Buscar Cliente</button>
          </div>

          {loadingClientes && <p>🔄 Carregando clientes...</p>}
          {!loadingClientes && clientes.length === 0 && (documentoBusca || nomeBusca) && (
            <p>Nenhum cliente encontrado.</p>
          )}
          {clientes.length > 0 && (
            <ul style={listaStyle}>
              {clientes.map((c) => (
                <li key={c.id} style={itemListaStyle} onClick={() => selecionarCliente(c)}>
                  {c.nome} ({c.documento})
                </li>
              ))}
            </ul>
          )}

          <div style={{ marginTop: "20px" }}>
            <label>Filtrar por Data:</label>
            <input
              type="date"
              value={dataFiltro}
              onChange={(e) => setDataFiltro(e.target.value)}
              style={inputStyle}
            />
          </div>
        </div>

        {/* Lista de Pedidos */}
        {!pedidoSelecionado ? (
          <table style={tableStyle}>
            <thead>
              <tr>
                <th>Data</th>
                <th>Cliente</th>
                <th>Valor Total</th>
                <th>Ação</th>
              </tr>
            </thead>
            <tbody>
              {filtrarPedidos().map(pedido => (
                <tr key={pedido.id}>
                  <td>{new Date(pedido.created_at).toLocaleDateString()}</td>
                  <td>{pedido.cliente_nome}</td>
                  <td>R$ {pedido.valor_total ? pedido.valor_total.toFixed(2) : "0,00"}</td>
                  <td>
                    <button style={buttonPrimary} onClick={() => abrirPedido(pedido)}>
                      Abrir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div>
            <h2>Detalhes do Pedido</h2>
            <button style={buttonCancel} onClick={fecharDetalhes}>Voltar</button>

            {/* Cabeçalho do Pedido */}
            <div style={dadosClienteStyle}>
              <h3>Cliente:</h3>
              <p><strong>Nome:</strong> {pedidoSelecionado.cliente_nome}</p>
              <p><strong>Status:</strong> {pedidoSelecionado.status}</p>
              <p><strong>Data Entrega:</strong> {new Date(pedidoSelecionado.data_entrega).toLocaleDateString()}</p>
            </div>

            {/* Itens do Pedido */}
            <h3>Itens:</h3>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th>Produto</th>
                  <th>Preço Unitário</th>
                  <th>Quantidade</th>
                  <th>Total Item</th>
                </tr>
              </thead>
              <tbody>
                {itensPedido.map(item => (
                  <tr key={item.id}>
                    <td>{item.produto_nome}</td>
                    <td>R$ {parseFloat(item.preco_unitario).toFixed(2)}</td>
                    <td>{item.quantidade}</td>
                    <td>R$ {(item.quantidade * item.preco_unitario).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ----- ESTILOS -----
const backgroundStyle = { minHeight: "100vh", background: "linear-gradient(135deg, #000080 0%, #1a1a99 50%, #3333cc 100%)", padding: "40px", color: "#fff" };
const cardStyle = { background: "#fff", color: "#000080", borderRadius: "12px", maxWidth: "1100px", margin: "0 auto", padding: "30px", boxShadow: "0 8px 16px rgba(0,0,0,0.2)" };
const inputStyle = { padding: "10px", width: "100%", borderRadius: "8px", border: "1px solid #ccc", fontSize: "16px" };
const listaStyle = { background: "#fff", color: "#000", listStyle: "none", padding: 0, marginTop: "10px", border: "1px solid #ccc", borderRadius: "8px", maxHeight: "200px", overflowY: "auto" };
const itemListaStyle = { padding: "10px", cursor: "pointer", borderBottom: "1px solid #eee", transition: "background 0.3s" };
const tableStyle = { width: "100%", marginTop: "20px", background: "#f9f9f9", color: "#000", borderRadius: "8px", overflow: "hidden", borderCollapse: "collapse" };
const buttonPrimary = { padding: "8px 12px", borderRadius: "8px", background: "#000080", color: "#fff", border: "none", cursor: "pointer", fontWeight: "bold", fontSize: "14px" };
const buttonCancel = { padding: "8px 12px", borderRadius: "8px", background: "#ccc", color: "#333", border: "none", fontWeight: "bold", fontSize: "14px" };
const dadosClienteStyle = { background: "#f1f1f1", padding: "20px", borderRadius: "8px", marginBottom: "30px", color: "#000" };

export default Pedidos;
