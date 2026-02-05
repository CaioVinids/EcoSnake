import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, signOut } from "firebase/auth"; 
import { app } from '../services/firebase'; 
import './pagesCss/StartPage.css';

const logoPath = '/assets/imgs/logo.png'; 

const StartPage = () => {
  const navigate = useNavigate();
  const auth = getAuth(app); 

  const handleAboutClick = () => {
    navigate('/about'); 
  };

  const handlePlayClick = () => {
    navigate('/game');
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('token'); 
      navigate('/login'); 
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      alert("Erro ao sair. Tente novamente.");
    }
  };

  return (
    <div className="start-page-container">
      <div className="start-page-content">
        <img src={logoPath} alt="Eco Snake Logo" className="start-page-logo" />
        <div className="start-page-buttons">
          <button onClick={handlePlayClick} className="start-page-btn start-page-jogar">
            Jogar
          </button>
          <button onClick={handleAboutClick} className="start-page-btn start-page-sobre">
            Sobre o Projeto
          </button>
          <button onClick={handleLogout} className="start-page-btn start-page-sair">
            Sair
          </button>
        </div>
      </div>
    </div>
  );
};

export default StartPage;