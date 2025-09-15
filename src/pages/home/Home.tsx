import React from "react";
import Header from "../../components/Header";
import JobList from "./Joblist";
import { useAuth } from "../../hooks/UseAuth";
import "./Home.scss";

const Home: React.FC = () => {
  const { authorized} = useAuth();

  if (authorized === null) return <p>Carregando...</p>;

  const handleLoginClick = () => {
    alert("Abrir modal ou redirecionar para login");
  };

  const handleRegisterClick = () => {
    alert("Abrir modal ou redirecionar para registro");
  };

  return (
    <div>
      <Header onLoginClick={handleLoginClick} onRegisterClick={handleRegisterClick} />
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
