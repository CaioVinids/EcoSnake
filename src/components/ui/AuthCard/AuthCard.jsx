import React from 'react';
import './AuthCard.css'; 

const AuthCard = ({ logoSrc, logoAlt, title, subtitle, children }) => {
  return (
    <div className="auth-card">
      {logoSrc && <img src={logoSrc} alt={logoAlt || 'Logo'} className="auth-card-logo" />}
      {title && <h2 className="auth-card-title">{title}</h2>}
      {subtitle && <p className="auth-card-subtitle">{subtitle}</p>}
      <div className="auth-card-content">
        {children}
      </div>
    </div>
  );
};

export default AuthCard;
