import React from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export interface ToastItem {
  id: number;
  message: string;
  type: 'success' | 'error';
}

interface ToastContainerProps {
  toasts: ToastItem[];
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts }) => {
  return (
    <div className="fixed top-5 right-5 z-[100] flex flex-col gap-3 pointer-events-none">
      {toasts.map(toast => {
        const isSuccess = toast.type === 'success';
        const bgColor = isSuccess ? 'bg-slate-800' : 'bg-rose-900/90';
        const borderColor = isSuccess ? 'border-emerald-500/50' : 'border-rose-500/50';
        const iconColor = isSuccess ? 'text-emerald-400' : 'text-rose-200';

        return (
          <div 
            key={toast.id}
            className={`toast flex items-center p-4 text-slate-200 ${bgColor} border ${borderColor} rounded-2xl shadow-xl max-w-xs w-full pointer-events-auto`}
          >
            <div className={`inline-flex items-center justify-center flex-shrink-0 w-8 h-8 ${iconColor} rounded-lg bg-white/10`}>
              {isSuccess ? <CheckCircle2 size={18} strokeWidth={2.5} /> : <AlertCircle size={18} strokeWidth={2.5} />}
            </div>
            <div className="ml-3 text-sm font-semibold">{toast.message}</div>
          </div>
        );
      })}
    </div>
  );
};
