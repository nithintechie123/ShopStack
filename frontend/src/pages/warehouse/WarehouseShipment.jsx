import { useEffect, useState } from 'react';
import { getShipments, getWarehouseOrders, createShipment, updateShipmentStatus } from '../../api/warehouse';
import { Truck, ArrowRightCircle } from 'lucide-react';

export default function WarehouseShipment() {
  const [shipments, setShipments] = useState([]);
  const [readyOrders, setReadyOrders] = useState([]);
  const [couriers, setCouriers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      const [shipmentsRes, ordersRes] = await Promise.all([
        getShipments(),
        getWarehouseOrders(),
      ]);

      const shipmentList = shipmentsRes.data || [];
      const orderList = ordersRes.data || [];

      setShipments(shipmentList);

      // Find orders that are READY_TO_SHIP but don't have a shipment created yet
      const assignedOrderIds = new Set(shipmentList.map((s) => s.order?.id));
      const pendingShipment = orderList.filter(
        (o) => o.trackingStatus === 'READY_TO_SHIP' && !assignedOrderIds.has(o.id)
      );

      setReadyOrders(pendingShipment);
    } catch (err) {
      console.error('Failed to load shipment data', err);
      setError('Failed to load shipments or pending orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCourierChange = (orderId, value) => {
    setCouriers((prev) => ({ ...prev, [orderId]: value }));
  };

  const handleCreateShipment = async (orderId) => {
    const courierName = couriers[orderId]?.trim() || 'RapidX';
    try {
      await createShipment({ orderId, courierName });
      // Reset input
      setCouriers((prev) => {
        const copy = { ...prev };
        delete copy[orderId];
        return copy;
      });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create shipment');
    }
  };

  const handleDispatch = async (shipmentId) => {
    try {
      await updateShipmentStatus(shipmentId, 'DISPATCHED');
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to dispatch shipment');
    }
  };

  const getStatusBadge = (status) => {
    const base = 'inline-flex items-center text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border';
    switch (status) {
      case 'CREATED':
        return <span className={`${base} bg-amber-500/10 border-amber-500/20 text-amber-600`}>Ready</span>;
      case 'DISPATCHED':
        return <span className={`${base} bg-accent-secondary/10 border-accent-secondary/20 text-accent-secondary`}>Dispatched</span>;
      default:
        return <span className={`${base} bg-bg-tertiary border-glass-border text-text-secondary`}>{status}</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="flex items-center gap-3 gradient-text text-3xl font-extrabold tracking-tight">
          <Truck size={28} className="text-accent-primary shrink-0" />
          <span>Shipment Preparation</span>
        </h1>
        <p className="text-sm text-text-secondary mt-1.5 font-medium">Track upcoming shipments, assign couriers, and dispatch orders.</p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-accent-danger/10 border border-accent-danger/20 text-accent-danger text-sm font-semibold">
          {error}
        </div>
      )}

      {/* Pending Shipments Section */}
      <div className="rounded-2xl border border-glass-border bg-glass/5 p-6 mb-8 shadow-sm">
        <h2 className="text-lg font-bold text-text-primary mb-1">Assign Courier (Pending Shipments)</h2>
        <p className="text-xs text-text-secondary mb-6 font-medium">
          Assign couriers to customer orders that have been picked, packed, and marked ready for shipment.
        </p>

        {loading ? (
          <div className="text-center py-6 text-text-secondary text-sm">Loading pending orders...</div>
        ) : readyOrders.length === 0 ? (
          <div className="text-center py-6 text-text-muted text-sm font-medium">No orders currently waiting for courier assignment.</div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-glass-border bg-glass/5">
            <table className="min-w-full divide-y divide-glass-border text-sm text-left">
              <thead className="bg-bg-tertiary/70 text-[11px] font-bold text-text-muted uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Order ID</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Delivery Address</th>
                  <th className="px-6 py-4">Courier Carrier</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-glass-border/40">
                {readyOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 font-semibold text-text-primary text-sm">{order.id}</td>
                    <td className="px-6 py-4 text-text-primary font-semibold">
                      {order.user ? `${order.user.firstName} ${order.user.lastName}` : 'Guest Customer'}
                    </td>
                    <td className="px-6 py-4 text-sm text-text-secondary font-medium">{order.shippingAddress}</td>
                    <td className="px-6 py-4">
                      <select
                        value={couriers[order.id] || 'RapidX'}
                        onChange={(e) => handleCourierChange(order.id, e.target.value)}
                        className="px-3 py-1.5 rounded-xl border border-glass-border bg-bg-secondary text-xs text-text-primary focus:outline-none focus:border-accent-primary cursor-pointer font-medium"
                      >
                        <option value="RapidX">RapidX</option>
                        <option value="ShipPoint">ShipPoint</option>
                        <option value="FleetWave">FleetWave</option>
                        <option value="DHL Express">DHL Express</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleCreateShipment(order.id)}
                        className="inline-flex items-center gap-1.5 bg-accent-primary hover:bg-accent-primary-hover text-white text-xs font-bold px-4 py-2 rounded-xl transition-all duration-200 cursor-pointer shadow-sm"
                      >
                        <Truck size={14} />
                        <span>Assign & Prepare</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Active Shipments Section */}
      <div className="rounded-2xl border border-glass-border bg-glass/5 p-6 shadow-sm">
        <h2 className="text-lg font-bold text-text-primary mb-1">Active Shipments & Dispatches</h2>
        <p className="text-xs text-text-secondary mb-6 font-medium">Track shipments created for courier collection and transition them to dispatched state.</p>
        
        {loading ? (
          <div className="text-center py-6 text-text-secondary text-sm">Loading shipments...</div>
        ) : shipments.length === 0 ? (
          <div className="text-center py-6 text-text-muted text-sm font-medium">No active shipments in the database.</div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-glass-border bg-glass/5">
            <table className="min-w-full divide-y divide-glass-border text-sm text-left">
              <thead className="bg-bg-tertiary/70 text-[11px] font-bold text-text-muted uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Tracking ID</th>
                  <th className="px-6 py-4">Order ID</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Courier</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-glass-border/40">
                {shipments.map((shipment) => (
                  <tr key={shipment.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 font-semibold text-text-primary text-sm">{shipment.trackingNumber || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-text-muted">{shipment.order?.id || 'N/A'}</td>
                    <td className="px-6 py-4 text-text-primary font-semibold">
                      {shipment.order?.user ? `${shipment.order.user.firstName} ${shipment.order.user.lastName}` : 'Guest'}
                    </td>
                    <td className="px-6 py-4 text-text-secondary font-medium">{shipment.courierName}</td>
                    <td className="px-6 py-4">{getStatusBadge(shipment.shipmentStatus)}</td>
                    <td className="px-6 py-4 text-right">
                      {shipment.shipmentStatus === 'CREATED' ? (
                        <button
                          type="button"
                          onClick={() => handleDispatch(shipment.id)}
                          className="inline-flex items-center gap-1.5 bg-accent-secondary hover:bg-accent-secondary-hover text-white text-xs font-bold px-4 py-2 rounded-xl transition-all duration-200 cursor-pointer shadow-sm"
                        >
                          <ArrowRightCircle size={14} />
                          <span>Dispatch Courier</span>
                        </button>
                      ) : (
                        <span className="text-text-muted text-xs font-semibold bg-bg-tertiary border border-glass-border px-3 py-1.5 rounded-xl">
                          Dispatched
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
