import { useEffect, useState } from 'react';
import { getWarehouseOrders, getWarehouses, allocateOrder, pickOrder, packOrder, readyForShipment } from '../../api/warehouse';
import { ArrowRightCircle, CheckCircle, Boxes } from 'lucide-react';

export default function WarehousePickPack() {
  const [orders, setOrders] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [selectedWhs, setSelectedWhs] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchOrders = async () => {
    try {
      const [oRes, wRes] = await Promise.all([
        getWarehouseOrders(),
        getWarehouses(),
      ]);
      
      const whList = wRes.data || [];
      setWarehouses(whList);

      const warehouseStates = ['READY_FOR_WAREHOUSE', 'ALLOCATED', 'PICKED', 'PACKED', 'READY_TO_SHIP'];
      const filtered = (oRes.data || []).filter((o) => warehouseStates.includes(o.trackingStatus));
      setOrders(filtered);

      // Pre-select first warehouse for ready orders
      const initialWhs = {};
      const defaultWhId = whList[0]?.id || '';
      filtered.forEach((o) => {
        if (o.trackingStatus === 'READY_FOR_WAREHOUSE') {
          initialWhs[o.id] = defaultWhId;
        }
      });
      setSelectedWhs((prev) => ({ ...prev, ...initialWhs }));
    } catch (err) {
      console.error('Failed to load orders', err);
      setError('Failed to load orders or warehouses.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleAllocate = async (orderId) => {
    const warehouseId = selectedWhs[orderId];
    if (!warehouseId) {
      alert('Please select a warehouse.');
      return;
    }
    try {
      await allocateOrder({ orderId, warehouseId });
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to allocate order');
    }
  };

  const handlePick = async (orderId) => {
    try {
      await pickOrder(orderId);
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to pick order');
    }
  };

  const handlePack = async (orderId) => {
    try {
      await packOrder(orderId);
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to pack order');
    }
  };

  const handleReady = async (orderId) => {
    try {
      await readyForShipment(orderId);
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to mark order ready');
    }
  };

  const getStatusBadge = (status) => {
    const base = 'inline-flex items-center text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border';
    switch (status) {
      case 'READY_FOR_WAREHOUSE':
        return <span className={`${base} bg-teal-500/10 border-teal-500/20 text-teal-600`}>Ready for Handover</span>;
      case 'ALLOCATED':
        return <span className={`${base} bg-amber-500/10 border-amber-500/20 text-amber-600`}>Allocated</span>;
      case 'PICKED':
        return <span className={`${base} bg-amber-500/10 border-amber-500/20 text-amber-600`}>Picked</span>;
      case 'PACKED':
        return <span className={`${base} bg-accent-secondary/10 border-accent-secondary/20 text-accent-secondary`}>Packed</span>;
      case 'READY_TO_SHIP':
        return <span className={`${base} bg-accent-secondary/10 border-accent-secondary/20 text-accent-secondary`}>Ready to Ship</span>;
      default:
        return <span className={`${base} bg-bg-tertiary border-glass-border text-text-secondary`}>{status}</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="flex items-center gap-3 gradient-text text-3xl font-extrabold tracking-tight">
          <Boxes size={28} className="text-accent-primary shrink-0" />
          <span>Pick & Pack Orders</span>
        </h1>
        <p className="text-sm text-text-secondary mt-1.5 font-medium">Fulfill incoming marketplace orders by picking and packaging items for courier dispatch.</p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-accent-danger/10 border border-accent-danger/20 text-accent-danger text-sm font-semibold">
          {error}
        </div>
      )}

      {/* Orders Table */}
      <div className="overflow-x-auto rounded-xl border border-glass-border bg-glass/5">
        <table className="min-w-full divide-y divide-glass-border text-sm text-left">
          <thead className="bg-bg-tertiary/70 text-[11px] font-bold text-text-muted uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4">Order ID</th>
              <th className="px-6 py-4">Customer Details</th>
              <th className="px-6 py-4">Order Volume</th>
              <th className="px-6 py-4">Fulfillment Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-glass-border/40">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-text-secondary">Loading orders...</td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-text-secondary">No pending orders in the queue.</td>
              </tr>
            ) : (
              orders.map((order) => {
                const itemCount = order.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
                return (
                  <tr key={order.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 font-semibold text-text-primary text-sm font-mono">#{order.id.substring(0, 8)}...</td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-text-primary">
                        {order.user ? `${order.user.firstName} ${order.user.lastName}` : 'Guest Customer'}
                      </div>
                      <div className="text-xs text-text-muted mt-0.5">{order.shippingAddress || 'No Address'}</div>
                    </td>
                    <td className="px-6 py-4 text-text-secondary font-medium">{itemCount} items</td>
                    <td className="px-6 py-4">{getStatusBadge(order.trackingStatus)}</td>
                    <td className="px-6 py-4 text-right">
                      {order.trackingStatus === 'READY_FOR_WAREHOUSE' && (
                        <div className="flex items-center justify-end gap-2">
                          <select
                            value={selectedWhs[order.id] || ''}
                            onChange={(e) => setSelectedWhs((prev) => ({ ...prev, [order.id]: e.target.value }))}
                            className="rounded-xl border border-glass-border bg-bg-secondary px-3 py-1.5 text-xs text-text-primary focus:outline-none focus:border-accent-primary"
                          >
                            <option value="">Select Warehouse</option>
                            {warehouses.map((w) => (
                              <option key={w.id} value={w.id}>{w.warehouseName}</option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={() => handleAllocate(order.id)}
                            className="inline-flex items-center gap-1.5 bg-accent-primary hover:bg-accent-primary-hover text-white text-xs font-bold px-4 py-2 rounded-xl transition-all duration-200 cursor-pointer shadow-sm"
                          >
                            <ArrowRightCircle size={14} />
                            <span>Allocate</span>
                          </button>
                        </div>
                      )}
                      {order.trackingStatus === 'ALLOCATED' && (
                        <button
                          type="button"
                          onClick={() => handlePick(order.id)}
                          className="inline-flex items-center gap-1.5 bg-accent-primary hover:bg-accent-primary-hover text-white text-xs font-bold px-4 py-2 rounded-xl transition-all duration-200 cursor-pointer shadow-sm"
                        >
                          <ArrowRightCircle size={14} />
                          <span>Pick Order</span>
                        </button>
                      )}
                      {order.trackingStatus === 'PICKED' && (
                        <button
                          type="button"
                          onClick={() => handlePack(order.id)}
                          className="inline-flex items-center gap-1.5 bg-accent-primary hover:bg-accent-primary-hover text-white text-xs font-bold px-4 py-2 rounded-xl transition-all duration-200 cursor-pointer shadow-sm"
                        >
                          <ArrowRightCircle size={14} />
                          <span>Pack Order</span>
                        </button>
                      )}
                      {order.trackingStatus === 'PACKED' && (
                        <button
                          type="button"
                          onClick={() => handleReady(order.id)}
                          className="inline-flex items-center gap-1.5 bg-accent-secondary hover:bg-accent-secondary-hover text-white text-xs font-bold px-4 py-2 rounded-xl transition-all duration-200 cursor-pointer shadow-sm"
                        >
                          <CheckCircle size={14} />
                          <span>Mark Ready</span>
                        </button>
                      )}
                      {order.trackingStatus === 'READY_TO_SHIP' && (
                        <span className="text-text-muted text-xs font-semibold uppercase tracking-wider bg-bg-tertiary border border-glass-border px-3 py-1.5 rounded-xl">
                          Ready for courier
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
