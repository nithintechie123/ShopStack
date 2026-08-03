import React from 'react';

export default function SummaryCard({ icon: Icon, title, value, detail, trend }) {
  const isPositive = trend > 0;
  const trendClass = isPositive ? 'text-emerald-600' : 'text-rose-600';
  const trendBg = isPositive ? 'bg-emerald-500/10' : 'bg-rose-500/10';
  const trendLabel = isPositive ? `+${trend}%` : `${trend}%`;

  return (
    <div className="group glass glass-hover rounded-[24px] p-6 transition-all duration-300 hover:-translate-y-1">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-text-muted">{title}</div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600/10 to-indigo-600/10 text-violet-600 shadow-inner group-hover:scale-110 transition-transform duration-300">
          <Icon size={20} className="stroke-[2.5]" />
        </div>
      </div>
      <div className="text-3xl font-extrabold tracking-tight text-text-primary group-hover:gradient-text transition-all duration-300">{value}</div>
      <div className="mt-3 text-sm text-text-secondary flex items-center justify-between gap-2">
        <span>{detail}</span>
        {trend !== undefined && (
          <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${trendClass} ${trendBg} border border-current/10 animate-pulse`}>
            {trendLabel}
          </span>
        )}
      </div>
    </div>
  );
}

