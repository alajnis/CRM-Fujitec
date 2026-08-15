import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, Loader } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'loading';
  onDismiss?: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({ message, type, onDismiss, duration = 3000 }) => {
  useEffect(() => {
    if (type !== 'loading' && onDismiss && duration > 0) {
      const timer = setTimeout(onDismiss, duration);
      return () => clearTimeout(timer);
    }
  }, [type, onDismiss, duration]);

  const bgColor = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    loading: 'bg-blue-50 border-blue-200'
  }[type];

  const textColor = {
    success: 'text-green-700',
    error: 'text-red-700',
    loading: 'text-blue-700'
  }[type];

  const IconComponent = {
    success: CheckCircle,
    error: AlertCircle,
    loading: Loader
  }[type];

  return (
    <div className={`fixed bottom-4 right-4 flex items-center gap-3 px-4 py-3 rounded-lg border ${bgColor} ${textColor} text-sm font-semibold shadow-lg z-[99999] animate-in fade-in slide-in-from-bottom-2 duration-300`}>
      <IconComponent
        size={18}
        className={type === 'loading' ? 'animate-spin' : ''}
      />
      {message}
    </div>
  );
};
