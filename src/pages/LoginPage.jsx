import React, { useState, useCallback } from "react"; 
import { getAuth, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { app } from "../services/firebase";
import { useNavigate, Link } from "react-router-dom";

import AuthCard from "../components/ui/AuthCard/AuthCard";
import EmailInput from "../components/form/EmailInput";
import PasswordInput from "../components/form/PasswordInput";
import PrimaryButton from "../components/ui/PrimaryButton";
import GoogleSignInButton from "../components/ui/GoogleSignInButton";

import './pagesCss/AuthPages.css'; 

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [erro, setErro] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const auth = getAuth(app);
  const navigate = useNavigate();

  const handleSuccessfulLogin = useCallback(async (user) => {
    if (user) {
      try {
        const idToken = await user.getIdToken();
        localStorage.setItem('token', idToken);
      } catch (tokenError) {
        console.error("Erro ao obter token:", tokenError);
        setErro("Erro ao processar login. Tente novamente.");
        setIsLoading(false); 
        return; 
      }
    }
    navigate("/");
  }, [navigate]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setErro("");
    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await handleSuccessfulLogin(userCredential.user);
    } catch (error) {
      if (error.code === "auth/user-not-found" || error.code === "auth/invalid-credential" || error.code === "auth/wrong-password") {
        setErro("E-mail ou senha incorretos.");
      } else {
        console.error("Erro no login por email/senha:", error);
        setErro("Erro ao fazer login. Verifique os dados.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [auth, email, password, handleSuccessfulLogin]);

  const handleGoogleSignIn = useCallback(async () => {
    setErro("");
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      await handleSuccessfulLogin(result.user);
    } catch (error) {
      console.error("Erro no login com Google:", error);
      if (error.code === 'auth/popup-closed-by-user') {
        setErro("Login com Google cancelado.");
      } else {
        setErro("Erro ao entrar com o Google. Tente novamente.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [auth, handleSuccessfulLogin]);

  return (
    <div className="auth-page-container"> 
      <AuthCard
        logoSrc="/assets/imgs/logo.png" 
        logoAlt="Eco Snake Logo"
        title="Bem-vindo!" 
        subtitle="🔑 Acesse sua conta para continuar" 
      >
        {/* O conteúdo abaixo será renderizado como 'children' dentro do AuthCard */}
        <form onSubmit={handleSubmit}>
          <EmailInput
            id="loginEmail"
            label="Seu e-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
            placeholder="usuario@exemplo.com"
            autoComplete="email"
          />

          <PasswordInput
            id="loginPassword"
            label="Sua senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
            autoComplete="current-password"
          />
          
          {/* Usando a classe de erro genérica do AuthCard */}
          {erro && <div className="auth-card-error-message">{erro}</div>} 
          
          <PrimaryButton 
            type="submit" 
            isLoading={isLoading} 
            disabled={isLoading}
            className="w-100 mt-3 mb-2" 
            loadingText="Entrando..."
          >
            Entrar
          </PrimaryButton>
        </form>
        
        {/* Usando a classe de divisor genérica do AuthCard */}
        <div className="auth-card-divider"> 
          <span>OU</span>
        </div>

        <GoogleSignInButton 
          onClick={handleGoogleSignIn} 
          isLoading={isLoading} 
          disabled={isLoading}
          className="w-100 mb-3"
          loadingText="Processando..."
        />

        {/* Usando a classe de opções genérica do AuthCard */}
        <div className="auth-card-options"> 
          <Link 
            to="/reset-password" 
            className={`auth-option-link ${isLoading ? "disabled-link" : ""}`}
          >
            Esqueceu a senha?
          </Link>
          {/* Usando a classe de separador genérica do AuthCard */}
          <span className="auth-options-separator">|</span> 
          <Link 
            to="/register" 
            className={`auth-option-link ${isLoading ? "disabled-link" : ""}`}
          >
            Criar conta
          </Link>
        </div>
      </AuthCard>
    </div>
  );
};

export default LoginPage;
