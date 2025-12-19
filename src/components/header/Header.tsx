import React from "react";
import { FaBuildingUser } from "react-icons/fa6";
import './Header.scss';
import { FiLogIn } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import { useIsMobile } from "../../hooks/UseIsMobile";
import { useProfile } from "../../cached-requests/getProfile";
import { ImSpinner9 } from "react-icons/im";
import ShinyText from "../ShinyText";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";

interface HeaderProps {
  onLoginClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onLoginClick }) => {
  const { authorized } = useAuth();
  console.log('auth: ', authorized)
  const { data, isLoading, isError } = useProfile();
  console.log('data: ', data)
  console.log('isError:', isError)
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <header className="header">
      <div className="header-items-wrapper">
        <div style={{flexShrink: 1,  cursor: 'pointer'}} onClick={()=>navigate('/')}>
          <img src='/brasao.png' alt="Logo" />
          <ShinyText 
            text="Vagas Poço Fundo" 
            disabled={false} 
            speed={2} 
            hover={true} 
            className="h1"
            shineColor="rgba(255, 208, 0, 0.938) 50%"
          />
        </div>

        {authorized && (
          <div style={{flexGrow: 1, justifyContent: 'flex-end'}} className="user-section">
            {!isMobile && isLoading ? (
              <ImSpinner9 className="spinner-icon" />
            ) : location.pathname === "/profile" ? (
              <div style={{color: 'white'}}>Painel Administrativo</div>
            ) : (
              data?.name && (
                <div
                  className="desktop-profile-wrapper"
                  onClick={() => navigate("/profile")}
                  style={{
                    display: "flex",
                    gap: "10px",
                    alignItems: "center",
                  }}
                >
                  <span className="company-name">
                    {data.name.replace(/ /g, "\n")}
                  </span>
                  <FaBuildingUser className="user-icon" />
                </div>
              )
            )}
          </div>
        )}

        {!authorized && (
          <button onClick={onLoginClick}>
            <FiLogIn className="mobile-login-button" />
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
