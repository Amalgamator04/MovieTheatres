import { createContext, useContext, useMemo, useState } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const username = localStorage.getItem("moviemate-username");
    return username ? { username } : null;
  });

  async function login(username, password) {
    const { data } = await api.post("/auth/login/", { username, password });
    localStorage.setItem("moviemate-token", data.token);
    localStorage.setItem("moviemate-username", username);
    setUser({ username });
  }

  async function register(username, email, password) {
    const { data } = await api.post("/auth/register/", { username, email, password });
    localStorage.setItem("moviemate-token", data.token);
    localStorage.setItem("moviemate-username", data.username);
    setUser({ username: data.username });
  }

  async function logout() {
    try {
      if (localStorage.getItem("moviemate-token")) await api.post("/auth/logout/");
    } finally {
      localStorage.removeItem("moviemate-token");
      localStorage.removeItem("moviemate-username");
      setUser(null);
    }
  }

  const value = useMemo(() => ({ user, login, register, logout }), [user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
