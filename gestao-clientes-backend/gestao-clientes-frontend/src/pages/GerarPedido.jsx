import { useState } from "react";
import { apiRailway, apiSupabase } from "../services/axiosInstances";
import toast, { Toaster } from "react-hot-toast";

function GerarPedido() {
  const [documentoBusca, setDocumentoBusca] = useState("");
  const [nomeBusca, setNomeBusca] = useState("");
  const [clientes, setClientes] = useState([]);
  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const [loadingClientes, setLoadingClientes] = useState(false);

  const [produtos, setProdutos] = useState([]);
  const [buscaProduto, setBuscaProduto] = useState("");
  const [loadingProdutos, setLoadingProdutos] = useState(false);

  const [pedido, setPedido] = useState([]);
  const [quantidadeModal, setQuantidadeModal] = useState("");
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  const [showModal, setShowModal] = useState(false);

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

  const buscarProdutos = async (texto) => {
    try {
      setLoadingProdutos(true);
      const res = await apiRailway.get(`/produtos?busca=${texto}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });
      setProdutos(res.data);
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
    } finally {
      setLoadingProdutos(false);
    }
  };

  const abrirModalQuantidade = (produto) => {
    setProdutoSelecionado(produto);
    setQuantidadeModal("");
    setShowModal(true);
  };

  const confirmarQuantidade = () => {
    const quantidade = parseInt(quantidadeModal, 10);

    if (isNaN(quantidade) || quantidade <= 0) {
      toast.error("Quantidade inválida");
      return;
    }

    if (quantidade > produtoSelecionado.estoque) {
      toast.error("Quantidade maior que estoque disponível!");
      return;
    }

    const novosProdutos = produtos.map(p => {
      if (p.id === produtoSelecionado.id) {
        return { ...p, estoque: p.estoque - quantidade };
      }
      return p;
    });
    setProdutos(novosProdutos);

    setPedido([...pedido, {
      ...produtoSelecionado,
      quantidade,
      total: quantidade * produtoSelecionado.preco
    }]);

    setShowModal(false);
    toast.success("Produto adicionado ao pedido!");
  };

  const finalizarPedido = async () => {
    if (!clienteSelecionado) {
      toast.error("Selecione um cliente!");
      return;
    }

    if (pedido.length === 0) {
      toast.error("Adicione produtos ao pedido!");
      return;
    }

    if (!window.confirm("Deseja finalizar o pedido?")) return;

    try {
      // 1. Criar pedido vazio
      const resPedido = await apiRailway.post('/pedidos', {
        cliente_id: clienteSelecionado.id,
        status: "pendente",
        data_entrega: new Date().toISOString()
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });

      const pedidoId = resPedido.data.id;

      // 2. Adicionar itens
      for (const item of pedido) {
        await apiRailway.post('/itens-pedido', {
          pedido_id: pedidoId,
          produto_id: item.id,
          quantidade: item.quantidade,
          preco_unitario: item.preco
        }, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        });
      }

      toast.success("Pedido finalizado com sucesso!");
      resetarTela();
    } catch (error) {
      console.error("Erro ao finalizar pedido:", error);
      toast.error("Erro ao finalizar pedido!");
    }
  };

  const resetarTela = () => {
    setClienteSelecionado(null);
    setDocumentoBusca("");
    setNomeBusca("");
    setProdutos([]);
    setBuscaProduto("");
    setPedido([]);
  };

  const totalPedido = pedido.reduce((acc, item) => acc + item.total, 0);

  return (
    <div style={backgroundStyle}>
      <Toaster position="top-center" reverseOrder={false} />
      <div style={cardStyle}>
        <h1 style={{ textAlign: "center", marginBottom: "20px" }}>Gerar Novo Pedido</h1>

        {/* Buscar cliente */}
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
        </div>

        {/* Cliente selecionado */}
        {clienteSelecionado && (
          <div style={dadosClienteStyle}>
            <h3>Cliente Selecionado:</h3>
            <p><strong>Nome:</strong> {clienteSelecionado.nome}</p>
            <p><strong>Documento:</strong> {clienteSelecionado.documento}</p>
            <p><strong>Email:</strong> {clienteSelecionado.email}</p>
          </div>
        )}

        {/* Buscar Produto */}
        <div style={{ marginBottom: "30px" }}>
          <label><strong>Buscar Produto (Nome ou Código):</strong></label>
          <input
            type="text"
            value={buscaProduto}
            onChange={(e) => {
              setBuscaProduto(e.target.value);
              buscarProdutos(e.target.value);
            }}
            placeholder="Digite o nome ou código"
            style={inputStyle}
          />
          {loadingProdutos && <p>🔄 Carregando produtos...</p>}
        </div>

        {/* Lista de produtos */}
        {produtos.length > 0 && (
          <table style={tableStyle}>
            <thead>
              <tr>
                <th>Produto</th>
                <th>Preço (R$)</th>
                <th>Estoque</th>
                <th>Ação</th>
              </tr>
            </thead>
            <tbody>
              {produtos.map((p) => (
                <tr key={p.id}>
                  <td>{p.nome}</td>
                  <td>{p.preco.toFixed(2)}</td>
                  <td>{p.estoque}</td>
                  <td>
                    <button style={buttonPrimary} onClick={() => abrirModalQuantidade(p)}>
                      Adicionar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Itens do Pedido */}
        {pedido.length > 0 && (
          <>
            <h2>Itens do Pedido</h2>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th>Produto</th>
                  <th>Preço</th>
                  <th>Qtd</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {pedido.map((item, index) => (
                  <tr key={index}>
                    <td>{item.nome}</td>
                    <td>{item.preco.toFixed(2)}</td>
                    <td>{item.quantidade}</td>
                    <td>{item.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <h3 style={{ textAlign: "right", marginTop: "20px" }}>
              Total Geral: R$ {totalPedido.toFixed(2)}
            </h3>

            <div style={{ textAlign: "right", marginTop: "30px" }}>
              <button style={buttonSuccess} onClick={finalizarPedido}>
                Finalizar Pedido
              </button>
            </div>
          </>
        )}

        {/* Modal de Quantidade */}
        {showModal && (
          <div style={modalOverlay}>
            <div style={modalContent}>
              <h2>Quantidade de {produtoSelecionado?.nome}</h2>
              <input
                type="number"
                value={quantidadeModal}
                onChange={(e) => setQuantidadeModal(e.target.value)}
                placeholder="Digite a quantidade"
                style={inputStyle}
              />
              <div style={{ marginTop: "20px", display: "flex", gap: "10px", justifyContent: "center" }}>
                <button style={buttonPrimary} onClick={confirmarQuantidade}>Confirmar</button>
                <button style={buttonCancel} onClick={() => setShowModal(false)}>Cancelar</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Estilos
const backgroundStyle = { minHeight: "100vh", background: "linear-gradient(135deg, #000080 0%, #1a1a99 50%, #3333cc 100%)", padding: "40px", color: "#fff" };
const cardStyle = { background: "#fff", color: "#000080", borderRadius: "12px", maxWidth: "1100px", margin: "0 auto", padding: "30px", boxShadow: "0 8px 16px rgba(0,0,0,0.2)" };
const inputStyle = { padding: "10px", width: "100%", borderRadius: "8px", border: "1px solid #ccc", fontSize: "16px" };
const listaStyle = { background: "#fff", color: "#000", listStyle: "none", padding: 0, marginTop: "10px", border: "1px solid #ccc", borderRadius: "8px", maxHeight: "200px", overflowY: "auto" };
const itemListaStyle = { padding: "10px", cursor: "pointer", borderBottom: "1px solid #eee", transition: "background 0.3s" };
const tableStyle = { width: "100%", marginTop: "20px", background: "#f9f9f9", color: "#000", borderRadius: "8px", overflow: "hidden", borderCollapse: "collapse" };
const buttonPrimary = { padding: "8px 12px", borderRadius: "8px", background: "#000080", color: "#fff", border: "none", cursor: "pointer", fontWeight: "bold", fontSize: "14px" };
const buttonSuccess = { padding: "12px 20px", borderRadius: "8px", background: "#28a745", color: "#fff", border: "none", fontWeight: "bold", fontSize: "16px" };
const buttonCancel = { padding: "12px 20px", borderRadius: "8px", background: "#ccc", color: "#333", border: "none", fontWeight: "bold", fontSize: "16px" };
const dadosClienteStyle = { background: "#f1f1f1", padding: "20px", borderRadius: "8px", marginBottom: "30px", color: "#000" };
const modalOverlay = { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 };
const modalContent = { background: "#fff", padding: "30px", borderRadius: "12px", color: "#000", minWidth: "300px", textAlign: "center" };

export default GerarPedido;
