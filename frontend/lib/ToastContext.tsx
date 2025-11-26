'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showInfo: (message: string) => void;
  showWarning: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: () => void }) {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const duration = 5000;
    const interval = 50;
    const step = (interval / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev - step;
        if (next <= 0) {
          clearInterval(timer);
          onRemove();
          return 0;
        }
        return next;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [onRemove]);

  const getStyles = (type: ToastType) => {
    const styles = {
      success: { bg: 'bg-green-50 dark:bg-green-900/30', border: 'border-green-200 dark:border-green-800', text: 'text-green-800 dark:text-green-300', progressBg: 'bg-green-500', icon: <CheckCircle className="w-5 h-5" /> },
      error: { bg: 'bg-red-50 dark:bg-red-900/30', border: 'border-red-200 dark:border-red-800', text: 'text-red-800 dark:text-red-300', progressBg: 'bg-red-500', icon: <AlertCircle className="w-5 h-5" /> },
      warning: { bg: 'bg-yellow-50 dark:bg-yellow-900/30', border: 'border-yellow-200 dark:border-yellow-800', text: 'text-yellow-800 dark:text-yellow-300', progressBg: 'bg-yellow-500', icon: <AlertTriangle className="w-5 h-5" /> },
      info: { bg: 'bg-blue-50 dark:bg-blue-900/30', border: 'border-blue-200 dark:border-blue-800', text: 'text-blue-800 dark:text-blue-300', progressBg: 'bg-blue-500', icon: <Info className="w-5 h-5" /> },
    };
    return styles[type];
  };

  const styles = getStyles(toast.type);

  return (
    <div className={`${styles.bg} ${styles.border} ${styles.text} border rounded-lg shadow-xl overflow-hidden animate-slide-down backdrop-blur-sm`} style={{ minWidth: '320px', maxWidth: '500px' }}>
      <div className="flex items-start gap-3 p-4">
        <div className="flex-shrink-0 mt-0.5">{styles.icon}</div>
        <p className="flex-1 text-sm font-medium break-words pr-2">{toast.message}</p>
        <button onClick={onRemove} className="flex-shrink-0 hover:opacity-70 transition-opacity"><X className="w-4 h-4" /></button>
      </div>
      <div className="h-1 bg-gray-200 dark:bg-gray-700">
        <div className={`h-full ${styles.progressBg} transition-all duration-50 ease-linear`} style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}

function ToastContainer({ toasts, removeToast }: { toasts: Toast[]; removeToast: (id: string) => void }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-3 pointer-events-none" style={{ maxWidth: 'calc(100vw - 2rem)' }}>
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem toast={toast} onRemove={() => removeToast(toast.id)} />
        </div>
      ))}
    </div>,
    document.body
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(7);
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const showSuccess = useCallback((msg: string) => showToast(msg, 'success'), [showToast]);
  const showError = useCallback((msg: string) => showToast(msg, 'error'), [showToast]);
  const showInfo = useCallback((msg: string) => showToast(msg, 'info'), [showToast]);
  const showWarning = useCallback((msg: string) => showToast(msg, 'warning'), [showToast]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showSuccess, showError, showInfo, showWarning }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
}
