// src/components/ui/Badge.jsx
import React from 'react';

export const Badge = ({ children, variant = 'default', className = '', ...props }) => {
  const variants = {
    default: 'bg-gray-700 text-gray-100',
    primary: 'bg-purple-900/50 text-purple-300',
    success: 'bg-green-900/50 text-green-300',
    warning: 'bg-yellow-900/50 text-yellow-300',
    danger: 'bg-red-900/50 text-red-300',
  };
  
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;
