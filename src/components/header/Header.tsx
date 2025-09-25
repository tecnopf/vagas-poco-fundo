import React from "react";
import { FaBuildingUser } from "react-icons/fa6";
import logo from '../../assets/brasao.png';
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
  const { authorized,  logout } = useAuth();
  const { data, isLoading } = useProfile();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <header className="header">
      <div className="header-items-wrapper">
        <div>
          <img src={logo} alt="Logo" />
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
          <div className="user-section">
            {!isMobile && isLoading ? (
              <ImSpinner9 className="spinner-icon" />
            ) : location.pathname === "/profile" ? (
              <button
                onClick={() => {
                  logout();
                  navigate("/"); 
                }}
                className="logout-btn"
              >
                Sair
              </button>
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
