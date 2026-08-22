import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell
} from 'recharts';

function CustomChartTooltip({ active, payload, label, prefix = '' }) {
  if (!active || !payload || !payload.length) return null;
  const val = payload[0].value;
  return (
    <div className="rounded-2xl border border-glass-border bg-bg-secondary/95 backdrop-blur-md px-4 py-3 shadow-xl text-xs transition-all duration-200">
      <div className="font-semibold text-text-muted mb-1">{label}</div>
      <div className="font-bold text-text-primary text-sm flex items-center gap-1">
        <span className="text-violet-600 dark:text-violet-400 font-extrabold">{prefix}</span>
        <span>{Number(val).toLocaleString()} Orders</span>
      </div>
    </div>
  );
}

export function SalesCategoryChart({ data }) {
  const [chartType, setChartType] = useState('bar'); // 'bar' | 'area' | 'line'

  const renderChart = () => {
    switch (chartType) {
      case 'line':
        return (
          <LineChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 10 }}>
            <CartesianGrid stroke="#F1F5F9" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="name"
              stroke="#94A3B8"
              tick={{ fill: '#64748B', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis stroke="#94A3B8" tick={{ fill: '#64748B', fontSize: 11 }} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomChartTooltip />} />
            <Line
              type="monotone"
              dataKey="orders"
              stroke="#7C3AED"
              strokeWidth={3}
              dot={{ r: 4, fill: '#7C3AED' }}
            />
          </LineChart>
        );
      case 'area':
        return (
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 10 }}>
            <defs>
              <linearGradient id="salesCatGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#7C3AED" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#F1F5F9" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="name"
              stroke="#94A3B8"
              tick={{ fill: '#64748B', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis stroke="#94A3B8" tick={{ fill: '#64748B', fontSize: 11 }} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomChartTooltip />} />
            <Area
              type="monotone"
              dataKey="orders"
              stroke="#7C3AED"
              strokeWidth={3}
              fill="url(#salesCatGrad)"
            />
          </AreaChart>
        );
      case 'bar':
      default:
        return (
          <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 10 }}>
            <CartesianGrid stroke="#F1F5F9" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="name"
              stroke="#94A3B8"
              tick={{ fill: '#64748B', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis stroke="#94A3B8" tick={{ fill: '#64748B', fontSize: 11 }} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomChartTooltip />} />
            <Bar dataKey="orders" fill="#7C3AED" radius={[8, 8, 0, 0]} maxBarSize={45} />
          </BarChart>
        );
    }
  };

  return (
    <div className="glass rounded-[24px] p-6 transition-all duration-300 hover:shadow-lg">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div className="text-lg font-bold tracking-tight text-text-primary">Sales by Category</div>
        
        {/* Toggle Controls */}
        <div className="flex gap-1 p-0.5 bg-slate-100 rounded-xl border border-slate-200/40 w-fit">
          {['bar', 'area', 'line'].map((type) => (
            <button
              key={type}
              onClick={() => setChartType(type)}
              className={`rounded-lg px-3 py-1 text-xs font-bold capitalize transition-all duration-150 cursor-pointer ${
                chartType === type
                  ? 'bg-white text-violet-700 shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div className="h-[260px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </div>
  );
}

const COLORS = ['#7C3AED', '#8B5CF6', '#A855F7', '#C084FC', '#E9D5FF', '#6D28D9', '#4F46E5', '#3B82F6', '#14B8A6'];

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
    <div className="rounded-2xl border border-glass-border bg-bg-secondary/95 backdrop-blur-md px-4 py-3 shadow-xl text-xs">
      <div className="font-semibold text-text-primary mb-1">{p.name}</div>
      <div className="text-text-muted flex flex-col gap-0.5">
        <div>Revenue: <span className="font-bold text-violet-600 dark:text-violet-400">₹{Number(p.value).toLocaleString()}</span></div>
        <div>Contribution: <span className="font-semibold text-text-primary">{percent}%</span></div>
      </div>
    </div>
  );
}

export function SalesPieChart({ data = [] }) {
  const total = (data || []).reduce((s, d) => s + (Number(d.value) || 0), 0);
  const showLabels = data.length <= 7;

  if (!data || data.length === 0 || total === 0) {
    return (
      <div className="glass rounded-[24px] p-6 flex items-center justify-center min-h-[320px]">
        <div className="text-sm text-text-muted">No category sales data available.</div>
      </div>
    );
  }

  const labelRenderer = (entry) => {
    const { cx, cy, midAngle, outerRadius, name, value } = entry;
    const pos = polarToCartesian(cx, cy, outerRadius + 15, midAngle);
    return (
      <g>
        <path d={`M ${polarToCartesian(cx, cy, outerRadius - 4, midAngle).x} ${polarToCartesian(cx, cy, outerRadius - 4, midAngle).y} L ${pos.x} ${pos.y}`} stroke="#CBD5E1" fill="none" />
        <text x={pos.x} y={pos.y} textAnchor={pos.x > cx ? 'start' : 'end'} fill="#0F172A" style={{ fontSize: 10, fontWeight: 600 }}>
          <tspan x={pos.x} dy={0}>{name}</tspan>
          <tspan x={pos.x} dy={12} fill="#7C3AED">₹{Number(value).toLocaleString()}</tspan>
        </text>
      </g>
    );
  };

  return (
    <div className="glass rounded-[24px] p-6 transition-all duration-300 hover:shadow-lg">
      <div className="text-lg font-bold tracking-tight text-text-primary mb-6">Best Performing Categories</div>

      <div className="w-full">
        <div className="w-full h-56 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={55}
                outerRadius={showLabels ? 72 : 60}
                paddingAngle={3}
                cx="50%"
                cy="50%"
                label={showLabels ? labelRenderer : false}
                labelLine={showLabels}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className="focus:outline-none" />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip total={total} />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="w-full border-t border-slate-100 my-4" />

        <div className="w-full">
          <ul className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
            {data.map((entry, idx) => (
              <li
                key={entry.name + idx}
                className="flex items-center justify-between gap-4 bg-slate-50/50 border border-slate-100 rounded-xl px-4 py-2"
                title={entry.name}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: COLORS[idx % COLORS.length] }} />
                  <span className="text-xs font-semibold text-text-secondary truncate">{entry.name}</span>
                </div>
                <div className="text-xs font-bold text-text-muted">
                  ₹{Number(entry.value).toLocaleString()}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
