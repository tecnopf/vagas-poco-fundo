import React, { useState } from "react";
import Header from "../../components/header/Header";
import JobList from "./Joblist";
import "./Home.scss";
import LoginModal from "../../components/authModal/AuthModal";
import { useAuth } from "../../context/AuthContext";
import Loading from "../../components/loading/Loading";
import Footer from "../../components/footer/Footer";


const Home: React.FC = () => {
  const {authorized} = useAuth();
  const [modalOpen, setModalOpen] = useState(false);

  if (authorized === null) return <Loading loading={authorized === null} text="Carregando... pode demorar até 2 min após um período de inatividade nos servidores."></Loading>;

  const handleLoginClick = () => {
    setModalOpen(true);
  };

  return (
    <div>
      <Header onLoginClick={handleLoginClick} />
      <LoginModal open={modalOpen} onClose={() => setModalOpen(false)}/>
      <JobList />
      <Footer></Footer>
    </div>
  );
};

export default Home;
