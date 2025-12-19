import React, { useState } from "react";
import { API_URL } from "../../../configs";
import { useAuth } from "../../../context/AuthContext";

interface Props {
  onClose: () => void;
  onError: (message?: string, status?: number, directMessage?: string) => void;
}

const UserRegister: React.FC<Props> = ({
  onClose,
  onError,
}) => {
  const { login } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('submit')

    if (!name || !email || !cpf || !birthDate || !password || !confirmPassword) {
      onError(undefined, undefined, "Preencha todos os campos");
      return;
    }

    if (password !== confirmPassword) {
      onError(undefined, undefined, "As senhas não conferem");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/user/register`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          data: {
            name,
            cpf,
            birthDate
          }
        }),
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
      setLoading(false);
    }
  };

  return (
    <div className="modal-body">
      <form onSubmit={submit}>
        <h3>Crie sua conta para aplicar para vagas!</h3>

        <input
          type="text"
          placeholder="Nome completo"
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
          placeholder="CPF"
          value={cpf}
          onChange={(e) => setCpf(e.target.value)}
        />

        <div className="date-input-wrapper">
          {!birthDate && <span className="fake-placeholder">Data de nascimento</span>}

          <input
            type="date"
            value={birthDate}
            style={{width: '100%'}}
            onChange={(e) => setBirthDate(e.target.value)}
            className={!birthDate ? "date-empty" : ""}
          />
        </div>

        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <input
          type="password"
          placeholder="Repetir senha"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <button type="submit" disabled={loading}>
          {loading ? "Criando..." : "Criar conta"}
        </button>
      </form>
    </div>
  );
};

export default UserRegister;
