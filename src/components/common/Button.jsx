// src/components/common/Button.jsx
import React from 'react';
import './Button.css';

const Button = ({ 
  children, 
  variant = 'default', 
  size = 'medium', 
  onClick,
  className = '',
  ...props 
}) => {
  return (
    <button 
      className={`btn btn-${variant} btn-${size} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;