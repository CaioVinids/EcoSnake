import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom'; 
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
import { app } from '../services/firebase';
import AuthCard from '../components/ui/AuthCard/AuthCard';
import EmailInput from '../components/form/EmailInput';
import PrimaryButton from '../components/ui/PrimaryButton';

import './pagesCss/AuthPages.css'; 

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const auth = getAuth(app);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setIsLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage('Link enviado! Verifique seu e-mail para redefinir a senha. Pode levar alguns minutos e confira também sua caixa de spam.');
      setEmail(''); // Limpa o campo de email após o envio bem-sucedido
    } catch (err) {
      console.error("Erro ao enviar e-mail de redefinição:", err.code, err.message);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-email') {
        setError('E-mail não encontrado ou inválido. Verifique o endereço digitado.');
      } else {
        setError('Ocorreu um erro. Tente novamente mais tarde.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [auth, email]); // Adicionado email à lista de dependências

  return (
    <div className="auth-page-container">
      <AuthCard
        logoSrc="/assets/imgs/logo.png"
        title="Redefinir Senha"
        subtitle="Enviaremos um link para o seu e-mail"
      >
        <form onSubmit={handleSubmit}>
          <EmailInput
            id="resetPasswordEmail"
            label="Seu e-mail cadastrado"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
            placeholder="usuario@exemplo.com"
            autoComplete="email"
          />

          {/* Mensagem de sucesso ou erro dentro do card */}
          {message && <div className="auth-card-success-message">{message}</div>}
          {error && <div className="auth-card-error-message">{error}</div>}
          
          <PrimaryButton
            type="submit"
            isLoading={isLoading}
            disabled={isLoading || !!message} // Desabilita se estiver carregando ou se já enviou com sucesso
            className="w-100 mt-3 mb-3"
            loadingText="Enviando..."
          >
            Enviar Link
          </PrimaryButton>
        </form>
        
        <div className="auth-card-options">
          <span>Lembrou a senha? </span>
          <Link 
            to="/login" 
            className={`auth-option-link ${isLoading ? "disabled-link" : ""}`}
          >
            Faça login
          </Link>
        </div>
      </AuthCard>
    </div>
  );
};

export default ForgotPasswordPage;
