import React, { useState, useEffect } from "react";
import { API_URL } from "../../configs";
import AdminTokenList from "./TokenList";
import "./Admin.scss";

const checkAdminSession = async () => {
  const res = await fetch(`${API_URL}/api/admin/check-session`, {
    method: "GET",
    credentials: "include",
  });
  return res.ok;
};

const AdminPage: React.FC = () => {
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [key, setKey] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const session = await checkAdminSession();
        setAuthorized(session);
      } catch {
        setAuthorized(false);
      } finally {
        setLoading(false);
      }
    };
    fetchSession();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch(`${API_URL}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ key }),
      });

      if (res.ok) {
        setAuthorized(true);
      } else {
        const data = await res.json();
        setError(res.status === 401 ? "Chave incorreta" : data.error);
      }
    } catch {
      setError("Erro de conexão com o servidor");
    }
  };

  if (loading) return <p>Carregando...</p>;

  if (!authorized) {
    return (
      <div className="admin-container">
        <div style={{backgroundColor: 'white', padding: 25, borderRadius: 15}}>
          <h1>Login Admin</h1>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              style={{border: '1px solid #b7b7b7', borderRadius: '10px', paddingLeft: '15px', marginRight: '10px'}}
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="Digite a chave"
            />
            <button type="submit">Entrar</button>
          </form>
          {error && <p style={{ color: "red" }}>{error}</p>}

        </div>

      </div>
    );
  }

  return (
    <div style={{background: 'black', paddingTop: '1.5em', paddingBottom: '1.5em'}}>
      <h1 className="admin-h1">Área Administrativa</h1>
      {authorized && <AdminTokenList />}
    </div>
  );
};

export default AdminPage;
