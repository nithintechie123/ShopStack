import { useState, useEffect } from 'react';
import { getAllVendors, updateVendorStatus, getCustomerCount, getAllCustomers, toggleUserStatus } from '../../api/vendors';
import { getPendingProducts, approveProduct, searchProducts } from '../../api/products';
import { getAdminOrders, updateOrderStatus } from '../../api/orders';
import { Shield, Store, Package, CheckCircle, XCircle, Clock, Users, Eye, ImageOff, X, Star, Truck, ShoppingBag, Layers } from 'lucide-react';
import DashboardCards from '../../components/admin/DashboardCards';
import OrderTracker from '../../components/orders/OrderTracker';
import { Link } from 'react-router-dom';
import InventoryManager from '../../components/inventory/InventoryManager';

export default function AdminDashboard() {
  const [customerCount, setCustomerCount] = useState(0);
  const [vendors, setVendors] = useState([]);
  const [pendingProducts, setPendingProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [adminOrders, setAdminOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  useEffect(() => {
    Promise.all([
      getAllVendors(),
      getPendingProducts(),
      getCustomerCount(),
      getAllCustomers(),
      getAdminOrders(),
      searchProducts({})
    ])
      .then(([vRes, pRes, ccRes, cRes, oRes, prodRes]) => {   
        setCustomers(cRes.data);
        setVendors(vRes.data);
        setPendingProducts(pRes.data);
        setCustomerCount(ccRes.data);
        setAdminOrders(oRes.data);
        setAllProducts(prodRes.data || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleVendorStatus = async (id, status) => {
    try {
      const res = await updateVendorStatus(id, status, null);
      setVendors((prev) => prev.map((v) => v.id === id ? res.data : v));
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update vendor status.');
    }
  };

  const handleProductApproval = async (id, status) => {
    try {
      await approveProduct(id, status);
      setPendingProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update product status.');
    }
  };

  const handleToggleUserStatus = async (id) => {
    try {
      const res = await toggleUserStatus(id);
      setCustomers((prev) => prev.map((c) => c.id === id ? res.data : c));
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update user status.');
    }
  };

  const handleAdminOrderStatusUpdate = async (orderId, status) => {
    try {
      const res = await updateOrderStatus(orderId, status);
      setAdminOrders((prev) => prev.map((o) => o.id === orderId ? res.data : o));
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update order status.');
    }
  };

  const approved = vendors.filter((v) => v.status === 'APPROVED').length;
  const pending  = vendors.filter((v) => v.status === 'PENDING_APPROVAL').length;

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary py-10 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="flex items-center gap-3 gradient-text text-3xl font-extrabold tracking-tight">
              <Shield size={28} className="text-accent-primary shrink-0" />
              <span>Admin Dashboard</span>
            </h1>
            <p className="text-sm text-text-secondary mt-1.5">Manage vendors, products, users, and platform order tracking</p>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/admin/reports" className="inline-flex items-center gap-2 bg-accent-primary text-white px-4 py-2 rounded-lg text-sm font-bold hover:opacity-95">Reports</Link>
          </div>
        </div>

        {/* Stats Grid */}
        <DashboardCards
          cards={[
            { icon: Users, label: 'Total Users', value: customerCount, bg: 'bg-accent-primary/10 text-accent-primary' },
            { icon: Store, label: 'Total Vendors', value: vendors.length, bg: 'bg-accent-primary/10 text-accent-primary' },
            { icon: Truck, label: 'Platform Orders', value: adminOrders.length, bg: 'bg-accent-secondary/10 text-accent-secondary' },
            { icon: Package, label: 'Pending Products', value: pendingProducts.length, bg: 'bg-purple-500/10 text-purple-600' },
          ]}
        />

        {/* Tabs */}
        <div className="flex gap-1 border-b border-glass-border mb-6">
          <button
            className={`flex items-center gap-2 px-5 py-3.5 text-sm font-semibold transition-all border-b-2 relative -bottom-[1px] cursor-pointer ${
              activeTab === 'users'
                ? 'border-accent-primary text-accent-primary'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
            onClick={() => setActiveTab('users')}
          >
            <Users size={15} />
            <span>Users</span>
            {customerCount > 0 && <span className="bg-accent-primary text-white text-[10px] px-2 py-0.5 rounded-full font-bold ml-1">{customerCount}</span>}
          </button>
          <button
            className={`flex items-center gap-2 px-5 py-3.5 text-sm font-semibold transition-all border-b-2 relative -bottom-[1px] cursor-pointer ${
              activeTab === 'vendors'
                ? 'border-accent-primary text-accent-primary'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
            onClick={() => setActiveTab('vendors')}
          >
            <Store size={15} />
            <span>Vendors</span>
            {pending > 0 && <span className="bg-accent-primary text-white text-[10px] px-2 py-0.5 rounded-full font-bold ml-1">{pending}</span>}
          </button>
          <button
            className={`flex items-center gap-2 px-5 py-3.5 text-sm font-semibold transition-all border-b-2 relative -bottom-[1px] cursor-pointer ${
              activeTab === 'products'
                ? 'border-accent-primary text-accent-primary'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
            onClick={() => setActiveTab('products')}
          >
            <Package size={15} />
            <span>Product Approvals</span>
            {pendingProducts.length > 0 && <span className="bg-accent-primary text-white text-[10px] px-2 py-0.5 rounded-full font-bold ml-1">{pendingProducts.length}</span>}
          </button>
          <button
            className={`flex items-center gap-2 px-5 py-3.5 text-sm font-semibold transition-all border-b-2 relative -bottom-[1px] cursor-pointer ${
              activeTab === 'orders'
                ? 'border-accent-primary text-accent-primary'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
            onClick={() => setActiveTab('orders')}
          >
            <Truck size={15} />
            <span>All Platform Orders</span>
            {adminOrders.length > 0 && <span className="bg-accent-secondary text-white text-[10px] px-2 py-0.5 rounded-full font-bold ml-1">{adminOrders.length}</span>}
          </button>
          <button
            className={`flex items-center gap-2 px-5 py-3.5 text-sm font-semibold transition-all border-b-2 relative -bottom-[1px] cursor-pointer ${
              activeTab === 'inventory'
                ? 'border-accent-primary text-accent-primary'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
            onClick={() => setActiveTab('inventory')}
          >
            <Layers size={15} />
            <span>Inventory Control</span>
            {allProducts.filter(p => p.stockQuantity <= 5).length > 0 && (
              <span className="bg-amber-500 text-black text-[10px] px-2 py-0.5 rounded-full font-extrabold ml-1">
                {allProducts.filter(p => p.stockQuantity <= 5).length} alert
              </span>
            )}
          </button>
        </div>

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="overflow-x-auto rounded-xl border border-glass-border bg-glass/5">
            {loading ? (
              <p className="text-sm text-text-muted p-6">Loading users…</p>
            ) : customers.length === 0 ? (
              <p className="text-sm text-text-muted p-6">No users found.</p>
            ) : (
              <table className="min-w-full divide-y divide-glass-border text-sm text-left">
                <thead className="bg-bg-tertiary/70 text-[11px] font-bold text-text-muted uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Joined Date</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-glass-border/40">
                  {customers.map((c) => (
                    <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 font-semibold text-text-primary">
                        {c.firstName} {c.lastName}
                      </td>
                      <td className="px-6 py-4 text-text-secondary">{c.email}</td>
                      <td className="px-6 py-4 text-text-secondary">
                        {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                          (c.isActive !== undefined ? c.isActive : c.active) ? 'bg-accent-secondary/10 border-accent-secondary/20 text-accent-secondary' : 'bg-accent-danger/10 border-accent-danger/20 text-accent-danger'
                        }`}>
                          {(c.isActive !== undefined ? c.isActive : c.active) ? 'Active' : 'Suspended'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggleUserStatus(c.id)}
                          className={`inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded transition-all duration-200 cursor-pointer shadow-sm ${
                            (c.isActive !== undefined ? c.isActive : c.active) 
                              ? 'bg-accent-danger/10 text-accent-danger hover:bg-accent-danger/20' 
                              : 'bg-accent-secondary/10 text-accent-secondary hover:bg-accent-secondary/20'
                          }`}
                        >
                          {(c.isActive !== undefined ? c.isActive : c.active) ? 'Suspend' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Vendors Tab */}
        {activeTab === 'vendors' && (
          <div className="overflow-x-auto rounded-xl border border-glass-border bg-glass/5">
            {loading ? (
              <p className="text-sm text-text-muted p-6">Loading vendors…</p>
            ) : vendors.length === 0 ? (
              <p className="text-sm text-text-muted p-6">No vendors found.</p>
            ) : (
              <table className="min-w-full divide-y divide-glass-border text-sm text-left">
                <thead className="bg-bg-tertiary/70 text-[11px] font-bold text-text-muted uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Store</th>
                    <th className="px-6 py-4">Owner</th>
                    <th className="px-6 py-4">License</th>
                    <th className="px-6 py-4">Commission</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-glass-border/40">
                  {vendors.map((v) => (
                    <tr key={v.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-semibold text-text-primary">{v.storeName}</div>
                          {v.description && <div className="text-xs text-text-muted mt-0.5 line-clamp-1">{v.description}</div>}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-semibold text-text-primary">{v.user?.firstName} {v.user?.lastName}</div>
                          <div className="text-xs text-text-muted mt-0.5">{v.user?.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-text-secondary">{v.businessLicense || '—'}</td>
                      <td className="px-6 py-4 font-semibold text-text-primary">{(parseFloat(v.commissionRate || 0) * 100).toFixed(0)}%</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                          v.status === 'APPROVED' ? 'bg-accent-secondary/10 border-accent-secondary/20 text-accent-secondary' :
                          v.status === 'REJECTED' ? 'bg-accent-danger/10 border-accent-danger/20 text-accent-danger' :
                          'bg-accent-warning/10 border-accent-warning/20 text-accent-warning'
                        }`}>
                          {v.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2 flex-wrap">
                          {v.status !== 'APPROVED' && (
                            <button
                              className="inline-flex items-center gap-1 bg-accent-secondary hover:bg-accent-secondary-hover text-white text-xs font-bold px-3 py-1.5 rounded transition-all duration-200 cursor-pointer shadow-sm"
                              onClick={() => handleVendorStatus(v.id, 'APPROVED')}
                            >
                              <CheckCircle size={12} />
                              <span>Approve</span>
                            </button>
                          )}
                          {v.status !== 'REJECTED' && (
                            <button
                              className="inline-flex items-center gap-1 bg-accent-danger hover:opacity-90 text-white text-xs font-bold px-3 py-1.5 rounded transition-all duration-200 cursor-pointer shadow-sm"
                              onClick={() => handleVendorStatus(v.id, 'REJECTED')}
                            >
                              <XCircle size={12} />
                              <span>Reject</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="overflow-x-auto rounded-xl border border-glass-border bg-glass/5">
            {loading ? (
              <p className="text-sm text-text-muted p-6">Loading…</p>
            ) : pendingProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-4 py-20 text-text-muted">
                <CheckCircle size={40} className="text-accent-secondary opacity-80" />
                <h3 className="text-base font-bold text-text-secondary">All Caught Up!</h3>
                <p className="text-sm">No products are pending review.</p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-glass-border text-sm text-left">
                <thead className="bg-bg-tertiary/70 text-[11px] font-bold text-text-muted uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Product</th>
                    <th className="px-6 py-4">Vendor</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Price</th>
                    <th className="px-6 py-4">Rating</th>
                    <th className="px-6 py-4">Stock</th>
                    <th className="px-6 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-glass-border/40">
                  {pendingProducts.map((p) => {
                    const avgRating = p.reviews?.length
                      ? (p.reviews.reduce((s, r) => s + r.rating, 0) / p.reviews.length).toFixed(1)
                      : null;
                    return (
                      <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-semibold text-text-primary">{p.name}</div>
                            {p.brand && <div className="text-xs text-text-muted mt-0.5">{p.brand}</div>}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-text-primary font-medium">{p.vendor?.storeName}</td>
                        <td className="px-6 py-4 text-text-secondary">{p.category?.name || '—'}</td>
                        <td className="px-6 py-4 font-bold text-text-primary">₹{parseFloat(p.price).toFixed(2)}</td>
                        <td className="px-6 py-4">
                          {avgRating ? (
                            <span className="flex items-center gap-1 text-xs font-bold text-accent-warning">
                              <Star size={12} fill="currentColor" /> {avgRating}
                              <span className="text-[10px] text-text-muted font-normal">({p.reviews.length})</span>
                            </span>
                          ) : (
                            <span className="text-xs text-text-muted">No ratings</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-text-secondary">{p.stockQuantity}</td>
                        <td className="px-6 py-4">
                        <div className="flex gap-2 flex-wrap">
                          <button
                            className="inline-flex items-center gap-1 bg-accent-primary/10 hover:bg-accent-primary/20 text-accent-primary text-xs font-bold px-3 py-1.5 rounded transition-all duration-200 cursor-pointer shadow-sm"
                            onClick={() => setSelectedProduct(p)}
                          >
                            <Eye size={12} />
                            <span>Validate</span>
                          </button>
                          <button
                            className="inline-flex items-center gap-1 bg-accent-secondary hover:bg-accent-secondary-hover text-white text-xs font-bold px-3 py-1.5 rounded transition-all duration-200 cursor-pointer shadow-sm"
                            onClick={() => handleProductApproval(p.id, 'APPROVED')}
                          >
                            <CheckCircle size={12} />
                            <span>Approve</span>
                          </button>
                          <button
                            className="inline-flex items-center gap-1 bg-accent-danger hover:opacity-90 text-white text-xs font-bold px-3 py-1.5 rounded transition-all duration-200 cursor-pointer shadow-sm"
                            onClick={() => handleProductApproval(p.id, 'REJECTED')}
                          >
                            <XCircle size={12} />
                            <span>Reject</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Platform Orders Tab */}
        {activeTab === 'orders' && (
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-bold text-text-primary">All Platform Orders Management</h2>
            {adminOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-4 py-16 border border-glass-border rounded-xl bg-glass/5 text-text-muted">
                <ShoppingBag size={44} className="opacity-50 text-accent-primary" />
                <h3 className="text-base font-bold text-text-secondary">No platform orders yet</h3>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                {adminOrders.map((order) => {
                  const currentStatus = (order.trackingStatus || order.orderStatus || 'PLACED').toUpperCase();
                  const dateStr = order.orderDate
                    ? new Date(order.orderDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                    : 'Recent';
                  const isExpanded = expandedOrderId === order.id;

                  return (
                    <div key={order.id} className="rounded-xl border border-glass-border bg-glass/10 backdrop-blur-md overflow-hidden">
                      <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 bg-bg-tertiary/40 border-b border-glass-border/40 text-xs">
                        <div className="flex gap-6 flex-wrap">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Order ID</span>
                            <span className="font-mono font-bold text-text-primary">#{order.id?.substring(0, 13)}</span>
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Date</span>
                            <span className="font-semibold text-text-secondary">{dateStr}</span>
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Buyer</span>
                            <span className="font-semibold text-text-primary">{order.user?.firstName} {order.user?.lastName} ({order.user?.email})</span>
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Amount</span>
                            <span className="font-bold text-accent-secondary">₹{parseFloat(order.finalAmount || order.totalAmount || 0).toFixed(2)}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Status:</span>
                            <select
                              value={currentStatus}
                              onChange={(e) => handleAdminOrderStatusUpdate(order.id, e.target.value)}
                              className="bg-bg-tertiary border border-glass-border rounded-lg text-text-primary text-xs font-bold px-3 py-1.5 outline-none focus:border-accent-primary cursor-pointer"
                            >
                              <option value="PLACED">Placed</option>
                              <option value="PROCESSING">Processing</option>
                              <option value="SHIPPED">Shipped</option>
                              <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                              <option value="DELIVERED">Delivered</option>
                              <option value="CANCELLED">Cancelled</option>
                            </select>
                          </div>

                          <button
                            onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                            className="inline-flex items-center gap-1 bg-accent-primary/10 hover:bg-accent-primary/20 text-accent-primary border border-accent-primary/25 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                          >
                            <Eye size={14} />
                            <span>{isExpanded ? 'Hide' : 'Track Order'}</span>
                          </button>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="p-6 flex flex-col gap-3">
                        {(order.items || order.orderItems || []).map((item, idx) => (
                          <div key={item.id || idx} className="flex items-center justify-between gap-4 text-xs pb-3 last:pb-0 border-b border-glass-border/20 last:border-b-0">
                            <div className="flex items-center gap-3">
                              <Package size={16} className="text-accent-primary shrink-0" />
                              <div>
                                <span className="font-bold text-text-primary">{item.product?.name || item.productName || 'Item'}</span>
                                {item.product?.vendor?.storeName && (
                                  <span className="text-[10px] text-text-muted ml-2 font-semibold">Store: {item.product.vendor.storeName}</span>
                                )}
                                <span className="text-[11px] text-text-muted ml-2">Qty {item.quantity}</span>
                              </div>
                            </div>
                            <span className="font-bold text-text-primary">₹{(parseFloat(item.price || 0) * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>

                      {/* Shipping info */}
                      <div className="px-6 py-3 bg-bg-tertiary/20 border-t border-glass-border/30 text-[11px] text-text-secondary flex items-center gap-2">
                        <Truck size={14} className="text-accent-primary shrink-0" />
                        <span>Shipping Address: <strong className="text-text-primary">{order.shippingAddress}</strong></span>
                      </div>

                      {/* Expanded View */}
                      {isExpanded && (
                        <div className="p-6 border-t border-glass-border/50 bg-bg-secondary/40">
                          <OrderTracker
                            order={order}
                            onStatusUpdate={(updated) => {
                              setAdminOrders((prev) => prev.map((o) => o.id === updated.id ? updated : o));
                            }}
                            isCustomer={false}
                            userRole="ADMIN"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Inventory Control Tab */}
        {activeTab === 'inventory' && (
          <div className="flex flex-col gap-4">
            <InventoryManager
              products={allProducts}
              userRole="ADMIN"
              onProductUpdate={(updatedProduct) => {
                setAllProducts((prev) => prev.map((p) => p.id === updatedProduct.id ? updatedProduct : p));
              }}
            />
          </div>
        )}
      </div>

      {/* Product Validation Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-bg-primary border border-glass-border rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl text-text-primary">
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-glass-border bg-bg-secondary">
              <h3 className="text-base font-bold flex items-center gap-2">
                <Package className="text-accent-primary" size={18} />
                Validate Product Details
              </h3>
              <button onClick={() => setSelectedProduct(null)} className="text-text-muted hover:text-text-primary transition-colors cursor-pointer">
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 max-h-[70vh] overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Image Preview */}
              <div className="flex items-center justify-center bg-bg-tertiary rounded-xl p-4 border border-glass-border min-h-[220px]">
                {selectedProduct.images?.[0]?.imageUrl ? (
                  <img src={selectedProduct.images[0].imageUrl} alt={selectedProduct.name} className="max-h-[200px] object-contain rounded-lg shadow-sm" />
                ) : (
                  <div className="text-text-muted text-xs flex flex-col items-center gap-2">
                    <ImageOff size={32} />
                    <span>No Image Uploaded</span>
                  </div>
                )}
              </div>

              {/* Text Specs */}
              <div className="flex flex-col gap-4">
                <div>
                  <div className="text-[10px] uppercase font-semibold text-text-secondary tracking-wider">Product Name</div>
                  <h2 className="text-lg font-bold mt-0.5">{selectedProduct.name}</h2>
                  {selectedProduct.brand && (
                    <span className="text-xs text-text-muted bg-bg-tertiary border border-glass-border px-2.5 py-0.5 rounded-full mt-1.5 inline-block">
                      {selectedProduct.brand}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-[10px] uppercase font-semibold text-text-secondary tracking-wider">Category</div>
                    <span className="text-sm font-semibold text-text-primary">{selectedProduct.category?.name || '—'}</span>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-semibold text-text-secondary tracking-wider">Vendor Store</div>
                    <span className="text-sm font-semibold text-text-primary">{selectedProduct.vendor?.storeName}</span>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-semibold text-text-secondary tracking-wider">Price</div>
                    <span className="text-base font-bold text-accent-primary">₹{parseFloat(selectedProduct.price).toFixed(2)}</span>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-semibold text-text-secondary tracking-wider">Stock</div>
                    <span className="text-sm font-semibold text-text-primary">{selectedProduct.stockQuantity} units</span>
                  </div>
                </div>

                <div>
                  <div className="text-[10px] uppercase font-semibold text-text-secondary tracking-wider">Description</div>
                  <p className="text-xs text-text-secondary mt-1 bg-bg-secondary p-3 rounded-lg border border-glass-border/30 max-h-[120px] overflow-y-auto leading-relaxed">
                    {selectedProduct.description || 'No description provided.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-glass-border bg-bg-secondary">
              <button onClick={() => setSelectedProduct(null)} className="bg-transparent hover:bg-bg-tertiary border border-glass-border text-text-primary text-xs font-bold px-4 py-2 rounded-lg transition-colors cursor-pointer">
                Close
              </button>
              <button
                onClick={() => {
                  handleProductApproval(selectedProduct.id, 'REJECTED');
                  setSelectedProduct(null);
                }}
                className="bg-accent-danger hover:opacity-90 text-white text-xs font-bold px-4 py-2 rounded-lg transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
              >
                <XCircle size={14} />
                Reject
              </button>
              <button
                onClick={() => {
                  handleProductApproval(selectedProduct.id, 'APPROVED');
                  setSelectedProduct(null);
                }}
                className="bg-accent-secondary hover:bg-accent-secondary-hover text-white text-xs font-bold px-4 py-2 rounded-lg transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
              >
                <CheckCircle size={14} />
                Approve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
