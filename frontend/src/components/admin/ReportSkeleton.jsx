import React from 'react';

export default function ReportSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-10 rounded-2xl bg-slate-200/70" />
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={idx} className="h-28 rounded-[28px] bg-slate-200/70" />
        ))}
      </div>
      <div className="h-80 rounded-[32px] bg-slate-200/70" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="h-96 rounded-[32px] bg-slate-200/70" />
        <div className="h-96 rounded-[32px] bg-slate-200/70" />
      </div>
      <div className="h-72 rounded-[32px] bg-slate-200/70" />
    </div>
  );
}
