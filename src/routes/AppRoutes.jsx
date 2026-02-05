import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import StartPage from '../pages/StartPage';
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";
import GamePage from '../pages/GamePage';
import AboutPage from "../pages/AboutPage"; 
import ConfirmEmailPage from "../pages/ConfirmEmailPage"; 
import PrivateRoute from "./PrivateRoute";

function AppRoutes() {
  return (
    <Router>
      <Routes>
        {/* Rotas públicas */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/reset-password" element={<ForgotPasswordPage />} />
        <Route path="/confirm-email" element={<ConfirmEmailPage />} /> {}
        
        {/* Rota protegida */}
        <Route path="/" element={<PrivateRoute />}>
          <Route index element={<StartPage />} /> 
          <Route path="game" element={<GamePage />} /> 
          <Route path="about" element={<AboutPage />} /> 
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default AppRoutes;
