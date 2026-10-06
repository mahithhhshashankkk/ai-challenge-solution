import { type ReactNode } from 'react';

interface SectionCardProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

export default function SectionCard({ title, description, icon, action, children, className = '' }: SectionCardProps) {
  return (
    <div className={`card p-6 animate-slide-up ${className}`}>
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-3">
          {icon && (
            <div className="w-9 h-9 rounded-lg bg-primary-900 flex items-center justify-center text-accent-400 shrink-0">
              {icon}
            </div>
          )}
          <div>
            <h3 className="text-base font-semibold text-neutral-900">{title}</h3>
            {description && <p className="text-sm text-neutral-500 mt-0.5">{description}</p>}
          </div>
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}
