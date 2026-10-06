import { type ReactNode } from 'react';

interface BadgeProps {
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'accent';
  children: ReactNode;
  icon?: ReactNode;
}

const variantMap = {
  success: 'bg-success-50 text-success-700 border border-success-200',
  warning: 'bg-warning-50 text-warning-700 border border-warning-200',
  danger: 'bg-danger-50 text-danger-700 border border-danger-200',
  info: 'bg-accent-50 text-accent-700 border border-accent-200',
  neutral: 'bg-neutral-100 text-neutral-600 border border-neutral-200',
  accent: 'bg-accent-500 text-white border border-accent-600',
};

export default function Badge({ variant = 'neutral', children, icon }: BadgeProps) {
  return (
    <span className={`badge ${variantMap[variant]}`}>
      {icon}
      {children}
    </span>
  );
}
