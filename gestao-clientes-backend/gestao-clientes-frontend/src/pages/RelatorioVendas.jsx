import { useEffect, useState } from 'react';
import axios from 'axios';

export default function RelatorioVendas() {
  const [relatorio, setRelatorio] = useState({});

  useEffect(() => {
    setRelatorio({
      "user123": { pedidos: 5, totalVendas: 1234.56 },
      "user456": { pedidos: 2, totalVendas: 789.00 }
    });
  }, []);

  return (
    <div>
      <h2>Relatório de Vendas por Vendedor</h2>
      <table>
        <thead>
          <tr>
            <th>Usuário</th>
            <th>Pedidos</th>
            <th>Total Vendido</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(relatorio).map(([usuarioId, dados]) => (
            <tr key={usuarioId}>
              <td>{usuarioId}</td>
              <td>{dados.pedidos}</td>
              <td>R$ {dados.totalVendas.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}