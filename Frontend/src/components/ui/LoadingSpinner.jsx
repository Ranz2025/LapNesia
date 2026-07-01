// src/components/ui/LoadingSpinner.jsx
import React from 'react';

export const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizeMap = {
    sm: 'w-6 h-6',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };
  
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className={`${sizeMap[size]} rounded-full animate-spin`} 
        style={{ border: "4px solid #BFDBFE", borderTopColor: "#2563EB" }} />
    </div>
  );
};

export const LoadingPage = () => (
  <div className="flex items-center justify-center min-h-screen">
    <LoadingSpinner size="lg" />
  </div>
);

export default LoadingSpinner;
