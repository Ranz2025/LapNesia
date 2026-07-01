// src/components/ui/Button.jsx
import React from 'react';

export const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  disabled = false, 
  className = '',
  ...props 
}) => {
  const baseStyle = 'font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2';
  
  const variants = {
    primary: 'text-white hover:brightness-110 disabled:opacity-60',
    secondary: 'bg-gray-700 text-white hover:bg-gray-600 disabled:opacity-60',
    outline: 'border-2 border-pink-500 text-pink-400 hover:bg-pink-500/10 disabled:opacity-50',
    danger: 'bg-red-600 text-white hover:bg-red-700 disabled:opacity-60',
    success: 'bg-green-600 text-white hover:bg-green-700 disabled:opacity-60',
  };

  const getPrimaryStyle = () => {
    if (variant === 'primary') {
      return 'background: linear-gradient(90deg, #2563EB, #2563EB)';
    }
    return '';
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };
  
  return (
    <button
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
      style={variant === 'primary' ? { backgroundImage: 'linear-gradient(90deg, #2563EB, #2563EB)' } : {}}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
