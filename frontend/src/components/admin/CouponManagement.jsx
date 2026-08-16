import { useState, useEffect } from 'react';
import {
  getAllCoupons,
  getCouponStats,
  createCoupon,
  updateCoupon,
  toggleCouponStatus,
  deleteCoupon
} from '../../api/coupons';
import {
  Ticket,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Tag,
  Percent,
  IndianRupee,
  TrendingUp,
  AlertCircle,
  X,
  Copy,
  Check
} from 'lucide-react';
import DashboardCards from './DashboardCards';

export default function CouponManagement() {
  const [coupons, setCoupons] = useState([]);
  const [stats, setStats] = useState({
    totalCoupons: 0,
    activeCoupons: 0,
    expiredCoupons: 0,
    totalRedemptions: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'PERCENTAGE',
    discountValue: '',
    minOrderAmount: '',
    maxDiscountAmount: '',
    usageLimit: '',
    startDate: '',
    expiryDate: '',
    active: true,
    description: ''
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Deletion state
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Copy code feedback
  const [copiedCode, setCopiedCode] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [couponsRes, statsRes] = await Promise.all([
        getAllCoupons(),
        getCouponStats()
      ]);
      setCoupons(couponsRes.data || []);
      setStats(statsRes.data || {});
    } catch (err) {
      console.error('Failed to load coupon data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingCoupon(null);
    setFormData({
      code: '',
      discountType: 'PERCENTAGE',
      discountValue: '',
      minOrderAmount: '',
      maxDiscountAmount: '',
      usageLimit: '',
      startDate: '',
      expiryDate: '',
      active: true,
      description: ''
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleOpenEditModal = (coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code || '',
      discountType: coupon.discountType || 'PERCENTAGE',
      discountValue: coupon.discountValue !== null ? coupon.discountValue : '',
      minOrderAmount: coupon.minOrderAmount !== null ? coupon.minOrderAmount : '',
      maxDiscountAmount: coupon.maxDiscountAmount !== null ? coupon.maxDiscountAmount : '',
      usageLimit: coupon.usageLimit !== null ? coupon.usageLimit : '',
      startDate: coupon.startDate ? coupon.startDate.substring(0, 16) : '',
      expiryDate: coupon.expiryDate ? coupon.expiryDate.substring(0, 16) : '',
      active: coupon.active !== undefined ? coupon.active : true,
      description: coupon.description || ''
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleToggleStatus = async (id) => {
    try {
      const res = await toggleCouponStatus(id);
      setCoupons((prev) => prev.map((c) => (c.id === id ? res.data : c)));
      loadData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to toggle status');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteCoupon(id);
      setCoupons((prev) => prev.filter((c) => c.id !== id));
      setDeleteConfirmId(null);
      loadData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete coupon');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.code.trim()) {
      setFormError('Coupon code is required');
      return;
    }
    if (!formData.discountValue || parseFloat(formData.discountValue) <= 0) {
      setFormError('Discount value must be a positive number');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        code: formData.code.trim().toUpperCase(),
        discountType: formData.discountType,
        discountValue: parseFloat(formData.discountValue),
        minOrderAmount: formData.minOrderAmount ? parseFloat(formData.minOrderAmount) : null,
        maxDiscountAmount: formData.maxDiscountAmount ? parseFloat(formData.maxDiscountAmount) : null,
        usageLimit: formData.usageLimit ? parseInt(formData.usageLimit, 10) : null,
        startDate: formData.startDate ? formData.startDate + ':00' : null,
        expiryDate: formData.expiryDate ? formData.expiryDate + ':00' : null,
        active: formData.active,
        description: formData.description.trim()
      };

      if (editingCoupon) {
        await updateCoupon(editingCoupon.id, payload);
      } else {
        await createCoupon(payload);
      }

      setModalOpen(false);
      loadData();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to save coupon.');
    } finally {
      setSubmitting(false);
    }
  };

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(''), 2000);
  };

  const now = new Date();

  const filteredCoupons = coupons.filter((c) => {
    const matchesSearch =
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const isExpired = c.expiryDate && new Date(c.expiryDate) < now;
    const isLimitReached = c.usageLimit && c.usedCount >= c.usageLimit;

    if (!matchesSearch) return false;

    if (statusFilter === 'ACTIVE') return c.active && !isExpired && !isLimitReached;
    if (statusFilter === 'EXPIRED') return isExpired;
    if (statusFilter === 'INACTIVE') return !c.active;
    if (statusFilter === 'LIMIT_REACHED') return isLimitReached;

    return true;
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
            <Ticket className="text-accent-primary" size={22} />
            <span>Coupon & Promotional Management</span>
          </h2>
          <p className="text-xs text-text-secondary mt-1">
            Create discount vouchers, configure usage caps, minimum spend rules, and track customer redemptions.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-accent-primary to-indigo-600 hover:from-indigo-600 hover:to-accent-primary text-white font-bold text-xs shadow-md shadow-accent-primary/20 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer"
        >
          <Plus size={16} />
          <span>Create Coupon</span>
        </button>
      </div>

      {/* Analytics Cards */}
      <DashboardCards
        cards={[
          {
            icon: Ticket,
            label: 'Total Coupons',
            value: stats.totalCoupons || 0,
            bg: 'bg-accent-primary/10 text-accent-primary'
          },
          {
            icon: CheckCircle,
            label: 'Active Offers',
            value: stats.activeCoupons || 0,
            bg: 'bg-emerald-500/10 text-emerald-500'
          },
          {
            icon: Clock,
            label: 'Expired Coupons',
            value: stats.expiredCoupons || 0,
            bg: 'bg-amber-500/10 text-amber-500'
          },
          {
            icon: TrendingUp,
            label: 'Total Redemptions',
            value: stats.totalRedemptions || 0,
            bg: 'bg-indigo-500/10 text-indigo-500'
          }
        ]}
      />

      {/* Search & Filter controls */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 items-center bg-bg-secondary/60 p-4 rounded-xl border border-glass-border">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search code or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-bg-tertiary border border-glass-border rounded-lg text-text-primary text-xs px-3 py-2 pl-9 outline-none transition-all focus:border-accent-primary"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {['ALL', 'ACTIVE', 'EXPIRED', 'LIMIT_REACHED', 'INACTIVE'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                statusFilter === st
                  ? 'bg-accent-primary text-white shadow-sm'
                  : 'bg-bg-tertiary text-text-secondary hover:text-text-primary hover:bg-glass-border/30'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Coupons Table */}
      <div className="overflow-x-auto rounded-xl border border-glass-border bg-glass/5 shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-sm text-text-muted">Loading coupons...</div>
        ) : filteredCoupons.length === 0 ? (
          <div className="p-12 text-center text-text-muted flex flex-col items-center gap-3">
            <Ticket size={36} className="opacity-40" />
            <span className="font-medium text-sm">No coupons found.</span>
            <button
              onClick={handleOpenCreateModal}
              className="text-xs text-accent-primary font-bold hover:underline"
            >
              Create one now
            </button>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-glass-border text-sm text-left">
            <thead className="bg-bg-tertiary/70 text-[11px] font-bold text-text-muted uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Coupon Code</th>
                <th className="px-6 py-4">Discount</th>
                <th className="px-6 py-4">Min Spend / Cap</th>
                <th className="px-6 py-4">Redemptions</th>
                <th className="px-6 py-4">Expiry Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-glass-border/40">
              {filteredCoupons.map((c) => {
                const isExpired = c.expiryDate && new Date(c.expiryDate) < now;
                const isLimitReached = c.usageLimit && c.usedCount >= c.usageLimit;

                let statusBadge = (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
                    <CheckCircle size={10} /> Active
                  </span>
                );

                if (!c.active) {
                  statusBadge = (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-gray-500/10 border border-gray-500/20 text-gray-400">
                      <XCircle size={10} /> Disabled
                    </span>
                  );
                } else if (isExpired) {
                  statusBadge = (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500">
                      <Clock size={10} /> Expired
                    </span>
                  );
                } else if (isLimitReached) {
                  statusBadge = (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-500">
                      <AlertCircle size={10} /> Limit Reached
                    </span>
                  );
                }

                return (
                  <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                    {/* Code */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm bg-accent-primary/10 text-accent-primary px-3 py-1 rounded-lg border border-accent-primary/20 flex items-center gap-1.5">
                          <Tag size={13} />
                          {c.code}
                        </span>
                        <button
                          onClick={() => copyToClipboard(c.code)}
                          title="Copy Code"
                          className="text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                        >
                          {copiedCode === c.code ? (
                            <Check size={14} className="text-emerald-500" />
                          ) : (
                            <Copy size={14} />
                          )}
                        </button>
                      </div>
                      {c.description && (
                        <p className="text-xs text-text-muted mt-1 max-w-xs truncate">
                          {c.description}
                        </p>
                      )}
                    </td>

                    {/* Discount Value */}
                    <td className="px-6 py-4">
                      <div className="font-bold text-text-primary flex items-center gap-1">
                        {c.discountType === 'PERCENTAGE' ? (
                          <span className="text-emerald-500 font-extrabold text-base">
                            {c.discountValue}% OFF
                          </span>
                        ) : (
                          <span className="text-indigo-400 font-extrabold text-base">
                            ₹{parseFloat(c.discountValue).toFixed(0)} FLAT
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-text-muted uppercase font-semibold">
                        {c.discountType}
                      </span>
                    </td>

                    {/* Min Spend / Cap */}
                    <td className="px-6 py-4 text-xs">
                      <div>
                        <span className="text-text-muted">Min Spend: </span>
                        <span className="font-semibold text-text-primary">
                          {c.minOrderAmount ? `₹${c.minOrderAmount}` : 'None'}
                        </span>
                      </div>
                      {c.discountType === 'PERCENTAGE' && c.maxDiscountAmount && (
                        <div className="text-text-muted text-[11px] mt-0.5">
                          Cap: <span className="font-semibold text-text-primary">₹{c.maxDiscountAmount}</span>
                        </div>
                      )}
                    </td>

                    {/* Redemptions */}
                    <td className="px-6 py-4 text-xs">
                      <div className="font-bold text-text-primary">
                        {c.usedCount} {c.usageLimit ? `/ ${c.usageLimit}` : 'uses'}
                      </div>
                      {c.usageLimit && (
                        <div className="w-24 bg-bg-tertiary rounded-full h-1.5 mt-1 overflow-hidden">
                          <div
                            className={`h-full ${
                              c.usedCount >= c.usageLimit
                                ? 'bg-amber-500'
                                : 'bg-accent-primary'
                            }`}
                            style={{
                              width: `${Math.min(100, (c.usedCount / c.usageLimit) * 100)}%`
                            }}
                          />
                        </div>
                      )}
                    </td>

                    {/* Expiry */}
                    <td className="px-6 py-4 text-xs text-text-secondary">
                      {c.expiryDate ? (
                        <div>
                          <div>{new Date(c.expiryDate).toLocaleDateString()}</div>
                          <div className="text-[10px] text-text-muted">
                            {new Date(c.expiryDate).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                      ) : (
                        <span className="text-text-muted font-italic">No expiration</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">{statusBadge}</td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Toggle Active button */}
                        <button
                          onClick={() => handleToggleStatus(c.id)}
                          title={c.active ? 'Disable Coupon' : 'Enable Coupon'}
                          className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                            c.active
                              ? 'bg-amber-500/10 border-amber-500/20 text-amber-500 hover:bg-amber-500/20'
                              : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/20'
                          }`}
                        >
                          {c.active ? 'Disable' : 'Enable'}
                        </button>

                        <button
                          onClick={() => handleOpenEditModal(c)}
                          title="Edit Coupon"
                          className="p-1.5 text-text-muted hover:text-text-primary hover:bg-bg-tertiary rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit2 size={15} />
                        </button>

                        <button
                          onClick={() => setDeleteConfirmId(c.id)}
                          title="Delete Coupon"
                          className="p-1.5 text-text-muted hover:text-accent-danger hover:bg-accent-danger/10 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 size={15} />
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

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-bg-primary border border-glass-border rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl text-text-primary">
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-glass-border bg-bg-secondary">
              <h3 className="text-base font-bold flex items-center gap-2">
                <Ticket className="text-accent-primary" size={18} />
                <span>{editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}</span>
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-text-muted hover:text-text-primary transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 max-h-[75vh] overflow-y-auto space-y-4">
              {formError && (
                <div className="p-3 bg-accent-danger/10 border border-accent-danger/30 rounded-xl text-accent-danger text-xs font-semibold flex items-center gap-2">
                  <AlertCircle size={16} />
                  <span>{formError}</span>
                </div>
              )}

              {/* Code & Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">
                    Coupon Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SUMMER50"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({ ...formData, code: e.target.value.toUpperCase() })
                    }
                    className="w-full bg-bg-tertiary border border-glass-border rounded-lg text-text-primary text-xs px-3 py-2 outline-none font-mono font-bold uppercase transition-all focus:border-accent-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">
                    Discount Type *
                  </label>
                  <select
                    value={formData.discountType}
                    onChange={(e) =>
                      setFormData({ ...formData, discountType: e.target.value })
                    }
                    className="w-full bg-bg-tertiary border border-glass-border rounded-lg text-text-primary text-xs px-3 py-2 outline-none transition-all focus:border-accent-primary"
                  >
                    <option value="PERCENTAGE">PERCENTAGE (%)</option>
                    <option value="FLAT">FLAT AMOUNT (₹)</option>
                  </select>
                </div>
              </div>

              {/* Discount Value & Max Cap */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">
                    Discount Value * ({formData.discountType === 'PERCENTAGE' ? '%' : '₹'})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder={formData.discountType === 'PERCENTAGE' ? 'e.g. 20' : 'e.g. 500'}
                    value={formData.discountValue}
                    onChange={(e) =>
                      setFormData({ ...formData, discountValue: e.target.value })
                    }
                    className="w-full bg-bg-tertiary border border-glass-border rounded-lg text-text-primary text-xs px-3 py-2 outline-none transition-all focus:border-accent-primary"
                  />
                </div>

                {formData.discountType === 'PERCENTAGE' && (
                  <div>
                    <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">
                      Max Discount Cap (₹)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Optional max cap"
                      value={formData.maxDiscountAmount}
                      onChange={(e) =>
                        setFormData({ ...formData, maxDiscountAmount: e.target.value })
                      }
                      className="w-full bg-bg-tertiary border border-glass-border rounded-lg text-text-primary text-xs px-3 py-2 outline-none transition-all focus:border-accent-primary"
                    />
                  </div>
                )}
              </div>

              {/* Min Spend & Usage Limit */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">
                    Minimum Order Amount (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Min cart spend required"
                    value={formData.minOrderAmount}
                    onChange={(e) =>
                      setFormData({ ...formData, minOrderAmount: e.target.value })
                    }
                    className="w-full bg-bg-tertiary border border-glass-border rounded-lg text-text-primary text-xs px-3 py-2 outline-none transition-all focus:border-accent-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">
                    Usage Limit (Max Uses)
                  </label>
                  <input
                    type="number"
                    placeholder="Leave blank for unlimited"
                    value={formData.usageLimit}
                    onChange={(e) =>
                      setFormData({ ...formData, usageLimit: e.target.value })
                    }
                    className="w-full bg-bg-tertiary border border-glass-border rounded-lg text-text-primary text-xs px-3 py-2 outline-none transition-all focus:border-accent-primary"
                  />
                </div>
              </div>

              {/* Start & Expiry Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">
                    Start Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                    className="w-full bg-bg-tertiary border border-glass-border rounded-lg text-text-primary text-xs px-3 py-2 outline-none transition-all focus:border-accent-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">
                    Expiration Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.expiryDate}
                    onChange={(e) =>
                      setFormData({ ...formData, expiryDate: e.target.value })
                    }
                    className="w-full bg-bg-tertiary border border-glass-border rounded-lg text-text-primary text-xs px-3 py-2 outline-none transition-all focus:border-accent-primary"
                  />
                </div>
              </div>

              {/* Active Toggle & Description */}
              <div>
                <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">
                  Description / Offer Terms
                </label>
                <textarea
                  rows="2"
                  placeholder="e.g. Get 20% off on all items above ₹500"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full bg-bg-tertiary border border-glass-border rounded-lg text-text-primary text-xs px-3 py-2 outline-none transition-all focus:border-accent-primary"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="activeCheck"
                  checked={formData.active}
                  onChange={(e) =>
                    setFormData({ ...formData, active: e.target.checked })
                  }
                  className="w-4 h-4 rounded border-glass-border text-accent-primary accent-accent-primary cursor-pointer"
                />
                <label
                  htmlFor="activeCheck"
                  className="text-xs font-semibold text-text-primary cursor-pointer"
                >
                  Active & Enabled Immediately
                </label>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-glass-border">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="bg-transparent hover:bg-bg-tertiary border border-glass-border text-text-primary text-xs font-bold px-4 py-2 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-gradient-to-r from-accent-primary to-indigo-600 hover:from-indigo-600 hover:to-accent-primary text-white text-xs font-bold px-5 py-2 rounded-lg shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editingCoupon ? 'Update Coupon' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-bg-primary border border-glass-border rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-accent-danger/10 text-accent-danger flex items-center justify-center mx-auto">
              <Trash2 size={24} />
            </div>
            <h3 className="text-base font-bold text-text-primary">Delete Coupon?</h3>
            <p className="text-xs text-text-secondary">
              Are you sure you want to delete this coupon? Customers will no longer be able to redeem it.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="bg-bg-tertiary border border-glass-border text-text-primary text-xs font-bold px-4 py-2 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="bg-accent-danger text-white text-xs font-bold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
