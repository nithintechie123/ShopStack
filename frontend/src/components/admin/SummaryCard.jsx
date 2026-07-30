import React from 'react';

export default function SummaryCard({ icon: Icon, title, value, detail, trend }) {
  const trendClass = trend > 0 ? 'text-emerald-600' : 'text-rose-600';
  const trendLabel = trend > 0 ? `+${trend}%` : `${trend}%`;

  return (
    <div className="group rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="text-sm font-semibold uppercase tracking-[0.2em] text-text-muted">{title}</div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
          <Icon size={20} />
        </div>
      </div>
      <div className="text-3xl font-extrabold text-text-primary">{value}</div>
      <div className="mt-3 text-sm text-text-secondary">{detail}</div>
      <div className={`mt-4 inline-flex rounded-full px-3 py-1 text-sm font-semibold ${trendClass} bg-current/5`}>{trendLabel}</div>
    </div>
  );
}
