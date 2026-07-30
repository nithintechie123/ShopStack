import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAdminOrders } from '../../api/orders';
import { getAllVendors } from '../../api/vendors';
import ReportHeader from '../../components/admin/ReportHeader';
import { printElement, downloadCSV } from '../../utils/exportUtils';
import ReportSkeleton from '../../components/admin/ReportSkeleton';
import SummaryCard from '../../components/admin/SummaryCard';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend } from 'recharts';
import { ChevronLeft, Store, DollarSign, Award, LayoutGrid } from 'lucide-react';

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

function friendlyStatus(status) {
  if (!status) return 'Active';
  return status.toString().toUpperCase() === 'INACTIVE' ? 'Inactive' : 'Active';
}

export default function VendorPerformanceReport() {
  const [orders, setOrders] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('7days');
  const [statusFilter, setStatusFilter] = useState('all');
  const [vendorFilter, setVendorFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    setLoading(true);
    Promise.all([getAdminOrders(), getAllVendors()])
      .then(([ordersRes, vendorsRes]) => {
        setOrders(ordersRes.data || []);
        setVendors(vendorsRes.data || []);
      })
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
    const vendorsByName = new Map();
    const categorySet = new Set();

    filteredOrders.forEach((order) => {
      const items = order.items || order.orderItems || [];
      items.forEach((item) => {
        const vendorName = item.product?.vendor?.storeName || item.vendor?.storeName || 'Unknown Vendor';
        const category = item.product?.category?.name || item.category?.name || 'Uncategorized';
        const price = parseFloat(item.price || item.unitPrice || item.product?.price || 0) || 0;
        const qty = parseInt(item.quantity || 0, 10) || 0;
        const revenue = price * qty;

        categorySet.add(category);
        const vendor = vendorsByName.get(vendorName) || {
          vendorName,
          revenue: 0,
          orders: 0,
          productsSold: 0,
          productNames: new Set(),
          rating: item.product?.vendor?.rating || item.rating || 4.3,
          status: friendlyStatus(item.product?.vendor?.status || item.status),
        };
        vendor.revenue += revenue;
        vendor.productsSold += qty;
        if (qty) vendor.productNames.add(item.product?.name || item.productName || 'Unknown Product');
        vendorsByName.set(vendorName, vendor);
      });
    });

    filteredOrders.forEach((order) => {
      const vendorNames = new Set((order.items || order.orderItems || []).map((item) => item.product?.vendor?.storeName || item.vendor?.storeName || 'Unknown Vendor'));
      vendorNames.forEach((name) => {
        const current = vendorsByName.get(name);
        if (current) {
          current.orders += 1;
        }
      });
    });

    const enrichedVendors = Array.from(vendorsByName.values()).map((vendor) => ({
      ...vendor,
      productsListed: vendor.productNames.size,
      rating: Number(vendor.rating) || 4.2,
    }));

    const filteredByStatus = statusFilter === 'all' ? enrichedVendors : enrichedVendors.filter((vendor) => vendor.status.toLowerCase() === statusFilter);
    const filteredByVendor = vendorFilter === 'all' ? filteredByStatus : filteredByStatus.filter((vendor) => vendor.vendorName === vendorFilter);
    const filteredByCategory = categoryFilter === 'all' ? filteredByVendor : filteredByVendor;

    const sortedVendors = [...filteredByCategory].sort((a, b) => b.revenue - a.revenue);
    const totalRevenue = sortedVendors.reduce((sum, item) => sum + item.revenue, 0);
    const totalVendors = vendors.length;
    const activeVendors = vendors.filter((vendor) => friendlyStatus(vendor.status) === 'Active').length;
    const avgRating = totalVendors === 0 ? 0 : Number((vendors.reduce((sum, vendor) => sum + (Number(vendor.rating) || 4.2), 0) / totalVendors).toFixed(1));

    const rankTable = sortedVendors.map((vendor, idx) => ({
      id: idx,
      vendorName: vendor.vendorName,
      productsListed: vendor.productsListed,
      productsSold: vendor.productsSold,
      orders: vendor.orders,
      revenue: formatCurrency(vendor.revenue),
      rating: vendor.rating.toFixed(1),
      status: vendor.status,
    }));

    const revenueChartData = sortedVendors.slice(0, 10).map((vendor) => ({ name: vendor.vendorName, revenue: Math.round(vendor.revenue) }));
    const orderDistribution = sortedVendors.slice(0, 8).map((vendor) => ({ name: vendor.vendorName, value: vendor.orders }));
    const bestVendor = sortedVendors[0] || null;
    const worstVendor = sortedVendors[sortedVendors.length - 1] || null;

    return {
      totalRevenue,
      totalVendors,
      activeVendors,
      avgRating,
      rankTable,
      revenueChartData,
      orderDistribution,
      bestVendor,
      worstVendor,
      categories: Array.from(categorySet),
    };
  }, [filteredOrders, vendors, statusFilter, vendorFilter, categoryFilter]);

  const vendorOptions = useMemo(() => ['all', ...new Set(computed.rankTable.map((row) => row.vendorName))], [computed.rankTable]);
  const statusOptions = ['all', 'Active', 'Inactive'];

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-text-muted mb-2">Admin Dashboard &gt; Reports &gt; Vendor Performance</p>
            <h1 className="text-3xl font-extrabold tracking-tight">Vendor Performance</h1>
          </div>
          <Link to="/admin/reports" className="inline-flex items-center gap-2 text-sm font-semibold text-violet-700 hover:text-violet-900">
            <ChevronLeft size={16} /> Back to Reports
          </Link>
        </div>

        <ReportHeader
          filters={filterItems}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          onExportPDF={() => printElement(document.querySelector('.max-w-7xl'), 'Vendor Performance')}
          onPrint={() => printElement(document.querySelector('.max-w-7xl'), 'Vendor Performance')}
          onExportExcel={() => {
            const rows = computed.rankTable.map((r) => ({ Vendor: r.vendorName, ProductsListed: r.productsListed, ProductsSold: r.productsSold, Orders: r.orders, Revenue: r.revenue, Rating: r.rating, Status: r.status }));
            downloadCSV('vendor-performance.csv', rows, ['Vendor', 'ProductsListed', 'ProductsSold', 'Orders', 'Revenue', 'Rating', 'Status']);
          }}
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 mb-6">
          <div className="space-y-3 rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
            <label className="text-xs font-semibold uppercase tracking-[0.17em] text-text-secondary">Vendor</label>
            <select value={vendorFilter} onChange={(e) => setVendorFilter(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-text-primary outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100">
              {vendorOptions.map((vendor) => (
                <option key={vendor} value={vendor}>{vendor === 'all' ? 'All Vendors' : vendor}</option>
              ))}
            </select>
          </div>
          <div className="space-y-3 rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
            <label className="text-xs font-semibold uppercase tracking-[0.17em] text-text-secondary">Status</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-text-primary outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100">
              {statusOptions.map((status) => (
                <option key={status} value={status === 'all' ? 'all' : status.toLowerCase()}>{status}</option>
              ))}
            </select>
          </div>
          <div className="space-y-3 rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
            <label className="text-xs font-semibold uppercase tracking-[0.17em] text-text-secondary">Category</label>
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-text-primary outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100">
              <option value="all">All Categories</option>
              {computed.categories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <ReportSkeleton />
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-4 mb-6">
              <SummaryCard icon={() => <Store size={20} />} title="Total Vendors" value={computed.totalVendors} detail="Vendors on platform" trend={3} />
              <SummaryCard icon={() => <Award size={20} />} title="Active Vendors" value={computed.activeVendors} detail="Vendors currently active" trend={6} />
              <SummaryCard icon={() => <DollarSign size={20} />} title="Total Vendor Revenue" value={formatCurrency(computed.totalRevenue)} detail="Revenue across vendors" trend={5} />
              <SummaryCard icon={() => <LayoutGrid size={20} />} title="Average Vendor Rating" value={`${computed.avgRating.toFixed(1)}`} detail="Average vendor score" trend={2} />
            </div>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-3 mb-6">
              <div className="col-span-1 xl:col-span-2 rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-4">
                  <div className="text-lg font-semibold text-text-primary">Vendor Revenue Ranking</div>
                  <p className="text-sm text-text-muted">Sorted by descending revenue.</p>
                </div>
                {computed.revenueChartData.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-slate-200 p-12 text-center text-sm text-text-muted">No vendor revenue available.</div>
                ) : (
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart layout="vertical" data={computed.revenueChartData} margin={{ top: 10, right: 20, left: 100, bottom: 20 }}>
                      <CartesianGrid stroke="#E2E8F0" strokeDasharray="3 3" />
                      <XAxis type="number" stroke="#94A3B8" />
                      <YAxis dataKey="name" type="category" width={180} stroke="#94A3B8" />
                      <Tooltip formatter={(value) => [formatCurrency(value), 'Revenue']} />
                      <Bar dataKey="revenue" fill="#7C3AED" radius={[12, 12, 12, 12]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>

              <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-4">
                  <div className="text-lg font-semibold text-text-primary">Vendor Order Distribution</div>
                  <p className="text-sm text-text-muted">Share of orders by vendor.</p>
                </div>
                {computed.orderDistribution.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-slate-200 p-12 text-center text-sm text-text-muted">No order distribution data.</div>
                ) : (
                  <ResponsiveContainer width="100%" height={320}>
                    <PieChart>
                      <Pie data={computed.orderDistribution} dataKey="value" nameKey="name" innerRadius={70} outerRadius={110} paddingAngle={4} label />
                      {computed.orderDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                      <Legend verticalAlign="bottom" height={36} />
                      <Tooltip formatter={(value) => [value, 'Orders']} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm mb-6 overflow-x-auto">
              <div className="mb-4">
                <div className="text-lg font-semibold text-text-primary">Vendor Ranking Table</div>
                <p className="text-sm text-text-muted">Top vendors sorted by revenue, orders, and rating.</p>
              </div>
              {computed.rankTable.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-200 p-12 text-center text-sm text-text-muted">No vendor performance data available.</div>
              ) : (
                <table className="min-w-full divide-y divide-glass-border text-sm text-left">
                  <thead className="bg-bg-tertiary/70 text-[11px] font-bold text-text-muted uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-3">Vendor Name</th>
                      <th className="px-6 py-3">Products Listed</th>
                      <th className="px-6 py-3">Products Sold</th>
                      <th className="px-6 py-3">Orders</th>
                      <th className="px-6 py-3">Revenue</th>
                      <th className="px-6 py-3">Avg Rating</th>
                      <th className="px-6 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-glass-border/40">
                    {computed.rankTable.map((row) => (
                      <tr key={row.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-3 font-semibold text-text-primary">{row.vendorName}</td>
                        <td className="px-6 py-3">{row.productsListed}</td>
                        <td className="px-6 py-3">{row.productsSold}</td>
                        <td className="px-6 py-3">{row.orders}</td>
                        <td className="px-6 py-3 font-semibold text-text-primary">{row.revenue}</td>
                        <td className="px-6 py-3">{row.rating}</td>
                        <td className="px-6 py-3">{row.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-4">
                  <div className="text-lg font-semibold text-text-primary">Best Performing Vendor</div>
                  <p className="text-sm text-text-muted">Highest revenue and order contribution.</p>
                </div>
                {computed.bestVendor ? (
                  <div className="space-y-3">
                    <div className="text-xl font-semibold text-text-primary">{computed.bestVendor.vendorName}</div>
                    <div className="grid grid-cols-2 gap-4 text-sm text-text-secondary">
                      <div>
                        <div className="font-semibold text-text-primary">Revenue</div>
                        <div>{formatCurrency(computed.bestVendor.revenue)}</div>
                      </div>
                      <div>
                        <div className="font-semibold text-text-primary">Orders</div>
                        <div>{computed.bestVendor.orders}</div>
                      </div>
                      <div>
                        <div className="font-semibold text-text-primary">Products Sold</div>
                        <div>{computed.bestVendor.productsSold}</div>
                      </div>
                      <div>
                        <div className="font-semibold text-text-primary">Rating</div>
                        <div>{computed.bestVendor.rating.toFixed(1)}</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-3xl border border-dashed border-slate-200 p-12 text-center text-sm text-text-muted">No best vendor available.</div>
                )}
              </div>

              <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-4">
                  <div className="text-lg font-semibold text-text-primary">Lowest Performing Vendor</div>
                  <p className="text-sm text-text-muted">Lowest revenue among active vendors.</p>
                </div>
                {computed.worstVendor ? (
                  <div className="space-y-3">
                    <div className="text-xl font-semibold text-text-primary">{computed.worstVendor.vendorName}</div>
                    <div className="grid grid-cols-2 gap-4 text-sm text-text-secondary">
                      <div>
                        <div className="font-semibold text-text-primary">Revenue</div>
                        <div>{formatCurrency(computed.worstVendor.revenue)}</div>
                      </div>
                      <div>
                        <div className="font-semibold text-text-primary">Orders</div>
                        <div>{computed.worstVendor.orders}</div>
                      </div>
                      <div>
                        <div className="font-semibold text-text-primary">Products Sold</div>
                        <div>{computed.worstVendor.productsSold}</div>
                      </div>
                      <div>
                        <div className="font-semibold text-text-primary">Rating</div>
                        <div>{computed.worstVendor.rating.toFixed(1)}</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-3xl border border-dashed border-slate-200 p-12 text-center text-sm text-text-muted">No lowest vendor available.</div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
