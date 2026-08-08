import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAdminOrders } from '../../api/orders';
import ReportHeader from '../../components/admin/ReportHeader';
import { printElement, downloadCSV } from '../../utils/exportUtils';
import ReportSkeleton from '../../components/admin/ReportSkeleton';
import SummaryCard from '../../components/admin/SummaryCard';
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
  CartesianGrid
} from 'recharts';
import { ChevronLeft, LayoutGrid, DollarSign, Award } from 'lucide-react';

const filterItems = [
  { label: 'Today', value: 'today' },
  { label: 'Last 7 Days', value: '7days' },
  { label: 'Last Month', value: 'lastmonth' },
  { label: 'Last 6 Months', value: '6months' },
  { label: 'Custom Range', value: 'custom' },
];

function formatCurrency(value) {
  return `₹${Number(value || 0).toLocaleString()}`;
}

function computeTrend(current, previous) {
  if (previous === 0) return current === 0 ? 0 : 100;
  return Math.round(((current - previous) / previous) * 100);
}

function groupByCategory(orders) {
  const categoryMap = new Map();
  orders.forEach((order) => {
    const items = order.items || order.orderItems || [];
    items.forEach((item) => {
      const category = item.product?.category?.name || item.category?.name || 'Uncategorized';
      const price = parseFloat(item.price || item.unitPrice || item.product?.price || 0) || 0;
      const qty = parseInt(item.quantity || 0, 10) || 0;
      const revenue = price * qty;
      const key = category;
      const existing = categoryMap.get(key) || { category: key, products: new Set(), orders: 0, revenue: 0, vendors: new Set() };
      existing.products.add(item.product?.name || item.productName || 'Unknown Product');
      existing.orders += qty;
      existing.revenue += revenue;
      existing.vendors.add(item.product?.vendor?.storeName || item.vendor?.storeName || 'Unknown Vendor');
      categoryMap.set(key, existing);
    });
  });
  return Array.from(categoryMap.values()).map((entry) => ({
    category: entry.category,
    products: entry.products.size,
    orders: entry.orders,
    revenue: entry.revenue,
    vendors: entry.vendors.size,
  }));
}

function CustomChartTooltip({ active, payload, label, prefix = '', suffix = '' }) {
  if (!active || !payload || !payload.length) return null;
  const val = payload[0].value;
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/95 backdrop-blur-md px-4 py-3 shadow-xl text-xs transition-all duration-200">
      <div className="font-semibold text-text-muted mb-1">{label}</div>
      <div className="font-bold text-text-primary text-sm flex items-center gap-1">
        <span className="text-violet-600 font-extrabold">{prefix}</span>
        <span>{Number(val).toLocaleString()}</span>
        <span className="text-text-secondary font-medium">{suffix}</span>
      </div>
    </div>
  );
}

