import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

function GerarPedido() {
  const [clienteId, setClienteId] = useState('');
  const [clientes, setClientes] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [pedidoId, setPedidoId] = useState(null);
  const [itens, setItens] = useState([]);
  const [produtoSelecionado, setProdutoSelecionado] = useState('');
  const [quantidade, setQuantidade] = useState(1);
  const navigate = useNavigate();

  // Buscar clientes e produtos no carregamento da página
  useEffect(() => {
    async function carregarDados() {
      const { data: clientesData } = await api.get('/clientes');
      const { data: produtosData } = await api.get('/produtos');
      setClientes(clientesData);
      setProdutos(produtosData);
    }
    carregarDados();
  }, []);

  async function criarPedido() {
    const { data } = await api.post('/pedidos', {
      cliente_id: clienteId,
      status: 'Pendente',
      valor_total: 0,
    });
    setPedidoId(data[0].id);
  }

  async function adicionarItem() {
    if (!pedidoId || !produtoSelecionado || quantidade <= 0) return;

    const produto = produtos.find(p => p.id === produtoSelecionado);

    await api.post('/itens-pedido', {
      pedido_id: pedidoId,
      produto_id: produto.id,
      quantidade,
      preco_unitario: produto.preco,
    });

    setItens(prev => [...prev, { nome: produto.nome, quantidade }]);
    setProdutoSelecionado('');
    setQuantidade(1);
  }

  async function finalizarPedido() {
    await api.post(`/pedidos/${pedidoId}/atualizar-total`);
    alert('Pedido finalizado com sucesso!');
    navigate('/pedidos');
  }

  return (
    <div>
      <h1>Gerar Pedido</h1>

      {!pedidoId ? (
        <>
          <h2>Selecione um Cliente</h2>
          <select value={clienteId} onChange={(e) => setClienteId(e.target.value)}>
            <option value="">Selecione</option>
            {clientes.map(cliente => (
              <option key={cliente.id} value={cliente.id}>{cliente.nome}</option>
            ))}
          </select>
          <br />
          <button onClick={criarPedido} disabled={!clienteId}>Criar Pedido</button>
        </>
      ) : (
        <>
          <h2>Adicionar Itens</h2>
          <select value={produtoSelecionado} onChange={(e) => setProdutoSelecionado(e.target.value)}>
            <option value="">Selecione</option>
            {produtos.map(produto => (
              <option key={produto.id} value={produto.id}>{produto.nome} - R${produto.preco}</option>
            ))}
          </select>

          <input
            type="number"
            value={quantidade}
            min="1"
            onChange={(e) => setQuantidade(Number(e.target.value))}
          />

          <button onClick={adicionarItem}>Adicionar Item</button>

          <h3>Itens Adicionados:</h3>
          <ul>
            {itens.map((item, idx) => (
              <li key={idx}>{item.nome} - {item.quantidade}x</li>
            ))}
          </ul>

          <button onClick={finalizarPedido} disabled={itens.length === 0}>Finalizar Pedido</button>
        </>
      )}
    </div>
  );
}

export default GerarPedido;
