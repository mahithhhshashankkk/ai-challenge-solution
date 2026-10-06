import { type ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  maxWidth?: string;
}

export default function Modal({ open, onClose, title, description, children, footer, maxWidth = 'max-w-lg' }: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative bg-white rounded-2xl shadow-2xl w-full ${maxWidth} animate-slide-up max-h-[90vh] flex flex-col`}>
        <div className="flex items-start justify-between p-6 border-b border-neutral-200">
          <div>
            <h2 className="text-lg font-semibold text-neutral-900">{title}</h2>
            {description && <p className="text-sm text-neutral-500 mt-1">{description}</p>}
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto flex-1">{children}</div>
        {footer && <div className="p-6 border-t border-neutral-200 flex items-center justify-end gap-3">{footer}</div>}
      </div>
    </div>
  );
}
