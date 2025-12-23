import React from "react";
import { ImSpinner9 } from "react-icons/im";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { useAuth } from "../../context/AuthContext";
import ProfileEstablishment from "./ProfileEstablishment";
import ProfileUser from "./ProfileUser";
import "./ProfileSidebar.scss";

interface ProfileSidebarProps {
  data: any;
  isLoading: boolean;
  isOpen: boolean;
  onToggle: () => void;
}

const ProfileSidebar: React.FC<ProfileSidebarProps> = ({ data, isLoading, isOpen, onToggle }) => {
  const { role } = useAuth();

  const renderProfile = () => {
    if (role === "establishment") return <ProfileEstablishment data={data} />;
    if (role === "user") return <ProfileUser data={data} />;
    return null;
  };

  return (
    <div className={`profile-sidebar ${isOpen ? "open" : ""}`}>
      {isLoading ? (
        <div className="profile-loading">
          <ImSpinner9 className="spinner" />
        </div>
      ) : (
        <>
          {renderProfile()}

          <button className="sidebar-toggle" onClick={onToggle} aria-label="Abrir perfil">
            {isOpen ? (
              <IoIosArrowForward className="sidebar-arrow arrow-open" />
            ) : (
              <IoIosArrowBack className="sidebar-arrow" />
            )}
          </button>
        </>
      )}
    </div>
  );
};

export default ProfileSidebar;
