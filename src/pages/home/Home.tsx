import React, { useState } from "react";
import Header from "../../components/header/Header";
import JobList from "./Joblist";
import { useAuth } from "../../hooks/UseAuth";
import "./Home.scss";
import LoginModal from "../../components/loginModal/LoginModal";

const Home: React.FC = () => {
  const { authorized} = useAuth();
  const [modalOpen, setModalOpen] = useState(false);

  if (authorized === null) return <p>Carregando...</p>;

  const handleLoginClick = () => {
    setModalOpen(true);
  };

  return (
    <div>
      <Header onLoginClick={handleLoginClick} />
      <LoginModal open={modalOpen} onClose={() => setModalOpen(false)}/>
      {!authorized && <JobList />}
      {authorized && (
        <section className="hero">
          <h1>Bem-vindo, usuário!</h1>
          <p>Área autenticada.</p>
        </section>
      )}
    </div>
  );
};

export default Home;
