import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend } from 'recharts';

export function SalesCategoryChart({ data }) {
  const tickAngle = data.length > 12 ? -45 : data.length > 8 ? -35 : data.length > 5 ? -22 : data.length > 3 ? -12 : 0;
  const textAnchor = tickAngle < 0 ? 'end' : 'middle';

  return (
    <div className="h-[320px] rounded-[32px] bg-white p-6 shadow-sm border border-slate-200">
      <div className="text-lg font-semibold text-text-primary mb-4">Sales by Category</div>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 70 }} barCategoryGap={'14%'}>
          <CartesianGrid stroke="#E2E8F0" strokeDasharray="3 3" />
          <XAxis
            dataKey="name"
            stroke="#94A3B8"
            interval={0}
            tick={{ fill: '#64748B', fontSize: 12, angle: tickAngle, textAnchor }}
            tickMargin={16}
            minTickGap={15}
          />
          <YAxis stroke="#94A3B8" />
          <Tooltip formatter={(value) => [value == null ? 'N/A' : value, 'Orders']} />
          <Bar dataKey="orders" fill="#7C3AED" radius={[12, 12, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

const COLORS = ['#7c3aed', '#8b5cf6', '#a855f7', '#c084fc', '#e9d5ff', '#6366f1', '#4f46e5', '#6d28d9', '#8b5cf6'];

function polarToCartesian(cx, cy, radius, angleInDegrees) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: cx + radius * Math.cos(angleInRadians),
    y: cy + radius * Math.sin(angleInRadians),
  };
}

function CustomTooltip({ active, payload, total }) {
  if (!active || !payload || !payload.length) return null;
  const p = payload[0].payload;
  const percent = total > 0 ? ((p.value / total) * 100).toFixed(1) : '0.0';
  return (
    <div className="bg-white border border-slate-200 p-3 rounded shadow-sm text-sm">
      <div className="font-semibold mb-1">{p.name}</div>
      <div>Revenue: <span className="font-semibold">₹{Number(p.value).toLocaleString()}</span></div>
      <div className="text-text-muted">Contribution: {percent}%</div>
    </div>
  );
}

export function SalesPieChart({ data = [] }) {
  const total = (data || []).reduce((s, d) => s + (Number(d.value) || 0), 0);
  const showLabels = data.length <= 7; // show outside labels only for small lists

  if (!data || data.length === 0 || total === 0) {
    return (
      <div className="h-[320px] rounded-[32px] bg-white p-6 shadow-sm border border-slate-200 flex items-center justify-center">
        <div className="text-sm text-text-muted">No category sales data available.</div>
      </div>
    );
  }

  const labelRenderer = (entry) => {
    const { cx, cy, midAngle, outerRadius, name, value } = entry;
    const pos = polarToCartesian(cx, cy, outerRadius + 18, midAngle);
    return (
      <g>
        <path d={`M ${polarToCartesian(cx, cy, outerRadius - 4, midAngle).x} ${polarToCartesian(cx, cy, outerRadius - 4, midAngle).y} L ${pos.x} ${pos.y}`} stroke="#CBD5E1" fill="none" />
        <text x={pos.x} y={pos.y} textAnchor={pos.x > cx ? 'start' : 'end'} fill="#0F172A" style={{ fontSize: 12 }}>
          <tspan x={pos.x} dy={0}>{name}</tspan>
          <tspan x={pos.x} dy={14}>₹{Number(value).toLocaleString()}</tspan>
        </text>
      </g>
    );
  };

  return (
    <div className="min-h-[460px] rounded-[32px] bg-white p-6 shadow-sm border border-slate-200">
      <div className="text-lg font-semibold text-text-primary mb-4">Best Performing Categories</div>

      <div className="w-full">
        {/* Chart area - keep labels inside this section and lift chart slightly */}
        <div className="w-full" style={{ height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={50}
                outerRadius={showLabels ? 78 : 60}
                paddingAngle={3}
                // lift chart upward so labels don't collide with divider below
                cx="50%"
                cy="36%"
                label={showLabels ? labelRenderer : false}
                labelLine={showLabels}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip total={total} />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* spacer to ensure 40-50px between chart bottom and divider */}
        <div className="w-full" style={{ height: 48 }} />

        <div className="w-full border-t border-slate-100" />

        {/* ranked list starts below divider and uses even spacing */}
        <div className="w-full mt-4">
          <ul className="flex flex-col gap-4 max-h-56 overflow-auto"> {/* gap-4 = 16px vertical spacing */}
            {data.map((entry, idx) => (
              <li
                key={entry.name + idx}
                className="flex items-center justify-between gap-4 bg-white/40 border border-slate-100 rounded-lg px-4 py-3"
                title={entry.name}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: COLORS[idx % COLORS.length] }} />
                  <span className="text-sm truncate">{entry.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-sm text-text-muted">₹{Number(entry.value).toLocaleString()}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
