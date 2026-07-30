import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts';

export function RevenueTrendChart({ data }) {
  return (
    <div className="h-[320px] rounded-[32px] bg-white p-6 shadow-sm border border-slate-200">
      <div className="text-lg font-semibold text-text-primary mb-4">Monthly Revenue Trend</div>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 10, left: 10, bottom: 36 }}>
          <CartesianGrid stroke="#E2E8F0" strokeDasharray="3 3" />
          <XAxis
            dataKey="label"
            stroke="#94A3B8"
            tick={{ fill: '#64748B', fontSize: 12 }}
            tickMargin={10}
            interval={0}
          />
          <YAxis stroke="#94A3B8" tick={{ fill: '#64748B' }} tickFormatter={(v) => (v == null ? '0' : Number(v).toLocaleString())} tickCount={6} />
          <Tooltip formatter={(value) => [value == null ? 'N/A' : `₹${Number(value).toLocaleString()}`, 'Revenue']} />
          <Line type={data && data.length > 1 ? 'monotone' : 'linear'} dataKey="value" stroke="#7C3AED" strokeWidth={4} dot={{ r: 5, fill: '#7C3AED' }} activeDot={{ r: 8 }} />
        </LineChart>
      </ResponsiveContainer>
      {data && data.length === 1 && (
        <div className="mt-2 text-center text-sm text-text-muted">Only one month of data available</div>
      )}
    </div>
  );
}

export function RevenueCategoryChart({ data }) {
  return (
    <div className="h-[320px] rounded-[32px] bg-white p-6 shadow-sm border border-slate-200">
      <div className="text-lg font-semibold text-text-primary mb-4">Revenue by Category</div>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 70 }} barCategoryGap={'18%'}>
          <CartesianGrid stroke="#E2E8F0" strokeDasharray="3 3" />
          <XAxis
            dataKey="name"
            stroke="#94A3B8"
            interval={0}
            tickMargin={14}
            minTickGap={8}
            tick={(props) => {
              const { x, y, payload, index } = props;
              const text = payload.value || '';
              const maxLen = 18;
              const shouldRotate = data && data.length > 10;
              // split into two lines if long
              const words = text.split(' ');
              const mid = Math.ceil(words.length / 2);
              const line1 = words.slice(0, mid).join(' ');
              const line2 = words.slice(mid).join(' ');
              const displayTwo = text.length > maxLen && line2;
              if (shouldRotate) {
                return (
                  <g transform={`translate(${x},${y}) rotate(-35)`}> 
                    <text x={0} y={0} dy={4} textAnchor="end" fill="#64748B" style={{ fontSize: 12 }}>
                      {text}
                    </text>
                  </g>
                );
              }
              return (
                <text x={x} y={y} dy={16} textAnchor="middle" fill="#64748B" style={{ fontSize: 12 }}>
                  {displayTwo ? (
                    <tspan x={x} dy={-2}>{line1}</tspan>
                  ) : null}
                  {displayTwo ? (
                    <tspan x={x} dy={16}>{line2}</tspan>
                  ) : (
                    text
                  )}
                </text>
              );
            }}
          />
          <YAxis stroke="#94A3B8" tick={{ fill: '#64748B' }} tickFormatter={(v) => (v == null ? '0' : Number(v).toLocaleString())} />
          <Tooltip formatter={(value) => [value == null ? 'N/A' : `₹${Number(value).toLocaleString()}`, 'Revenue']} />
          <Bar dataKey="value" fill="#7C3AED" radius={[12, 12, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

const COLORS = ['#7C3AED', '#8B5CF6', '#A855F7', '#C084FC', '#E9D5FF', '#6D28D9', '#7C3AED'];

function RevenueTooltip({ active, payload, total }) {
  if (!active || !payload || !payload.length) return null;
  const p = payload[0].payload;
  const pct = total > 0 ? ((p.value / total) * 100).toFixed(1) : '0.0';
  return (
    <div className="bg-white border border-slate-200 p-2 rounded shadow-sm text-sm">
      <div className="font-semibold">{p.name}</div>
      <div>Revenue: <span className="font-semibold">₹{Number(p.value).toLocaleString()}</span></div>
      <div className="text-text-muted">{pct}%</div>
    </div>
  );
}

export function RevenuePieChart({ data = [] }) {
  const total = (data || []).reduce((s, d) => s + (Number(d.value) || 0), 0);

  if (!data || data.length === 0 || total === 0) {
    return (
      <div className="h-[320px] rounded-[32px] bg-white p-6 shadow-sm border border-slate-200 flex items-center justify-center">
        <div className="text-sm text-text-muted">No category sales data available.</div>
      </div>
    );
  }

  return (
    <div className="h-[320px] rounded-[32px] bg-white p-6 shadow-sm border border-slate-200">
      <div className="text-lg font-semibold text-text-primary mb-4">Revenue Distribution</div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <div className="w-full h-64 flex items-center justify-center">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={50}
                outerRadius={60}
                paddingAngle={3}
                label={false}
                labelLine={false}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<RevenueTooltip total={total} />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="w-full">
          <ul className="flex flex-col gap-3 max-h-56 overflow-auto">
            {data.map((entry, idx) => {
              const pct = total > 0 ? ((Number(entry.value) / total) * 100).toFixed(1) : '0.0';
              return (
                <li key={entry.name + idx} className="flex items-center justify-between gap-4 bg-white/40 border border-slate-100 rounded-lg px-4 py-3" title={entry.name}>
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: COLORS[idx % COLORS.length] }} />
                    <span className="text-sm truncate">{entry.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-sm text-text-muted">₹{Number(entry.value).toLocaleString()}</div>
                    <div className="text-sm text-primary">{pct}%</div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
