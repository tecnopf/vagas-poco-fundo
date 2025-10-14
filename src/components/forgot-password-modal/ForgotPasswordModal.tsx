import React, { useState, useEffect } from "react";
import "./ForgotPasswordModal.scss";
import { API_URL } from "../../configs";
import ErrorPopup from "../error-popup/ErrorPopup";

interface ForgotPasswordModalProps {
  open: boolean;
  onClose: () => void;
}

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ open, onClose }) => {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [counter, setCounter] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errorPopupOpen, setErrorPopupOpen] = useState(false);
  const [errorStatus, setErrorStatus] = useState<number | undefined>(undefined);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let timer: any;
    if (counter > 0) timer = setTimeout(() => setCounter((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [counter]);

  const handleSendCode = async () => {
    if (!email) {
      setErrorMessage("Digite seu e-mail.");
      setErrorPopupOpen(true);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/magic-link`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorStatus(res.status);
        setErrorMessage(data.error || "Erro ao enviar e-mail.");
        setErrorPopupOpen(true);
        return;
      }

      setSent(true);
      setCounter(60);
    } catch {
      setErrorStatus(0);
      setErrorMessage("Falha de conexão. Verifique sua internet.");
      setErrorPopupOpen(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`modal-overlay ${open ? "show" : "hide"}`} onClick={onClose}>
      <div className="forgot-modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>Recuperar Acesso</h3>
        <p>Digite seu e-mail para receber um link de acesso.</p>

        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button onClick={handleSendCode} disabled={counter > 0 || loading}>
          {loading
            ? "Enviando..."
            : counter > 0
            ? `Reenviar em ${counter}s`
            : "Enviar link"}
        </button>

        {sent && <p className="info-text">Se o e-mail existir, o link foi enviado.</p>}

        <button className="close-btn" onClick={onClose}>Fechar</button>

        <ErrorPopup
          isOpen={errorPopupOpen}
          statusCode={errorStatus}
          message={errorMessage}
          onClose={() => setErrorPopupOpen(false)}
        />
      </div>
    </div>
  );
};

export default ForgotPasswordModal;
