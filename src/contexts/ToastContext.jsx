import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, Info, AlertCircle } from 'lucide-react';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info') => {
    const id = Math.random().toString(36).substring(7);
    const toast = { id, message, type };

    setToasts((prev) => [...prev, toast]);

    // Auto-dismiss després de 4 segons
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const success = useCallback((message) => addToast(message, 'success'), [addToast]);
  const info = useCallback((message) => addToast(message, 'info'), [addToast]);
  const error = useCallback((message) => addToast(message, 'error'), [addToast]);

  return (
    <ToastContext.Provider value={{ success, info, error }}>
      {children}

      {/* Toast Container - Posició fixa a dalt a la dreta */}
      <div className="fixed top-20 right-4 z-[99999] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <Toast
              key={toast.id}
              toast={toast}
              onClose={() => removeToast(toast.id)}
            />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

const Toast = ({ toast, onClose }) => {
  const icons = {
    success: <CheckCircle2 className="h-4 w-4" />,
    info: <Info className="h-4 w-4" />,
    error: <AlertCircle className="h-4 w-4" />
  };

  const colors = {
    success: 'bg-green-600 text-white border-green-700',
    info: 'bg-blue-600 text-white border-blue-700',
    error: 'bg-red-600 text-white border-red-700'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={`pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-lg border shadow-xl ${colors[toast.type]}`}
      style={{ maxWidth: '520px', minWidth: '320px', maxHeight: '70vh' }}
    >
      <div className="flex-shrink-0 text-white">
        {icons[toast.type]}
      </div>

      <p className="text-sm font-roboto font-medium flex-1 leading-snug text-white whitespace-pre-wrap break-words overflow-auto" style={{ maxHeight: '65vh' }}>
        {toast.message}
      </p>

      <button
        onClick={onClose}
        className="flex-shrink-0 text-white hover:opacity-80 transition-opacity"
        aria-label="Tancar notificació"
      >
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export default ToastContext;
