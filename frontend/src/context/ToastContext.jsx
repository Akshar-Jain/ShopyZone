import React, { createContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

export const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success', duration = 3000) => {
    const id = Math.random().toString(36).slice(2, 9);
    
    setToasts(prev => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = {
    success: (msg, dur) => addToast(msg, 'success', dur),
    error: (msg, dur) => addToast(msg, 'error', dur),
    info: (msg, dur) => addToast(msg, 'info', dur),
    warning: (msg, dur) => addToast(msg, 'warning', dur),
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      
      {/* Toast Portal Container */}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 pointer-events-none max-w-sm w-full sm:w-80">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start p-4 rounded-xl shadow-lg border animate-fade-in transition-all duration-300 ${
              t.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' :
              t.type === 'error' ? 'bg-rose-50 border-rose-200 text-rose-800' :
              t.type === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-800' :
              'bg-blue-50 border-blue-200 text-blue-800'
            }`}
            style={{
              animation: 'fadeIn 0.3s ease-out'
            }}
          >
            <div className="flex-shrink-0 mt-0.5">
              {t.type === 'success' && <CheckCircle className="h-5 w-5 text-emerald-500" />}
              {t.type === 'error' && <AlertCircle className="h-5 w-5 text-rose-500" />}
              {t.type === 'warning' && <AlertCircle className="h-5 w-5 text-amber-500" />}
              {t.type === 'info' && <Info className="h-5 w-5 text-blue-500" />}
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium">{t.message}</p>
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="ml-4 flex-shrink-0 inline-flex text-gray-400 hover:text-gray-600 rounded-md focus:outline-none"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
