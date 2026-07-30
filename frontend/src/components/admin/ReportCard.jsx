import React from 'react';
import { Link } from 'react-router-dom';

export default function ReportCard({ icon: Icon, title, description, to }) {
  return (
    <div className="group rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <div className="flex items-center justify-between gap-3 mb-4 text-slate-700">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
          <Icon size={20} />
        </div>
        <span className="inline-flex rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-violet-700">Quick</span>
      </div>
      <h3 className="text-xl font-bold text-text-primary mb-2">{title}</h3>
      <p className="text-sm text-text-secondary mb-6">{description}</p>
      <Link to={to} className="inline-flex items-center gap-2 text-sm font-semibold text-violet-700 transition hover:text-violet-900">
        View Report
      </Link>
    </div>
  );
}
