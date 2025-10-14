import React, { useEffect } from "react";
import { AiOutlineExclamationCircle } from "react-icons/ai";
import "./ErrorPopup.scss";

interface Props {
  isOpen: boolean;
  statusCode?: number;
  message?: string;
  onClose: () => void;
  nestedModal?: boolean; // if true, don't change body overflow
}

const statusMessages: Record<number, string> = {
  400: "Requisição inválida.",
  401: "Não autorizado.",
  403: "Acesso negado.",
  404: "Recurso não encontrado.",
  500: "Erro interno do servidor.",
  0: "Erro de conexão. Verifique sua internet.",
};

const ErrorPopup: React.FC<Props> = ({ isOpen, statusCode, message, onClose, nestedModal }) => {
  useEffect(() => {
    if (!nestedModal) { // only manage body scroll if it's not nested
      if (isOpen) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "";
      }

      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [isOpen, nestedModal]);

  if (!isOpen) return null;

  const displayMessage = message || statusMessages[statusCode || 0] || "Ocorreu um erro.";

  return (
    <div className="error-popup-overlay">
      <div className="error-popup">
        <AiOutlineExclamationCircle size={40} color="#ff4d4f" />
        <p>{displayMessage}</p>
        <button onClick={onClose}>OK</button>
      </div>
    </div>
  );
};

export default ErrorPopup;
