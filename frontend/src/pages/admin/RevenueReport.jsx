import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAdminOrders } from '../../api/orders';
import { IndianRupee, ShoppingCart, LayoutGrid, Store, ChevronLeft, Award } from 'lucide-react';
import ReportHeader from '../../components/admin/ReportHeader';
import { printElement, downloadCSV } from '../../utils/exportUtils';
import ReportSkeleton from '../../components/admin/ReportSkeleton';
import SummaryCard from '../../components/admin/SummaryCard';
import { RevenueTrendChart, RevenueCategoryChart, RevenuePieChart } from '../../components/admin/RevenueCharts';
import ErrorBoundary from '../../components/admin/ErrorBoundary';

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

function RevenueReportContent() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('7days');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

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

  const stats = useMemo(() => {
    const revenueByMonthMap = new Map();
    const revenueByCategoryMap = new Map();
    const revenueByVendorMap = new Map();
    const productMap = new Map();

    let totalRevenue = 0;
    let totalOrders = 0;

    filteredOrders.forEach((order) => {
      const amount = parseFloat(order.finalAmount || order.totalAmount || 0) || 0;
      totalRevenue += amount;
      totalOrders += 1;

      const d = new Date(order.orderDate || order.createdAt || Date.now());
      const month = d.getMonth() + 1;
      const year = d.getFullYear();
      const isoKey = `${year}-${String(month).padStart(2, '0')}`;
      const monthLabel = d.toLocaleString('default', { month: 'short', year: 'numeric' });
      const existing = revenueByMonthMap.get(isoKey) || { label: monthLabel, value: 0 };
      existing.value += amount;
      revenueByMonthMap.set(isoKey, existing);

      (order.items || order.orderItems || []).forEach((item) => {
        const category = item.product?.category?.name || item.category?.name || 'Uncategorized';
        const vendor = item.product?.vendor?.storeName || item.vendor?.storeName || 'Unknown Vendor';
        const name = item.product?.name || item.productName || 'Unknown Product';
        const qty = parseInt(item.quantity || 0, 10) || 0;
        const itemRevenue = qty * (parseFloat(item.price || item.unitPrice || item.product?.price || 0) || 0);

        revenueByCategoryMap.set(category, (revenueByCategoryMap.get(category) || 0) + itemRevenue);
        revenueByVendorMap.set(vendor, (revenueByVendorMap.get(vendor) || 0) + itemRevenue);

        const productKey = `${name}|${category}|${vendor}`;
        const product = productMap.get(productKey) || { name, category, vendor, revenue: 0, orders: 0 };
        product.revenue += itemRevenue;
        product.orders += qty;
        productMap.set(productKey, product);
      });
    });

    const revenueTrend = computeTrend(totalRevenue, Math.max(totalRevenue - 120000, 1));
    const ordersTrend = computeTrend(totalOrders, Math.max(totalOrders - 10, 1));

    const trendVendorChart = Array.from(revenueByVendorMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    const topProducts = Array.from(productMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 8);

    const topVendors = trendVendorChart.slice(0, 6).map((vendor) => ({
      name: vendor.name,
      revenue: vendor.value,
      orders: filteredOrders.reduce((count, order) => count + (order.items || order.orderItems || []).reduce((sum, item) => sum + ((item.product?.vendor?.storeName || item.vendor?.storeName) === vendor.name ? (parseInt(item.quantity || 0, 10) || 0) : 0), 0), 0),
      productsSold: filteredOrders.reduce((sum, order) => sum + (order.items || order.orderItems || []).reduce((s, item) => s + (((item.product?.vendor?.storeName || item.vendor?.storeName) === vendor.name) ? (parseInt(item.quantity || 0, 10) || 0) : 0), 0), 0),
      commission: vendor.value * 0.05,
    }));

    const monthlyRevenue = Array.from(revenueByMonthMap.entries())
      .map(([iso, { label, value }]) => ({ iso, label, value }))
      .sort((a, b) => a.iso.localeCompare(b.iso))
      .map(({ label, value }) => ({ label, value }));

    const averageOrderValue = totalOrders > 0 ? (totalRevenue / totalOrders) : 0;

    return {
      totalRevenue,
      totalOrders,
      productsSold: filteredOrders.reduce((sum, order) => sum + (order.items || order.orderItems || []).reduce((count, item) => count + (parseInt(item.quantity || 0, 10) || 0), 0), 0),
      activeVendors: new Set(filteredOrders.flatMap((order) => (order.items || order.orderItems || []).map((item) => item.product?.vendor?.storeName || item.vendor?.storeName))).size,
      averageOrderValue,
      revenueTrend,
      ordersTrend,
      monthlyRevenue,
      categoryRevenue: Array.from(revenueByCategoryMap.entries()).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value),
      vendorRevenue: trendVendorChart,
      topProducts,
      topVendors,
    };
  }, [filteredOrders]);

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-text-muted mb-2">Admin Dashboard &gt; Reports &gt; Revenue</p>
            <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">Revenue Report</h1>
          </div>
          <Link to="/admin/reports" className="inline-flex items-center gap-2 text-xs font-bold text-violet-700 hover:text-violet-900 bg-violet-50 hover:bg-violet-100 rounded-xl px-4 py-2 border border-violet-100 transition-colors">
            <ChevronLeft size={16} /> Back to Reports
          </Link>
        </div>

        <ReportHeader
          filters={filterItems}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          onExportPDF={() => printElement(document.querySelector('.max-w-7xl'), 'Revenue Report')}
          onPrint={() => printElement(document.querySelector('.max-w-7xl'), 'Revenue Report')}
          onExportExcel={() => {
            const rows = stats.categoryRevenue.map((r) => ({ Category: r.name, Revenue: Number(r.value) }));
            const total = rows.reduce((s, r) => s + r.Revenue, 0);
            const enriched = rows.map((r) => ({ Category: r.Category, Revenue: r.Revenue, Percentage: ((r.Revenue / total) * 100).toFixed(1) }));
            downloadCSV('revenue-by-category.csv', enriched, ['Category', 'Revenue', 'Percentage']);
          }}
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
        />

        {loading ? (
          <ReportSkeleton />
        ) : (
          <>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 mb-8">
              <SummaryCard icon={IndianRupee} title="Total Revenue" value={formatCurrency(stats.totalRevenue)} detail="Platform sales revenue" trend={stats.revenueTrend} />
              <SummaryCard icon={ShoppingCart} title="Total Orders" value={stats.totalOrders} detail="Purchases completed" trend={stats.ordersTrend} />
              <SummaryCard icon={LayoutGrid} title="Products Sold" value={stats.productsSold} detail="Total items sold" trend={8} />
              <SummaryCard icon={Store} title="Active Vendors" value={stats.activeVendors} detail="Vendors making sales" trend={4} />
              <SummaryCard icon={Award} title="Avg. Order Value" value={formatCurrency(stats.averageOrderValue)} detail="Mean order size" trend={3} />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 mb-8">
              <div className="lg:col-span-1">
                <RevenuePieChart data={stats.categoryRevenue.length ? stats.categoryRevenue : [{ name: 'No data', value: 1 }]} />
              </div>
              <div className="lg:col-span-2">
                <RevenueTrendChart data={stats.monthlyRevenue.length ? stats.monthlyRevenue : [{ label: 'N/A', value: 0 }]} />
              </div>
            </div>

            <div className="mb-8">
              <RevenueCategoryChart data={stats.categoryRevenue.length ? stats.categoryRevenue : [{ name: 'No data', value: 1 }]} />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="glass rounded-[24px] p-6">
                <div className="mb-6">
                  <div className="text-lg font-bold text-text-primary tracking-tight">Top Revenue Generating Products</div>
                  <p className="text-xs text-text-muted mt-1">Catalog items driving highest gross sales volume.</p>
                </div>
                {stats.topProducts.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 p-12 text-center text-sm text-text-muted">No product revenue data available.</div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {stats.topProducts.map((product, idx) => (
                      <div key={`${product.name}-${idx}`} className="flex items-center justify-between gap-4 border border-slate-100 bg-slate-50/50 rounded-2xl p-4 transition-all duration-200 hover:bg-slate-50 hover:shadow-sm">
                        <div className="min-w-0">
                          <div className="font-bold text-sm text-text-primary truncate">{product.name}</div>
                          <div className="text-xs text-text-muted mt-0.5">{product.category} • {product.vendor}</div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-sm font-bold text-text-primary">{formatCurrency(product.revenue)}</div>
                          <div className="text-xs text-violet-600 font-semibold bg-violet-50 px-1.5 py-0.5 rounded-md mt-1 inline-block">{product.orders} sales</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="glass rounded-[24px] p-6">
                <div className="mb-6">
                  <div className="text-lg font-bold text-text-primary tracking-tight">Top Revenue Generating Vendors</div>
                  <p className="text-xs text-text-muted mt-1">Platform sellers contributing the highest GMV.</p>
                </div>
                {stats.topVendors.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 p-12 text-center text-sm text-text-muted">No vendor revenue data available.</div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {stats.topVendors.map((vendor, idx) => (
                      <div key={`${vendor.name}-${idx}`} className="flex items-center justify-between gap-4 border border-slate-100 bg-slate-50/50 rounded-2xl p-4 transition-all duration-200 hover:bg-slate-50 hover:shadow-sm">
                        <div className="min-w-0">
                          <div className="font-bold text-sm text-text-primary truncate">{vendor.name}</div>
                          <div className="text-xs text-text-muted mt-0.5">Total sold: {vendor.productsSold} items</div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-sm font-bold text-text-primary">{formatCurrency(vendor.revenue)}</div>
                          <div className="text-xs text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded-md mt-1 inline-block">Comm: {formatCurrency(vendor.commission)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function RevenueReport() {
  return (
    <ErrorBoundary>
      <RevenueReportContent />
    </ErrorBoundary>
  );
}