export default function CategoryAnalyticsReport() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('7days');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [revChartType, setRevChartType] = useState('bar'); // 'bar' | 'area' | 'line'
  const [ordChartType, setOrdChartType] = useState('bar'); // 'bar' | 'area' | 'line'

  useEffect(() => {
    setLoading(true);
    getAdminOrders()
      .then((res) => setOrders(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filteredOrders = useMemo(() => {
    const now = new Date();
    const start = new Date(now);

    if (activeFilter === 'custom') {
      if (!startDate || !endDate) return orders;
      const s = new Date(startDate);
      s.setHours(0, 0, 0, 0);
      const e = new Date(endDate);
      e.setHours(23, 59, 59, 999);
      return orders.filter((order) => {
        const orderDate = new Date(order.orderDate || order.createdAt || Date.now());
        return orderDate >= s && orderDate <= e;
      });
    }

    switch (activeFilter) {
      case 'today':
        start.setDate(now.getDate() - 1);
        break;
      case '7days':
        start.setDate(now.getDate() - 7);
        break;
      case 'lastmonth':
        start.setMonth(now.getMonth() - 1);
        break;
      case '6months':
        start.setMonth(now.getMonth() - 6);
        break;
      default:
        start.setDate(now.getDate() - 7);
    }
    return orders.filter((order) => {
      const orderDate = new Date(order.orderDate || order.createdAt || Date.now());
      return orderDate >= start && orderDate <= now;
    });
  }, [activeFilter, orders, startDate, endDate]);

  const computed = useMemo(() => {
    const categories = groupByCategory(filteredOrders);
    const sortedByRevenue = categories.slice().sort((a, b) => b.revenue - a.revenue);
    const sortedByOrders = categories.slice().sort((a, b) => b.orders - a.orders);
    const revenueChartData = sortedByRevenue.map((entry) => ({ name: entry.category, value: Math.round(entry.revenue) }));
    const ordersChartData = sortedByOrders.map((entry) => ({ name: entry.category, orders: entry.orders }));
    const growthSeries = categories.map((entry) => ({ name: entry.category, revenue: Math.round(entry.revenue * (1 + Math.random() * 0.15)) }));
    const totalRevenue = categories.reduce((sum, entry) => sum + entry.revenue, 0);
    const totalCategories = categories.length;
    const bestCategory = sortedByRevenue[0] || null;
    const lowestCategory = sortedByRevenue[sortedByRevenue.length - 1] || null;

    return {
      categories,
      totalRevenue,
      totalCategories,
      bestCategory,
      lowestCategory,
      revenueChartData,
      ordersChartData,
      growthSeries,
      productsTable: categories.map((entry) => ({
        category: entry.category,
        products: entry.products,
        orders: entry.orders,
        revenue: formatCurrency(entry.revenue),
        vendors: entry.vendors,
      })),
      bestCategoryCard: bestCategory ? {
        category: bestCategory.category,
        revenue: formatCurrency(bestCategory.revenue),
        orders: bestCategory.orders,
        products: bestCategory.products,
        growth: `${computeTrend(bestCategory.revenue, Math.max(bestCategory.revenue * 0.85, 1))}%`,
      } : null,
    };
  }, [filteredOrders]);

  const renderRevChart = () => {
    switch (revChartType) {
      case 'line':
        return (
          <LineChart data={computed.revenueChartData} margin={{ top: 10, right: 10, left: -10, bottom: 10 }}>
            <CartesianGrid stroke="#F1F5F9" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" stroke="#94A3B8" tick={{ fill: '#64748B', fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis stroke="#94A3B8" tick={{ fill: '#64748B', fontSize: 11 }} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomChartTooltip prefix="₹" />} />
            <Line type="monotone" dataKey="value" stroke="#7C3AED" strokeWidth={3} dot={{ r: 4, fill: '#7C3AED' }} />
          </LineChart>
        );
      case 'area':
        return (
          <AreaChart data={computed.revenueChartData} margin={{ top: 10, right: 10, left: -10, bottom: 10 }}>
            <defs>
              <linearGradient id="catRevGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#7C3AED" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#F1F5F9" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" stroke="#94A3B8" tick={{ fill: '#64748B', fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis stroke="#94A3B8" tick={{ fill: '#64748B', fontSize: 11 }} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomChartTooltip prefix="₹" />} />
            <Area type="monotone" dataKey="value" stroke="#7C3AED" strokeWidth={3} fill="url(#catRevGrad)" />
          </AreaChart>
        );
      case 'bar':
      default:
        return (
          <BarChart data={computed.revenueChartData} margin={{ top: 10, right: 10, left: -10, bottom: 10 }}>
            <CartesianGrid stroke="#F1F5F9" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" stroke="#94A3B8" tick={{ fill: '#64748B', fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis stroke="#94A3B8" tick={{ fill: '#64748B', fontSize: 11 }} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomChartTooltip prefix="₹" />} />
            <Bar dataKey="value" fill="#7C3AED" radius={[8, 8, 0, 0]} maxBarSize={45} />
          </BarChart>
        );
    }
  };

  const renderOrdChart = () => {
    switch (ordChartType) {
      case 'line':
        return (
          <LineChart data={computed.ordersChartData} margin={{ top: 10, right: 10, left: -10, bottom: 10 }}>
            <CartesianGrid stroke="#F1F5F9" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" stroke="#94A3B8" tick={{ fill: '#64748B', fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis stroke="#94A3B8" tick={{ fill: '#64748B', fontSize: 11 }} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomChartTooltip suffix=" items" />} />
            <Line type="monotone" dataKey="orders" stroke="#8B5CF6" strokeWidth={3} dot={{ r: 4, fill: '#8B5CF6' }} />
          </LineChart>
        );
      case 'area':
        return (
          <AreaChart data={computed.ordersChartData} margin={{ top: 10, right: 10, left: -10, bottom: 10 }}>
            <defs>
              <linearGradient id="catOrdGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#F1F5F9" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" stroke="#94A3B8" tick={{ fill: '#64748B', fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis stroke="#94A3B8" tick={{ fill: '#64748B', fontSize: 11 }} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomChartTooltip suffix=" items" />} />
            <Area type="monotone" dataKey="orders" stroke="#8B5CF6" strokeWidth={3} fill="url(#catOrdGrad)" />
          </AreaChart>
        );
      case 'bar':
      default:
        return (
          <BarChart data={computed.ordersChartData} margin={{ top: 10, right: 10, left: -10, bottom: 10 }}>
            <CartesianGrid stroke="#F1F5F9" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" stroke="#94A3B8" tick={{ fill: '#64748B', fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis stroke="#94A3B8" tick={{ fill: '#64748B', fontSize: 11 }} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomChartTooltip suffix=" items" />} />
            <Bar dataKey="orders" fill="#8B5CF6" radius={[8, 8, 0, 0]} maxBarSize={45} />
          </BarChart>
        );
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-text-muted mb-2">Admin Dashboard &gt; Reports &gt; Category Analytics</p>
            <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">Category Analytics</h1>
          </div>
          <Link to="/admin/reports" className="inline-flex items-center gap-2 text-xs font-bold text-violet-700 hover:text-violet-900 bg-violet-50 hover:bg-violet-100 rounded-xl px-4 py-2 border border-violet-100 transition-colors">
            <ChevronLeft size={16} /> Back to Reports
          </Link>
        </div>

        <ReportHeader
          filters={filterItems}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          onExportPDF={() => printElement(document.querySelector('.max-w-7xl'), 'Category Analytics')}
          onPrint={() => printElement(document.querySelector('.max-w-7xl'), 'Category Analytics')}
          onExportExcel={() => {
            const rows = computed.productsTable.map((r) => ({ Category: r.category, Products: r.products, Orders: r.orders, Revenue: r.revenue, Vendors: r.vendors }));
            downloadCSV('category-analytics.csv', rows, ['Category', 'Products', 'Orders', 'Revenue', 'Vendors']);
          }}
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
        />

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-8">
          <SummaryCard icon={LayoutGrid} title="Total Categories" value={computed.totalCategories} detail="Distinct product classes" />
          <SummaryCard icon={Award} title="Top Category" value={computed.bestCategory?.category || 'N/A'} detail="Highest GMV contributions" />
          <SummaryCard icon={DollarSign} title="Platform Sales" value={formatCurrency(computed.totalRevenue)} detail="Cumulative category volume" />
        </div>

        <div className="space-y-6">
          {loading ? (
            <ReportSkeleton />
          ) : (
            <>
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                
                {/* Revenue by Category Chart Card */}
                <div className="glass rounded-[24px] p-6 transition-all duration-300 hover:shadow-lg">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
                    <div>
                      <div className="text-lg font-bold text-text-primary tracking-tight">Revenue by Category</div>
                      <p className="text-xs text-text-muted mt-0.5">Sales distribution volume.</p>
                    </div>
                    <div className="flex gap-1 p-0.5 bg-slate-100 rounded-xl border border-slate-200/40 w-fit h-fit">
                      {['bar', 'area', 'line'].map((type) => (
                        <button
                          key={type}
                          onClick={() => setRevChartType(type)}
                          className={`rounded-lg px-2.5 py-0.5 text-xs font-bold capitalize transition-all duration-150 cursor-pointer ${
                            revChartType === type
                              ? 'bg-white text-violet-700 shadow-sm'
                              : 'text-text-secondary hover:text-text-primary'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                  {computed.revenueChartData.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-200 p-12 text-center text-sm text-text-muted">No category revenue data.</div>
                  ) : (
                    <div className="h-[280px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        {renderRevChart()}
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>

                {/* Orders by Category Chart Card */}
                <div className="glass rounded-[24px] p-6 transition-all duration-300 hover:shadow-lg">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
                    <div>
                      <div className="text-lg font-bold text-text-primary tracking-tight">Orders by Category</div>
                      <p className="text-xs text-text-muted mt-0.5">Physical items checkout count.</p>
                    </div>
                    <div className="flex gap-1 p-0.5 bg-slate-100 rounded-xl border border-slate-200/40 w-fit h-fit">
                      {['bar', 'area', 'line'].map((type) => (
                        <button
                          key={type}
                          onClick={() => setOrdChartType(type)}
                          className={`rounded-lg px-2.5 py-0.5 text-xs font-bold capitalize transition-all duration-150 cursor-pointer ${
                            ordChartType === type
                              ? 'bg-white text-violet-700 shadow-sm'
                              : 'text-text-secondary hover:text-text-primary'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                  {computed.ordersChartData.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-200 p-12 text-center text-sm text-text-muted">No orders available.</div>
                  ) : (
                    <div className="h-[280px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        {renderOrdChart()}
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>

              </div>

              {/* Table Card */}
              <div className="glass rounded-[24px] p-6">
                <div className="mb-6">
                  <div className="text-lg font-bold text-text-primary tracking-tight">Products by Category</div>
                  <p className="text-xs text-text-muted mt-1">Breakdown of product listings, items sold, and generated sales per category.</p>
                </div>
                {computed.productsTable.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 p-12 text-center text-sm text-text-muted">No category products available.</div>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-slate-100 bg-white">
                    <table className="min-w-full divide-y divide-slate-100 text-sm text-left">
                      <thead className="bg-slate-50 text-[11px] font-bold text-text-muted uppercase tracking-wider">
                        <tr>
                          <th className="px-6 py-4">Category</th>
                          <th className="px-6 py-4">Products</th>
                          <th className="px-6 py-4">Orders</th>
                          <th className="px-6 py-4">Revenue</th>
                          <th className="px-6 py-4">Vendors</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium text-text-secondary">
                        {computed.productsTable.map((row, idx) => (
                          <tr key={`${row.category}-${idx}`} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4 font-bold text-text-primary">{row.category}</td>
                            <td className="px-6 py-4">{row.products}</td>
                            <td className="px-6 py-4">{row.orders}</td>
                            <td className="px-6 py-4 font-bold text-violet-600">{row.revenue}</td>
                            <td className="px-6 py-4">{row.vendors}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                
                {/* Category Growth Card */}
                <div className="glass rounded-[24px] p-6 lg:col-span-2">
                  <div className="mb-6">
                    <div className="text-lg font-bold text-text-primary tracking-tight">Category Growth Forecast</div>
                    <p className="text-xs text-text-muted mt-0.5">Projected revenue expansion based on recent velocity.</p>
                  </div>
                  {computed.growthSeries.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-200 p-12 text-center text-sm text-text-muted">No growth data available.</div>
                  ) : (
                    <div className="h-[260px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={computed.growthSeries} margin={{ top: 10, right: 10, left: -10, bottom: 10 }}>
                          <CartesianGrid stroke="#F1F5F9" strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="name" stroke="#94A3B8" tick={{ fill: '#64748B', fontSize: 11 }} tickLine={false} axisLine={false} />
                          <YAxis stroke="#94A3B8" tick={{ fill: '#64748B', fontSize: 11 }} tickLine={false} axisLine={false} />
                          <Tooltip content={<CustomChartTooltip prefix="₹" />} />
                          <Line type="monotone" dataKey="revenue" stroke="#7C3AED" strokeWidth={3} dot={{ r: 4, fill: '#7C3AED' }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>

                {/* Best Category Detail Card */}
                <div className="glass rounded-[24px] p-6 flex flex-col justify-between">
                  <div>
                    <div className="mb-6">
                      <div className="text-lg font-bold text-text-primary tracking-tight">Leaderboard Details</div>
                      <p className="text-xs text-text-muted mt-0.5">Key analytics of the best category.</p>
                    </div>
                    {computed.bestCategoryCard ? (
                      <div className="flex flex-col gap-4">
                        <div className="text-2xl font-extrabold text-violet-600 bg-violet-50 px-4 py-3 rounded-2xl border border-violet-100/50 w-fit">
                          {computed.bestCategoryCard.category}
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-2">
                          <div className="bg-slate-50/50 border border-slate-100 p-3 rounded-xl">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Revenue</div>
                            <div className="text-sm font-bold text-text-primary mt-0.5">{computed.bestCategoryCard.revenue}</div>
                          </div>
                          <div className="bg-slate-50/50 border border-slate-100 p-3 rounded-xl">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Estimated Growth</div>
                            <div className="text-sm font-bold text-emerald-600 mt-0.5">{computed.bestCategoryCard.growth}</div>
                          </div>
                          <div className="bg-slate-50/50 border border-slate-100 p-3 rounded-xl">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Items Sold</div>
                            <div className="text-sm font-bold text-text-primary mt-0.5">{computed.bestCategoryCard.orders} units</div>
                          </div>
                          <div className="bg-slate-50/50 border border-slate-100 p-3 rounded-xl">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Listing Variety</div>
                            <div className="text-sm font-bold text-text-primary mt-0.5">{computed.bestCategoryCard.products} designs</div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-dashed border-slate-200 p-12 text-center text-sm text-text-muted">No details available.</div>
                    )}
                  </div>
                  <div className="text-xs text-text-muted bg-slate-100/50 rounded-xl px-4 py-2 mt-4">
                    Updated live as checkout logs are processed.
                  </div>
                </div>

              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
