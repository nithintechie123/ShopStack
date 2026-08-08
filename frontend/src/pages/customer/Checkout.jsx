import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { validateCoupon } from '../../api/coupons';
import { checkoutOrder, createPaymentSession } from '../../api/orders';
import AvailableCouponsModal from '../../components/coupons/AvailableCouponsModal';
import {
  ShoppingBag,
  MapPin,
  CreditCard,
  Tag,
  XCircle,
  ChevronRight,
  ShieldCheck,
  Package,
  Truck,
  FileText,
  Sparkles,
  CheckSquare,
  Square,
  Lock,
  Zap,
  QrCode,
  Building2,
  Wallet,
  Smartphone,
  Check
} from 'lucide-react';

export default function Checkout() {
  const {
    cartItems,
    cartSubtotal,
    removePurchasedItems
  } = useCart();

  const navigate = useNavigate();
  const location = useLocation();

const selectedItems = location.state?.selectedItems || [];

const checkoutItems =
  selectedItems.length > 0
    ? cartItems.filter(item => selectedItems.includes(item.product.id))
    : cartItems;
  // Form state
  const [form, setForm] = useState({
    streetAddress: '',
    city: '',
    state: '',
    postalCode: '',
    phoneNumber: '',
    paymentMethod: 'COD',

    // Billing fields
    billingName: '',
    billingStreetAddress: '',
    billingCity: '',
    billingState: '',
    billingPostalCode: '',
    billingPhoneNumber: '',
    gstNumber: '',

    // Card Details
    cardNumber: '',
    cardExpiry: '',
    cardCvv: '',
    cardHolder: '',

    // UPI Details
    upiId: '',
    selectedUpiApp: 'gpay',

    // Netbanking Details
    selectedBank: 'SBI',

    // Wallet Details
    selectedWallet: 'Amazon Pay',
  });

  const [sameAsShipping, setSameAsShipping] = useState(true);
  const [onlineMethod, setOnlineMethod] = useState('CARD'); // 'CARD', 'UPI', 'NETBANKING', 'WALLET'

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [offersModalOpen, setOffersModalOpen] = useState(false);

  // Submission state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const calculateDiscount = () => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.discountType === 'PERCENTAGE') {
      return (cartSubtotal * parseFloat(appliedCoupon.discountValue)) / 100;
    } else {
      return Math.min(cartSubtotal, parseFloat(appliedCoupon.discountValue));
    }
  };

  const checkoutSubtotal = checkoutItems.reduce(
  (total, item) => total + parseFloat(item.product.price) * item.quantity,
  0
);

const discountAmount = appliedCoupon
  ? appliedCoupon.discountType === 'PERCENTAGE'
    ? (checkoutSubtotal * parseFloat(appliedCoupon.discountValue)) / 100
    : Math.min(checkoutSubtotal, parseFloat(appliedCoupon.discountValue))
  : 0;

const shippingFee = checkoutSubtotal > 1000 ? 0 : 99;

