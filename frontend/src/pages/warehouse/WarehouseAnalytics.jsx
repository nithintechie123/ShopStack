import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { getWarehouseAnalytics, getWarehouseInventory, getShipments } from '../../api/warehouse';
import { BarChart3 } from 'lucide-react';

const colors = ['#4338ca', '#0f766e', '#c026d3', '#e11d48', '#f59e0b'];

export default function WarehouseAnalytics() {
  const [data, setData] = useState({
    totalInventory: 0,
    allocatedOrders: 0,
    pickedOrders: 0,
    packedOrders: 0,
    totalShipments: 0,
    inventoryByCategory: [],
    shipmentStatus: [],
    topInventory: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [analyticsRes, inventoryRes, shipmentsRes] = await Promise.all([
          getWarehouseAnalytics(),
          getWarehouseInventory(),
          getShipments(),
        ]);

        const analytics = analyticsRes.data || {};
        const inventory = inventoryRes.data || [];
        const shipments = shipmentsRes.data || [];

        // Compute inventory by category
        const categoryMap = {};
        inventory.forEach((item) => {
          const cat = item.product?.category?.name || 'Uncategorized';
          categoryMap[cat] = (categoryMap[cat] || 0) + (item.availableQuantity || 0);
        });
        const inventoryByCategory = Object.keys(categoryMap).map((key) => ({
          category: key,
          value: categoryMap[key],
        }));

        // Compute shipment statuses
        const statusMap = {};
        shipments.forEach((item) => {
          const status = item.shipmentStatus || 'UNKNOWN';
          statusMap[status] = (statusMap[status] || 0) + 1;
        });
        const shipmentStatus = Object.keys(statusMap).map((key) => ({
          name: key,
          value: statusMap[key],
        }));

        // Top inventory items
        const topInventory = inventory
          .sort((a, b) => (b.availableQuantity || 0) - (a.availableQuantity || 0))
          .slice(0, 5)
          .map((item) => ({
            product: item.product?.name || 'Unknown',
            stock: item.availableQuantity,
            movement: item.availableQuantity > 50 ? 'IN' : 'OUT',
          }));

        setData({
          totalInventory: analytics.totalAvailableStock || 0,
          allocatedOrders: analytics.allocatedOrders || 0,
          pickedOrders: analytics.pickedOrders || 0,
          packedOrders: analytics.packedOrders || 0,
          totalShipments: analytics.totalShipments || 0,
          inventoryByCategory,
          shipmentStatus,
          topInventory,
        });
      } catch (err) {
        console.error('Failed to load warehouse analytics', err);
        setError('Failed to load analytics.');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="flex items-center gap-3 gradient-text text-3xl font-extrabold tracking-tight">
          <BarChart3 size={28} className="text-accent-primary shrink-0" />
          <span>Warehouse Analytics</span>
        </h1>
        <p className="text-sm text-text-secondary mt-1.5 font-medium">Performance insights for inventory volumes, order packing, and shipping logs.</p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-accent-danger/10 border border-accent-danger/20 text-accent-danger text-sm font-semibold">
          {error}
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid gap-5 grid-cols-2 md:grid-cols-3 lg:grid-cols-5 mb-8">
        {[
          { title: 'Total Inventory Stock', value: data.totalInventory },
          { title: 'Allocated Orders', value: data.allocatedOrders },
          { title: 'Picked Orders', value: data.pickedOrders },
          { title: 'Packed Orders', value: data.packedOrders },
          { title: 'Total Shipments', value: data.totalShipments },
        ].map((card) => (
          <div key={card.title} className="rounded-2xl border border-glass-border bg-glass/5 p-5 shadow-sm">
            <p className="text-[10px] uppercase font-bold tracking-wider text-text-muted leading-none">{card.title}</p>
            <p className="text-2xl font-extrabold text-text-primary mt-2">{loading ? '...' : card.value}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-text-secondary text-sm">Loading charts and reports...</div>
      ) : (
        <>
          {/* Charts Grid */}
          <div className="grid gap-6 lg:grid-cols-[1.25fr_0.8fr] mt-8">
            {/* Bar Chart */}
            <div className="rounded-2xl border border-glass-border bg-glass/5 p-6 shadow-sm">
              <div className="mb-6">
                <h2 className="text-lg font-bold text-text-primary">Inventory by Category</h2>
                <p className="text-xs text-text-muted mt-0.5 font-medium">Volume distribution of stocked products.</p>
              </div>
              {data.inventoryByCategory.length === 0 ? (
                <div className="text-center py-20 text-text-muted text-sm font-medium">No inventory records found.</div>
              ) : (
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={data.inventoryByCategory} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                    <XAxis dataKey="category" stroke="#64748b" style={{ fontSize: '11px', fontWeight: '500' }} />
                    <YAxis stroke="#64748b" style={{ fontSize: '11px', fontWeight: '500' }} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#4338ca" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Pie Chart */}
            <div className="rounded-2xl border border-glass-border bg-glass/5 p-6 shadow-sm">
              <div className="mb-6">
                <h2 className="text-lg font-bold text-text-primary">Shipment Status</h2>
                <p className="text-xs text-text-muted mt-0.5 font-medium">Real-time status proportions of dispatch logs.</p>
              </div>
              {data.shipmentStatus.length === 0 ? (
                <div className="text-center py-20 text-text-muted text-sm font-medium">No shipment records found.</div>
              ) : (
                <ResponsiveContainer width="100%" height={320}>
                  <PieChart>
                    <Pie data={data.shipmentStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={50} paddingAngle={4}>
                      {data.shipmentStatus.map((entry, index) => (
                        <Cell key={entry.name} fill={colors[index % colors.length]} />
                      ))}
                    </Pie>
                    <Legend verticalAlign="bottom" height={48} wrapperStyle={{ fontSize: '11px', fontWeight: '600' }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Top Stock Table */}
          <div className="rounded-2xl border border-glass-border bg-glass/5 p-6 mt-8 shadow-sm">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-text-primary">Top Stocked Products</h2>
              <p className="text-xs text-text-muted mt-0.5 font-medium">Highest volume inventory products currently in warehouse.</p>
            </div>
            <div className="overflow-x-auto rounded-xl border border-glass-border bg-glass/5">
              <table className="min-w-full divide-y divide-glass-border text-sm text-left">
                <thead className="bg-bg-tertiary/70 text-[11px] font-bold text-text-muted uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Product Name</th>
                    <th className="px-6 py-4">Available Units</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-glass-border/40">
                  {data.topInventory.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-4 text-center text-text-muted text-sm font-medium">No inventory items.</td>
                    </tr>
                  ) : (
                    data.topInventory.map((item) => (
                      <tr key={item.product} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-4 font-semibold text-text-primary text-sm">{item.product}</td>
                        <td className="px-6 py-4 font-bold text-text-primary">{item.stock} units</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                            item.stock > 20 
                              ? 'bg-accent-secondary/10 border-accent-secondary/20 text-accent-secondary' 
                              : 'bg-amber-500/10 border-amber-500/20 text-amber-600'
                          }`}>
                            {item.stock > 20 ? 'In Stock' : 'Low Stock'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
