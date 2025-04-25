import { useState } from "react";
import axios from "axios";

function GerarPedido() {
  const API = "https://sistemagestao-production-b109.up.railway.app";
  const token = localStorage.getItem("token");

  const [clientes, setClientes] = useState([]);
  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const [buscaCliente, setBuscaCliente] = useState("");

  const [produtos, setProdutos] = useState([]);
  const [buscaProduto, setBuscaProduto] = useState("");
  const [pedido, setPedido] = useState([]);

  const buscarClientes = async (texto) => {
    try {
      const res = await axios.get(`${API}/clientes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const todosClientes = res.data;

      const filtrados = todosClientes.filter(c =>
        c.nome.toLowerCase().includes(texto.toLowerCase()) ||
        (c.documento && c.documento.includes(texto))
      );
      setClientes(filtrados);
    } catch (error) {
      console.error("Erro ao buscar clientes:", error);
    }
  };

  const selecionarCliente = (cliente) => {
    setClienteSelecionado(cliente);
    setClientes([]);
    setBuscaCliente(cliente.nome);
  };

  const buscarProdutos = async (texto) => {
    try {
      const res = await axios.get(`${API}/produtos?busca=${texto}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProdutos(res.data);
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
    }
  };

  const adicionarProduto = (produto) => {
    const quantidade = parseInt(prompt(`Quantas unidades de "${produto.nome}"?`), 10);

    if (isNaN(quantidade) || quantidade <= 0) {
      alert("Quantidade inválida");
      return;
    }

    if (quantidade > produto.estoque) {
      alert("Quantidade maior que estoque disponível!");
      return;
    }

    // Atualiza o estoque localmente
    const novosProdutos = produtos.map(p => {
      if (p.id === produto.id) {
        return { ...p, estoque: p.estoque - quantidade };
      }
      return p;
    });
    setProdutos(novosProdutos);

    // Adiciona ao pedido
    setPedido([...pedido, {
      ...produto,
      quantidade,
      total: quantidade * produto.preco
    }]);
  };

  const totalPedido = pedido.reduce((acc, item) => acc + item.total, 0);

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #000080 0%, #1a1a99 50%, #3333cc 100%)",
      padding: "40px",
      color: "#fff"
    }}>
      <div style={{
        background: "#fff",
        color: "#000080",
        borderRadius: "12px",
        maxWidth: "1000px",
        margin: "0 auto",
        padding: "30px",
        boxShadow: "0 8px 16px rgba(0,0,0,0.2)"
      }}>
        <h1 style={{ textAlign: "center", marginBottom: "20px" }}>Gerar Novo Pedido</h1>

        {/* Campo de busca de cliente */}
        <div style={{ marginBottom: "30px" }}>
          <label><strong>Buscar Cliente (Nome ou Documento):</strong></label>
          <input
            type="text"
            value={buscaCliente}
            onChange={(e) => {
              setBuscaCliente(e.target.value);
              buscarClientes(e.target.value);
            }}
            placeholder="Digite o nome ou documento"
            style={inputStyle}
          />
          {clientes.length > 0 && (
            <ul style={listaStyle}>
              {clientes.map((c) => (
                <li key={c.id} style={itemListaStyle} onClick={() => selecionarCliente(c)}>
                  {c.nome} - {c.documento}
                </li>
              ))}
            </ul>
          )}
        </div>

        {clienteSelecionado && (
          <div style={{
            background: "#f1f1f1",
            padding: "20px",
            borderRadius: "8px",
            marginBottom: "30px"
          }}>
            <h3>Cliente Selecionado:</h3>
            <p><strong>Nome:</strong> {clienteSelecionado.nome}</p>
            <p><strong>Documento:</strong> {clienteSelecionado.documento}</p>
            <p><strong>Email:</strong> {clienteSelecionado.email}</p>
          </div>
        )}

        {/* Campo de busca de produto */}
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
        </div>

        {/* Lista de produtos encontrados */}
        {produtos.length > 0 && (
          <div style={{ marginBottom: "30px" }}>
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
                      <button style={buttonPrimary} onClick={() => adicionarProduto(p)}>
                        Adicionar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tabela dos produtos adicionados */}
        {pedido.length > 0 && (
          <div>
            <h2>Itens do Pedido</h2>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th>Produto</th>
                  <th>Preço (R$)</th>
                  <th>Quantidade</th>
                  <th>Total (R$)</th>
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
          </div>
        )}
      </div>
    </div>
  );
}

// Estilos básicos
const inputStyle = {
  padding: "12px",
  width: "100%",
  marginTop: "10px",
  borderRadius: "8px",
  border: "1px solid #ccc",
  fontSize: "16px"
};

const listaStyle = {
  background: "#fff",
  color: "#000",
  listStyle: "none",
  padding: 0,
  marginTop: "10px",
  border: "1px solid #ccc",
  borderRadius: "8px",
  maxHeight: "200px",
  overflowY: "auto",
};

const itemListaStyle = {
  padding: "10px",
  cursor: "pointer",
  borderBottom: "1px solid #eee",
};

const tableStyle = {
  width: "100%",
  marginTop: "20px",
  background: "#f9f9f9",
  color: "#000",
  borderRadius: "8px",
  overflow: "hidden",
  borderCollapse: "collapse",
};

const buttonPrimary = {
  padding: "8px 12px",
  borderRadius: "8px",
  background: "#000080",
  color: "#fff",
  border: "none",
  cursor: "pointer",
  fontWeight: "bold",
  fontSize: "14px",
};

export default GerarPedido;
