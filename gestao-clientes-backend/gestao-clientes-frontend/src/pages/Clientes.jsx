import { useEffect, useState } from "react";
import API from "../api";
import axios from "axios"; // faltava importar aqui

function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [form, setForm] = useState({ nome: "", documento: "", email: "" });

  const API_BASE = "https://sistemagestao-production-b109.up.railway.app";

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
      await API.post("/clientes", form); // corrigido para usar API.js
      setForm({ nome: "", documento: "", email: "" });
      listarClientes();
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
        maxWidth: "800px",
        margin: "0 auto",
        padding: "30px",
        boxShadow: "0 8px 16px rgba(0,0,0,0.2)"
      }}>
        <h1 style={{ textAlign: "center", marginBottom: "20px" }}>Cadastro de Clientes</h1>

        <form onSubmit={cadastrarCliente} style={{
          display: "flex",
          flexDirection: "column",
          gap: "15px",
          marginBottom: "30px"
        }}>
          <input
            type="text"
            placeholder="Nome"
            value={form.nome}
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
            required
            style={inputStyle}
          />
          <input
            type="text"
            placeholder="Documento"
            value={form.documento}
            onChange={(e) => setForm({ ...form, documento: e.target.value })}
            required
            style={inputStyle}
          />
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
            style={inputStyle}
          />
          <button type="submit" style={buttonPrimary}>
            Cadastrar Cliente
          </button>
        </form>

        <h2 style={{ textAlign: "center", marginBottom: "10px" }}>Lista de Clientes</h2>

        <ul style={{ listStyle: "none", padding: 0 }}>
          {clientes.map((cliente) => (
            <li key={cliente.id} style={{
              background: "#f9f9f9",
              color: "#000",
              borderRadius: "8px",
              padding: "10px",
              marginBottom: "10px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
            }}>
              <strong>{cliente.nome}</strong> <br />
              Documento: {cliente.documento} <br />
              Email: {cliente.email}
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

export default Clientes;
