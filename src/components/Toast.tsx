import React from 'react';

interface ToastProps {
  message: string | null;
}

export const Toast: React.FC<ToastProps> = ({ message }) => {
  if (!message) return null;

  return (
    <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-50 pointer-events-none transition-all duration-300 ease-out animate-in fade-in slide-in-from-bottom-2">
      <div className="glass-panel px-4 py-2 rounded-lg shadow-2xl flex items-center gap-2 text-sm font-medium text-emerald-400 border border-emerald-500/20">
        <span>{message}</span>
      </div>
    </div>
  );
};
