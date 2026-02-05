import React, { useState, useCallback } from "react";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  createUserWithEmailAndPassword,
  sendEmailVerification, 
  signOut 
} from "firebase/auth";
import { app } from "../services/firebase"; 
import { useNavigate, Link } from "react-router-dom";

import AuthCard from "../components/ui/AuthCard/AuthCard"; 
import EmailInput from "../components/form/EmailInput";
import PasswordInput from "../components/form/PasswordInput";
import PrimaryButton from "../components/ui/PrimaryButton";
import GoogleSignInButton from "../components/ui/GoogleSignInButton";

import './pagesCss/AuthPages.css'; 

const RegisterPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [erro, setErro] = useState("");
  const [successMessage, setSuccessMessage] = useState(""); 
  const [isLoading, setIsLoading] = useState(false);
  const [isFormDisabled, setIsFormDisabled] = useState(false); 
  const auth = getAuth(app);
  const navigate = useNavigate();

  const handleAuthAndNavigate = useCallback(async (user) => {
    if (user) {
      try {
        const idToken = await user.getIdToken();
        localStorage.setItem('token', idToken);
      } catch (tokenError) {
        console.error("Erro ao obter token:", tokenError);
        setErro("Erro ao processar autenticação. Tente novamente.");
        setIsLoading(false);
        setIsFormDisabled(false); 
        return;
      }
    }
    setSuccessMessage("Autenticação com Google bem-sucedida! Redirecionando para a página inicial...");
    setIsFormDisabled(true);
    setIsLoading(false); 

    setTimeout(() => {
      navigate("/");
    }, 2500); 
  }, [navigate]);


  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setErro("");
    setSuccessMessage("");
    setIsLoading(true);
    setIsFormDisabled(false);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      if (userCredential.user) {
        await sendEmailVerification(userCredential.user);
        // Mensagem de sucesso e agendamento do redirecionamento
        setSuccessMessage(
          "Cadastro realizado! Um link de verificação foi enviado para o seu e-mail. " +
          "Por favor, verifique sua caixa de entrada (e spam). " +
          "Você será redirecionado para a tela de login em 5 segundos para prosseguir após a verificação."
        );
        
        await signOut(auth); 
        console.log("Usuário deslogado após envio de verificação.");

        setEmail(""); 
        setPassword("");
        setIsFormDisabled(true); 
        setIsLoading(false); // Define isLoading como false aqui

        // Redireciona para /login após 5 segundos
        setTimeout(() => {
          console.log("RegisterPage: Redirecionando para /login após 5 segundos.");
          navigate("/login"); 
        }, 5000);

      } else {
        setErro("Erro inesperado no cadastro. Tente novamente.");
        setIsLoading(false); // Garante que isLoading seja false
      }
      
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        setErro("Este e-mail já está em uso. Tente fazer login ou use outro e-mail.");
      } else if (error.code === "auth/weak-password") {
        setErro("A senha precisa ter pelo menos 6 caracteres.");
      } else {
        console.error("Erro ao criar conta:", error);
        setErro("Erro ao criar conta. Verifique os dados e tente novamente.");
      }
      setIsLoading(false); // Garante que isLoading seja false em caso de erro
      setIsFormDisabled(false);
    }
    // Não precisa de finally para setIsLoading(false) se já é tratado em todos os caminhos
  }, [auth, email, password, navigate]);

  const handleGoogleSignIn = useCallback(async () => {
    setErro("");
    setSuccessMessage("");
    setIsLoading(true);
    setIsFormDisabled(false);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      await handleAuthAndNavigate(result.user); 
    } catch (error) {
      console.error("Erro ao registrar/logar com Google:", error);
      if (error.code === 'auth/popup-closed-by-user') {
        setErro("Autenticação com Google cancelada.");
      } else {
        setErro("Erro ao autenticar com o Google. Tente novamente.");
      }
      setIsLoading(false); 
      setIsFormDisabled(false);
    }
  }, [auth, handleAuthAndNavigate]);

  return (
    <div className="auth-page-container"> {}
      <AuthCard
        logoSrc="/assets/imgs/logo.png"
        title="Crie sua Conta"
        subtitle="É rápido e fácil!"
      >
        {successMessage && (
          <div className="auth-card-success-message mb-3">{successMessage}</div>
        )}
        {erro && !successMessage && ( 
            <div className="auth-card-error-message">{erro}</div>
        )}

        <form onSubmit={handleSubmit}>
          <EmailInput
            id="registerEmail"
            label="Seu e-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading || isFormDisabled}
            placeholder="usuario@exemplo.com"
            autoComplete="email"
          />

          <PasswordInput
            id="registerPassword"
            label="Crie uma senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading || isFormDisabled}
            placeholder="Mínimo 6 caracteres"
            autoComplete="new-password"
          />
          
          <PrimaryButton 
            type="submit" 
            isLoading={isLoading} 
            disabled={isLoading || isFormDisabled}
            className="w-100 mt-3 mb-2"
            loadingText="Criando conta..."
          >
            Criar conta
          </PrimaryButton>
        </form>
        
        {!isFormDisabled && ( 
          <>
            <div className="auth-card-divider">
              <span>OU</span>
            </div>

            <GoogleSignInButton 
              onClick={handleGoogleSignIn} 
              isLoading={isLoading} 
              disabled={isLoading || isFormDisabled} 
              className="w-100 mb-3"
              loadingText="Processando..."
            />
          </>
        )}

        <div className="auth-card-options">
          <span>Já tem uma conta? </span>
          <Link 
            to="/login" 
            className={`auth-option-link ${(isLoading || isFormDisabled) ? "disabled-link" : ""}`}
            onClick={(e) => (isLoading || isFormDisabled) && e.preventDefault()}
          >
            Faça login aqui
          </Link>
        </div>
      </AuthCard>
    </div>
  );
};

export default RegisterPage;
