import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function ReportCard({ icon: Icon, title, description, to }) {
  return (
    <div className="group glass glass-hover rounded-[24px] p-6 transition-all duration-300 hover:-translate-y-1">
      <div className="flex items-center justify-between gap-3 mb-4 text-slate-700">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600/10 to-indigo-600/10 text-violet-600 shadow-inner group-hover:scale-110 transition-transform duration-300">
          <Icon size={20} className="stroke-[2.5]" />
        </div>
        <span className="inline-flex rounded-full bg-gradient-to-r from-violet-500/10 to-indigo-500/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-violet-600 border border-violet-500/20">
          Analytics
        </span>
      </div>
      <h3 className="text-xl font-bold text-text-primary mb-2 group-hover:gradient-text transition-all duration-300">{title}</h3>
      <p className="text-sm text-text-secondary mb-6 line-clamp-2 leading-relaxed">{description}</p>
      <Link to={to} className="inline-flex items-center gap-2 text-sm font-semibold text-violet-600 transition-all duration-300 hover:text-violet-800">
        <span>View Detailed Report</span>
        <ArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform duration-300" />
      </Link>
    </div>
  );
}

