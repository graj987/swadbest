// src/api.js
import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  headers: { "Content-Type": "application/json" },
});


// Attach token only if exists
API.interceptors.request.use((config) => {
  // If Authorization already exists, do not override it
  if (config.headers?.Authorization) {
    return config;
  }

  const token = localStorage.getItem("token");

  const nonAuthRoutes = [
    "/payments/verify",
    "/payments/webhook",
  ];

  const isNonAuthRoute = nonAuthRoutes.some((route) =>
    config.url?.includes(route)
  );

  if (!isNonAuthRoute && token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default API;
