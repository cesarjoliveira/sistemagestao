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

  const API_BASE = "https://sistemagestao-production-b109.up.railway.app";

  useEffect(() => {
    listarClientes();
    listarPedidos();
  }, []);

  const listarClientes = async () => {
    try {
      const res = await axios.get(`${API_BASE}/clientes`);
      setClientes(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const listarPedidos = async () => {
    try {
      const res = await axios.get(`${API_BASE}/pedidos`);
      setPedidos(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const cadastrarPedido = async (e) => {
    e.preventDefault();
    const itensConvertidos = form.itens.split(";").map((item) => {
      const [produto, qtd] = item.split(",");
      return { produto: produto.trim(), qtd: parseInt(qtd) };
    });

    try {
      await axios.post(`${API_BASE}/pedidos`, {
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
    } catch (error) {
      console.error(error);
    }
  };

  const atualizarStatus = async (id, status) => {
    try {
      await axios.put(`${API_BASE}/pedidos/${id}/status`, { status });
      listarPedidos();
    } catch (error) {
      console.error(error);
    }
  };

  const baixarPDF = (id) => {
    window.open(`${API_BASE}/pedidos/${id}/pdf`, "_blank");
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #000080 0%, #1a1a99 50%, #3333cc 100%)",
      color: "#fff",
      padding: "40px"
    }}>
      <div style={{
        background: "#fff",
        color: "#000080",
        borderRadius: "12px",
        maxWidth: "900px",
        margin: "0 auto",
        padding: "30px",
        boxShadow: "0 8px 16px rgba(0,0,0,0.2)"
      }}>
        <h1 style={{ textAlign: "center", marginBottom: "20px" }}>Cadastro de Pedidos</h1>

        <form onSubmit={cadastrarPedido} style={{
          display: "flex",
          flexDirection: "column",
          gap: "15px",
          marginBottom: "30px"
        }}>
          <select
            required
            value={form.cliente_id}
            onChange={(e) => setForm({ ...form, cliente_id: e.target.value })}
            style={inputStyle}
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
            style={inputStyle}
          />

          <input
            type="number"
            placeholder="Valor Total"
            value={form.valor_total}
            onChange={(e) => setForm({ ...form, valor_total: e.target.value })}
            required
            style={inputStyle}
          />

          <input
            type="datetime-local"
            value={form.data_entrega}
            onChange={(e) => setForm({ ...form, data_entrega: e.target.value })}
            required
            style={inputStyle}
          />

          <button type="submit" style={buttonPrimary}>
            Cadastrar Pedido
          </button>
        </form>

        <h2 style={{ textAlign: "center", marginBottom: "10px" }}>Pedidos Cadastrados</h2>

        <ul style={{ listStyle: "none", padding: 0 }}>
          {pedidos.map((p) => (
            <li key={p.id} style={{
              background: "#f9f9f9",
              color: "#000",
              borderRadius: "8px",
              padding: "20px",
              marginBottom: "15px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
            }}>
              <p><strong>Pedido ID:</strong> {p.id}</p>
              <p><strong>Cliente:</strong> {p.cliente_id}</p>
              <p><strong>Status:</strong> {p.status}</p>
              <p><strong>Data de Entrega:</strong> {new Date(p.data_entrega).toLocaleDateString()}</p>

              <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                <button onClick={() => atualizarStatus(p.id, "entregue")} style={buttonSuccess}>
                  Marcar como Entregue
                </button>
                <button onClick={() => baixarPDF(p.id)} style={buttonSecondary}>
                  Baixar PDF
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// Estilos padrões
const inputStyle = {
  padding: "12px",
  borderRadius: "8px",
  border: "1px solid #ccc",
  fontSize: "16px",
};

const buttonPrimary = {
  padding: "12px",
  borderRadius: "8px",
  background: "#000080",
  color: "#fff",
  fontWeight: "bold",
  border: "none",
  cursor: "pointer",
  fontSize: "16px",
};

const buttonSuccess = {
  padding: "10px 15px",
  borderRadius: "8px",
  background: "#28a745",
  color: "#fff",
  fontWeight: "bold",
  border: "none",
  cursor: "pointer",
  fontSize: "14px",
};

const buttonSecondary = {
  padding: "10px 15px",
  borderRadius: "8px",
  background: "#007bff",
  color: "#fff",
  fontWeight: "bold",
  border: "none",
  cursor: "pointer",
  fontSize: "14px",
};

export default Pedidos;
