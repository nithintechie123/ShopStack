import React from 'react';
import { Download, Printer, FileText, Filter, Calendar } from 'lucide-react';

export default function ReportHeader({
  filters,
  activeFilter,
  onFilterChange,
  onExportPDF,
  onExportExcel,
  onPrint,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}) {
  return (
    <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between mb-8 pb-6 border-b border-slate-200/60">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-text-muted">
          <Filter size={14} className="text-violet-600" />
          <span>Filter reports</span>
        </div>
        <div className="flex flex-wrap gap-2.5 items-center">
          <div className="flex flex-wrap gap-1 p-1 bg-slate-200/50 rounded-2xl border border-slate-200/40">
            {filters.map((item) => (
              <button
                key={item.value}
                onClick={() => onFilterChange(item.value)}
                className={`rounded-xl px-4 py-2 text-xs font-bold transition-all duration-200 ${
                  activeFilter === item.value
                    ? 'bg-white text-violet-700 shadow-sm'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {activeFilter === 'custom' && (
            <div className="flex flex-wrap items-center gap-2 animate-[fadeIn_0.2s_ease-out]">
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 shadow-sm text-sm">
                <Calendar size={14} className="text-text-muted" />
                <input
                  type="date"
                  value={startDate || ''}
                  onChange={(e) => onStartDateChange && onStartDateChange(e.target.value)}
                  className="bg-transparent focus:outline-none text-text-primary text-xs font-semibold cursor-pointer"
                />
              </div>
              <span className="text-xs font-bold text-text-muted uppercase">to</span>
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 shadow-sm text-sm">
                <Calendar size={14} className="text-text-muted" />
                <input
                  type="date"
                  value={endDate || ''}
                  onChange={(e) => onEndDateChange && onEndDateChange(e.target.value)}
                  className="bg-transparent focus:outline-none text-text-primary text-xs font-semibold cursor-pointer"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2.5 items-center">
        {onExportPDF && (
          <button
            onClick={onExportPDF}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-text-secondary shadow-sm transition hover:bg-slate-50 hover:text-text-primary hover:border-slate-300 cursor-pointer"
          >
            <Download size={14} className="text-violet-600" /> Export PDF
          </button>
        )}
        {onExportExcel && (
          <button
            onClick={onExportExcel}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-text-secondary shadow-sm transition hover:bg-slate-50 hover:text-text-primary hover:border-slate-300 cursor-pointer"
          >
            <FileText size={14} className="text-emerald-600" /> Export Excel
          </button>
        )}
        {onPrint && (
          <button
            onClick={onPrint}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-text-secondary shadow-sm transition hover:bg-slate-50 hover:text-text-primary hover:border-slate-300 cursor-pointer"
          >
            <Printer size={14} className="text-slate-600" /> Print
          </button>
        )}
      </div>
    </div>
  );
}

