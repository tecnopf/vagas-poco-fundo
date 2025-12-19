import { createContext, useContext, useEffect, useState } from "react";
import { API_URL } from "../configs";

export type Role = "user" | "establishment" | null;

interface AuthContextType {
  role: Role;
  authorized: boolean;
  loading: boolean;
  login: (role: Exclude<Role, null>) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const ROLE_KEY = "auth:role";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<Role>(null);
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedRole = localStorage.getItem(ROLE_KEY) as Role | null;

    if (!storedRole) {
      setLoading(false);
      return;
    }

    checkAuth(storedRole);
  }, []);

  const checkAuth = async (storedRole: Exclude<Role, null>) => {
    try {
      const res = await fetch(`${API_URL}/api/auth/${storedRole}/check`, {
        credentials: "include",
        method: 'POST'
      });

      if (!res.ok) throw new Error("Unauthorized");

      const data = await res.json();

      setRole(data.role);
      setAuthorized(true);
    } catch {
      localStorage.removeItem(ROLE_KEY);
      setRole(null);
      setAuthorized(false);
    } finally {
      setLoading(false);
    }
  };

  const login = (newRole: Exclude<Role, null>) => {
    localStorage.setItem(ROLE_KEY, newRole);
    setRole(newRole);
    setAuthorized(true);
  };

  const logout = async () => {
    try {
      if (role) {
        await fetch(`${API_URL}/api/auth/${role}/logout`, {
          method: "POST",
          credentials: "include",
        });
      }
    } finally {
      localStorage.removeItem(ROLE_KEY);
      setRole(null);
      setAuthorized(false);
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        role,
        authorized,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
