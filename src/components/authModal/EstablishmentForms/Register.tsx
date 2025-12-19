import React, { useState } from "react";
import { API_URL } from "../../../configs";
import { formatCNPJ } from "../../../utils/formatCNPJ";
import { useAuth } from "../../../context/AuthContext";
import { IoIosInformationCircle } from "react-icons/io";

interface Props {
  onClose: () => void;
  onError: (message?: string, status?: number, directMessage?: string) => void;
  setTokenInfoOpen: (open: boolean) => void;
}

const EstablishmentRegister: React.FC<Props> = ({
  onClose,
  onError,
  setTokenInfoOpen,
}) => {
  const { login } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [tokenValue, setTokenValue] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [tokenError, setTokenError] = useState(false);

  const handleCnpjChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCnpj(formatCNPJ(e.target.value));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log(cnpj)

    const sanitizedCnpj = cnpj.replace(/\D/g, "");

    console.log(sanitizedCnpj)

    if (!name || !email || !cnpj || !tokenValue || !password || !confirmPassword) {
      onError(undefined, undefined, "Preencha todos os campos.");
      return;
    }

    if (tokenValue.length < 7) {
      onError(undefined, undefined, "O token deve ter pelo menos 7 caracteres.",);
      setTokenError(true);
      setTimeout(() => setTokenError(false), 3000);
      return;
    }

    if (password !== confirmPassword) {
      onError(undefined, undefined, "As senhas não conferem.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/establishment/register`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          tokenValue,
          data: {
            name,
            cnpj: sanitizedCnpj,
          },
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          onError(undefined, undefined, "Token inválido ou expirado.");
          setTokenError(true);
          setTimeout(() => setTokenError(false), 3000);
        } else {
          onError(data.error, res.status);
        }
        return;
      }

      login(data.role);
      onClose();
    } catch {
      onError(undefined, 0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-body">
      <form onSubmit={submit}>
        <h3>Crie uma conta de Estabelecimento para anunciar suas vagas!</h3>

        <input
          type="text"
          placeholder="Nome do Estabelecimento"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="text"
          placeholder="CNPJ"
          value={cnpj}
          onChange={handleCnpjChange}
          maxLength={18}
        />

        <div className="input-info">
          <input
            type="text"
            placeholder="Token"
            maxLength={7}
            value={tokenValue}
            onChange={(e) => setTokenValue(e.target.value.toUpperCase())}
          />
          <div onClick={() => setTokenInfoOpen(true)}>
            <IoIosInformationCircle
              className={`info ${tokenError ? "error-blink" : ""}`}
            />
          </div>
        </div>

        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <div style={{ position: "relative", width: "100%" }}>
          <input
            type="password"
            placeholder="Repetir Senha"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            style={{
              width: "100%",
              paddingRight: "140px",
              borderColor:
                confirmPassword.length > 0
                  ? password === confirmPassword
                    ? "green"
                    : "red"
                  : undefined,
            }}
          />
          {confirmPassword.length > 0 && password !== confirmPassword && (
            <span
              style={{
                position: "absolute",
                right: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: "0.85rem",
                color: "red",
                pointerEvents: "none",
              }}
            >
              Senhas não coincidem
            </span>
          )}
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Criando..." : "Criar conta"}
        </button>
      </form>
    </div>
  );
};

export default EstablishmentRegister;
