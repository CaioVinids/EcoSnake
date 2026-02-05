import React from 'react';
import '../ui/Button/Button.css'; 

const PrimaryButton = ({ children, onClick, type = 'button', disabled = false, isLoading = false, loadingText = 'Aguarde...', className = '' }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`btn btn-ui-primary ${className}`}
    >
      {isLoading ? loadingText : children}
    </button>
  );
};

export default PrimaryButton;