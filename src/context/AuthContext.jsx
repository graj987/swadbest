// src/context/AuthContext.js
import { createContext } from "react";

const AuthContext = createContext({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  loading: true,

  // auth actions (no-op defaults)
  login: () => {
    throw new Error("login() not implemented");
  },
  logout: () => {
    throw new Error("logout() not implemented");
  },

  // helpers
  getAuthHeader: () => ({}),
  setUser: () => {
    throw new Error("setUser() not implemented");
  },
});

export default AuthContext;
