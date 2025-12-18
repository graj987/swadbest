// src/hooks/useAuth.jsx
import { useContext } from "react";
import AuthContext from "@/context/AuthContext";

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used within an <AuthProvider />"
    );
  }

  const {
    user,
    accessToken,
    refreshToken,
    isAuthenticated,
    loading,
    login,
    logout,
    getAuthHeader,
    setUser,
  } = context;

  return {
    user,
    accessToken,
    refreshToken,
    isAuthenticated,
    loading,
    login,
    logout,
    getAuthHeader,
    setUser,
  };
};

export default useAuth;
