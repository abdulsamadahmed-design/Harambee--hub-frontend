import { useEffect, useState } from "react";

import { AuthContext } from "./authContextValue";

import api, {
  getToken,
  saveToken,
  clearToken,
} from "../services/api";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(
    () => Boolean(getToken())
  );

  // Restore an existing session when the application starts
  useEffect(() => {
    const token = getToken();

    if (!token) return;

    let cancelled = false;

    async function restoreSession() {
      try {
        const userData = await api.get("/auth/me");

        if (!cancelled) {
          setUser(userData);
        }
      } catch {
        if (!cancelled) {
          clearToken();
          setUser(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    restoreSession();

    return () => {
      cancelled = true;
    };
  }, []);

  // Login
  async function login(email, password) {
    const response = await api.post("/auth/login", {
      email,
      password,
    });

    if (!response.token || !response.user) {
      throw new Error("Invalid authentication response");
    }

    saveToken(response.token);
    setUser(response.user);

    return response.user;
  }

  // Logout
  function logout() {
    clearToken();
    setUser(null);
  }

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: Boolean(user),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
