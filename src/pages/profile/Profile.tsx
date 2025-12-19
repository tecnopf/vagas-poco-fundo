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
import Footer from "../../components/footer/Footer";


const Profile: React.FC = () => {
  const {authorized, loading, role, logout } = useAuth()
  const { data, isLoading, isError } = useProfile();
  const [error, setError] = useState<string | null>(null);
  const [showNewVacancyModal, setShowNewVacancyModal] = useState(false);
  const [showSocialLinksModal,setShowSocialLinksModal] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  useEffect(() => {
    if (showNewVacancyModal) {
      document.body.style.overflow = "hidden"; 
    } else {
      document.body.style.overflow = ""; 
    }

    return () => {
      document.body.style.overflow = ""; 
    };
  }, [showNewVacancyModal])

  const openNewVacancy = () => {
    setShowNewVacancyModal(true)
  };

  useEffect(() => {
    if(loading){
      return
    }
    if (!authorized || isError) {
      queryClient.invalidateQueries({ queryKey: ["profile", role] })
      navigate("/")
    }
  }, [authorized, isError, error, queryClient, loading])

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
    setIsSavingProfile(true)

    const payload: Partial<typeof formData> = {};
    if (formData.name !== data.name) payload.name = formData.name;
    if (formData.email !== data.email) payload.email = formData.email;
    if (formData.cnpj !== data.cnpj) payload.cnpj = formData.cnpj;
    if (formData.password && formData.password.trim() !== "") payload.password = formData.password;

    if (Object.keys(payload).length === 0) {
      setEditing(false); 
      setIsSavingProfile(false)
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/${role}/profile/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const updated = await res.json();

      if (!res.ok) {
        throw new Error(updated.error || "Erro ao atualizar perfil");
      }

      setFormData({ ...formData, password: "" }); 
      await queryClient.invalidateQueries({ queryKey: ["profile", role] });
      setEditing(false);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setIsSavingProfile(false)
    }
  };

  return (
    <>
      <Header onLoginClick={() => null} />
      <Vacancy onProfileClick={() => setIsOpen(true)} onGetStartedClick={()=>setShowNewVacancyModal(true)}/>

      <div className={`profile-sidebar ${isOpen ? "open" : ""}`}>
        {isLoading ? (
          <div className="profile-loading">
            <ImSpinner9 className="spinner"  />
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
                  <button disabled={isSavingProfile} style={{display: 'flex', justifyContent: 'center', maxHeight: '52.48px'}} onClick={handleSave} className="generic-button">
                    {isSavingProfile ? <ImSpinner9 className="spinner-icon" color="#ffff" style={{color: 'white', width: 25, height: 25}} /> : 'Salvar'}
                  </button>
                  <button
                    className="generic-button cancel"
                    style={{maxHeight: '52.48px'}}
                    disabled={isSavingProfile}
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
                <>
                <button style={{marginTop: '2rem'}} onClick={() => setEditing(true)} className="edit-button">
                  Editar
                </button>
                <button  style={{marginTop: '.5rem'}} onClick={() => logout()} className="edit-button">
                  Sair
                </button>
              </>
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
      <Footer/>

      <div className="floating-button-wrapper">
        <Toast placement="top" message="Criar vaga">
        <button onClick={openNewVacancy}>
          <IoIosAddCircle className="floating-button" />
        </button>
        </Toast>
        <Toast placement="top" message="Redes sociais">
        <button onClick={()=>{setShowSocialLinksModal(true); document.body.style.overflow = 'hidden'}} className="social-media">
          <LiaLinkSolid className="floating-button social-media" width={50} height={50} color="white" />
        </button>
        </Toast>
      </div>
      <NewVacancyModal
        isOpen={showNewVacancyModal}
        onClose={() => setShowNewVacancyModal(false)}
        onSave={() => null}
      />
      {showSocialLinksModal && (
         <SocialLinksModal isOpen={true} onClose={()=>{setShowSocialLinksModal(false); document.body.style.overflow = ''}} onSave={()=>queryClient.invalidateQueries({ queryKey: ["profile"] })}/>
      )}
     
      
    </>
  );
};

export default Profile;
