import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import {
  ShoppingCart,
  Trash2,
  Package,
  ChevronRight,
  ArrowRight,
  Truck,
  ShieldCheck,
  Plus,
  Minus,
  ShoppingBag
} from 'lucide-react';

export default function Cart() {
  const { cartItems, updateQuantity, removeFromCart, clearCart, cartSubtotal, cartCount } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [selectedItems, setSelectedItems] = useState(
    cartItems.map(item => item.product.id)
  );

  const selectedCartItems = cartItems.filter(item =>
    selectedItems.includes(item.product.id)
  );

  // Checks if all items in the cart are selected
  const isAllSelected = cartItems.length > 0 && cartItems.every(item => selectedItems.includes(item.product.id));

  // Toggles selecting/deselecting all items in the cart
  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedItems([]);
    } else {
      setSelectedItems(cartItems.map(item => item.product.id));
    }
  };


  const selectedSubtotal = selectedCartItems.reduce(
    (total, item) => total + parseFloat(item.product.price) * item.quantity,
    0
  );
  const shippingFee =
    selectedSubtotal > 1000 || selectedSubtotal === 0 ? 0 : 99;

  const grandTotal = selectedSubtotal + shippingFee;

  const handleCheckoutClick = () => {
    if (!user) {
      navigate('/login');
    } else {
      navigate('/checkout', {
        state: {
          selectedItems
        }
      });
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-bg-primary text-text-primary flex flex-col items-center justify-center gap-4 py-20 px-4">
        <div className="w-20 h-20 rounded-full bg-bg-tertiary border border-glass-border flex items-center justify-center text-text-muted">
          <ShoppingCart size={36} className="opacity-50" />
        </div>
        <h1 className="text-2xl font-bold text-text-primary">Your Cart is Empty</h1>
        <p className="text-sm text-text-secondary max-w-md text-center">
          Looks like you haven&apos;t added any items to your shopping cart yet. Browse our marketplace to discover incredible products!
        </p>
        <Link
          to="/"
          className="mt-4 inline-flex items-center gap-2 bg-gradient-to-r from-accent-primary to-indigo-600 hover:from-indigo-600 hover:to-accent-primary text-white text-sm font-bold px-6 py-3 rounded-xl shadow-lg shadow-accent-primary/20 transition-all duration-300 transform hover:-translate-y-0.5"
        >
          <ShoppingBag size={16} />
          <span>Start Shopping</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary py-10 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Page Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="gradient-text text-3xl font-extrabold tracking-tight flex items-center gap-3">
              <ShoppingCart size={28} className="text-accent-primary shrink-0" />
              <span>Shopping Cart</span>
              <span className="text-xs font-bold text-accent-primary bg-accent-primary/10 px-3 py-1 rounded-full border border-accent-primary/20">
                {cartCount} {cartCount === 1 ? 'item' : 'items'}
              </span>
            </h1>
            <p className="text-sm text-text-secondary mt-1.5 font-medium">Review your items before proceeding to checkout</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={clearCart}
              className="text-xs font-bold text-accent-danger hover:underline flex items-center gap-1.5 px-3 py-2 rounded-lg border border-accent-danger/20 hover:bg-accent-danger/10 transition-colors cursor-pointer"
            >
              <Trash2 size={14} />
              <span>Clear Cart</span>
            </button>
            <Link
              to="/"
              className="text-xs font-bold text-accent-primary hover:underline flex items-center gap-1"
            >
              Continue Shopping <ChevronRight size={14} />
            </Link>
          </div>
        </div>

        {/* Cart Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Column: Cart Items List */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="rounded-2xl border border-glass-border bg-glass/10 backdrop-blur-md overflow-hidden">
              {/* Select All Checkbox Header */}
              <div className="p-4 sm:p-5 bg-white/[0.02] border-b border-glass-border/40 flex items-center justify-between">
                <label className="flex items-center gap-3 cursor-pointer select-none text-sm font-semibold text-text-primary">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                    className="w-5 h-5 cursor-pointer shrink-0 rounded border-glass-border text-accent-primary focus:ring-accent-primary/20 accent-accent-primary"
                  />
                  <span>Select All ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})</span>
                </label>
                {selectedItems.length > 0 && (
                  <span className="text-xs font-medium text-text-secondary">
                    {selectedItems.length} of {cartItems.length} selected
                  </span>
                )}
              </div>
              <div className="divide-y divide-glass-border/40">


                {cartItems.map((item) => {
                  const product = item.product;
                  const primaryImage = product.images?.find((i) => i.isPrimary)?.imageUrl || product.images?.[0]?.imageUrl;
                  const itemTotal = parseFloat(product.price) * item.quantity;

                  return (
                    <div
                      key={product.id}
                      className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors"
                    >
                      {/* Product Thumbnail & Details */}
                      <div className="flex items-center gap-4 min-w-0">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(product.id)}
                          onChange={() => {
                            if (selectedItems.includes(product.id)) {
                              setSelectedItems(selectedItems.filter(id => id !== product.id));
                            } else {
                              setSelectedItems([...selectedItems, product.id]);
                            }
                          }}
                          className="w-5 h-5 cursor-pointer shrink-0"
                        />
                        <div className="w-20 h-20 rounded-xl bg-bg-tertiary border border-glass-border overflow-hidden shrink-0 flex items-center justify-center">
                          {primaryImage ? (
                            <img src={primaryImage} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <Package size={28} className="text-text-muted opacity-50" />
                          )}
                        </div>

                        <div className="flex flex-col gap-1 min-w-0">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-accent-primary">
                            {product.vendor?.storeName || 'Verified Merchant'}
                          </span>
                          <Link
                            to={`/product/${product.slug || product.id}`}
                            className="font-bold text-sm text-text-primary hover:text-accent-primary transition-colors truncate"
                          >
                            {product.name}
                          </Link>
                          {product.brand && (
                            <span className="text-xs text-text-muted">{product.brand}</span>
                          )}
                          <span className="text-xs font-semibold text-accent-secondary sm:hidden">
                            ₹{parseFloat(product.price).toFixed(2)} each
                          </span>
                        </div>
                      </div>

                      {/* Quantity Stepper & Price & Delete */}
                      <div className="flex items-center justify-between sm:justify-end gap-6 shrink-0 mt-2 sm:mt-0">

                        {/* Unit Price (Desktop) */}
                        <div className="hidden sm:flex flex-col items-end">
                          <span className="text-[10px] text-text-muted uppercase font-bold tracking-wider">Unit Price</span>
                          <span className="text-sm font-semibold text-text-primary">
                            ₹{parseFloat(product.price).toFixed(2)}
                          </span>
                        </div>

                        {/* Interactive Quantity Stepper */}
                        <div className="flex items-center border border-glass-border rounded-xl bg-bg-tertiary/50 p-1">
                          <button
                            onClick={() => updateQuantity(product, item.quantity - 1)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-bg-tertiary text-text-primary font-bold transition-colors cursor-pointer"
                            title="Decrease Quantity"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-10 text-center text-xs font-extrabold text-text-primary">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(product, item.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-bg-tertiary text-text-primary font-bold transition-colors cursor-pointer"
                            title="Increase Quantity"
                          >
                            <Plus size={14} />
                          </button>
                        </div>

                        {/* Item Total Price */}
                        <div className="flex flex-col items-end min-w-[90px]">
                          <span className="text-[10px] text-text-muted uppercase font-bold tracking-wider">Total</span>
                          <span className="text-base font-extrabold text-accent-secondary font-display">
                            ₹{itemTotal.toFixed(2)}
                          </span>
                        </div>

                        {/* Delete Button */}
                        <button
                          onClick={() => removeFromCart(product.id)}
                          className="p-2 text-text-muted hover:text-accent-danger hover:bg-accent-danger/10 rounded-lg transition-colors cursor-pointer"
                          title="Remove item"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary Card */}
          <div className="flex flex-col gap-6">
            <div className="p-6 sm:p-8 rounded-2xl border border-glass-border bg-glass/10 backdrop-blur-md flex flex-col gap-5">
              <h3 className="text-lg font-bold text-text-primary pb-3 border-b border-glass-border">
                Order Summary
              </h3>

              <div className="flex flex-col gap-3 text-sm">
                <div className="flex justify-between text-text-secondary">
                  <span>Subtotal (
                    {selectedCartItems.length}
                    {' '}
                    {selectedCartItems.length === 1 ? 'item' : 'items'}
                    )</span>
                  <span className="font-semibold text-text-primary">₹{selectedSubtotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-text-secondary">
                  <span className="flex items-center gap-1.5">
                    <Truck size={14} className="text-accent-primary" />
                    Estimated Shipping
                  </span>
                  <span className="font-semibold text-text-primary">
                    {shippingFee === 0 ? (
                      <span className="text-accent-secondary font-bold">FREE</span>
                    ) : (
                      `₹${shippingFee.toFixed(2)}`
                    )}
                  </span>
                </div>

                {selectedSubtotal < 1000 && (
                  <p className="text-[11px] text-accent-warning font-semibold bg-accent-warning/10 p-2.5 rounded-lg border border-accent-warning/20">
                    💡 Add ₹{(1000 - selectedSubtotal).toFixed(2)} more of products to get <strong>FREE Shipping</strong>!
                  </p>
                )}

                <div className="h-px bg-glass-border my-1" />

                <div className="flex justify-between text-base font-extrabold text-text-primary">
                  <span>Total</span>
                  <span className="text-xl text-accent-secondary font-display">₹{grandTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleCheckoutClick}
                className="w-full mt-2 bg-gradient-to-r from-accent-primary to-indigo-600 hover:from-indigo-600 hover:to-accent-primary text-white text-sm font-bold py-3.5 rounded-xl shadow-lg shadow-accent-primary/20 transition-all cursor-pointer flex items-center justify-center gap-2 transform hover:-translate-y-0.5"
              >
                <ShieldCheck size={18} />
                <span>Proceed to Checkout</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
