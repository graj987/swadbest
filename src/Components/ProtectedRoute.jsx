import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");

  // If token not found, redirect to login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // If logged in, allow access
  return children;
};

export default ProtectedRoute;
