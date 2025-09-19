import React, { useState } from "react";
import "./LoginModal.scss";
import { IoIosInformationCircle } from "react-icons/io";
import InfoModal from "./InfoModal";
import { useAuth } from "../../context/AuthContext";
import Loading from "../loading/Loading";
import { API_URL } from "../../configs";

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
}

const formatCNPJ = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 14);
  if (digits.length <= 2) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  if (digits.length <= 8)
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
  if (digits.length <= 12)
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(
      5,
      8
    )}/${digits.slice(8)}`;
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(
    5,
    8
  )}/${digits.slice(8, 12)}-${digits.slice(12)}`;
};

const LoginModal: React.FC<LoginModalProps> = ({ open, onClose }) => {
  if (!open) return null;

  const [mode, setMode] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false)
  const [loadingText, setLoadingText] = useState('')
  const [TokenInfoOpen, setTokenInfoOpen] = useState(false);
  const [tokenError, setTokenError] = useState(false);
  const [cnpj, setCnpj] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  

  const { login } = useAuth()

  const handleCnpjChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCnpj(formatCNPJ(e.target.value));
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingText('Criando conta...')
    setLoading(true);
    
    setError(null);

    await new Promise((resolve)=>setTimeout(resolve, 2000))

    if (!name || !email || !cnpj || !token || !password || !confirmPassword) {
      setError("Preencha todos os campos.");
      return;
    }
    if (token.length < 7) {
      setError("O token deve ter pelo menos 7 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      setError("As senhas não conferem.");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, cnpj, email, password, tokenValue: token }),
      });

      const data = await res.json();
      if (!res.ok) {
        let errorMessage = data.error || "Erro ao registrar";
        if (res.status === 401) {
          errorMessage = "Token inválido, solicite outro";
          setTokenError(true);
          setTimeout(() => setTokenError(false), 5000)
        }
        throw new Error(errorMessage);
      }

      console.log(data)
      

      login(data.token);
      console.log('token saved')

      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false)
    }
  };

  return (
    <>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <button
              style={{
                borderRight: "none",
                borderTopRightRadius: 0,
                borderBottomRightRadius: 0,
              }}
              onClick={() => setMode("login")}
              className={mode === "login" ? "active" : ""}
            >
              Entrar
            </button>
            <button
              style={{
                borderLeft: "none",
                borderTopLeftRadius: 0,
                borderBottomLeftRadius: 0,
              }}
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
                <button type="submit">Entrar</button>
              </form>
            ) : (
              <form onSubmit={handleRegisterSubmit}>
                <h3>
                  Crie uma conta de Estabelecimento para anunciar suas vagas!
                </h3>
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
                    value={token}
                    onChange={(e) => setToken(e.target.value.toUpperCase())}
                  />
                  <div onClick={() => setTokenInfoOpen(true)}>
                    <IoIosInformationCircle className={`info ${tokenError ? "error-blink" : ""}`} />
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
                  {confirmPassword.length > 0 &&
                    password !== confirmPassword && (
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
                {error && (
                  <div style={{ position: "relative" }}>
                    <p className="error">{error}</p>
                  </div>
                )}
                <button type="submit">Criar conta</button>
              </form>
            )}
          </div>
        </div>
      </div>

      <InfoModal open={TokenInfoOpen} onClose={() => setTokenInfoOpen(false)} />
      <Loading loading={loading} text={loadingText} />
    </>
  );
};

export default LoginModal;
