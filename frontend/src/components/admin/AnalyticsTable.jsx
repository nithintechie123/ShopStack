import React from 'react';

export default function AnalyticsTable({ rows = [] }) {
  if (!rows || rows.length === 0) {
    return <div className="text-text-muted">No analytics data.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-glass-border text-sm text-left">
        <thead className="bg-bg-tertiary/70 text-[11px] font-bold text-text-muted uppercase tracking-wider">
          <tr>
            <th className="px-6 py-3">Product</th>
            <th className="px-6 py-3">Quantity Sold</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-glass-border/40">
          {rows.map((r, idx) => (
            <tr key={r.name + idx} className="hover:bg-white/[0.02] transition-colors">
              <td className="px-6 py-3 font-semibold text-text-primary">{r.name}</td>
              <td className="px-6 py-3 text-text-primary font-bold">{r.qty}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
