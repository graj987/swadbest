// src/components/ProtectedRoute.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import useAuth from "@/Hooks/useAuth";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // ⏳ wait until auth state is restored
  if (loading) {
    return (
      <div className="w-full flex justify-center py-20 text-lg font-semibold text-gray-600">
        Loading...
      </div>
    );
  }

  // ❌ not authenticated → redirect to login
  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  // ✅ authenticated → render protected content
  return children;
};

export default ProtectedRoute;
