import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAdminOrders } from '../../api/orders';
import { DollarSign, ShoppingCart, LayoutGrid, Store, ChevronLeft } from 'lucide-react';
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
  }, [activeFilter, orders]);

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

    return {
      totalRevenue,
      totalOrders,
      productsSold: filteredOrders.reduce((sum, order) => sum + (order.items || order.orderItems || []).reduce((count, item) => count + (parseInt(item.quantity || 0, 10) || 0), 0), 0),
      activeVendors: new Set(filteredOrders.flatMap((order) => (order.items || order.orderItems || []).map((item) => item.product?.vendor?.storeName || item.vendor?.storeName))).size,
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
            <h1 className="text-3xl font-extrabold tracking-tight">Revenue Report</h1>
          </div>
          <Link to="/admin/reports" className="inline-flex items-center gap-2 text-sm font-semibold text-violet-700 hover:text-violet-900">
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
            // export category revenue as CSV
            const rows = stats.categoryRevenue.map((r) => ({ Category: r.name, Revenue: Number(r.value) }));
            const total = rows.reduce((s, r) => s + r.Revenue, 0);
            const enriched = rows.map((r) => ({ Category: r.Category, Revenue: r.Revenue, Percentage: ((r.Revenue / total) * 100).toFixed(1) }));
            downloadCSV('revenue-by-category.csv', enriched, ['Category', 'Revenue', 'Percentage']);
          }}
        />

        {loading ? (
          <ReportSkeleton />
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-4 mb-6">
              <SummaryCard icon={() => <DollarSign size={20} />} title="Total Revenue" value={formatCurrency(stats.totalRevenue)} detail="Revenue for selected period" trend={stats.revenueTrend} />
              <SummaryCard icon={() => <ShoppingCart size={20} />} title="Total Orders" value={stats.totalOrders} detail="Orders in selected period" trend={stats.ordersTrend} />
              <SummaryCard icon={() => <LayoutGrid size={20} />} title="Products Sold" value={stats.productsSold} detail="Total items sold" trend={8} />
              <SummaryCard icon={() => <Store size={20} />} title="Active Vendors" value={stats.activeVendors} detail="Vendors making sales" trend={4} />
            </div>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-3 mb-6">
              <RevenueTrendChart data={stats.monthlyRevenue.length ? stats.monthlyRevenue : [{ label: 'N/A', value: 0 }]} />
              <RevenueCategoryChart data={stats.categoryRevenue.length ? stats.categoryRevenue : [{ name: 'No data', value: 1 }]} />
              <RevenuePieChart data={stats.vendorRevenue.length ? stats.vendorRevenue : [{ name: 'No data', value: 1 }]} />
            </div>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2 mb-6">
              <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between gap-4 mb-6">
                  <div>
                    <div className="text-lg font-semibold text-text-primary">Top Revenue Generating Products</div>
                    <p className="text-sm text-text-muted">Products driving the most revenue.</p>
                  </div>
                </div>
                {stats.topProducts.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-slate-200 p-12 text-center text-sm text-text-muted">No product revenue data available.</div>
                ) : (
                  <div className="space-y-4">
                    {stats.topProducts.map((product, idx) => (
                      <div key={`${product.name}-${idx}`} className="grid grid-cols-1 gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-2 md:items-center">
                        <div>
                          <div className="font-semibold text-text-primary">{product.name}</div>
                          <div className="text-sm text-text-muted">{product.category} • {product.vendor}</div>
                        </div>
                        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-text-secondary">
                          <span className="font-semibold">{formatCurrency(product.revenue)}</span>
                          <span>{product.orders} orders</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between gap-4 mb-6">
                  <div>
                    <div className="text-lg font-semibold text-text-primary">Top Revenue Generating Vendors</div>
                    <p className="text-sm text-text-muted">Vendors with the highest revenue.</p>
                  </div>
                </div>
                {stats.topVendors.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-slate-200 p-12 text-center text-sm text-text-muted">No vendor revenue data available.</div>
                ) : (
                  <div className="grid gap-4">
                    {stats.topVendors.map((vendor, idx) => (
                      <div key={`${vendor.name}-${idx}`} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <div className="font-semibold text-text-primary">{vendor.name}</div>
                            <div className="text-sm text-text-muted">Products sold: {vendor.productsSold}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">{formatCurrency(vendor.revenue)}</div>
                            <div className="text-sm text-text-muted">Comm. {formatCurrency(vendor.commission)}</div>
                          </div>
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

