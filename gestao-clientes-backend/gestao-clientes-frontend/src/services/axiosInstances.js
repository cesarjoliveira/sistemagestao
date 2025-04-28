// src/services/axiosInstances.js

import axios from "axios";

export const apiRailway = axios.create({
  baseURL: "https://sistemagestao-production-b109.up.railway.app",
  headers: {
    "Content-Type": "application/json",
  }
});

export const apiSupabase = axios.create({
  baseURL: "https://metkeaicfiesanpvgjfi.supabase.co/rest/v1/",
  headers: {
    "Content-Type": "application/json",
    "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ldGtlYWljZmllc2FucHZnamZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU1OTg0OTEsImV4cCI6MjA2MTE3NDQ5MX0.6wUt9NozH8tZoEEsqw0rL5J9iE-pLwnLiMzJRsvXNbc",
    "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ldGtlYWljZmllc2FucHZnamZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU1OTg0OTEsImV4cCI6MjA2MTE3NDQ5MX0.6wUt9NozH8tZoEEsqw0rL5J9iE-pLwnLiMzJRsvXNbc"
  }
});
