// src/components/ui/Alert.jsx
import React from 'react';
import { AlertCircle, CheckCircle, AlertTriangle, Info, X } from 'lucide-react';

const iconMap = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const variantStyles = {
  success: 'bg-green-500/10 border-green-500/30 text-green-300',
  error: 'bg-red-500/10 border-red-500/30 text-red-300',
  warning: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-300',
  info: 'bg-blue-500/10 border-blue-500/30 text-blue-300',
};

export const Alert = ({ 
  variant = 'info', 
  title, 
  message, 
  onClose,
  className = ''
}) => {
  const Icon = iconMap[variant];
  
  return (
    <div className={`border rounded-lg p-4 flex gap-4 ${variantStyles[variant]} ${className}`}>
      <Icon size={24} className="flex-shrink-0" />
      <div className="flex-1">
        {title && <h4 className="font-semibold mb-1">{title}</h4>}
        <p className="text-sm">{message}</p>
      </div>
      {onClose && (
        <button onClick={onClose} className="flex-shrink-0 hover:opacity-75">
          <X size={20} />
        </button>
      )}
    </div>
  );
};

export default Alert;
