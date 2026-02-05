import React, { useEffect, useState, useMemo } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { app } from '../services/firebase';

console.log("PrivateRoute.jsx: Módulo PARSEADO. Verifique os caminhos de importação."); 

const PrivateRoute = () => {
  console.log("PrivateRoute: Função do componente INICIADA/RE-RENDERIZADA.");

  const authInstance = useMemo(() => { 
    if (!app) {
      console.error("PrivateRoute: Firebase app (de '../services/firebase') NÃO está inicializado! Verifique firebase.js.");
      return null;
    }
    try {
      return getAuth(app);
    } catch (error) {
      console.error("PrivateRoute: Erro ao chamar getAuth(app):", error);
      return null;
    }
  }, []); 

  const [currentUser, setCurrentUser] = useState(undefined); 
  const [authLoading, setAuthLoading] = useState(true); 
  const location = useLocation(); 

  useEffect(() => {
    if (!authInstance) {
      console.warn("PrivateRoute useEffect: Serviço de autenticação (authInstance) não disponível. A definir authLoading como false.");
      setAuthLoading(false); 
      setCurrentUser(null); 
      return; 
    }

    console.log("PrivateRoute useEffect: A configurar o listener onAuthStateChanged.");
    const unsubscribe = onAuthStateChanged(authInstance, (user) => {
      console.log("PrivateRoute onAuthStateChanged disparado. User:", user ? { uid: user.uid, email: user.email, emailVerified: user.emailVerified } : null);
      setCurrentUser(user);
      setAuthLoading(false);
    });

    return () => {
      console.log("PrivateRoute useEffect: A limpar o listener onAuthStateChanged.");
      unsubscribe(); 
    };
  }, [authInstance]); 

  if (authLoading) {
    console.log("PrivateRoute: A renderizar estado de 'Carregando autenticação...'");
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'Arial, sans-serif' }}>
        A verificar autenticação...
      </div>
    );
  }

  if (!currentUser) {
    console.log("PrivateRoute: Utilizador NÃO AUTENTICADO (currentUser é null/undefined). A redirecionar para /login. Tentou aceder a:", location.pathname);
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Neste ponto, currentUser existe.
  if (!currentUser.emailVerified) {
    console.log(`PrivateRoute: Utilizador ${currentUser.email} autenticado, MAS E-MAIL NÃO VERIFICADO. A redirecionar para /confirm-email.`);
    return <Navigate to="/confirm-email" state={{ email: currentUser.email }} replace />;
  }

  // Se chegou aqui, utilizador está autenticado e com e-mail verificado.
  console.log(`PrivateRoute: Utilizador ${currentUser.email} AUTENTICADO E VERIFICADO. A renderizar Outlet.`);
  return <Outlet />;
};

export default PrivateRoute;
