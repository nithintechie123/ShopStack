import { useEffect, useState } from 'react';
import { ArrowDown, Package, Truck, Layers, Bell, ClipboardList, CircleDollarSign } from 'lucide-react';
import { getWarehouseInventory, getWarehouseOrders, getShipments } from '../../api/warehouse';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function WarehouseDashboard() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState({
    totalInventory: 0,
    incomingShipments: 0,
    ordersToPack: 0,
    readyToShip: 0,
    lowStockItems: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const [inventoryRes, ordersRes, shipmentsRes] = await Promise.all([
        getWarehouseInventory(),
        getWarehouseOrders(),
        getShipments(),
      ]);

      const inventory = inventoryRes.data || [];
      const orders = ordersRes.data || [];
      const shipmentsList = shipmentsRes.data || [];

      const totalInv = inventory.reduce((sum, item) => sum + (item.availableQuantity || 0), 0);
      const lowStock = inventory.filter((item) => (item.availableQuantity || 0) <= 20).length;
      const toPack = orders.filter((o) => o.trackingStatus === 'ALLOCATED' || o.trackingStatus === 'PICKED').length;
      const ready = shipmentsList.filter((s) => s.shipmentStatus === 'CREATED').length;
      const incoming = shipmentsList.filter((s) => s.shipmentStatus === 'CREATED' || s.shipmentStatus === 'DISPATCHED').length;

      setMetrics({
        totalInventory: totalInv,
        incomingShipments: incoming,
        ordersToPack: toPack,
        readyToShip: ready,
        lowStockItems: lowStock,
      });
    } catch (err) {
      console.error('Failed to load dashboard metrics', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/warehouse/login');
  };

  const activities = [
    { label: 'Received new stock for Pro Active Camera', time: '14 min ago' },
    { label: 'Picked and packed order OID-3D8A5B2C', time: '40 min ago' },
    { label: 'Shipment ready for dispatch', time: '2 hrs ago' },
    { label: 'Low stock alert triggered for Kitchen Smart Scale', time: 'Yesterday' },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-glass/10 border border-glass-border p-6 md:p-8 rounded-2xl backdrop-blur-md shadow-sm">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-accent-primary bg-accent-primary/10 border border-accent-primary/20 px-3 py-1 rounded-full">
            Central Warehouse Operations
          </span>
          <h1 className="gradient-text text-3xl font-extrabold tracking-tight mt-3">
            Warehouse Dashboard
          </h1>
          <p className="text-sm text-text-secondary mt-1.5 leading-relaxed">
            Real-time fulfillment metrics, stock movements, and dispatch readiness tools.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-6 text-sm text-text-secondary md:border-l border-glass-border md:pl-8">
          <div>
            <div className="text-[10px] uppercase font-bold text-text-muted tracking-wider">Active Staff</div>
            <div className="font-bold text-text-primary mt-1">{user?.firstName || 'Warehouse Staff'}</div>
          </div>
          <div>
            <button
              onClick={handleLogout}
              type="button"
              className="inline-flex items-center gap-1.5 bg-accent-danger/10 hover:bg-accent-danger/20 text-accent-danger text-xs font-bold px-4 py-2 rounded-xl border border-accent-danger/20 transition-all duration-200 cursor-pointer shadow-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid gap-5 grid-cols-2 md:grid-cols-3 lg:grid-cols-5 mb-8">
        {[
          { icon: Layers, title: 'Total Inventory', value: metrics.totalInventory, tone: 'bg-accent-primary/10 text-accent-primary' },
          { icon: CircleDollarSign, title: 'Incoming Shipments', value: metrics.incomingShipments, tone: 'bg-emerald-500/10 text-emerald-600' },
          { icon: Package, title: 'Orders to Pack', value: metrics.ordersToPack, tone: 'bg-amber-500/10 text-amber-600' },
          { icon: Truck, title: 'Ready to Ship', value: metrics.readyToShip, tone: 'bg-indigo-500/10 text-indigo-600' },
          { icon: Bell, title: 'Low Stock Items', value: metrics.lowStockItems, tone: 'bg-accent-danger/10 text-accent-danger' },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.title} className="rounded-2xl border border-glass-border bg-glass/5 p-5 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="flex items-center gap-4">
                <div className={`p-2.5 rounded-xl ${card.tone} shrink-0`}>
                  <Icon size={18} />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-wider text-text-muted leading-none">{card.title}</p>
                  <p className="text-2xl font-extrabold text-text-primary mt-1.5">{loading ? '...' : card.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Grid Content */}
      <div className="grid gap-8 lg:grid-cols-12">
        {/* Quick Actions */}
        <div className="lg:col-span-8 rounded-2xl border border-glass-border bg-glass/5 p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-text-primary">Quick Operations</h2>
            <p className="text-xs text-text-muted mt-0.5 font-medium">Drive outbound fulfillment workflows and manage inventory.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { label: 'Receive Inventory', description: 'Log inbound supplier stocks.', icon: ArrowDown, path: '/warehouse/receive', tone: 'bg-emerald-500/10 text-emerald-600 hover:border-emerald-500' },
              { label: 'Pick & Pack', description: 'Fulfill customer orders in queue.', icon: Package, path: '/warehouse/pick-pack', tone: 'bg-amber-500/10 text-amber-600 hover:border-amber-500' },
              { label: 'Prepare Shipment', description: 'Assign couriers & prepare dispatch.', icon: Truck, path: '/warehouse/shipment', tone: 'bg-indigo-500/10 text-indigo-600 hover:border-indigo-500' },
              { label: 'Inventory Status', description: 'Track stock health and alerts.', icon: ClipboardList, path: '/warehouse/inventory', tone: 'bg-accent-primary/10 text-accent-primary hover:border-accent-primary' },
            ].map((action) => (
              <button
                key={action.label}
                type="button"
                onClick={() => navigate(action.path)}
                className={`flex flex-col items-start p-5 rounded-xl border border-glass-border/40 hover:bg-white/[0.02] transition-all duration-300 text-left group cursor-pointer ${action.tone.split(' ').pop()}`}
              >
                <div className="flex items-center gap-3.5 mb-3">
                  <span className={`inline-flex items-center justify-center w-10 h-10 rounded-xl ${action.tone.split(' ').slice(0, 2).join(' ')}`}>
                    <action.icon size={18} />
                  </span>
                  <p className="font-bold text-text-primary text-sm transition-colors">{action.label}</p>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed font-medium">{action.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Activity Log */}
        <div className="lg:col-span-4 rounded-2xl border border-glass-border bg-glass/5 p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-text-primary">Recent Activity Log</h2>
            <p className="text-xs text-text-muted mt-0.5 font-medium">Real-time status changes from floor operations.</p>
          </div>
          <div className="divide-y divide-glass-border/40">
            {activities.map((activity) => (
              <div key={activity.label} className="py-4 flex flex-col justify-between gap-1.5 first:pt-0 last:pb-0">
                <div className="font-medium text-xs text-text-primary leading-normal">{activity.label}</div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-[10px] text-text-muted">{activity.time}</span>
                  <span className="text-[9px] uppercase tracking-wider font-extrabold text-text-secondary bg-bg-tertiary px-2 py-0.5 rounded-md">
                    Log
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
