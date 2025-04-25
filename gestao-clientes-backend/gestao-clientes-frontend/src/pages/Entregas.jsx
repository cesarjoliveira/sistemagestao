import { useEffect, useState } from "react";
import API from "../api";

function Entregas() {
  const [entregas, setEntregas] = useState({});
  const API = "https://sistemagestao-production-b109.up.railway.app"; // seu backend local

  useEffect(() => {
    listarEntregas();
  }, []);

  const listarEntregas = async () => {
    const res = await axios.get(`${API}/entregas`);
    setEntregas(res.data);
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Resumo de Entregas</h1>

      {Object.keys(entregas).length === 0 ? (
        <p>Nenhuma entrega planejada.</p>
      ) : (
        Object.keys(entregas).map((data) => (
          <div key={data} style={{ marginBottom: 20, borderBottom: "1px solid #ccc", paddingBottom: 10 }}>
            <h2>{data}</h2>
            <p>Total: {entregas[data].total}</p>
            <p>Entregues: {entregas[data].entregues}</p>
            <p>Pendentes: {entregas[data].pendentes}</p>

            <ul>
              {entregas[data].pedidos.map((pedido) => (
                <li key={pedido.id}>
                  Pedido ID: {pedido.id} | Status: {pedido.status}
                </li>
              ))}
            </ul>
          </div>
        ))
      )}
    </div>
  );
}

export default Entregas;
