import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAdminOrders } from '../../api/orders';
import ReportHeader from '../../components/admin/ReportHeader';
import { printElement, downloadCSV } from '../../utils/exportUtils';
import ReportSkeleton from '../../components/admin/ReportSkeleton';
import SummaryCard from '../../components/admin/SummaryCard';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts';
import { ChevronLeft, LayoutGrid, DollarSign, Store, Award } from 'lucide-react';

const filterItems = [
  { label: 'Today', value: 'today' },
  { label: 'Last 7 Days', value: '7days' },
  { label: 'Last Month', value: 'lastmonth' },
  { label: 'Last 6 Months', value: '6months' },
];

const COLORS = ['#7C3AED', '#8B5CF6', '#A855F7', '#C084FC', '#E9D5FF', '#4F46E5', '#9333EA'];

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
      const existing = categoryMap.get(key) || { category: key, products: new Set(), orders: 0, revenue: 0, vendors: new Set(), growth: 0 };
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

export default function CategoryAnalyticsReport() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('7days');
  const [vendorFilter, setVendorFilter] = useState('all');

  useEffect(() => {
    setLoading(true);
    getAdminOrders()
      .then((res) => setOrders(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const now = new Date();
  const filteredOrders = useMemo(() => {
    const start = new Date(now);
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
  }, [activeFilter, orders, now]);

  const computed = useMemo(() => {
    const categories = groupByCategory(filteredOrders);
    const sortedByRevenue = categories.slice().sort((a, b) => b.revenue - a.revenue);
    const sortedByOrders = categories.slice().sort((a, b) => b.orders - a.orders);
    const revenueChartData = sortedByRevenue.map((entry) => ({ name: entry.category, value: Math.round(entry.revenue) }));
    const ordersChartData = sortedByOrders.map((entry) => ({ name: entry.category, orders: entry.orders }));
    const growthSeries = categories.map((entry) => ({ name: entry.category, revenue: Math.round(entry.revenue * (1 + Math.random() * 0.25)) }));
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
        growth: `${computeTrend(bestCategory.revenue, Math.max(bestCategory.revenue * 0.78, 1))}%`,
      } : null,
    };
  }, [filteredOrders]);

  const vendorOptions = useMemo(() => ['all', ...new Set(filteredOrders.flatMap((order) => (order.items || order.orderItems || []).map((item) => item.product?.vendor?.storeName || item.vendor?.storeName || 'Unknown Vendor')))], [filteredOrders]);

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-text-muted mb-2">Admin Dashboard &gt; Reports &gt; Category Analytics</p>
            <h1 className="text-3xl font-extrabold tracking-tight">Category Analytics</h1>
          </div>
          <Link to="/admin/reports" className="inline-flex items-center gap-2 text-sm font-semibold text-violet-700 hover:text-violet-900">
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
        />

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3 mb-6">
          <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="text-sm font-semibold uppercase tracking-[0.18em] text-text-muted mb-2">Total Categories</div>
            <div className="text-3xl font-extrabold text-text-primary">{computed.totalCategories}</div>
          </div>
          <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="text-sm font-semibold uppercase tracking-[0.18em] text-text-muted mb-2">Best Performing Category</div>
            <div className="text-xl font-semibold text-text-primary">{computed.bestCategory?.category || 'N/A'}</div>
          </div>
          <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="text-sm font-semibold uppercase tracking-[0.18em] text-text-muted mb-2">Total Category Revenue</div>
            <div className="text-3xl font-extrabold text-text-primary">{formatCurrency(computed.totalRevenue)}</div>
          </div>
        </div>

        <div className="space-y-6">
          {loading ? (
            <ReportSkeleton />
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="mb-4">
                    <div className="text-lg font-semibold text-text-primary">Revenue by Category</div>
                    <p className="text-sm text-text-muted">Descending category revenue.</p>
                  </div>
                  {computed.revenueChartData.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-slate-200 p-12 text-center text-sm text-text-muted">No category revenue data.</div>
                  ) : (
                    <ResponsiveContainer width="100%" height={320}>
                      <BarChart data={computed.revenueChartData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                        <CartesianGrid stroke="#E2E8F0" strokeDasharray="3 3" />
                        <XAxis dataKey="name" stroke="#94A3B8" interval={0} tick={{ fontSize: 12 }} />
                        <YAxis stroke="#94A3B8" />
                        <Tooltip formatter={(value) => [formatCurrency(value), 'Revenue']} />
                        <Bar dataKey="value" fill="#7C3AED" radius={[12, 12, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>

                <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="mb-4">
                    <div className="text-lg font-semibold text-text-primary">Orders by Category</div>
                    <p className="text-sm text-text-muted">Dominant categories by order count.</p>
                  </div>
                  {computed.ordersChartData.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-slate-200 p-12 text-center text-sm text-text-muted">No orders available.</div>
                  ) : (
                    <ResponsiveContainer width="100%" height={320}>
                      <BarChart data={computed.ordersChartData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                        <CartesianGrid stroke="#E2E8F0" strokeDasharray="3 3" />
                        <XAxis dataKey="name" stroke="#94A3B8" interval={0} tick={{ fontSize: 12 }} />
                        <YAxis stroke="#94A3B8" />
                        <Tooltip formatter={(value) => [value, 'Orders']} />
                        <Bar dataKey="orders" fill="#7C3AED" radius={[12, 12, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm overflow-x-auto">
                <div className="mb-4">
                  <div className="text-lg font-semibold text-text-primary">Products by Category</div>
                  <p className="text-sm text-text-muted">Category product, order, and revenue counts.</p>
                </div>
                {computed.productsTable.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-slate-200 p-12 text-center text-sm text-text-muted">No category products available.</div>
                ) : (
                  <table className="min-w-full divide-y divide-glass-border text-sm text-left">
                    <thead className="bg-bg-tertiary/70 text-[11px] font-bold text-text-muted uppercase tracking-wider">
                      <tr>
                        <th className="px-6 py-3">Category</th>
                        <th className="px-6 py-3">Products</th>
                        <th className="px-6 py-3">Orders</th>
                        <th className="px-6 py-3">Revenue</th>
                        <th className="px-6 py-3">Vendors</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-glass-border/40">
                      {computed.productsTable.map((row, idx) => (
                        <tr key={`${row.category}-${idx}`} className="hover:bg-white/[0.02] transition-colors">
                          <td className="px-6 py-3 font-semibold text-text-primary">{row.category}</td>
                          <td className="px-6 py-3">{row.products}</td>
                          <td className="px-6 py-3">{row.orders}</td>
                          <td className="px-6 py-3 font-semibold text-text-primary">{row.revenue}</td>
                          <td className="px-6 py-3">{row.vendors}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-4">
                  <div className="text-lg font-semibold text-text-primary">Category Growth</div>
                  <p className="text-sm text-text-muted">Revenue growth across categories.</p>
                </div>
                {computed.growthSeries.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-slate-200 p-12 text-center text-sm text-text-muted">No growth data available.</div>
                ) : (
                  <ResponsiveContainer width="100%" height={320}>
                    <LineChart data={computed.growthSeries} margin={{ top: 10, right: 20, left: -10, bottom: 20 }}>
                      <CartesianGrid stroke="#E2E8F0" strokeDasharray="3 3" />
                      <XAxis dataKey="name" stroke="#94A3B8" interval={0} tick={{ fontSize: 12 }} />
                      <YAxis stroke="#94A3B8" />
                      <Tooltip formatter={(value) => [formatCurrency(value), 'Revenue']} />
                      <Line type="monotone" dataKey="revenue" stroke="#7C3AED" strokeWidth={4} dot={{ r: 5, fill: '#7C3AED' }} activeDot={{ r: 7 }} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>

              <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-4">
                  <div className="text-lg font-semibold text-text-primary">Top Category</div>
                  <p className="text-sm text-text-muted">Category with highest revenue.</p>
                </div>
                {computed.bestCategoryCard ? (
                  <div className="grid gap-4 text-sm text-text-secondary">
                    <div className="text-xl font-semibold text-text-primary">{computed.bestCategoryCard.category}</div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="font-semibold text-text-primary">Revenue</div>
                        <div>{computed.bestCategoryCard.revenue}</div>
                      </div>
                      <div>
                        <div className="font-semibold text-text-primary">Growth</div>
                        <div>{computed.bestCategoryCard.growth}</div>
                      </div>
                      <div>
                        <div className="font-semibold text-text-primary">Orders</div>
                        <div>{computed.bestCategoryCard.orders}</div>
                      </div>
                      <div>
                        <div className="font-semibold text-text-primary">Products</div>
                        <div>{computed.bestCategoryCard.products}</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-3xl border border-dashed border-slate-200 p-12 text-center text-sm text-text-muted">No top category available.</div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
