import { useState } from 'react';
import { 
  Package, 
  Truck, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  AlertCircle, 
  Calendar, 
  CreditCard,
  Building,
  RefreshCw
} from 'lucide-react';
import { updateOrderStatus } from '../../api/orders';

const TRACKING_STEPS = [
  { key: 'PLACED', label: 'Order Placed', desc: 'Order received and confirmed', Icon: Clock },
  { key: 'PROCESSING', label: 'Processing', desc: 'Seller is preparing your items', Icon: Package },
  { key: 'SHIPPED', label: 'Shipped', desc: 'Package handed over to courier', Icon: Truck },
  { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', desc: 'Package is out with delivery agent', Icon: MapPin },
  { key: 'DELIVERED', label: 'Delivered', desc: 'Package delivered safely', Icon: CheckCircle2 }
];

const FULFILLMENT_ACTIONS = {
  PLACED: {
    label: 'Accept order and start preparation',
    nextStatus: 'PROCESSING',
    helper: 'Confirm items, check stock, and begin picking for packing.'
  },
  PROCESSING: {
    label: 'Mark as packed and ready for shipment',
    nextStatus: 'SHIPPED',
    helper: 'Inspect items, pack them securely, and attach the delivery label.'
  },
  SHIPPED: {
    label: 'Dispatch to courier',
    nextStatus: 'OUT_FOR_DELIVERY',
    helper: 'Hand over the package to the delivery partner for final transit.'
  },
  OUT_FOR_DELIVERY: {
    label: 'Confirm delivery complete',
    nextStatus: 'DELIVERED',
    helper: 'Update the status once the package reaches the customer.'
  }
};

export default function OrderTracker({ order, onStatusUpdate, isCustomer = true, userRole = 'CUSTOMER' }) {
  const [cancelling, setCancelling] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  if (!order) return null;

  const currentStatus = (order.trackingStatus || order.orderStatus || 'PLACED').toUpperCase();
  const isCancelled = currentStatus === 'CANCELLED';

  // Map backend prep states to user-facing steps
  const getStepIndex = (status) => {
    switch (status) {
      case 'PLACED':
        return 0;
      case 'CONFIRMED':
      case 'PREPARING':
      case 'READY_FOR_WAREHOUSE':
      case 'ALLOCATED':
      case 'PICKED':
      case 'PACKED':
      case 'READY_FOR_SHIPMENT':
      case 'PROCESSING':
        return 1;
      case 'SHIPPED':
        return 2;
      case 'OUT_FOR_DELIVERY':
        return 3;
      case 'DELIVERED':
        return 4;
      default:
        return 0;
    }
  };

  // Calculate current step index
  const activeStepIndex = isCancelled ? -1 : getStepIndex(currentStatus);

  // Calculate estimated delivery date (4 days after order date)
  const orderDateObj = order.orderDate ? new Date(order.orderDate) : new Date();
  const estDeliveryObj = new Date(orderDateObj);
  estDeliveryObj.setDate(estDeliveryObj.getDate() + 4);

  const formattedOrderDate = orderDateObj.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const formattedEstDelivery = estDeliveryObj.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const formattedUpdatedDate = order.updatedAt
    ? new Date(order.updatedAt).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : null;

  const canCustomerCancel =
    isCustomer &&
    ['PLACED', 'CONFIRMED', 'PREPARING', 'READY_FOR_WAREHOUSE', 'ALLOCATED', 'PICKED', 'PACKED', 'READY_FOR_SHIPMENT', 'PROCESSING'].includes(currentStatus) &&
    !isCancelled;

  const canVendorOrAdminUpdate =
    (userRole === 'VENDOR' || userRole === 'ADMIN') && !isCancelled;

  const canShowFulfillmentAction =
    userRole !== 'CUSTOMER' &&
    !isCancelled &&
    FULFILLMENT_ACTIONS[currentStatus] !== undefined;

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    setCancelling(true);
    setActionError('');
    setActionSuccess('');
    try {
      const res = await updateOrderStatus(order.id, 'CANCELLED');
      setActionSuccess('Order cancelled successfully.');
      if (onStatusUpdate) onStatusUpdate(res.data);
    } catch (err) {
      setActionError(err.response?.data?.error || 'Failed to cancel order.');
    } finally {
      setCancelling(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    setUpdating(true);
    setActionError('');
    setActionSuccess('');
    try {
      const res = await updateOrderStatus(order.id, newStatus);
      setActionSuccess(`Status updated to ${newStatus}`);
      if (onStatusUpdate) onStatusUpdate(res.data);
    } catch (err) {
      setActionError(err.response?.data?.error || 'Failed to update order status.');
    } finally {
      setUpdating(false);
    }
  };

  const handleFulfillmentAction = async () => {
    const action = FULFILLMENT_ACTIONS[currentStatus];
    if (!action) return;

    setUpdating(true);
    setActionError('');
    setActionSuccess('');

    try {
      const res = await updateOrderStatus(order.id, action.nextStatus);
      setActionSuccess(`Order moved to ${action.nextStatus.replace(/_/g, ' ')}.`);
      if (onStatusUpdate) onStatusUpdate(res.data);
    } catch (err) {
      setActionError(err.response?.data?.error || 'Failed to update order status.');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Alert Banners */}
      {actionError && (
        <div className="p-4 rounded-xl bg-accent-danger/10 border border-accent-danger/25 text-accent-danger text-xs flex items-center gap-2">
          <AlertCircle size={16} className="shrink-0" />
          <span>{actionError}</span>
        </div>
      )}
      {actionSuccess && (
        <div className="p-4 rounded-xl bg-accent-secondary/10 border border-accent-secondary/25 text-accent-secondary text-xs flex items-center gap-2">
          <CheckCircle2 size={16} className="shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Header Info Banner */}
      <div className="p-5 sm:p-6 rounded-2xl border border-glass-border bg-glass/15 backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Tracking Reference</span>
            <span className="text-xs font-mono font-bold text-accent-primary bg-accent-primary/10 border border-accent-primary/20 px-2 py-0.5 rounded-md">
              #{order.id ? order.id.toString().substring(0, 13) : 'ORD-LOCAL'}
            </span>
          </div>
          <p className="text-sm font-extrabold text-text-primary mt-1">
            {isCancelled ? (
              <span className="text-accent-danger flex items-center gap-1.5">
                <XCircle size={18} /> Order Cancelled
              </span>
            ) : currentStatus === 'DELIVERED' ? (
              <span className="text-accent-secondary flex items-center gap-1.5">
                <CheckCircle2 size={18} /> Order Delivered
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-text-primary">
                <Truck size={18} className="text-accent-primary animate-pulse" /> Estimated Delivery: <strong className="text-accent-primary">{formattedEstDelivery}</strong>
              </span>
            )}
          </p>
        </div>
        {canShowFulfillmentAction && (
          <div className="mt-4 p-4 rounded-2xl border border-accent-primary/20 bg-accent-primary/5 text-text-primary">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-accent-primary">Fulfillment Step</p>
                <p className="mt-2 text-sm font-bold">{FULFILLMENT_ACTIONS[currentStatus].label}</p>
                <p className="text-[12px] text-text-secondary mt-1">{FULFILLMENT_ACTIONS[currentStatus].helper}</p>
              </div>
              <button
                onClick={handleFulfillmentAction}
                disabled={updating}
                className="inline-flex items-center justify-center rounded-xl bg-accent-primary text-white text-sm font-bold px-4 py-2 transition-all duration-200 hover:bg-accent-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {updating ? 'Updating…' : FULFILLMENT_ACTIONS[currentStatus].label}
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-text-secondary bg-bg-tertiary/40 border border-glass-border/40 px-3 py-1.5 rounded-lg">
            <Calendar size={14} className="text-text-muted" />
            <span>Placed on: <strong className="text-text-primary">{formattedOrderDate}</strong></span>
          </div>
          {formattedUpdatedDate && (
            <div className="flex items-center gap-1.5 text-text-secondary bg-bg-tertiary/40 border border-glass-border/40 px-3 py-1.5 rounded-lg">
              <RefreshCw size={12} className="text-text-muted" />
              <span>Last update: <strong className="text-text-primary">{formattedUpdatedDate}</strong></span>
            </div>
          )}
        </div>
      </div>

      {/* Visual Tracking Progress Timeline */}
      <div className="p-6 sm:p-8 rounded-2xl border border-glass-border bg-glass/10 backdrop-blur-md">
        <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-6 flex items-center gap-2">
          <Truck size={16} className="text-accent-primary" />
          Shipment Progress
        </h3>

        {isCancelled ? (
          <div className="p-6 rounded-xl bg-accent-danger/10 border border-accent-danger/20 text-center flex flex-col items-center gap-2">
            <XCircle size={36} className="text-accent-danger" />
            <h4 className="font-bold text-text-primary text-sm">This order was cancelled</h4>
            <p className="text-xs text-text-secondary">No further tracking updates will be processed for this order.</p>
          </div>
        ) : (
          <div className="relative">
            {/* Desktop Stepper Horizontal */}
            <div className="hidden md:flex items-center justify-between relative z-10">
              {/* Progress Bar Background */}
              <div className="absolute top-5 left-8 right-8 h-1 bg-glass-border/60 -z-10 rounded-full" />
              
              {/* Active Progress Line */}
              <div 
                className="absolute top-5 left-8 h-1 bg-gradient-to-r from-accent-primary to-accent-secondary -z-10 rounded-full transition-all duration-500"
                style={{
                  width: `${(Math.max(0, activeStepIndex) / (TRACKING_STEPS.length - 1)) * 90}%`
                }}
              />

              {TRACKING_STEPS.map((step, idx) => {
                const isPassed = idx < activeStepIndex;
                const isCurrent = idx === activeStepIndex;
                const StepIcon = step.Icon;

                return (
                  <div key={step.key} className="flex flex-col items-center text-center max-w-[120px]">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                      isPassed 
                        ? 'bg-accent-secondary border-accent-secondary text-white shadow-lg shadow-accent-secondary/20' 
                        : isCurrent
                        ? 'bg-accent-primary border-accent-primary text-white ring-4 ring-accent-primary/20 scale-110 shadow-lg shadow-accent-primary/25'
                        : 'bg-bg-tertiary border-glass-border text-text-muted'
                    }`}>
                      <StepIcon size={18} />
                    </div>
                    <span className={`text-xs font-bold mt-3 transition-colors ${
                      isCurrent ? 'text-accent-primary font-extrabold' : isPassed ? 'text-text-primary' : 'text-text-muted'
                    }`}>
                      {step.label}
                    </span>
                    <span className="text-[10px] text-text-secondary font-medium mt-0.5 leading-tight opacity-85">
                      {step.desc}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Mobile Stepper Vertical */}
            <div className="flex md:hidden flex-col gap-6 relative">
              <div className="absolute top-4 bottom-4 left-5 w-0.5 bg-glass-border/60 -z-10" />

              {TRACKING_STEPS.map((step, idx) => {
                const isPassed = idx < activeStepIndex;
                const isCurrent = idx === activeStepIndex;
                const StepIcon = step.Icon;

                return (
                  <div key={step.key} className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 shrink-0 transition-all ${
                      isPassed 
                        ? 'bg-accent-secondary border-accent-secondary text-white' 
                        : isCurrent
                        ? 'bg-accent-primary border-accent-primary text-white ring-4 ring-accent-primary/20 scale-105'
                        : 'bg-bg-tertiary border-glass-border text-text-muted'
                    }`}>
                      <StepIcon size={18} />
                    </div>
                    <div className="pt-1">
                      <h4 className={`text-xs font-bold ${isCurrent ? 'text-accent-primary' : isPassed ? 'text-text-primary' : 'text-text-muted'}`}>
                        {step.label}
                      </h4>
                      <p className="text-[11px] text-text-secondary font-medium mt-0.5">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Control Actions for Vendor / Admin / Customer */}
      {(canCustomerCancel || canVendorOrAdminUpdate) && (
        <div className="p-5 rounded-xl border border-glass-border bg-glass/15 backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
          <div>
            <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider">Order Management</h4>
            <p className="text-[11px] text-text-secondary mt-0.5 font-medium">
              {isCustomer ? 'Need to cancel this order?' : 'Update tracking status for customer'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {canCustomerCancel && (
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="bg-accent-danger/10 hover:bg-accent-danger/20 border border-accent-danger/30 text-accent-danger text-xs font-bold px-4 py-2 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                <XCircle size={14} />
                <span>{cancelling ? 'Cancelling...' : 'Cancel Order'}</span>
              </button>
            )}

           
          </div>
        </div>
      )}

      {/* Order Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Shipping & Payment Summary */}
        <div className="p-6 rounded-2xl border border-glass-border bg-glass/10 backdrop-blur-md flex flex-col gap-5">
          <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider border-b border-glass-border pb-3 flex items-center gap-2">
            <MapPin size={15} className="text-accent-primary" /> Delivery & Payment Info
          </h3>

          <div className="flex flex-col gap-4 text-xs">
            <div>
              <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider block mb-1">Shipping Address</span>
              <p className="font-semibold text-text-primary leading-relaxed bg-bg-tertiary/40 border border-glass-border/30 p-3 rounded-lg">
                {order.shippingAddress || 'Address not specified'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider block mb-1">Payment Method</span>
                <span className="font-bold text-text-primary flex items-center gap-1.5">
                  <CreditCard size={14} className="text-accent-primary" />
                  {order.paymentMethod || 'COD'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider block mb-1">Payment Status</span>
                <span className={`inline-flex items-center text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${
                  order.paymentStatus === 'PAID'
                    ? 'bg-accent-secondary/10 border-accent-secondary/20 text-accent-secondary'
                    : 'bg-accent-warning/10 border-accent-warning/20 text-accent-warning'
                }`}>
                  {order.paymentStatus || 'PAID'}
                </span>
              </div>
            </div>

            {order.transactionId && (
              <div>
                <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider block mb-1">Transaction ID</span>
                <span className="font-mono text-[11px] text-text-secondary bg-bg-tertiary/40 px-2.5 py-1 rounded border border-glass-border/30 inline-block">
                  {order.transactionId}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Purchased Items List */}
        <div className="p-6 rounded-2xl border border-glass-border bg-glass/10 backdrop-blur-md flex flex-col gap-4">
          <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider border-b border-glass-border pb-3 flex items-center gap-2">
            <Package size={15} className="text-accent-primary" /> Order Items Summary
          </h3>

          <div className="flex flex-col gap-3 max-h-[260px] overflow-y-auto pr-1">
            {(order.items || order.orderItems || []).map((item, idx) => {
              const productName = item.product?.name || item.productName || 'Marketplace Item';
              const vendorStore = item.product?.vendor?.storeName;
              const unitPrice = parseFloat(item.price || 0);
              const qty = item.quantity || 1;
              const itemTotal = unitPrice * qty;

              return (
                <div key={item.id || idx} className="flex items-center justify-between gap-3 text-xs p-3 rounded-lg bg-bg-tertiary/30 border border-glass-border/30">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-bg-tertiary border border-glass-border/40 flex items-center justify-center shrink-0">
                      <Package size={16} className="text-accent-primary" />
                    </div>
                    <div>
                      <h4 className="font-bold text-text-primary line-clamp-1">{productName}</h4>
                      <div className="flex items-center gap-2 text-[10px] text-text-muted mt-0.5">
                        {vendorStore && (
                          <span className="flex items-center gap-1 font-semibold text-text-secondary">
                            <Building size={10} /> {vendorStore}
                          </span>
                        )}
                        <span>Qty {qty} × ₹{unitPrice.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  <span className="font-bold text-text-primary text-xs shrink-0">
                    ₹{itemTotal.toFixed(2)}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="border-t border-glass-border/40 pt-3 flex flex-col gap-1.5 text-xs">
            <div className="flex justify-between text-text-secondary">
              <span>Subtotal</span>
              <span>₹{parseFloat(order.subtotal || order.finalAmount || 0).toFixed(2)}</span>
            </div>
            {parseFloat(order.discount || 0) > 0 && (
              <div className="flex justify-between text-accent-secondary">
                <span>Discount</span>
                <span>-₹{parseFloat(order.discount).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-extrabold text-sm text-text-primary pt-1 border-t border-glass-border/20">
              <span>Total Paid</span>
              <span className="text-accent-secondary">₹{parseFloat(order.finalAmount || order.totalAmount || 0).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
