// src/components/ui/Card.jsx
import React from 'react';

export const Card = ({ children, className = '', shadow = 'base', ...props }) => {
  const shadowMap = {
    sm: 'shadow-sm',
    base: 'shadow',
    md: 'shadow-md',
    lg: 'shadow-lg',
  };
  
  return (
    <div
      className={`rounded-xl border p-6 ${shadowMap[shadow]} ${className}`}
      style={{ background: "#FFFFFF", borderColor: "#E2E8F0" }}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '' }) => (
  <div className={`mb-4 pb-4 border-b ${className}`} style={{ borderColor: "#E2E8F0" }}>
    {children}
  </div>
);

export const CardTitle = ({ children, className = '' }) => (
  <h3 className={`text-xl font-bold text-[#0F172A] ${className}`}>
    {children}
  </h3>
);

export const CardBody = ({ children, className = '' }) => (
  <div className={className}>{children}</div>
);

export const CardFooter = ({ children, className = '' }) => (
  <div className={`mt-6 pt-4 border-t ${className}`} style={{ borderColor: "#E2E8F0" }}>
    {children}
  </div>
);

export default Card;
