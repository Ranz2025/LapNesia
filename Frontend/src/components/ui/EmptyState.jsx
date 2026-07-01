import React from "react";

export const EmptyState = ({ icon, title, description, action, actionLabel, className = "" }) => {
  const GRADIENT = "linear-gradient(90deg, #2563EB, #2563EB)";
  
  return (
    <div className={`flex flex-col items-center justify-center py-16 text-center ${className}`}>
      {icon && (
        <div className="mb-4 opacity-60">
          {typeof icon === "function" ? React.createElement(icon, { size: 48, className: "text-gray-600" }) : icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-[#0F172A] mb-2">{title}</h3>
      {description && <p className="text-gray-400 text-sm mb-6 max-w-sm">{description}</p>}
      {action && (
        <button
          onClick={action.onClick}
          className="text-white px-4 py-2 rounded-lg text-sm font-medium hover:brightness-110 transition"
          style={{ background: GRADIENT }}
        >
          {action.label || actionLabel || "Aksi"}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
