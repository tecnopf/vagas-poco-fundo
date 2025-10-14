import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { API_URL } from "../../configs";
import Loading from "../../components/loading/Loading";
import { useAuth } from "../../context/AuthContext";

const MagicLogin: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const { login } = useAuth()

  useEffect(() => {
    if (!token) {
      setError("Token ausente");
      return;
    }

    const loginWithToken = async () => {
      try {
        const res = await fetch(`${API_URL}/api/auth/magic-login?token=${token}`, {
          method: "GET",
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Erro ao logar");

        localStorage.setItem("jwt", data.token);
        login(data.token); 

        navigate("/");

      } catch (err: any) {
        setError(err.message);
      }
    };

    loginWithToken();
  }, [token, navigate]);

  if (error) return <div style={{ padding: 20 }}>{error}</div>;

  return <div style={{ padding: 20 }}><Loading loading={true} text="Verificando dados..."/></div>;
};

export default MagicLogin;
