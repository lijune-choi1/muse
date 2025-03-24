// src/components/common/Button.jsx
import React from 'react';
import './Button.css';

const Button = ({ 
  children, 
  variant = 'primary', 
  size, 
  fullWidth,
  icon,
  onClick, 
  disabled = false,
  className = '', 
  ...props 
}) => {
  const buttonClasses = [
    'button',
    `button-${variant}`,
    size && `button-${size}`,
    fullWidth && 'button-full',
    icon && !children && 'button-icon',
    className
  ].filter(Boolean).join(' ');

  return (
    <button 
      className={buttonClasses} 
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="button-icon-wrapper">{icon}</span>}
      {children}
    </button>
  );
};

export default Button;