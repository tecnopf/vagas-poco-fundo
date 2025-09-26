// AuthContext.tsx
import { createContext, useContext, useState, useEffect } from "react";
import { API_URL } from "../configs";

interface AuthContextType {
  authorized: boolean | null;
  login: (token: string) => void;
  logout: () => void;
  token: string | null;
  loadingToken: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loadingToken, setLoadingToken] = useState(true); // novo estado

  useEffect(() => {
    const stored = localStorage.getItem("jwt");
    if (stored) {
      setToken(stored);
      checkToken(stored);
    } else {
      setAuthorized(false);
      setLoadingToken(false); // já terminou a checagem
    }
  }, []);

  const checkToken = async (token: string) => {
    try {
      const res = await fetch(`${API_URL}/api/auth/check`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Invalid token");
      setAuthorized(true);
    } catch (err) {
      console.warn("Invalid token, logging out...");
      logout();
    } finally {
      setLoadingToken(false); // termina a checagem independentemente do resultado
    }
  };

  const login = (newToken: string) => {
    localStorage.setItem("jwt", newToken);
    setToken(newToken);
    setAuthorized(true);
  };

  const logout = () => {
    localStorage.removeItem("jwt");
    setToken(null);
    setAuthorized(false);
  };

  return (
    <AuthContext.Provider value={{ authorized, login, logout, token, loadingToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
