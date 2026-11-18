import { createContext, useContext } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const value = {
    user: null,
    loading: false,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
