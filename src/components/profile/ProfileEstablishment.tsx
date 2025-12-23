import React, { useEffect, useState } from "react";
import { ImSpinner9 } from "react-icons/im";
import { formatCNPJ } from "../../utils/formatCNPJ";
import { API_URL } from "../../configs";
import { useAuth } from "../../context/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import ErrorPopup from "../error-popup/ErrorPopup";

interface ProfileEstablishmentProps {
  data: any;
}

export const unformatCNPJ = (value: string) => value.replace(/\D/g, "");


const ProfileEstablishment: React.FC<ProfileEstablishmentProps> = ({ data }) => {
  const { role, logout } = useAuth();
  const queryClient = useQueryClient();

  const [editing, setEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [errorPopupOpen, setErrorPopupOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const [errorDirectMessage, setErrorDirectMessage] = useState<string | undefined>();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    cnpj: "",
    password: "",
  });

  useEffect(() => {
    if (!data) return;
    setFormData({
      name: data.name || "",
      email: data.email || "",
      cnpj: data.cnpj ? formatCNPJ(data.cnpj) : "",
      password: "",
    });
  }, [data]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCnpjChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, cnpj: formatCNPJ(e.target.value) });
  };

  const handleSave = async () => {
    setIsSaving(true);

    const payload: Partial<typeof formData> = {};
    if (formData.name !== data.name) payload.name = formData.name;
    if (formData.email !== data.email) payload.email = formData.email;
    if (formData.cnpj !== data.cnpj) payload.cnpj = unformatCNPJ(formData.cnpj);
    if (formData.password.trim()) payload.password = formData.password;

    if (!Object.keys(payload).length) {
      setEditing(false);
      setIsSaving(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/auth/establishment/update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (res.status === 401 || res.status === 403) {
        setErrorDirectMessage('Sessão Expirada!');
        setErrorPopupOpen(true);
        setTimeout(logout, 4000)
        return;
      }

      const result = await res.json();

      if (!res.ok) {
        setErrorMessage(result.error);
        setErrorPopupOpen(true);
        return;
      }

      setFormData({ ...formData, password: "" });
      await queryClient.invalidateQueries({ queryKey: ["profile", role] });
      setEditing(false);
    } catch {
      setErrorMessage("Erro de conexão. Tente novamente.");
      setErrorPopupOpen(true);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div className="profile-card">
        <h2>Meu Perfil</h2>

        <div className="form-group">
          <label>Nome</label>
          <input name="name" value={formData.name} disabled={!editing} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label>Email</label>
          <input name="email" value={formData.email} disabled={!editing} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label>CNPJ</label>
          <input name="cnpj" value={formData.cnpj} disabled={!editing} onChange={handleCnpjChange} />
        </div>

        <div className="form-group">
          <label>Senha</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            disabled={!editing}
            onChange={handleChange}
            placeholder="Deixe em branco para manter a mesma"
          />
        </div>

        {editing ? (
          <div style={{ display: "flex", gap: "1rem" }}>
            <button onClick={handleSave} disabled={isSaving} className="generic-button">
              {isSaving ? <ImSpinner9 className="spinner-icon" style={{marginLeft: 'auto', marginRight: 'auto', fontSize: 24}} fontSize={28} color="white" /> : "Salvar"}
            </button>
            <button
              className="generic-button cancel"
              disabled={isSaving}
              onClick={() => {
                setFormData({
                  name: data?.name || "",
                  email: data?.email || "",
                  cnpj: data?.cnpj ? formatCNPJ(data.cnpj) : "",
                  password: "",
                });
                setEditing(false);
              }}
            >
              Cancelar
            </button>
          </div>
        ) : (
          <>
            <button onClick={() => setEditing(true)} className="edit-button">Editar</button>
            <button onClick={logout} className="edit-button">Sair</button>
          </>
        )}
      </div>

      <ErrorPopup
        isOpen={errorPopupOpen}
        message={errorMessage}
        rawMessage={errorDirectMessage}
        onClose={() => setErrorPopupOpen(false)}
        positionAbsolute


      />
    </>
  );
};

export default ProfileEstablishment;
