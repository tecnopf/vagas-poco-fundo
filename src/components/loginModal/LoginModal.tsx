import React, { useState } from "react";
import "./LoginModal.scss";
import { IoIosInformationCircle } from "react-icons/io";
import InfoModal from "./InfoModal";

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
}

const formatCNPJ = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 14); // keep only numbers up to 14
  if (digits.length <= 2) return digits; // 1..2
  if (digits.length <= 5) return `${digits.slice(0,2)}.${digits.slice(2)}`; // 3..5
  if (digits.length <= 8) return `${digits.slice(0,2)}.${digits.slice(2,5)}.${digits.slice(5)}`; // 6..8
  if (digits.length <= 12) return `${digits.slice(0,2)}.${digits.slice(2,5)}.${digits.slice(5,8)}/${digits.slice(8)}`; // 9..12
  return `${digits.slice(0,2)}.${digits.slice(2,5)}.${digits.slice(5,8)}/${digits.slice(8,12)}-${digits.slice(12)}`; // 13..14
};

const LoginModal: React.FC<LoginModalProps> = ({ open, onClose }) => {
  if (!open) return null;

  const [mode, setMode] = useState<"login" | "register">("login");
  const [TokenInfoOpen, setTokenInfoOpen] = useState(false);
  const [cnpj, setCnpj] = useState("");

  const handleCnpjChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCnpj(formatCNPJ(e.target.value));
  };

  return (
    <>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <button
              style={{ borderRight: "none", borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
              onClick={() => setMode("login")}
              className={mode === "login" ? "active" : ""}
            >
              Entrar
            </button>
            <button
              style={{ borderLeft: "none", borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
              onClick={() => setMode("register")}
              className={mode === "register" ? "active" : ""}
            >
              Criar conta
            </button>
          </div>

          <div className="modal-body">
            {mode === "login" ? (
              <form>
                <h3>Entre como Estabelecimento para anunciar suas vagas!</h3>
                <input type="email" placeholder="E-mail" />
                <input type="password" placeholder="Senha" />
                <button type="submit">Entrar</button>
              </form>
            ) : (
              <form>
                <h3>Crie uma conta de Estabelecimento para anunciar suas vagas!</h3>
                <input type="text" placeholder="Nome do Estabelecimento" />
                <input type="email" placeholder="E-mail" />
                <input
                  type="numeric"
                  placeholder="CNPJ"
                  value={cnpj}
                  onChange={handleCnpjChange}
                  maxLength={18} // 18 inclui pontos, barra e traço
                />
                <div className="input-info">
                  <input type="text" placeholder="Token" />
                  <div onClick={() => setTokenInfoOpen(true)}>
                    <IoIosInformationCircle className="info" />
                  </div>
                </div>
                <input type="password" placeholder="Senha" />
                <input type="password" placeholder="Repetir Senha" />
                <button type="submit">Criar conta</button>
              </form>
            )}
          </div>
        </div>
      </div>

      <InfoModal open={TokenInfoOpen} onClose={() => setTokenInfoOpen(false)} />
    </>
  );
};

export default LoginModal;
