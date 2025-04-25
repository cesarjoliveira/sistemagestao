import axios from "axios";

const API = axios.create({
  baseURL: "https://sistemagestao-production-b109.up.railway.app", // ou Railway se já subiu
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;