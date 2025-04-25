import { useEffect, useState } from "react";
import API from "../api";
import axios from "axios";

function Pedidos() {
  const [clientes, setClientes] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [form, setForm] = useState({
    cliente_id: "",
    itens: "",
    valor_total: "",
    data_entrega: ""
  });

  const API = "sistemagestao-production-b109.up.railway.app";

  useEffect(() => {
    listarClientes();
    listarPedidos();
  }, []);

  const listarClientes = async () => {
    const res = await axios.get(`${API}/clientes`);
    setClientes(res.data);
  };

  const listarPedidos = async () => {
    const res = await axios.get(`${API}/pedidos`);
    setPedidos(res.data);
  };

  const cadastrarPedido = async (e) => {
    e.preventDefault();
    const itensConvertidos = form.itens.split(";").map((item) => {
      const [produto, qtd] = item.split(",");
      return { produto: produto.trim(), qtd: parseInt(qtd) };
    });

    await axios.post(`${API}/pedidos`, {
      ...form,
      valor_total: parseFloat(form.valor_total),
      itens: itensConvertidos
    });

    setForm({
      cliente_id: "",
      itens: "",
      valor_total: "",
      data_entrega: ""
    });
    listarPedidos();
  };

  const atualizarStatus = async (id, status) => {
    await axios.put(`${API}/pedidos/${id}/status`, { status });
    listarPedidos();
  };

  const baixarPDF = (id) => {
    window.open(`${API}/pedidos/${id}/pdf`, "_blank");
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Cadastro de Pedidos</h1>

      <form onSubmit={cadastrarPedido}>
        <select
          required
          value={form.cliente_id}
          onChange={(e) => setForm({ ...form, cliente_id: e.target.value })}
        >
          <option value="">Selecione um cliente</option>
          {clientes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nome}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Itens (ex: Camisa,2; Calça,1)"
          value={form.itens}
          onChange={(e) => setForm({ ...form, itens: e.target.value })}
          required
        />

        <input
          type="number"
          placeholder="Valor Total"
          value={form.valor_total}
          onChange={(e) => setForm({ ...form, valor_total: e.target.value })}
          required
        />

        <input
          type="datetime-local"
          value={form.data_entrega}
          onChange={(e) => setForm({ ...form, data_entrega: e.target.value })}
          required
        />

        <button type="submit">Cadastrar Pedido</button>
      </form>

      <h2>Pedidos Cadastrados</h2>
      <ul>
        {pedidos.map((p) => (
          <li key={p.id}>
            <strong>{p.id}</strong> | Cliente: {p.cliente_id} | Status: {p.status} |
            Entrega: {new Date(p.data_entrega).toLocaleDateString()}<br />
            <button onClick={() => atualizarStatus(p.id, "entregue")}>Marcar como entregue</button>
            <button onClick={() => baixarPDF(p.id)}>Baixar PDF</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Pedidos;
