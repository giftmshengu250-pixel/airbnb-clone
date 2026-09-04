import { createContext, useContext, useState } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

// Keeps track of the logged-in user across the whole app.
// The user + token are saved to localStorage so a refresh doesn't log you out.
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("airbnb_user");
    return stored ? JSON.parse(stored) : null;
  });

  const login = async (email, password) => {
    const { data } = await api.post("/users/login", { email, password });
    localStorage.setItem("airbnb_user", JSON.stringify(data));
    setUser(data);
    return data;
  };

  const register = async (username, email, password, role = "user") => {
    const { data } = await api.post("/users/register", { username, email, password, role });
    localStorage.setItem("airbnb_user", JSON.stringify(data));
    setUser(data);
    return data;
  };

  const logout = () => {
    localStorage.removeItem("airbnb_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
