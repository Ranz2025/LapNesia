// src/components/ui/Input.jsx
import React from 'react';

export const Input = ({ 
  label, 
  error, 
  icon: Icon,
  className = '',
  ...props 
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold text-[#0F172A] mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-4 top-3.5 text-gray-500" size={20} />
        )}
        <input
          className={`
            w-full px-4 py-3 rounded-lg border-2 focus:outline-none
            transition-all duration-200
            ${Icon ? 'pl-12' : ''}
            ${error ? 'border-red-500' : 'border-gray-600 focus:border-pink-500'}
            ${className}
          `}
          style={{
            background: "#FFFFFF",
            color: "#0F172A"
          }}
          {...props}
        />
      </div>
      {error && (
        <p className="text-red-400 text-sm mt-1">{error}</p>
      )}
    </div>
  );
};

export default Input;
