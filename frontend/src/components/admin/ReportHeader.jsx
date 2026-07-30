import React from 'react';
import { Download, Printer, FileText, Filter } from 'lucide-react';

export default function ReportHeader({ filters, activeFilter, onFilterChange, onExportPDF, onExportExcel, onPrint }) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
      <div>
        <div className="flex items-center gap-2 text-[0.9rem] text-text-muted mb-2">
          <Filter size={16} />
          <span>Filter reports</span>
        </div>
        <div className="flex flex-wrap gap-3">
          {filters.map((item) => (
            <button
              key={item.value}
              onClick={() => onFilterChange(item.value)}
              className={`rounded-full border px-4 py-2 text-sm transition ${activeFilter === item.value ? 'border-accent-primary bg-accent-primary/10 text-accent-primary shadow-sm' : 'border-transparent bg-white/80 text-text-secondary hover:bg-slate-100'}`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <button onClick={onExportPDF} disabled={!onExportPDF} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-4 py-2 text-sm font-medium text-text-secondary shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60">
          <Download size={16} /> Export PDF
        </button>
        <button onClick={onExportExcel} disabled={!onExportExcel} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-4 py-2 text-sm font-medium text-text-secondary shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60">
          <FileText size={16} /> Export Excel
        </button>
        <button onClick={onPrint} disabled={!onPrint} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-4 py-2 text-sm font-medium text-text-secondary shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60">
          <Printer size={16} /> Print Report
        </button>
      </div>
    </div>
  );
}
