import { useState, createContext, useContext, ReactNode, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Info } from 'lucide-react';

interface ToastMessage {
  id: string;
  text: string;
  type?: 'success' | 'info';
}

interface ToastContextValue {
  showToast: (text: string, type?: 'success' | 'info') => void;
  copyToClipboard: (text: string, label?: string) => Promise<void>;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((text: string, type: 'success' | 'info' = 'success') => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2800);
  }, []);

  const copyToClipboard = useCallback(async (text: string, label = 'النص') => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        showToast(`تم نسخ ${label} إلى الحافظة بنجاح ✓`, 'success');
      }
    } catch {
      showToast(`تعذر النسخ التلقائي: ${text}`, 'info');
    }
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, copyToClipboard }}>
      {children}
      {/* Toast container */}
      <div
        className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[110] flex flex-col items-center gap-2 pointer-events-none"
        dir="rtl"
        aria-live="polite"
      >
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="bg-navy-900/95 border border-gold-500/50 text-gold-300 text-sm font-bold px-5 py-2.5 rounded-full shadow-2xl backdrop-blur-md flex items-center gap-2 pointer-events-auto"
            >
              {toast.type === 'success' ? (
                <CheckCircle2 size={16} className="text-gold-400" />
              ) : (
                <Info size={16} className="text-teal-400" />
              )}
              <span>{toast.text}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    return {
      showToast: () => {},
      copyToClipboard: async () => {},
    };
  }
  return ctx;
}
