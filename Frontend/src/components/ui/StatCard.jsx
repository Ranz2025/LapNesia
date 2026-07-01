// src/components/ui/StatCard.jsx
import React from 'react';

export const StatCard = ({ 
  icon: Icon,
  label,
  value,
  change,
  changeType = 'positive',
  className = ''
}) => {
  const GRADIENT = "linear-gradient(90deg, #2563EB, #2563EB)";
  
  return (
    <div className={`rounded-xl border p-6 ${className}`} style={{ background: "#FFFFFF", borderColor: "#E2E8F0" }}>
      <div className="flex items-start justify-between mb-4">
        {Icon && (
          <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ background: "rgba(37,99,235,0.1)" }}>
            <Icon size={24} style={{ color: "#2563EB" }} />
          </div>
        )}
      </div>
      <p className="text-gray-400 text-sm font-medium mb-1">{label}</p>
      <p className="text-2xl font-bold text-[#0F172A] mb-2">{value}</p>
      {change && (
        <p className={`text-sm font-semibold ${
          changeType === 'positive' ? 'text-green-400' : 'text-red-400'
        }`}>
          {changeType === 'positive' ? '↑' : '↓'} {change}
        </p>
      )}
    </div>
  );
};

export default StatCard;
