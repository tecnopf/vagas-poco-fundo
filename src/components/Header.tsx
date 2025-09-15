import React from "react";
import { useAuth } from "../hooks/UseAuth";

interface HeaderProps {
  onLoginClick: () => void;
  onRegisterClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onLoginClick, onRegisterClick }) => {
    const { authorized } = useAuth();
  return (
    <header className="header">
      <h1>Vagas Poço Fundo</h1>
      {!authorized && (
        <div className="auth-buttons">
          <button onClick={onLoginClick}>Login</button>
          <button onClick={onRegisterClick}>Registrar</button>
        </div>
      )}
    </header>
  );
};

export default Header;
