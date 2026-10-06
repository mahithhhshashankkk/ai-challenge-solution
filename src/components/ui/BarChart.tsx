interface BarChartProps {
  data: { label: string; value: number; secondaryValue?: number; color?: string; secondaryColor?: string }[];
  formatValue?: (value: number) => string;
  showSecondary?: boolean;
  primaryLabel?: string;
  secondaryLabel?: string;
  height?: number;
}

export default function BarChart({
  data,
  formatValue = (v) => v.toLocaleString(),
  showSecondary = false,
  primaryLabel = 'Primary',
  secondaryLabel = 'Secondary',
  height = 240,
}: BarChartProps) {
  const maxValue = Math.max(...data.map((d) => Math.max(d.value, d.secondaryValue || 0)), 1);

  return (
    <div>
      {showSecondary && (
        <div className="flex items-center gap-4 mb-3 text-xs text-neutral-500">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-accent-500" />
            <span>{primaryLabel}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-primary-300" />
            <span>{secondaryLabel}</span>
          </div>
        </div>
      )}
      <div className="flex items-end justify-between gap-3" style={{ height }}>
        {data.map((item, i) => (
          <div key={i} className="flex-1 flex flex-col items-center justify-end group h-full">
            <div className="w-full flex flex-col items-center justify-end gap-1 h-full relative">
              {showSecondary && item.secondaryValue !== undefined && (
                <>
                  <div className="absolute bottom-0 w-full flex justify-center gap-1">
                    <div
                      className="flex-1 max-w-[32px] rounded-t-md transition-all duration-500 hover:opacity-80"
                      style={{
                        height: `${(item.value / maxValue) * (height - 50)}px`,
                        backgroundColor: item.color || '#0ea5e9',
                      }}
                      title={`${primaryLabel}: ${formatValue(item.value)}`}
                    />
                    <div
                      className="flex-1 max-w-[32px] rounded-t-md transition-all duration-500 hover:opacity-80"
                      style={{
                        height: `${((item.secondaryValue || 0) / maxValue) * (height - 50)}px`,
                        backgroundColor: item.secondaryColor || '#b8cfe8',
                      }}
                      title={`${secondaryLabel}: ${formatValue(item.secondaryValue || 0)}`}
                    />
                  </div>
                </>
              )}
              {!showSecondary && (
                <div
                  className="w-full max-w-[48px] rounded-t-md transition-all duration-500 group-hover:opacity-80"
                  style={{
                    height: `${(item.value / maxValue) * (height - 50)}px`,
                    backgroundColor: item.color || '#0ea5e9',
                    minHeight: '4px',
                  }}
                  title={`${item.label}: ${formatValue(item.value)}`}
                />
              )}
              <div className="absolute -top-6 opacity-0 group-hover:opacity-100 transition-opacity bg-neutral-900 text-white text-xs px-2 py-1 rounded-md whitespace-nowrap pointer-events-none z-10">
                {formatValue(item.value)}
              </div>
            </div>
            <span className="text-xs text-neutral-500 mt-2 text-center truncate w-full">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
