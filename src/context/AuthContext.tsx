// AuthContext.tsx
import { createContext, useContext, useState, useEffect } from "react";

interface AuthContextType {
  authorized: boolean | null;
  login: (token: string) => void;
  logout: () => void;
  token: string | null
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [ token, setToken ] = useState<string|null>(null)

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    setAuthorized(!!token);
    if (token) setToken(token)
  }, []);

  const login = (token: string) => {
    localStorage.setItem("jwt", token);
    setAuthorized(true);
  };

  const logout = () => {
    localStorage.removeItem("jwt");
    setAuthorized(false);
  };

  return (
    <AuthContext.Provider value={{ authorized, login, logout, token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
