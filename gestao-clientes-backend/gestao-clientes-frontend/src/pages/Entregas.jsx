import { useEffect, useState } from "react";
import API from "../api";
import axios from "axios"; // faltava importar!

function Entregas() {
  const [entregas, setEntregas] = useState({});
  const API_BASE = "https://sistemagestao-production-b109.up.railway.app";

  useEffect(() => {
    listarEntregas();
  }, []);

  const listarEntregas = async () => {
    try {
      const res = await axios.get(`${API_BASE}/entregas`);
      setEntregas(res.data);
    } catch (error) {
      console.error(error);
    }
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
        <h1 style={{ textAlign: "center", marginBottom: "20px" }}>Resumo de Entregas</h1>

        {Object.keys(entregas).length === 0 ? (
          <p style={{ textAlign: "center", fontSize: "18px" }}>Nenhuma entrega planejada.</p>
        ) : (
          Object.keys(entregas).map((data) => (
            <div key={data} style={{
              background: "#f9f9f9",
              color: "#000",
              borderRadius: "8px",
              padding: "20px",
              marginBottom: "20px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
            }}>
              <h2 style={{ color: "#000080", marginBottom: "10px" }}>{data}</h2>
              <p><strong>Total de Pedidos:</strong> {entregas[data].total}</p>
              <p><strong>Entregues:</strong> {entregas[data].entregues}</p>
              <p><strong>Pendentes:</strong> {entregas[data].pendentes}</p>

              <ul style={{ marginTop: "10px", paddingLeft: "20px" }}>
                {entregas[data].pedidos.map((pedido) => (
                  <li key={pedido.id}>
                    <strong>Pedido ID:</strong> {pedido.id} | <strong>Status:</strong> {pedido.status}
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Entregas;
