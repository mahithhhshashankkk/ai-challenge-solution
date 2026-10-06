interface LineChartProps {
  data: { label: string; primary: number; secondary?: number }[];
  formatValue?: (value: number) => string;
  primaryLabel?: string;
  secondaryLabel?: string;
  height?: number;
  primaryColor?: string;
  secondaryColor?: string;
}

export default function LineChart({
  data,
  formatValue = (v) => v.toFixed(1),
  primaryLabel = 'Margin %',
  secondaryLabel = 'Basket Size',
  height = 240,
  primaryColor = '#0ea5e9',
  secondaryColor = '#f59e0b',
}: LineChartProps) {
  const width = 600;
  const padding = { top: 20, right: 20, bottom: 40, left: 50 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const allValues = data.flatMap((d) => [d.primary, d.secondary || 0]);
  const maxVal = Math.max(...allValues, 1);
  const minVal = Math.min(...allValues, 0);
  const range = maxVal - minVal || 1;

  const xStep = chartWidth / Math.max(data.length - 1, 1);

  const getPoint = (val: number, i: number) => ({
    x: padding.left + i * xStep,
    y: padding.top + chartHeight - ((val - minVal) / range) * chartHeight,
  });

  const primaryPoints = data.map((d, i) => getPoint(d.primary, i));
  const secondaryPoints = data.map((d, i) => getPoint(d.secondary || 0, i));

  const buildPath = (points: { x: number; y: number }[]) =>
    points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  const buildAreaPath = (points: { x: number; y: number }[]) =>
    `${buildPath(points)} L ${points[points.length - 1].x} ${padding.top + chartHeight} L ${points[0].x} ${padding.top + chartHeight} Z`;

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center text-sm text-neutral-400" style={{ height }}>
        No chart data available
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-3 text-xs text-neutral-500">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-1.5 rounded-full" style={{ backgroundColor: primaryColor }} />
          <span>{primaryLabel}</span>
        </div>
        {data.some((d) => d.secondary !== undefined) && (
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-1.5 rounded-full" style={{ backgroundColor: secondaryColor }} />
            <span>{secondaryLabel}</span>
          </div>
        )}
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ height }}>
        <defs>
          <linearGradient id="primaryGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={primaryColor} stopOpacity="0.2" />
            <stop offset="100%" stopColor={primaryColor} stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 0.25, 0.5, 0.75, 1].map((t) => {
          const y = padding.top + chartHeight * t;
          const val = maxVal - (range * t);
          return (
            <g key={t}>
              <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="#f1f5f9" strokeWidth="1" />
              <text x={padding.left - 8} y={y + 4} textAnchor="end" className="text-[10px] fill-neutral-400">
                {formatValue(val)}
              </text>
            </g>
          );
        })}
        {data.map((d, i) => {
          const x = padding.left + i * xStep;
          return (
            <text key={i} x={x} y={height - 12} textAnchor="middle" className="text-[10px] fill-neutral-400">
              {d.label}
            </text>
          );
        })}
        <path d={buildAreaPath(primaryPoints)} fill="url(#primaryGradient)" />
        <path d={buildPath(primaryPoints)} fill="none" stroke={primaryColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {primaryPoints.map((p, i) => (
          <g key={i} className="group">
            <circle cx={p.x} cy={p.y} r="4" fill="white" stroke={primaryColor} strokeWidth="2" className="transition-all group-hover:r-6" />
            <title>{`${data[i].label}: ${formatValue(data[i].primary)}`}</title>
          </g>
        ))}
        {data.some((d) => d.secondary !== undefined) && (
          <>
            <path d={buildPath(secondaryPoints)} fill="none" stroke={secondaryColor} strokeWidth="2" strokeDasharray="5 3" strokeLinecap="round" />
            {secondaryPoints.map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r="3" fill={secondaryColor} />
            ))}
          </>
        )}
      </svg>
    </div>
  );
}
