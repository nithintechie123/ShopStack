import React from 'react';

export default function DashboardCards({ cards = [] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
      {cards.map(({ icon: Icon, label, value, bg }, idx) => (
        <div key={idx} className="p-5 rounded-xl border border-glass-border bg-white/40 backdrop-blur-md hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${bg}`}>
                <Icon size={20} />
              </div>
              <div>
                <p className="font-display text-2xl font-extrabold text-text-primary leading-none">{value}</p>
                <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mt-1">{label}</p>
              </div>
            </div>
            <div className="text-sm text-text-muted">&nbsp;</div>
          </div>
        </div>
      ))}
    </div>
  );
}
