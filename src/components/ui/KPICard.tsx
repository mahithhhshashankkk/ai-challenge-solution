import { type ReactNode } from 'react';

interface KPICardProps {
  label: string;
  value: string;
  icon: ReactNode;
  trend?: string;
  trendDirection?: 'up' | 'down' | 'neutral';
  accentColor?: 'primary' | 'accent' | 'success' | 'warning' | 'danger';
}

const colorMap = {
  primary: { bg: 'bg-primary-50', iconBg: 'bg-primary-900', iconText: 'text-primary-100', ring: 'ring-primary-100' },
  accent: { bg: 'bg-accent-50', iconBg: 'bg-accent-500', iconText: 'text-white', ring: 'ring-accent-100' },
  success: { bg: 'bg-success-50', iconBg: 'bg-success-500', iconText: 'text-white', ring: 'ring-success-100' },
  warning: { bg: 'bg-warning-50', iconBg: 'bg-warning-500', iconText: 'text-white', ring: 'ring-warning-100' },
  danger: { bg: 'bg-danger-50', iconBg: 'bg-danger-500', iconText: 'text-white', ring: 'ring-danger-100' },
};

export default function KPICard({ label, value, icon, trend, trendDirection = 'neutral', accentColor = 'primary' }: KPICardProps) {
  const colors = colorMap[accentColor];

  return (
    <div className={`card card-hover p-5 animate-slide-up ring-1 ${colors.ring}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-neutral-500 mb-1">{label}</p>
          <p className="text-2xl font-bold text-neutral-900 tracking-tight">{value}</p>
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              <span
                className={`text-xs font-medium ${
                  trendDirection === 'up'
                    ? 'text-success-600'
                    : trendDirection === 'down'
                    ? 'text-danger-600'
                    : 'text-neutral-500'
                }`}
              >
                {trend}
              </span>
            </div>
          )}
        </div>
        <div className={`w-11 h-11 rounded-xl ${colors.iconBg} flex items-center justify-center shrink-0 shadow-sm`}>
          <div className={colors.iconText}>{icon}</div>
        </div>
      </div>
    </div>
  );
}
