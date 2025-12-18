import React, { useState, useEffect, useCallback, useMemo } from "react";
import AuthContext from "./AuthContext";

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore auth state on app load
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      const storedAccess = localStorage.getItem("accessToken");
      const storedRefresh = localStorage.getItem("refreshToken");

      if (storedAccess && storedUser) {
        setUser(JSON.parse(storedUser));
        setAccessToken(storedAccess);
        setRefreshToken(storedRefresh || null);
      }
    } catch (err) {
      console.warn("AuthProvider: failed to restore auth state", err);
      localStorage.clear();
    } finally {
      setLoading(false);
    }
  }, []);

  // Sync auth state to localStorage
  useEffect(() => {
    try {
      if (user && accessToken) {
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("accessToken", accessToken);
        if (refreshToken) {
          localStorage.setItem("refreshToken", refreshToken);
        }
      } else {
        localStorage.removeItem("user");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
      }
    } catch (err) {
      console.warn("AuthProvider: localStorage sync failed", err);
    }
  }, [user, accessToken, refreshToken]);

  // Login (called after successful backend login)
  const login = useCallback(({ user, accessToken, refreshToken }) => {
    setUser(user);
    setAccessToken(accessToken);
    setRefreshToken(refreshToken || null);
    setLoading(false);
  }, []);

  // Logout
  const logout = useCallback(() => {
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  }, []);

  // Helper for authenticated requests
  const getAuthHeader = useCallback(() => {
    if (!accessToken) return {};
    return { Authorization: `Bearer ${accessToken}` };
  }, [accessToken]);

  const isAuthenticated = Boolean(accessToken);

  const contextValue = useMemo(
    () => ({
      user,
      accessToken,
      refreshToken,
      isAuthenticated,
      loading,
      login,
      logout,
      setUser,
      getAuthHeader,
    }),
    [
      user,
      accessToken,
      refreshToken,
      isAuthenticated,
      loading,
      login,
      logout,
      getAuthHeader,
    ]
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}
