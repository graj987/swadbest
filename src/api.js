// src/api.js
import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://swadbackendserver.onrender.com",
  headers: { "Content-Type": "application/json" },
});

// Attach token only if exists
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  // DO NOT attach Authorization for Razorpay verification:
  // Razorpay sends response without Bearer token.
  const nonAuthRoutes = [
    "/payments/verify",
    "/payments/webhook",
  ];

  const isNonAuthRoute = nonAuthRoutes.some((route) =>
    config.url.includes(route)
  );

  if (!isNonAuthRoute && token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default API;
