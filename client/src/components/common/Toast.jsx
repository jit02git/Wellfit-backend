import React from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';

export default function Toast({ toast }) {
  if (!toast) return null;

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl transition-all duration-300 transform translate-y-0 border glass-panel ${
      toast.type === 'success' 
        ? 'border-emerald-500/30 text-emerald-400' 
        : 'border-rose-500/30 text-rose-400'
    }`}>
      {toast.type === 'success' ? (
        <CheckCircle className="w-5 h-5 shrink-0" />
      ) : (
        <AlertCircle className="w-5 h-5 shrink-0" />
      )}
      <span className="text-sm font-medium text-slate-200">{toast.message}</span>
    </div>
  );
}
