import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'warning' | 'info' | 'danger';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message: string;
}

interface ToastContextType {
  showToast: (type: ToastType, title: string, message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const toastConfig = {
  success: { icon: CheckCircle2, bg: 'bg-success-50', border: 'border-success-200', iconColor: 'text-success-600', titleColor: 'text-success-900' },
  warning: { icon: AlertTriangle, bg: 'bg-warning-50', border: 'border-warning-200', iconColor: 'text-warning-600', titleColor: 'text-warning-900' },
  danger: { icon: AlertTriangle, bg: 'bg-danger-50', border: 'border-danger-200', iconColor: 'text-danger-600', titleColor: 'text-danger-900' },
  info: { icon: Info, bg: 'bg-accent-50', border: 'border-accent-200', iconColor: 'text-accent-600', titleColor: 'text-accent-900' },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((type: ToastType, title: string, message: string) => {
    const id = Math.random().toString(36).substring(7);
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const dismiss = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[60] flex flex-col gap-3 max-w-sm">
        {toasts.map((toast) => {
          const config = toastConfig[toast.type];
          const Icon = config.icon;
          return (
            <div
              key={toast.id}
              className={`flex items-start gap-3 p-4 rounded-xl border ${config.bg} ${config.border} shadow-lg animate-slide-up`}
            >
              <div className={`shrink-0 ${config.iconColor}`}>
                <Icon size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold ${config.titleColor}`}>{toast.title}</p>
                <p className="text-sm text-neutral-600 mt-0.5">{toast.message}</p>
              </div>
              <button
                onClick={() => dismiss(toast.id)}
                className="shrink-0 text-neutral-400 hover:text-neutral-600 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
