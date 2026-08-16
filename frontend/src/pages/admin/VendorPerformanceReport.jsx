import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getVendorEarnings } from '../../api/orders';
import { getAllVendors } from '../../api/vendors';
import ReportHeader from '../../components/admin/ReportHeader';
import { printElement, downloadCSV } from '../../utils/exportUtils';
import ReportSkeleton from '../../components/admin/ReportSkeleton';
import SummaryCard from '../../components/admin/SummaryCard';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { ChevronLeft, Store, IndianRupee, Award, Star, AlertTriangle, TrendingUp } from 'lucide-react';

const filterItems = [
  { label: 'Today', value: 'today' },
  { label: 'Last 7 Days', value: '7days' },
  { label: 'Last Month', value: 'lastmonth' },
  { label: 'Last 6 Months', value: '6months' },
  { label: 'Custom Range', value: 'custom' },
];

const COLORS = ['#7C3AED', '#8B5CF6', '#A855F7', '#C084FC', '#E9D5FF', '#4F46E5', '#9333EA'];

function formatCurrency(value) {
  return `₹${Number(value || 0).toLocaleString()}`;
}

function friendlyStatus(status) {
  if (!status) return 'Active';
  return status.toString().toUpperCase() === 'INACTIVE' ? 'Inactive' : 'Active';
}

function CustomChartTooltip({ active, payload, label, prefix = '', suffix = '' }) {
  if (!active || !payload || !payload.length) return null;
  const val = payload[0].value;
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/95 backdrop-blur-md px-4 py-3 shadow-xl text-xs transition-all duration-200">
      <div className="font-semibold text-text-primary mb-1">{label || payload[0].name}</div>
      <div className="font-bold text-violet-600 text-sm flex items-center gap-1">
        <span>{prefix}{Number(val).toLocaleString()}{suffix}</span>
      </div>
    </div>
  );
}

