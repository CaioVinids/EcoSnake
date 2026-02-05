import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getAuth, sendEmailVerification, signOut } from 'firebase/auth';
import { app } from '../services/firebase'; 
import AuthCard from '../components/ui/AuthCard/AuthCard'; 
import PrimaryButton from '../components/ui/PrimaryButton'; 

import '../pages/pagesCss/AuthPages.css'; 
import '../pages/pagesCss/ConfirmEmailPage.css';

const ConfirmEmailPage = () => {
  const auth = getAuth(app);
  const navigate = useNavigate();
  const location = useLocation(); 

  const [userEmail, setUserEmail] = useState("");
  const [verificationMessage, setVerificationMessage] = useState("");
  const [isErrorMessage, setIsErrorMessage] = useState(false); 
  const [resendDisabled, setResendDisabled] = useState(false);
  const [redirectTimer, setRedirectTimer] = useState(null); 

  useEffect(() => {
    if (location.state && location.state.email) {
      setUserEmail(location.state.email);
    } else if (auth.currentUser && auth.currentUser.email) {
      setUserEmail(auth.currentUser.email);
    } else {
    }
  }, [auth.currentUser, location.state, navigate]);

  // Limpa o timer se o componente for desmontado
  useEffect(() => {
    return () => {
      if (redirectTimer) {
        clearTimeout(redirectTimer);
      }
    };
  }, [redirectTimer]);

  const handleResendVerification = useCallback(async () => {
    if (auth.currentUser && !resendDisabled) {
      setResendDisabled(true);
      setVerificationMessage("A enviar e-mail de verificação...");
      setIsErrorMessage(false);
      console.log("ConfirmEmailPage: A tentar reenviar e-mail de verificação para", auth.currentUser.email);

      try {
        await sendEmailVerification(auth.currentUser);
        console.log("ConfirmEmailPage: sendEmailVerification bem-sucedido.");
        setVerificationMessage(
          "E-mail de verificação reenviado! Verifique a sua caixa de entrada e spam. " +
          "Será redirecionado para o ecrã de login em 5 segundos para prosseguir após a verificação."
        );
        setIsErrorMessage(false);
        
        const timerId = setTimeout(() => {
          console.log("ConfirmEmailPage: Timeout de 5s concluído, a redirecionar para /login.");
          signOut(auth).then(() => navigate('/login')).catch(() => navigate('/login'));
        }, 5000);
        setRedirectTimer(timerId);

      } catch (error) {
        console.error("ConfirmEmailPage: Erro ao reenviar e-mail de verificação:", error);
        setVerificationMessage("Erro ao reenviar. Tente novamente dentro de momentos.");
        setIsErrorMessage(true);
        // Reabilita o botão após um tempo em caso de erro
        setTimeout(() => setResendDisabled(false), 30000); 
      }
    } else if (!auth.currentUser) {
        setVerificationMessage("Não há utilizador autenticado para reenviar a verificação. Por favor, faça login.");
        setIsErrorMessage(true);
        const timerId = setTimeout(() => navigate('/login'), 3000);
        setRedirectTimer(timerId);
    }
  }, [auth, resendDisabled, navigate]);

  const handleGoToLogin = useCallback(async () => {
    if (redirectTimer) clearTimeout(redirectTimer); 
    try {
      // Se o utilizador estiver autenticado (mesmo que não verificado), faz logout antes de ir para o login
      if (auth.currentUser) {
        await signOut(auth);
      }
    } catch (error) {
      console.error("Erro ao fazer logout antes de ir para login:", error);
    }
    navigate('/login');
  }, [auth, navigate, redirectTimer]);

  return (
    <div className="auth-page-container"> 
      <AuthCard
        logoSrc="/assets/imgs/logo.png" 
        title="Verifique o seu E-mail"
        subtitle={userEmail ? `Um link de verificação foi enviado para ${userEmail}.` : "Um link de verificação foi enviado para o seu e-mail."}
      >
        <p style={{ fontSize: '0.9rem', marginBottom: '20px', textAlign: 'center', lineHeight: '1.5' }}>
          Por favor, clique no link no seu e-mail para ativar a sua conta.
          Após verificar, poderá fazer login para aceder ao jogo.
        </p>
        
        <PrimaryButton
          onClick={handleResendVerification}
          disabled={resendDisabled}
          className="w-100 mb-3" 
          isLoading={resendDisabled && verificationMessage.startsWith("A enviar")}
          loadingText="A enviar..."
        >
          Reenviar E-mail de Verificação
        </PrimaryButton>

        {verificationMessage && (
          <p className={`confirm-email-message ${isErrorMessage ? 'error' : 'success'}`}>
            {verificationMessage}
          </p>
        )}
        
        <div className="auth-card-options" style={{ marginTop: '25px' }}>
          <div
            onClick={handleGoToLogin}
            className="auth-option-link" 
          >
            Já verificou? Ir para Login
          </div>
        </div>
      </AuthCard>
    </div>
  );
};

export default ConfirmEmailPage;
