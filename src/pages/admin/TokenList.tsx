// src/components/AdminTokenList.tsx
import { useEffect, useState } from "react";
import { API_URL } from "../../configs";
import { TiDelete } from "react-icons/ti";

interface Token {
  id: number;
  value: string;
}

const sortTokens = (list: Token[]) => [...list].sort((a, b) => b.id - a.id);

const fetchTokens = async (): Promise<Token[]> => {
  const res = await fetch(`${API_URL}/api/admin/tokens`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "Failed to fetch tokens");
  }

  return res.json();
};

const generateToken = async (): Promise<Token> => {
  const res = await fetch(`${API_URL}/api/admin/generate-token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "Failed to generate token");
  }

  return res.json();
};

const deleteToken = async (id: number): Promise<void> => {
  const res = await fetch(`${API_URL}/api/admin/delete-token`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ tokenID: id })
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "Failed to delete token");
  }
};

const AdminTokenList = () => {
  const [tokens, setTokens] = useState<Token[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const getTokens = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchTokens();
        setTokens(sortTokens(data));
      } catch (err: any) {
        setError(err.message || "Erro ao buscar tokens");
      } finally {
        setLoading(false);
      }
    };

    getTokens();
  }, []);

  const handleGenerateToken = async () => {
    setGenerating(true);
    setError(null);
    try {
      const newToken = await generateToken();
      setTokens((prev) => (prev ? sortTokens([...prev, newToken]) : [newToken]));
    } catch (err: any) {
      setError(err.message || "Erro ao gerar token");
    } finally {
      setGenerating(false);
    }
  };

  const handleDeleteToken = async (id: number) => {
    try {
      await deleteToken(id);
      setTokens((prev) => (prev ? prev.filter((t) => t.id !== id) : prev));
    } catch (err: any) {
      setError(err.message || "Erro ao remover token");
    }
  };

  const handleCopy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      alert("Token copiado para a área de transferência!");
    } catch {
      alert("Falha ao copiar o token.");
    }
  };

  if (loading) return <p>Loading tokens...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!tokens || tokens.length === 0) return <p>No tokens found.</p>;

  return (
    <div className="token-list">
      <div className="header">
        <h2>Tokens Disponíveis</h2>
        <button
          onClick={handleGenerateToken}
          disabled={generating}
        >
          {generating ? "Gerando..." : "Gerar novo token"}
        </button>
      </div>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {tokens.map((token) => (
          <li
            key={token.id}
            onClick={() => handleCopy(token.value)}
          >
            <span>{token.value}</span>
            <button
              onClick={(e) => {
                e.stopPropagation(); // prevent copy when clicking delete
                handleDeleteToken(token.id);
              }}
              className="token-list-delete"
            >
              <TiDelete size={40} />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminTokenList;
