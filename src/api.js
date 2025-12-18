// src/api.js
import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://swadbackendserver.onrender.com/",
  headers: { "Content-Type": "application/json" },
});

// Attach token only if exists
API.interceptors.request.use((config) => {
  // If Authorization already exists (e.g. email verification),
  // DO NOT override it
  if (config.headers?.Authorization) {
    return config;
  }

  const token = localStorage.getItem("token");

  // Routes that must never have auth
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
