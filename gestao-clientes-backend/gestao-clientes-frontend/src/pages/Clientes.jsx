import { useEffect, useState } from "react";
import API from "../api";

function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [form, setForm] = useState({ nome: "", documento: "", email: "" });

  const API_BASE = "https://sistemagestao-production.up.railway.app"; // Aqui é seu backend local!

  useEffect(() => {
    listarClientes();
  }, []);

  const listarClientes = async () => {
    try {
      const res = await axios.get(`${API_BASE}/clientes`);
      setClientes(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const cadastrarCliente = async (e) => {
    e.preventDefault();
    try {
      await API.post(`${API_BASE}/clientes`, form);
      setForm({ nome: "", documento: "", email: "" });
      listarClientes();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Cadastro de Clientes</h1>

      <form onSubmit={cadastrarCliente} style={{ marginBottom: 20 }}>
        <input
          type="text"
          placeholder="Nome"
          value={form.nome}
          onChange={(e) => setForm({ ...form, nome: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="Documento"
          value={form.documento}
          onChange={(e) => setForm({ ...form, documento: e.target.value })}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <button type="submit">Cadastrar Cliente</button>
      </form>

      <h2>Lista de Clientes</h2>
      <ul>
        {clientes.map((cliente) => (
          <li key={cliente.id}>
            {cliente.nome} - {cliente.documento} - {cliente.email}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Clientes;
