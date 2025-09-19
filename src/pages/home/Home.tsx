import React, { useState } from "react";
import Header from "../../components/header/Header";
import JobList from "./Joblist";
import "./Home.scss";
import LoginModal from "../../components/loginModal/LoginModal";
import { useAuth } from "../../context/AuthContext";
import Loading from "../../components/loading/Loading";
import { useProfile } from "../../cached-requests/getProfile";
import { useQueryClient } from "@tanstack/react-query";

const Home: React.FC = () => {
  const {authorized} = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const { data, isLoading, isError, error } = useProfile();
  const queryClient = useQueryClient();

  console.log('isLoading:',isLoading)
  console.log('isError:',isError)
  console.log('error:',error)

  console.log(data)

  const handleShowCache = () => {
    const cached = queryClient.getQueryData(["profile"]);
    console.log("📦 Cached profile:", cached);
    alert(JSON.stringify(cached, null, 2));
  };

  if (authorized === null) return <Loading loading={authorized === null} text="Carregando... pode demorar até 1 min após um tempo de inatividade nos servidores."></Loading>;

  const handleLoginClick = () => {
    setModalOpen(true);
  };

  return (
    <div>
      <Header onLoginClick={handleLoginClick} />
      <LoginModal open={modalOpen} onClose={() => setModalOpen(false)}/>
      <JobList />
    </div>
  );
};

export default Home;
