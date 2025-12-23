import React from "react";
import { useAuth } from "../../context/AuthContext";

interface ProfileUserProps {
  data: any;
}

const ProfileUser: React.FC<ProfileUserProps> = ({ data }) => {
  const { logout } = useAuth();

  return (
    <div className="profile-card">
      <h2>Meu Perfil</h2>

      <div className="form-group">
        <label>Nome</label>
        <input value={data?.name || ""} disabled />
      </div>

      <div className="form-group">
        <label>Email</label>
        <input value={data?.email || ""} disabled />
      </div>

      <button onClick={logout} className="edit-button">Sair</button>
    </div>
  );
};

export default ProfileUser;
