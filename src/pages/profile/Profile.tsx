import React, { useEffect, useState } from "react";
import { useProfile } from "../../cached-requests/getProfile";
import Header from "../../components/header/Header";
import Vacancy from "./Vacancy";
import Footer from "../../components/footer/Footer";
import ProfileSidebar from "../../components/profile/ProfileSidebar";
import './Profile.scss'
import NewVacancyModal from "./NewVacancyModal";
import SocialLinksModal from "./SocialLinksModal";
import Toast from "../../components/toast/Toast";
import { IoIosAddCircle } from "react-icons/io";
import { LiaLinkSolid } from "react-icons/lia";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

const Profile: React.FC = () => {
  const { authorized, loading, role } = useAuth();
  const { data, isLoading, isError } = useProfile();
  const [isOpen, setIsOpen] = useState(false);
  const [showNewVacancyModal, setShowNewVacancyModal] = useState(false);
  const [showSocialLinksModal, setShowSocialLinksModal] = useState(false);

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (loading) return;
    if (!authorized || isError) {
      queryClient.invalidateQueries({ queryKey: ["profile", role] });
      navigate("/");
    }
  }, [authorized, isError, loading]);

  return (
    <>
      <Header onLoginClick={() => null} />
      <Vacancy onProfileClick={() => setIsOpen(true)} onGetStartedClick={() => setShowNewVacancyModal(true)} />

      <ProfileSidebar
        data={data}
        isLoading={isLoading}
        isOpen={isOpen}
        onToggle={() => setIsOpen(!isOpen)}
      />

      <Footer />

      <div className="floating-button-wrapper">
        <Toast placement="top" message="Criar vaga">
          <button onClick={() => setShowNewVacancyModal(true)}>
            <IoIosAddCircle className="floating-button" />
          </button>
        </Toast>

        <Toast placement="top" message="Redes sociais">
          <button onClick={()=>{setShowSocialLinksModal(true); document.body.style.overflow = 'hidden'}} className="social-media"> 
            <LiaLinkSolid className="floating-button social-media" width={50} height={50} color="white" /> 
          </button>
        </Toast>
      </div>

      <NewVacancyModal isOpen={showNewVacancyModal} onClose={() => setShowNewVacancyModal(false)} onSave={() => null} />

      {showSocialLinksModal && (
        <SocialLinksModal
          isOpen
          onClose={() => setShowSocialLinksModal(false)}
          onSave={() => queryClient.invalidateQueries({ queryKey: ["profile"] })}
        />
      )}
    </>
  );
};

export default Profile;
