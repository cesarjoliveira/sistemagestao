import { useState, useEffect } from 'react';
import api from '../api';

function Pedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [itensPedido, setItensPedido] = useState([]);
  const [pedidoSelecionado, setPedidoSelecionado] = useState(null);

  useEffect(() => {
    async function carregarPedidos() {
      const { data } = await api.get('/pedidos');
      setPedidos(data);
    }
    carregarPedidos();
  }, []);

  async function verItens(pedidoId) {
    setPedidoSelecionado(pedidoId);
    const { data } = await api.get(`/itens-pedido/${pedidoId}`);
    setItensPedido(data);
  }

  return (
    <div>
      <h1>Lista de Pedidos</h1>

      <ul>
        {pedidos.map(pedido => (
          <li key={pedido.id}>
            Cliente: {pedido.cliente_id} | Status: {pedido.status} | Valor Total: R${pedido.valor_total}
            <button onClick={() => verItens(pedido.id)}>Ver Itens</button>
          </li>
        ))}
      </ul>

      {pedidoSelecionado && (
        <>
          <h2>Itens do Pedido</h2>
          <ul>
            {itensPedido.map(item => (
              <li key={item.id}>
                Produto ID: {item.produto_id} | Quantidade: {item.quantidade} | Preço Unitário: R${item.preco_unitario}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

export default Pedidos;