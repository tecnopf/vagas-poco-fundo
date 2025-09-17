import React from "react";
import { useAuth } from "../../hooks/UseAuth";
import logo from '../../assets/brasao.png'
import './Header.scss'
import { FiLogIn } from "react-icons/fi";

interface HeaderProps {
  onLoginClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onLoginClick }) => {
  const { authorized } = useAuth();
  return (
    <header className="header">
      <div className="header-items-wrapper">
        <div>
          <img src={logo} alt="Logo" />
          <h1>Vagas Poço Fundo</h1>
        </div>
        {!authorized && (
          <button onClick={onLoginClick}>
            <FiLogIn className="mobile-login-button"/>
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
