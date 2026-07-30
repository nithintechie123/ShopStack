import React from 'react';

export default function Charts({ data = [], height = 160 }) {
  if (!data || data.length === 0) {
    return <div className="text-text-muted">No data available for chart.</div>;
  }

  const max = Math.max(...data.map((d) => d.value));
  const padding = 8;
  const baseW = 560;
  const w = Math.max(baseW, data.length * 60);
  const h = height;
  const step = (w - padding * 2) / data.length;

  return (
    <div className="overflow-x-auto">
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
        {data.map((d, i) => {
          const barH = max > 0 ? (d.value / max) * (h - 40) : 0;
          const x = padding + i * step + 6;
          const y = h - barH - 20;
          return (
            <g key={d.label}>
              <rect x={x} y={y} width={Math.max(12, step - 12)} height={barH} rx={6} fill="#7c3aed" opacity={0.95} />
              <text x={x + (step - 12) / 2} y={h - 6} fontSize={10} fill="#9CA3AF" textAnchor="middle">{d.label}</text>
              <text x={x + (step - 12) / 2} y={y - 6} fontSize={11} fill="#111827" textAnchor="middle">{d.value}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
