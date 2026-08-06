import { useEffect, useState } from 'react';
import { Package, ChevronRight, ShoppingBag, CheckCircle, Truck, AlertCircle, Eye, RefreshCw, RotateCcw } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { getMyOrders } from '../../api/orders';
import OrderTracker from '../../components/orders/OrderTracker';
import OrderSuccessModal from '../../components/orders/OrderSuccessModal';

const STATUS_META = {
  PLACED:           { label: 'Order Placed',     cls: 'bg-blue-500/10 border-blue-500/20 text-blue-400' },
  PROCESSING:       { label: 'Processing',       cls: 'bg-accent-primary/10 border-accent-primary/20 text-accent-primary' },
  SHIPPED:          { label: 'Shipped',          cls: 'bg-accent-warning/10 border-accent-warning/20 text-accent-warning' },
  OUT_FOR_DELIVERY: { label: 'Out for Delivery',   cls: 'bg-purple-500/10 border-purple-500/20 text-purple-400' },
  DELIVERED:        { label: 'Delivered',        cls: 'bg-accent-secondary/10 border-accent-secondary/20 text-accent-secondary' },
  CANCELLED:        { label: 'Cancelled',        cls: 'bg-accent-danger/10 border-accent-danger/20 text-accent-danger' },
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('ALL');
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const location = useLocation();

  const isJustPlaced = location.state?.orderSuccess;
  const [showSuccessModal, setShowSuccessModal] = useState(Boolean(isJustPlaced));

  const fetchOrders = () => {
    setLoading(true);
    getMyOrders()
      .then((res) => {
        setOrders(res.data);
      })
      .catch((err) => {
        setError(err.response?.data?.error || 'Failed to load order history.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusUpdate = (updatedOrder) => {
    setOrders((prev) => prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o)));
  };

  // Filter logic
  const filteredOrders = orders.filter((order) => {
    const status = (order.trackingStatus || order.orderStatus || 'PLACED').toUpperCase();
    if (activeTab === 'ACTIVE') {
      return status !== 'DELIVERED' && status !== 'CANCELLED';
    }
    if (activeTab === 'DELIVERED') {
      return status === 'DELIVERED';
    }
    if (activeTab === 'CANCELLED') {
      return status === 'CANCELLED';
    }
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary text-text-primary py-16 text-center">
        <div className="w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-text-muted">Loading your order history…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary py-10 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {isJustPlaced && (
          <div className="mb-6 p-4 rounded-xl bg-accent-secondary/10 border border-accent-secondary/20 text-accent-secondary text-sm flex items-center justify-between gap-4 animate-in fade-in duration-300">
            <div className="flex items-center gap-2">
              <CheckCircle size={20} className="shrink-0 text-accent-secondary" />
              <span className="font-bold">Order placed successfully! Thank you for your purchase.</span>
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="gradient-text text-3xl font-extrabold tracking-tight">Order History</h1>
            <p className="text-sm text-text-secondary mt-1.5 font-medium">Track your shipments and view purchase history</p>
          </div>
          <Link 
            to="/dashboard"
            className="text-xs font-bold text-accent-primary hover:underline flex items-center gap-1"
          >
            Back to Dashboard <ChevronRight size={14} />
          </Link>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-accent-danger/10 border border-accent-danger/25 text-accent-danger text-sm flex items-center gap-2">
            <AlertCircle size={18} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex gap-2 border-b border-glass-border mb-8 overflow-x-auto pb-1">
          {[
            { key: 'ALL', label: 'All Orders', count: orders.length },
            { key: 'ACTIVE', label: 'In Transit / Active', count: orders.filter((o) => {
                const s = (o.trackingStatus || o.orderStatus || 'PLACED').toUpperCase();
                return s !== 'DELIVERED' && s !== 'CANCELLED';
              }).length 
            },
            { key: 'DELIVERED', label: 'Delivered', count: orders.filter((o) => (o.trackingStatus || o.orderStatus) === 'DELIVERED').length },
            { key: 'CANCELLED', label: 'Cancelled', count: orders.filter((o) => (o.trackingStatus || o.orderStatus) === 'CANCELLED').length },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-bold transition-all border-b-2 relative -bottom-[1px] cursor-pointer whitespace-nowrap ${
                activeTab === tab.key
                  ? 'border-accent-primary text-accent-primary'
                  : 'border-transparent text-text-secondary hover:text-text-primary'
              }`}
            >
              <span>{tab.label}</span>
              <span className="bg-bg-tertiary px-2 py-0.5 rounded-full text-[10px] text-text-primary">
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-6">
          {filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 py-20 border border-glass-border rounded-xl bg-glass/5 text-text-muted">
              <ShoppingBag size={44} className="opacity-50" />
              <h3 className="text-base font-bold text-text-secondary">No orders found</h3>
              <p className="text-sm">You have no orders matching this filter.</p>
              <Link 
                to="/" 
                className="mt-2 bg-gradient-to-r from-accent-primary to-indigo-600 hover:from-indigo-600 hover:to-accent-primary text-white text-xs font-bold px-5 py-2.5 rounded-lg shadow-md transition-all duration-300"
              >
                Shop Now
              </Link>
            </div>
          ) : (
            filteredOrders.map((order) => {
              const currentStatus = (order.trackingStatus || order.orderStatus || 'PLACED').toUpperCase();
              const statusMeta = STATUS_META[currentStatus] || STATUS_META.PROCESSING;
              const dateStr = order.orderDate
                ? new Date(order.orderDate).toLocaleString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })
                : 'Recent';

              const isExpanded = expandedOrderId === order.id;
              const itemsList = order.items || order.orderItems || [];
              const orderTotal = parseFloat(order.finalAmount || order.totalAmount || 0);

              return (
                <div 
                  key={order.id} 
                  className="rounded-xl border border-glass-border bg-glass/10 backdrop-blur-md overflow-hidden transition-all duration-300 hover:border-glass-border/80"
                >
                  {/* Order Card Header */}
                  <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 bg-bg-tertiary/40 border-b border-glass-border/40 text-xs">
                    <div className="flex gap-6 flex-wrap">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Order Reference</span>
                        <span className="font-mono font-bold text-text-primary text-xs">#{order.id?.substring(0, 13)}</span>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Date Placed</span>
                        <span className="font-semibold text-text-secondary">{dateStr}</span>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Total Amount</span>
                        <span className="font-bold text-accent-secondary">₹{orderTotal.toFixed(2)}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <span className={`inline-flex items-center text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full border ${statusMeta.cls}`}>
                        {statusMeta.label}
                      </span>
                      
                      <Link
                        to={`/orders/${order.id}/track`}
                        className="inline-flex items-center gap-1 bg-accent-primary/10 hover:bg-accent-primary/20 border border-accent-primary/30 text-accent-primary text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                      >
                        <Truck size={14} />
                        <span>Track</span>
                      </Link>
                      {(currentStatus === "PLACED" ||
                        currentStatus === "DELIVERED") && (

                        order.hasReturnRequest ? (

                          <Link
                            to={`/refund/${order.id}`}
                            className="inline-flex items-center gap-1 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 text-green-400 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
                          >
                            <RefreshCw size={14} />
                            <span>Track Refund</span>
                          </Link>

                        ) : (

                          <Link
                            to={`/orders/${order.id}/return`}
                            className="inline-flex items-center gap-1 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 text-orange-400 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
                          >
                            <RotateCcw size={14} />
                            <span>Request Return</span>
                          </Link>

                        )
                      )}

                      <button
                        onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                        className="inline-flex items-center gap-1 bg-bg-tertiary hover:bg-bg-tertiary/80 border border-glass-border text-text-primary text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                      >
                        <Eye size={14} />
                        <span>{isExpanded ? 'Hide Details' : 'View Details'}</span>
                      </button>
                    </div>
                  </div>


                  {/* Items summary preview */}
                  <div className="p-6 flex flex-col gap-4">
                    {itemsList.map((item, idx) => (
                      <div 
                        key={item.id || idx}
                        className="flex items-center justify-between gap-4 text-xs pb-4 last:pb-0 border-b border-glass-border/20 last:border-b-0"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-bg-tertiary border border-glass-border/40 flex items-center justify-center shrink-0">
                            <Package size={18} className="text-accent-primary" />
                          </div>
                          <div>
                            <h4 className="font-bold text-text-primary">{item.product?.name || item.productName || 'Marketplace Item'}</h4>
                            <p className="text-[10px] text-text-muted mt-0.5 font-medium">
                              {item.product?.brand ? `${item.product.brand} • ` : ''} Qty {item.quantity}
                            </p>
                          </div>
                        </div>
                        <span className="font-semibold text-text-primary">
                          ₹{(parseFloat(item.price || 0) * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Shipping Footer */}
                  {order.shippingAddress && (
                    <div className="px-6 py-3 bg-bg-tertiary/20 border-t border-glass-border/30 text-[11px] text-text-secondary flex items-center gap-2">
                      <Truck size={14} className="text-accent-primary shrink-0" />
                      <span className="truncate">
                        Shipping to: <strong className="text-text-primary">{order.shippingAddress}</strong>
                      </span>
                    </div>
                  )}

                  {/* Inline Expanded Order Tracking View */}
                  {isExpanded && (
                    <div className="p-6 border-t border-glass-border/50 bg-bg-secondary/40 animate-in fade-in duration-200">
                      <OrderTracker 
                        order={order} 
                        onStatusUpdate={handleStatusUpdate}
                        isCustomer={true}
                        userRole="CUSTOMER"
                      />
                    </div>
                  )}

                </div>
              );
            })
          )}
        </div>

      </div>

      {/* Animated Order Success Modal Popup */}
      {showSuccessModal && orders.length > 0 && (
        <OrderSuccessModal
          order={orders[0]}
          onClose={() => setShowSuccessModal(false)}
          onTrackOrder={(ord) => {
            setExpandedOrderId(ord.id);
          }}
        />
      )}
    </div>
  );
}
