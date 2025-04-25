import { useState } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

function GerarPedido() {
  const API = "https://sistemagestao-production-b109.up.railway.app";
  const token = localStorage.getItem("token");

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
      const res = await axios.get(`${API}/clientes`, {
        headers: { Authorization: `Bearer ${token}` }
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
      const res = await axios.get(`${API}/produtos?busca=${texto}`, {
        headers: { Authorization: `Bearer ${token}` }
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
      await axios.post(`${API}/pedidos`, {
        cliente_id: clienteSelecionado.id,
        itens: pedido.map((item) => ({
          produto: item.nome,
          qtd: item.quantidade
        })),
        valor_total: pedido.reduce((acc, item) => acc + item.total, 0),
        status: "pendente",
        data_entrega: new Date().toISOString()
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

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

        {/* Campos de Documento e Nome */}
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

          {/* Resultados da busca */}
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

        {/* Cliente Selecionado */}
        {clienteSelecionado && (
          <div style={dadosClienteStyle}>
            <h3>Cliente Selecionado:</h3>
            <p><strong>Nome:</strong> {clienteSelecionado.nome}</p>
            <p><strong>Documento:</strong> {clienteSelecionado.documento}</p>
            <p><strong>Email:</strong> {clienteSelecionado.email}</p>
          </div>
        )}

        {/* Busca de Produto */}
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
          {!loadingProdutos && produtos.length === 0 && buscaProduto.length > 2 && (
            <p>Nenhum produto encontrado.</p>
          )}
        </div>

        {/* Lista de Produtos */}
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

// (Estilos continuam iguais ao anterior — se quiser mando eles aqui também rapidinho!)

export default GerarPedido;
