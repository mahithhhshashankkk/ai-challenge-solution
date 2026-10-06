interface DonutChartProps {
  data: { label: string; value: number; color: string }[];
  centerLabel?: string;
  centerValue?: string;
  size?: number;
}

export default function DonutChart({ data, centerLabel, centerValue, size = 200 }: DonutChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0) || 1;
  const radius = size / 2 - 20;
  const strokeWidth = 28;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#f1f5f9"
            strokeWidth={strokeWidth}
          />
          {data.map((item, i) => {
            const dash = (item.value / total) * circumference;
            const circle = (
              <circle
                key={i}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={item.color}
                strokeWidth={strokeWidth}
                strokeDasharray={`${dash} ${circumference - dash}`}
                strokeDashoffset={-offset}
                className="transition-all duration-700"
                style={{ transitionDelay: `${i * 100}ms` }}
              />
            );
            offset += dash;
            return circle;
          })}
        </svg>
        {(centerLabel || centerValue) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {centerValue && <span className="text-xl font-bold text-neutral-900">{centerValue}</span>}
            {centerLabel && <span className="text-xs text-neutral-500 mt-0.5">{centerLabel}</span>}
          </div>
        )}
      </div>
      <div className="flex-1 space-y-2.5 w-full">
        {data.map((item, i) => (
          <div key={i} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: item.color }} />
              <span className="text-sm text-neutral-600 truncate">{item.label}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-sm font-medium text-neutral-900">
                {((item.value / total) * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
