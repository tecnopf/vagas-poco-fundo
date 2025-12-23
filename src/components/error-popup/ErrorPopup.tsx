import React, { useEffect } from "react";
import { AiOutlineExclamationCircle } from "react-icons/ai";
import "./ErrorPopup.scss";

interface Props {
  isOpen: boolean;
  statusCode?: number;
  message?: string;
  rawMessage?: string;
  onClose: () => void;
  nestedModal?: boolean;
  positionAbsolute?: boolean;
}

const statusMessages: Record<number, string> = {
  400: "Requisição inválida.",
  401: "Não autorizado.",
  403: "Acesso negado.",
  404: "Recurso não encontrado.",
  409: "Conflito de dados.",
  422: "Dados inválidos.",
  500: "Erro interno do servidor.",
  0: "Erro de conexão. Verifique sua internet.",
};

const errorCodeMessages: Record<string, string> = {
  TOKEN_REQUIRED: "Token é obrigatório.",
  TOKEN_INVALID_OR_EXPIRED: "Token inválido ou expirado.",
  EMAIL_REQUIRED: "E-mail é obrigatório.",
  EMAIL_NOT_FOUND: "E-mail não encontrado.",
  PASSWORD_REQUIRED: "Senha é obrigatória.",
  PASSWORD_INVALID: "Senha incorreta.",
  EMAIL_ALREADY_EXISTS: "Já existe uma conta com este e-mail.",
  CNPJ_ALREADY_EXISTS: "Já existe uma conta com este CNPJ.",
  CNPJ_ONLY_NUMBERS: "O CNPJ deve conter apenas números.",
  CNPJ_INVALID: "O CNPJ é inválido.",
  CNPJ_REQUIRED: "O CNPJ é necessário.",
  ESTABLISHMENT_NAME_REQUIRED: "Nome do Estabelecimento é necessário.",
};

const ErrorPopup: React.FC<Props> = ({
  isOpen,
  statusCode,
  message,
  rawMessage,
  onClose,
  nestedModal,
  positionAbsolute,
}) => {
  useEffect(() => {
    if (!nestedModal) {
      document.body.style.overflow = isOpen ? "hidden" : "";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [isOpen, nestedModal]);

  if (!isOpen) return null;

  const displayMessage =
    rawMessage ||
    errorCodeMessages[message ?? ""] ||
    statusMessages[statusCode || 0] ||
    "Ocorreu um erro inesperado.";

  return (
    <div
      className={`error-popup-overlay ${
        positionAbsolute ? "absolute" : "fixed"
      }`}
    >
      <div className="error-popup">
        <AiOutlineExclamationCircle size={40} color="#ff4d4f" />
        <p>{displayMessage}</p>
        <button onClick={onClose}>OK</button>
      </div>
    </div>
  );
};

export default ErrorPopup;