const finalTotal = Math.max(
  0,
  checkoutSubtotal - discountAmount + shippingFee
);

  const handleApplyCoupon = async (e, codeToApply) => {
    if (e && e.preventDefault) e.preventDefault();
    const code = codeToApply || couponCode;
    if (!code || !code.trim()) return;

    setCouponError('');
    setCouponLoading(true);
    try {
      const res = await validateCoupon(code.trim(), checkoutSubtotal);
      if (res.data && res.data.valid) {
        setAppliedCoupon(res.data);
        setCouponCode(code.trim().toUpperCase());
        setCouponError('');
      } else {
        setAppliedCoupon(null);
        setCouponError(res.data?.message || 'Invalid or expired coupon code.');
      }
    } catch (err) {
      setAppliedCoupon(null);
      const errMsg = err.response?.data?.message || err.response?.data?.error || 'Invalid or expired coupon code.';
      setCouponError(errMsg);
    } finally {
      setCouponLoading(false);
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) {
      setError('Your cart is empty.');
      return;
    }

    setError('');
    setLoading(true);

    const shippingFull = `${form.streetAddress}, ${form.city}, ${form.state} - ${form.postalCode} (Ph: ${form.phoneNumber})`;
    let billingFull = shippingFull;
    if (form.paymentMethod === 'ONLINE' && !sameAsShipping) {
      billingFull = `${form.billingStreetAddress || form.streetAddress}, ${form.billingCity || form.city}, ${form.billingState || form.state} - ${form.billingPostalCode || form.postalCode} (Name: ${form.billingName || 'N/A'}, Ph: ${form.billingPhoneNumber || form.phoneNumber})`;
    }

    const billingInfoText = form.paymentMethod === 'ONLINE'
      ? `Method: ${onlineMethod}, GST: ${form.gstNumber || 'N/A'}, Billing Name: ${form.billingName || 'Same as Shipping'}`
      : 'COD';

    const itemsPayload = checkoutItems.map((item) => ({
      productId: item.product.id,
      quantity: item.quantity,
      price: parseFloat(item.product.price),
    }));

    if (form.paymentMethod === 'ONLINE') {
      try {
        const checkoutPayload = {
          shippingAddress: shippingFull,
          billingAddress: billingFull,
          paymentMethod: 'RAZORPAY',
          billingInfo: billingInfoText,
          couponCode: appliedCoupon ? appliedCoupon.code : null,
          items: itemsPayload,
        };

        // 1. Create Razorpay Payment Session on backend
        const sessionRes = await createPaymentSession(checkoutPayload);
        const sessionData = sessionRes.data;

        if (sessionData.success === false && sessionData.error) {
          throw new Error(sessionData.error);
        }

        const { orderId, keyId, amount } = sessionData;

        // 2. Configure official Razorpay Checkout Modal
        const options = {
          key: keyId,
          amount: amount,
          currency: 'INR',
          name: 'ShopStack Marketplace',
          description: 'Payment for your order',
          order_id: orderId,
          prefill: {
            name: form.billingName || form.streetAddress,
            contact: form.phoneNumber,
          },
          theme: {
            color: '#6366f1',
          },
          handler: async function (response) {
            try {
              // Verified signature & order creation on backend
              const finalPayload = {
                ...checkoutPayload,
                paymentMethod: 'RAZORPAY',
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              };

              await checkoutOrder(finalPayload);
              removePurchasedItems(
  checkoutItems.map(item => item.product.id)
);
              navigate('/orders', { state: { orderSuccess: true } });
            } catch (err) {
              setError(err.response?.data?.error || 'Payment verification failed. Please contact support.');
              setLoading(false);
            }
          },
          modal: {
            ondismiss: function () {
              setError('Payment was cancelled. Order has not been placed.');
              setLoading(false);
            },
          },
        };

        if (window.Razorpay) {
          const rzp = new window.Razorpay(options);
          rzp.on('payment.failed', function (response) {
            setError(response.error.description || 'Payment failed. Please try another method.');
            setLoading(false);
          });
          rzp.open();
        } else {
          throw new Error('Razorpay SDK failed to load. Please refresh the page and try again.');
        }
      } catch (err) {
        setError(err.response?.data?.error || err.message || 'Failed to initialize Razorpay payment session.');
        setLoading(false);
      }
    } else {
      // Cash on Delivery (COD)
      try {
        const checkoutPayload = {
          shippingAddress: shippingFull,
          billingAddress: billingFull,
          paymentMethod: 'COD',
          paymentId: 'PAY-COD-' + Date.now(),
          billingInfo: 'COD',
          couponCode: appliedCoupon ? appliedCoupon.code : null,
          items: itemsPayload,
        };

        await checkoutOrder(checkoutPayload);
        removePurchasedItems(
  checkoutItems.map(item => item.product.id)
);
        navigate('/orders', { state: { orderSuccess: true } });
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to place order. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-bg-primary text-text-primary flex flex-col items-center justify-center gap-4 py-20 px-4">
        <ShoppingBag size={48} className="text-text-muted opacity-50" />
        <h2 className="text-xl font-bold text-text-primary">Your Cart is Empty</h2>
        <p className="text-sm text-text-secondary">Add some items to your cart before proceeding to checkout.</p>
        <Link
          to="/"
          className="mt-2 bg-gradient-to-r from-accent-primary to-indigo-600 text-white text-xs font-bold px-6 py-2.5 rounded-lg shadow-md hover:from-indigo-600 hover:to-accent-primary transition-all"
        >
          Explore Marketplace
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary py-10 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <h1 className="gradient-text text-3xl font-extrabold tracking-tight">Checkout</h1>
            <p className="text-sm text-text-secondary mt-1 font-medium">Complete your order details, shipping & billing options</p>
          </div>
          <Link to="/cart" className="text-xs font-bold text-accent-primary hover:underline flex items-center gap-1">
            Back to Cart <ChevronRight size={14} />
          </Link>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-accent-danger/10 border border-accent-danger/25 text-accent-danger text-sm flex items-center gap-2">
            <XCircle size={18} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Form Columns */}
          <div className="lg:col-span-2 flex flex-col gap-6">

            {/* Shipping Address Form */}
            <div className="p-6 sm:p-8 rounded-2xl border border-glass-border bg-glass/10 backdrop-blur-md">
              <h3 className="text-base font-bold text-text-primary mb-6 flex items-center gap-2">
                <MapPin size={18} className="text-accent-primary" />
                Shipping Address
              </h3>

              <form id="checkout-form" onSubmit={handlePlaceOrder} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2 flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Street Address *</label>
                  <input
                    name="streetAddress"
                    value={form.streetAddress}
                    onChange={handleChange}
                    placeholder="House No., Building, Street Name"
                    className="w-full bg-bg-tertiary/50 border border-glass-border rounded-lg text-text-primary text-sm px-4 py-3 outline-none focus:border-accent-primary"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">City *</label>
                  <input
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    placeholder="e.g. Mumbai"
                    className="w-full bg-bg-tertiary/50 border border-glass-border rounded-lg text-text-primary text-sm px-4 py-3 outline-none focus:border-accent-primary"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">State / Province *</label>
                  <input
                    name="state"
                    value={form.state}
                    onChange={handleChange}
                    placeholder="e.g. Maharashtra"
                    className="w-full bg-bg-tertiary/50 border border-glass-border rounded-lg text-text-primary text-sm px-4 py-3 outline-none focus:border-accent-primary"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Postal / ZIP Code *</label>
                  <input
                    name="postalCode"
                    value={form.postalCode}
                    onChange={handleChange}
                    placeholder="e.g. 400001"
                    className="w-full bg-bg-tertiary/50 border border-glass-border rounded-lg text-text-primary text-sm px-4 py-3 outline-none focus:border-accent-primary"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Phone Number *</label>
                  <input
                    name="phoneNumber"
                    type="tel"
                    value={form.phoneNumber}
                    onChange={handleChange}
                    placeholder="10-digit mobile number"
                    className="w-full bg-bg-tertiary/50 border border-glass-border rounded-lg text-text-primary text-sm px-4 py-3 outline-none focus:border-accent-primary"
                    required
                  />
                </div>
              </form>
            </div>

            {/* Payment Options */}
            <div className="p-6 sm:p-8 rounded-2xl border border-glass-border bg-glass/10 backdrop-blur-md">
              <h3 className="text-base font-bold text-text-primary mb-6 flex items-center gap-2">
                <CreditCard size={18} className="text-accent-primary" />
                Payment Options
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <label
                  onClick={() => setForm((prev) => ({ ...prev, paymentMethod: 'COD' }))}
                  className={`p-4 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${form.paymentMethod === 'COD' ? 'bg-accent-primary/10 border-accent-primary' : 'bg-bg-tertiary/40 border-glass-border hover:border-text-secondary'
                    }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="COD"
                    checked={form.paymentMethod === 'COD'}
                    onChange={handleChange}
                    className="accent-accent-primary"
                  />
                  <div>
                    <span className="font-bold text-sm text-text-primary block">Cash on Delivery (COD)</span>
                    <span className="text-xs text-text-muted">Pay with cash upon delivery</span>
                  </div>
                </label>

                <label
                  onClick={() => setForm((prev) => ({ ...prev, paymentMethod: 'ONLINE' }))}
                  className={`p-4 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${form.paymentMethod === 'ONLINE' ? 'bg-accent-primary/10 border-accent-primary' : 'bg-bg-tertiary/40 border-glass-border hover:border-text-secondary'
                    }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="ONLINE"
                    checked={form.paymentMethod === 'ONLINE'}
                    onChange={handleChange}
                    className="accent-accent-primary"
                  />
                  <div>
                    <span className="font-bold text-sm text-text-primary flex items-center gap-1.5">
                      Razorpay Online Payment <Zap size={14} className="text-amber-400 fill-amber-400" />
                    </span>
                    <span className="text-xs text-text-muted">Cards, UPI, NetBanking, Wallets</span>
                  </div>
                </label>
              </div>

              {/* Dynamic Online Payment & Billing Options */}

            </div>

          </div>

          {/* Right Column: Order Summary & Coupon */}
          <div className="flex flex-col gap-6">

            <div className="p-6 rounded-2xl border border-glass-border bg-glass/10 backdrop-blur-md flex flex-col gap-4">
              <h3 className="text-base font-bold text-text-primary pb-3 border-b border-glass-border">
                Order Summary ({checkoutItems.length} {checkoutItems.length === 1 ? 'item' : 'items'})
              </h3>

              {/* Items preview list */}
              <div className="flex flex-col gap-3 max-h-56 overflow-y-auto pr-1">
                {checkoutItems.map((item) => (
                  <div key={item.product.id} className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-8 h-8 rounded bg-bg-tertiary flex items-center justify-center shrink-0 border border-glass-border">
                        <Package size={14} className="text-text-muted" />
                      </div>
                      <div className="truncate">
                        {item.product.vendor?.storeName && (
                          <span className="text-[9px] text-accent-primary font-bold uppercase tracking-wider block mb-0.5">
                            {item.product.vendor.storeName}
                          </span>
                        )}
                        <span className="font-semibold text-text-primary block truncate">{item.product.name}</span>
                        <span className="text-[10px] text-text-muted">Qty {item.quantity}</span>
                      </div>
                    </div>
                    <span className="font-bold text-text-primary shrink-0 ml-2">
                      ₹{(parseFloat(item.product.price) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Coupon Form */}
              <div className="pt-4 border-t border-glass-border">
                <form onSubmit={handleApplyCoupon} className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                    <input
                      type="text"
                      placeholder="Coupon Code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      className="w-full bg-bg-tertiary/50 border border-glass-border rounded-lg text-xs px-3 py-2 pl-8 outline-none uppercase font-bold text-text-primary focus:border-accent-primary"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={couponLoading}
                    className="bg-bg-tertiary hover:bg-bg-tertiary/80 border border-glass-border text-text-primary text-xs font-bold px-3.5 py-2 rounded-lg transition-colors cursor-pointer disabled:opacity-50 shrink-0"
                  >
                    {couponLoading ? '...' : 'Apply'}
                  </button>
                </form>

                {/* Browse Offers link */}
                <button
                  type="button"
                  onClick={() => setOffersModalOpen(true)}
                  className="mt-2 text-[11px] font-bold text-accent-primary hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles size={13} />
                  <span>Browse Available Offers & Coupons</span>
                </button>

                {couponError && (
                  <div className="mt-2 p-2.5 rounded-lg bg-accent-danger/10 border border-accent-danger/20 text-accent-danger text-[11px] font-semibold">
                    {couponError}
                  </div>
                )}

                {appliedCoupon && (
                  <div className="mt-2.5 p-2.5 rounded-lg bg-accent-secondary/10 border border-accent-secondary/20 text-accent-secondary text-xs font-bold flex justify-between items-center">
                    <div>
                      <div>Coupon &apos;{appliedCoupon.code}&apos; Applied!</div>
                      {appliedCoupon.description && (
                        <div className="text-[10px] text-text-muted font-normal mt-0.5">{appliedCoupon.description}</div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setAppliedCoupon(null);
                        setCouponCode('');
                        setCouponError('');
                      }}
                      className="text-[10px] hover:underline cursor-pointer ml-2 text-accent-danger shrink-0 font-bold"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              {/* Pricing breakdown */}
              <div className="pt-4 border-t border-glass-border flex flex-col gap-2.5 text-xs">
                <div className="flex justify-between text-text-secondary">
                  <span>Subtotal</span>
                  <span className="font-semibold text-text-primary">₹{checkoutSubtotal.toFixed(2)}</span>
                </div>

                {appliedCoupon && (
                  <div className="flex justify-between text-accent-secondary font-semibold">
                    <span>Discount ({appliedCoupon.code})</span>
                    <span>-₹{discountAmount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-text-secondary">
                  <span className="flex items-center gap-1">
                    <Truck size={12} /> Shipping Fee
                  </span>
                  <span className="font-semibold text-text-primary">
                    {shippingFee === 0 ? 'FREE' : `₹${shippingFee.toFixed(2)}`}
                  </span>
                </div>

                <div className="h-px bg-glass-border my-1" />

                <div className="flex justify-between text-sm font-extrabold text-text-primary">
                  <span>Total Amount</span>
                  <span className="text-accent-secondary font-display">₹{finalTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                form="checkout-form"
                disabled={loading}
                className="w-full mt-2 bg-gradient-to-r from-accent-primary to-indigo-600 hover:from-indigo-600 hover:to-accent-primary text-white text-sm font-bold py-3.5 rounded-xl shadow-lg shadow-accent-primary/20 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <ShieldCheck size={18} />
                <span>{loading ? 'Processing Order…' : 'Place Order'}</span>
              </button>
            </div>

          </div>

        </div>

      </div>
      {/* Available Offers Modal */}
      <AvailableCouponsModal
        isOpen={offersModalOpen}
        onClose={() => setOffersModalOpen(false)}
        currentSubtotal={checkoutSubtotal}
        onApplyCoupon={(code) => handleApplyCoupon(null, code)}
      />
    </div>
  );
}