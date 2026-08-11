import React, { useEffect } from 'react';
import { CheckCircle2, Info, AlertCircle, X } from 'lucide-react';

interface ToastProps {
  message: string;
  type?: 'success' | 'info' | 'error';
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type = 'info', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3500);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-rose-400" />;
      default:
        return <Info className="w-4 h-4 text-blue-400" />;
    }
  };

  const getBg = () => {
    switch (type) {
      case 'success':
        return 'bg-emerald-950/90 border-emerald-500/30 text-emerald-200';
      case 'error':
        return 'bg-rose-950/90 border-rose-500/30 text-rose-200';
      default:
        return 'bg-slate-900/90 border-slate-700 text-slate-200';
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-sm w-full px-4 animate-in fade-in slide-in-from-bottom-4 duration-200">
      <div className={`p-3.5 rounded-xl border shadow-2xl backdrop-blur-md flex items-center justify-between gap-3 text-xs font-medium ${getBg()}`}>
        <div className="flex items-center gap-2.5 min-w-0">
          {getIcon()}
          <span className="truncate">{message}</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1 hover:bg-white/10 rounded-lg transition"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
