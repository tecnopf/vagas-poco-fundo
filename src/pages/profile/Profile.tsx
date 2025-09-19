// src/pages/Profile.tsx
import React, { useState, useEffect } from "react";
import { useProfile } from "../../cached-requests/getProfile";
import { ImSpinner9 } from "react-icons/im";
import { FiUser } from "react-icons/fi";
import Header from "../../components/header/Header";
import "./Profile.scss";
import { IoIosArrowBack } from "react-icons/io";
import { IoIosArrowForward } from "react-icons/io";

const Profile: React.FC = () => {
  const { data, isLoading } = useProfile();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: ""
  });

  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (data) {
      setFormData({
        name: data.name || "",
        email: data.email || "",
        phone: data.phone || ""
      });
    }
  }, [data]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    console.log("Save profile:", formData);
    // mutation para salvar
  };

  return (
    <>
      <Header onLoginClick={() => null} />


      {/* Sidebar */}
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
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Telefone</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            <button onClick={handleSave} className="save-button">
              Salvar
            </button>
          </div>
          <button
            className="sidebar-toggle"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Abrir perfil"
          >
            {isOpen ? <IoIosArrowForward className="arrow"/> : <IoIosArrowBack className="arrow"/> }
          </button>
          </>
        )}
      </div>
    </>
  );
};

export default Profile;
