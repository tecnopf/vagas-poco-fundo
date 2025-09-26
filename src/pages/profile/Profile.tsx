// src/pages/Profile.tsx
import React, { useState, useEffect } from "react";
import { useProfile } from "../../cached-requests/getProfile";
import { ImSpinner9 } from "react-icons/im";
import Header from "../../components/header/Header";
import "./Profile.scss";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { formatCNPJ } from "../../utils/formatCNPJ";
import { API_URL } from "../../configs";
import { useAuth } from "../../context/AuthContext";
import Vacancy from "./Vacancy";
import { IoIosAddCircle } from "react-icons/io";
import { LiaLinkSolid } from "react-icons/lia";
import Toast from "../../components/toast/Toast";
import NewVacancyModal from "./NewVacancyModal";
import SocialLinksModal from "./SocialLinksModal";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import ErrorPopup from "../../components/error-popup/ErrorPopup";


const Profile: React.FC = () => {
  const {authorized, token, loadingToken } = useAuth()
  console.log('authorized: ',authorized)
  const { data, isLoading, isError } = useProfile();
  const [error, setError] = useState<string | null>(null);
  const [showNewVacancyModal, setShowNewVacancyModal] = useState(false);
  const [showSocialLinksModal,setShowSocialLinksModal] = useState(false);
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  useEffect(() => {
    if(loadingToken){
      return
    }
    if (!authorized || isError) {
      console.log('redirecting')
      queryClient.invalidateQueries({ queryKey: ["profile"] })
      navigate("/")
    }
  }, [authorized, isError, error, queryClient, loadingToken])



  console.log('token: ', token)

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    cnpj: "",
    password: "",
  });

  const handleCnpjChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, cnpj: formatCNPJ(e.target.value) });
  };

  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (data) {
      setFormData({
        name: data.name || "",
        email: data.email || "",
        cnpj: data.cnpj || "",
        password: "",
      });
    }
  }, [data]);

  useEffect(() => {
    if (showNewVacancyModal) {
      document.body.style.overflow = "hidden"; 
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = ""; 
    };
  }, [showNewVacancyModal]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!data) return;
    setError(null); 

    // Create a payload with only changed values
    const payload: Partial<typeof formData> = {};
    if (formData.name !== data.name) payload.name = formData.name;
    if (formData.email !== data.email) payload.email = formData.email;
    if (formData.cnpj !== data.cnpj) payload.cnpj = formData.cnpj;
    if (formData.password && formData.password.trim() !== "") payload.password = formData.password;

    if (Object.keys(payload).length === 0) {
      setEditing(false); 
      return;
    }

    console.log(JSON.stringify(payload))

    try {
      const res = await fetch(`${API_URL}/api/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });

      const updated = await res.json();

      if (!res.ok) {
        throw new Error(updated.error || "Erro ao atualizar perfil");
      }

      setFormData({ ...formData, password: "" }); 
      setEditing(false);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      
    }
  };

  return (
    <>
      <Header onLoginClick={() => null} />
      <Vacancy onProfileClick={() => setIsOpen(true)}/>

      <div className={`profile-sidebar ${isOpen ? "open" : ""}`}>
        {isLoading ? (
          <div className="profile-loading">
            <ImSpinner9 className="spinner" />
          </div>
        ) : (
          <>
            <div className="profile-card">
              <h2>Meu Perfil</h2>

              <div className="form-group">
                <label>Nome</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  disabled={!editing}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  disabled={!editing}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>CNPJ</label>
                <input
                  type="text"
                  name="cnpj"
                  value={formData.cnpj}
                  disabled={!editing}
                  onChange={handleCnpjChange}
                />
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
                  <button onClick={handleSave} className="generic-button">
                    Salvar
                  </button>
                  <button
                    className="generic-button cancel"
                    onClick={() => {
                      setFormData({
                        name: data?.name || "",
                        email: data?.email || "",
                        cnpj: data?.cnpj || "",
                        password: "",
                      });
                      setEditing(false);
                    }}
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <button style={{marginTop: '2rem'}} onClick={() => setEditing(true)} className="edit-button">
                  Editar
                </button>
              )}
              {error && <p className="form-error">{error}</p>}
            </div>

            <button
              className="sidebar-toggle"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Abrir perfil"
            >
              {isOpen ? (
                <IoIosArrowForward className="sidebar-arrow arrow-open" />
              ) : (
                <IoIosArrowBack className="sidebar-arrow" />
              )}
            </button>
            
          </>
        )}
      </div>

      <div className="floating-button-wrapper">
        <Toast placement="top" message="Criar vaga">
        <button onClick={()=>setShowNewVacancyModal(true)}>
          <IoIosAddCircle className="floating-button" />
        </button>
        </Toast>
        <Toast placement="top" message="Redes sociais">
        <button onClick={()=>setShowSocialLinksModal(true)} className="social-media">
          <LiaLinkSolid className="floating-button social-media" width={50} height={50} color="white" />
        </button>
        </Toast>
      </div>
      <NewVacancyModal
        isOpen={showNewVacancyModal}
        onClose={() => setShowNewVacancyModal(false)}
        onSave={() => null}
      />
      <SocialLinksModal isOpen={showSocialLinksModal} onClose={()=>setShowSocialLinksModal(false)} onSave={()=>queryClient.invalidateQueries({ queryKey: ["profile"] })}/>
      
    </>
  );
};

export default Profile;
