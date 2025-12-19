import React, { useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { API_URL } from "../../../configs";

interface Props {
  onClose: () => void;
  onError: (message?: string, status?: number) => void;
  setForgotOpen: (open: boolean) => void;
  setLoadingScreen: (open: boolean, loadingText?: string) => void
}

const EstablishmentLogin: React.FC<Props> = ({ onClose, onError, setForgotOpen, setLoadingScreen }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingScreen(true, "Entrando...")
    setLoading(true)


    try {
      const res = await fetch(`${API_URL}/api/auth/establishment/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        onError(data.error, res.status);
        return;
      }

      login(data.role);
      onClose();
    } catch {
      onError(undefined, 0);
    } finally {
      setLoadingScreen(false)
    }
  };

  return (
    <>
      <div className="modal-body">
        <form onSubmit={handleLoginSubmit}>
          <h3>Entre como Estabelecimento para anunciar suas vagas!</h3>

          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <span id="forgot-passw" onClick={() => setForgotOpen(true)}>
            Esqueceu a senha?
          </span>

          <button type="submit" disabled={loading}>
            Entrar
          </button>
        </form>
      </div>

      
    </>
  );
};

export default EstablishmentLogin;