export default function VendorPerformanceReport() {
  const [vendorEarnings, setVendorEarnings] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('7days');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [vendorFilter, setVendorFilter] = useState('all');

  useEffect(() => {
    setLoading(true);
    Promise.all([getVendorEarnings(), getAllVendors()])
      .then(([earningsRes, vendorsRes]) => {
        setVendorEarnings(earningsRes.data || []);
        setVendors(vendorsRes.data || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const computed = useMemo(() => {
    const rows = vendorEarnings.map((vendor) => ({
      vendorName: vendor.vendorName || 'Unknown Vendor',
      status: vendor.status || 'UNKNOWN',
      totalSales: Number(vendor.totalSales || 0),
      totalCommission: Number(vendor.totalCommission || 0),
      totalPayout: Number(vendor.totalPayout || 0),
      completedOrders: vendor.completedOrders || 0,
      commissionRate: Number(vendor.commissionRate || 0),
    }));

    const filteredByStatus = statusFilter === 'all'
      ? rows
      : rows.filter((vendor) => vendor.status.toLowerCase() === statusFilter);

    const filteredByVendor = vendorFilter === 'all'
      ? filteredByStatus
      : filteredByStatus.filter((vendor) => vendor.vendorName === vendorFilter);

    const sortedVendors = [...filteredByVendor].sort((a, b) => b.totalSales - a.totalSales);
    const totalSales = sortedVendors.reduce((sum, item) => sum + item.totalSales, 0);
    const totalPayout = sortedVendors.reduce((sum, item) => sum + item.totalPayout, 0);
    const totalCommission = sortedVendors.reduce((sum, item) => sum + item.totalCommission, 0);
    const totalVendors = vendors.length;
    const activeVendors = vendors.filter((vendor) => friendlyStatus(vendor.status) === 'Active').length;
    const avgCommissionRate = sortedVendors.length === 0 ? 0 : sortedVendors.reduce((sum, item) => sum + item.commissionRate, 0) / sortedVendors.length;

    const rankTable = sortedVendors.map((vendor, idx) => ({
      id: idx,
      vendorName: vendor.vendorName,
      totalSales: vendor.totalSales,
      totalCommission: vendor.totalCommission,
      totalPayout: vendor.totalPayout,
      completedOrders: vendor.completedOrders,
      commissionRate: `${(vendor.commissionRate * 100).toFixed(1)}%`,
      status: vendor.status,
    }));

    const revenueChartData = sortedVendors.slice(0, 10).map((vendor) => ({ name: vendor.vendorName, revenue: Math.round(vendor.totalPayout) }));
    const orderDistribution = sortedVendors.slice(0, 8).map((vendor) => ({ name: vendor.vendorName, value: vendor.completedOrders }));
    const bestVendor = sortedVendors[0] || null;
    const worstVendor = sortedVendors[sortedVendors.length - 1] || null;

    return {
      totalSales,
      totalCommission,
      totalPayout,
      totalVendors,
      activeVendors,
      avgCommissionRate,
      rankTable,
      revenueChartData,
      orderDistribution,
      bestVendor,
      worstVendor,
      vendorOptions: ['all', ...new Set(rows.map((vendor) => vendor.vendorName))],
    };
  }, [vendorEarnings, vendors, statusFilter, vendorFilter]);

  const vendorOptions = computed.vendorOptions || ['all'];
  const statusOptions = ['all', 'Active', 'Inactive'];

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-text-muted mb-2">Admin Dashboard &gt; Reports &gt; Vendor Performance</p>
            <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">Vendor Performance</h1>
          </div>
          <Link to="/admin/reports" className="inline-flex items-center gap-2 text-xs font-bold text-violet-700 hover:text-violet-900 bg-violet-50 hover:bg-violet-100 rounded-xl px-4 py-2 border border-violet-100 transition-colors">
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
            const rows = computed.rankTable.map((r) => ({ Vendor: r.vendorName, Status: r.status, Orders: r.completedOrders, TotalSales: r.totalSales, Commission: r.totalCommission, Payout: r.totalPayout, CommissionRate: r.commissionRate }));
            downloadCSV('vendor-performance.csv', rows, ['Vendor', 'Status', 'Orders', 'TotalSales', 'Commission', 'Payout', 'CommissionRate']);
          }}
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
        />

        {/* Filters Select Cards */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3 mb-8">
          <div className="glass rounded-[24px] p-5 flex flex-col gap-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Filter by Store</label>
            <select value={vendorFilter} onChange={(e) => setVendorFilter(e.target.value)} className="w-full bg-slate-100 border border-slate-200/50 rounded-xl px-3 py-2 text-xs font-semibold text-text-secondary outline-none focus:border-violet-500 focus:bg-white transition-colors cursor-pointer">
              {vendorOptions.map((vendor) => (
                <option key={vendor} value={vendor}>{vendor === 'all' ? 'All Vendors' : vendor}</option>
              ))}
            </select>
          </div>
          <div className="glass rounded-[24px] p-5 flex flex-col gap-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Filter by Status</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full bg-slate-100 border border-slate-200/50 rounded-xl px-3 py-2 text-xs font-semibold text-text-secondary outline-none focus:border-violet-500 focus:bg-white transition-colors cursor-pointer">
              {statusOptions.map((status) => (
                <option key={status} value={status === 'all' ? 'all' : status.toLowerCase()}>{status}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <ReportSkeleton />
        ) : (
          <>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5 mb-8">
              <SummaryCard icon={IndianRupee} title="Total Sales (GMV)" value={formatCurrency(computed.totalSales)} detail="Gross customer sales" />
              <SummaryCard icon={IndianRupee} title="Commission Deducted" value={formatCurrency(computed.totalCommission)} detail="Platform revenue earned" />
              <SummaryCard icon={IndianRupee} title="Final Payout" value={formatCurrency(computed.totalPayout)} detail="Vendor take-home payout" />
              <SummaryCard icon={Store} title="Active Vendors" value={`${computed.activeVendors} / ${computed.totalVendors}`} detail="Registered stores" />
              <SummaryCard icon={Award} title="Completed Orders" value={computed.rankTable.reduce((s, r) => s + (r.completedOrders || 0), 0)} detail="Fulfillment orders" />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 mb-8">
              
              {/* Ranking Chart */}
              <div className="lg:col-span-2 glass rounded-[24px] p-6 transition-all duration-300 hover:shadow-lg">
                <div className="mb-6">
                  <div className="text-lg font-bold text-text-primary tracking-tight">Vendor Revenue Ranking</div>
                  <p className="text-xs text-text-muted mt-0.5">Top performing sellers by overall GMV output.</p>
                </div>
                {computed.revenueChartData.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 p-12 text-center text-sm text-text-muted">No vendor revenue available.</div>
                ) : (
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart layout="vertical" data={computed.revenueChartData} margin={{ top: 10, right: 10, left: 30, bottom: 10 }}>
                        <CartesianGrid stroke="#F1F5F9" strokeDasharray="3 3" horizontal={false} />
                        <XAxis type="number" stroke="#94A3B8" tick={{ fill: '#64748B', fontSize: 10 }} tickLine={false} axisLine={false} />
                        <YAxis dataKey="name" type="category" width={90} stroke="#94A3B8" tick={{ fill: '#64748B', fontSize: 10, fontWeight: 600 }} tickLine={false} axisLine={false} />
                        <Tooltip content={<CustomChartTooltip prefix="₹" />} />
                        <Bar dataKey="revenue" fill="#7C3AED" radius={[0, 8, 8, 0]} maxBarSize={30} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              {/* Order Distribution Chart */}
              <div className="glass rounded-[24px] p-6 transition-all duration-300 hover:shadow-lg">
                <div className="mb-6">
                  <div className="text-lg font-bold text-text-primary tracking-tight">Vendor Order Share</div>
                  <p className="text-xs text-text-muted mt-0.5">Physical checkout items share per store.</p>
                </div>
                {computed.orderDistribution.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 p-12 text-center text-sm text-text-muted">No order distribution data.</div>
                ) : (
                  <div className="h-[300px] w-full flex flex-col justify-center">
                    <ResponsiveContainer width="100%" height={240}>
                      <PieChart>
                        <Pie
                          data={computed.orderDistribution}
                          dataKey="value"
                          nameKey="name"
                          innerRadius={60}
                          outerRadius={75}
                          paddingAngle={3}
                        >
                          {computed.orderDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className="focus:outline-none" />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomChartTooltip suffix=" checkouts" />} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="mt-2 text-center text-[10px] text-text-muted font-bold uppercase tracking-wider">
                      Orders Distributed Across Top Sellers
                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* Vendor Ranking Table Card */}
            <div className="glass rounded-[24px] p-6 mb-8">
              <div className="mb-6">
                <div className="text-lg font-bold text-text-primary tracking-tight">Sellers Ranking Directory</div>
                <p className="text-xs text-text-muted mt-1">Comprehensive listings of performance statistics across active vendor channels.</p>
              </div>
              {computed.rankTable.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 p-12 text-center text-sm text-text-muted">No vendor performance data available.</div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-100 bg-white">
                  <table className="min-w-full divide-y divide-slate-100 text-sm text-left">
                    <thead className="bg-slate-50 text-[11px] font-bold text-text-muted uppercase tracking-wider">
                      <tr>
                        <th className="px-6 py-4">Vendor Name</th>
                        <th className="px-6 py-4">Orders</th>
                        <th className="px-6 py-4">Total Sales</th>
                        <th className="px-6 py-4">Commission</th>
                        <th className="px-6 py-4">Payout</th>
                        <th className="px-6 py-4">Commission Rate</th>
                        <th className="px-6 py-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-text-secondary">
                      {computed.rankTable.map((row) => (
                        <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4 font-bold text-text-primary">{row.vendorName}</td>
                          <td className="px-6 py-4">{row.completedOrders}</td>
                          <td className="px-6 py-4 font-bold text-violet-600">{formatCurrency(row.totalSales)}</td>
                          <td className="px-6 py-4 text-rose-600">{formatCurrency(row.totalCommission)}</td>
                          <td className="px-6 py-4 text-emerald-600">{formatCurrency(row.totalPayout)}</td>
                          <td className="px-6 py-4">{row.commissionRate}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                              row.status === 'Active' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-slate-50 border-slate-100 text-slate-500'
                            }`}>
                              {row.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Top Leaderboard Details */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              
              {/* Best Performers */}
              <div className="glass rounded-[24px] p-6 transition-all duration-300 hover:shadow-lg">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <div className="text-lg font-bold text-text-primary tracking-tight">Best Performing Merchant</div>
                    <p className="text-xs text-text-muted mt-0.5">Seller with highest total GMV transaction rates.</p>
                  </div>
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-violet-600 border border-violet-100">
                    <TrendingUp size={16} />
                  </span>
                </div>
                {computed.bestVendor ? (
                  <div className="space-y-4">
                    <div className="text-2xl font-extrabold text-violet-600 bg-violet-50 px-4 py-3 rounded-2xl border border-violet-100/50 w-fit">
                      {computed.bestVendor.vendorName}
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
                      <div className="bg-slate-50/50 border border-slate-100 p-3 rounded-xl">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Total Sales</div>
                        <div className="text-sm font-bold text-text-primary mt-0.5">{formatCurrency(computed.bestVendor.totalSales)}</div>
                      </div>
                      <div className="bg-slate-50/50 border border-slate-100 p-3 rounded-xl">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Completed Orders</div>
                        <div className="text-sm font-bold text-text-primary mt-0.5">{computed.bestVendor.completedOrders} orders</div>
                      </div>
                      <div className="bg-slate-50/50 border border-slate-100 p-3 rounded-xl">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Total Payout</div>
                        <div className="text-sm font-bold text-emerald-600 mt-0.5">{formatCurrency(computed.bestVendor.totalPayout)}</div>
                      </div>
                      <div className="bg-slate-50/50 border border-slate-100 p-3 rounded-xl">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Commission Rate</div>
                        <div className="text-sm font-bold text-amber-600 mt-0.5">{computed.bestVendor.commissionRate}</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-200 p-12 text-center text-sm text-text-muted">No best vendor available.</div>
                )}
              </div>

              {/* Lowest Performers */}
              <div className="glass rounded-[24px] p-6 transition-all duration-300 hover:shadow-lg">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <div className="text-lg font-bold text-text-primary tracking-tight">Lowest Performing Merchant</div>
                    <p className="text-xs text-text-muted mt-0.5">Seller with lowest transaction volume.</p>
                  </div>
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
                    <AlertTriangle size={16} />
                  </span>
                </div>
                {computed.worstVendor ? (
                  <div className="space-y-4">
                    <div className="text-2xl font-extrabold text-amber-600 bg-amber-50 px-4 py-3 rounded-2xl border border-amber-100/50 w-fit">
                      {computed.worstVendor.vendorName}
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
                      <div className="bg-slate-50/50 border border-slate-100 p-3 rounded-xl">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Total Sales</div>
                        <div className="text-sm font-bold text-text-primary mt-0.5">{formatCurrency(computed.worstVendor.totalSales)}</div>
                      </div>
                      <div className="bg-slate-50/50 border border-slate-100 p-3 rounded-xl">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Completed Orders</div>
                        <div className="text-sm font-bold text-text-primary mt-0.5">{computed.worstVendor.completedOrders} orders</div>
                      </div>
                      <div className="bg-slate-50/50 border border-slate-100 p-3 rounded-xl">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Total Payout</div>
                        <div className="text-sm font-bold text-emerald-600 mt-0.5">{formatCurrency(computed.worstVendor.totalPayout)}</div>
                      </div>
                      <div className="bg-slate-50/50 border border-slate-100 p-3 rounded-xl">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Commission Rate</div>
                        <div className="text-sm font-bold text-amber-600 mt-0.5">{computed.worstVendor.commissionRate}</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-200 p-12 text-center text-sm text-text-muted">No lowest vendor available.</div>
                )}
              </div>

            </div>
          </>
        )}
      </div>
    </div>
  );
}
