import { useState } from 'react';
import { Percent, DollarSign, Wallet, Store, Check, Edit2, ArrowUpRight, Calculator, ShieldCheck, RefreshCw, Filter, Sparkles } from 'lucide-react';
import { updateVendorCommission } from '../../api/vendors';
import { Link } from 'react-router-dom';

const COMMISSION_PRESETS = [
  { label: 'Starter / Standard', rate: 0.10, desc: '10% default platform fee' },
  { label: 'Silver Partner', rate: 0.08, desc: '8% reduced rate' },
  { label: 'Gold Partner', rate: 0.05, desc: '5% high-volume partner' },
  { label: 'High Support / Growth', rate: 0.15, desc: '15% premium service tier' },
  { label: 'Zero Fee Promo', rate: 0.00, desc: '0% introductory rate' },
];

export default function CommissionManagement({ vendors, setVendors, dashboardStats }) {
  const [editingVendorId, setEditingVendorId] = useState(null);
  const [editRate, setEditRate] = useState('');
  const [savingId, setSavingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [successMessage, setSuccessMessage] = useState('');
  const [calcAmount, setCalcAmount] = useState(5000);
  const [calcRate, setCalcRate] = useState(10);

  const handleStartEdit = (vendor) => {
    setEditingVendorId(vendor.id);
    const currentPct = (parseFloat(vendor.commissionRate || 0.10) * 100).toFixed(1);
    setEditRate(currentPct.endsWith('.0') ? currentPct.replace('.0', '') : currentPct);
  };

  const handleSaveCommission = async (vendorId) => {
    const rateNum = parseFloat(editRate);
    if (isNaN(rateNum) || rateNum < 0 || rateNum > 100) {
      alert('Please enter a valid commission percentage between 0% and 100%.');
      return;
    }

    setSavingId(vendorId);
    try {
      // Backend handles both decimal (0.10) and percentage (10)
      const decimalRate = rateNum / 100;
      const res = await updateVendorCommission(vendorId, decimalRate);
      setVendors((prev) => prev.map((v) => (v.id === vendorId ? { ...v, commissionRate: res.data.commissionRate || decimalRate } : v)));
      setEditingVendorId(null);
      setSuccessMessage(`Updated commission rate to ${rateNum}% for ${res.data.storeName || 'vendor'}.`);
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update commission rate.');
    } finally {
      setSavingId(null);
    }
  };

  const handleApplyPreset = async (vendorId, presetRate) => {
    setSavingId(vendorId);
    try {
      const res = await updateVendorCommission(vendorId, presetRate);
      setVendors((prev) => prev.map((v) => (v.id === vendorId ? { ...v, commissionRate: res.data.commissionRate || presetRate } : v)));
      setEditingVendorId(null);
      setSuccessMessage(`Applied ${(presetRate * 100).toFixed(0)}% preset rate.`);
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to apply preset.');
    } finally {
      setSavingId(null);
    }
  };

  const filteredVendors = vendors.filter((v) => {
    const matchesSearch =
      (v.storeName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (v.user?.firstName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (v.user?.lastName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (v.user?.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || v.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const avgCommission =
    vendors.length > 0
      ? (
          (vendors.reduce((sum, v) => sum + parseFloat(v.commissionRate != null ? v.commissionRate : 0.10), 0) /
            vendors.length) *
          100
        ).toFixed(1)
      : '10.0';

  const simCommission = ((calcAmount * calcRate) / 100).toFixed(2);
  const simPayout = (calcAmount - parseFloat(simCommission)).toFixed(2);

  return (
    <div className="flex flex-col gap-8">
      {/* Success banner */}
      {successMessage && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 text-sm font-semibold animate-in fade-in">
          <Check size={18} />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="flex items-center gap-4 p-5 rounded-xl border border-glass-border bg-glass/10 backdrop-blur-md">
          <div className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0 bg-accent-primary/10 text-accent-primary">
            <Percent size={22} />
          </div>
          <div>
            <p className="font-display text-2xl font-extrabold text-text-primary leading-none">{avgCommission}%</p>
            <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mt-1">Avg Commission Rate</p>
            <p className="text-[9px] font-medium text-text-secondary mt-1 opacity-80">Across {vendors.length} vendors</p>
          </div>
        </div>

        <div className="flex items-center gap-4 p-5 rounded-xl border border-glass-border bg-glass/10 backdrop-blur-md">
          <div className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0 bg-emerald-500/10 text-emerald-600">
            <DollarSign size={22} />
          </div>
          <div>
            <p className="font-display text-2xl font-extrabold text-emerald-600 leading-none">
              ₹{dashboardStats?.totalCommission ? Number(dashboardStats.totalCommission).toLocaleString('en-IN') : '0'}
            </p>
            <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mt-1">Platform Revenue</p>
            <p className="text-[9px] font-medium text-emerald-600/80 mt-1">Commission retained</p>
          </div>
        </div>

        <div className="flex items-center gap-4 p-5 rounded-xl border border-glass-border bg-glass/10 backdrop-blur-md">
          <div className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0 bg-indigo-500/10 text-indigo-600">
            <Wallet size={22} />
          </div>
          <div>
            <p className="font-display text-2xl font-extrabold text-indigo-600 leading-none">
              ₹{dashboardStats?.totalPayout ? Number(dashboardStats.totalPayout).toLocaleString('en-IN') : '0'}
            </p>
            <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mt-1">Vendor Payouts</p>
            <p className="text-[9px] font-medium text-text-secondary mt-1 opacity-80">Settled net balance</p>
          </div>
        </div>

        <div className="flex items-center gap-4 p-5 rounded-xl border border-glass-border bg-glass/10 backdrop-blur-md">
          <div className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0 bg-purple-500/10 text-purple-600">
            <ShieldCheck size={22} />
          </div>
          <div>
            <p className="font-display text-2xl font-extrabold text-text-primary leading-none">10.0%</p>
            <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mt-1">Platform Default</p>
            <p className="text-[9px] font-medium text-text-secondary mt-1 opacity-80">New vendor standard rate</p>
          </div>
        </div>
      </div>

      {/* Commission Simulator & Quick Tier Presets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Simulator Widget */}
        <div className="p-6 rounded-2xl border border-glass-border bg-glass/10 backdrop-blur-md flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-accent-primary font-bold text-xs uppercase tracking-wider mb-2">
              <Calculator size={16} />
              <span>Interactive Commission Simulator</span>
            </div>
            <h3 className="text-base font-bold text-text-primary mb-4">Simulate Order Payout & Fee</h3>

            <div className="flex flex-col gap-3">
              <div>
                <label className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">Sample Order Amount (₹)</label>
                <input
                  type="number"
                  value={calcAmount}
                  onChange={(e) => setCalcAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full mt-1 bg-bg-tertiary border border-glass-border rounded-lg text-text-primary text-sm px-3.5 py-2 outline-none focus:border-accent-primary"
                />
              </div>

              <div>
                <div className="flex justify-between items-center text-[11px] font-semibold text-text-muted uppercase tracking-wider">
                  <span>Commission Rate</span>
                  <span className="text-accent-primary font-bold text-xs">{calcRate}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="30"
                  step="0.5"
                  value={calcRate}
                  onChange={(e) => setCalcRate(parseFloat(e.target.value))}
                  className="w-full mt-2 accent-accent-primary cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-glass-border/50 grid grid-cols-2 gap-3 bg-bg-tertiary/40 p-3.5 rounded-xl">
            <div>
              <span className="text-[10px] text-emerald-600 uppercase font-bold block">Vendor Commission Profit</span>
              <span className="text-base font-extrabold text-emerald-600">+₹{simCommission}</span>
            </div>
            <div>
              <span className="text-[10px] text-text-muted uppercase font-bold block">Platform Base Share</span>
              <span className="text-base font-extrabold text-indigo-500">₹{simPayout}</span>
            </div>
          </div>
        </div>

        {/* Tier Presets Overview */}
        <div className="lg:col-span-2 p-6 rounded-2xl border border-glass-border bg-glass/10 backdrop-blur-md flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-violet-500 font-bold text-xs uppercase tracking-wider mb-2">
              <Sparkles size={16} />
              <span>Standard Commission Tiers</span>
            </div>
            <h3 className="text-base font-bold text-text-primary mb-2">Platform Rate Guidelines</h3>
            <p className="text-xs text-text-secondary mb-4">
              You can override and configure custom commission rates for each merchant individually based on agreement, volume, or category.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {COMMISSION_PRESETS.map((preset) => (
                <div key={preset.label} className="p-3.5 rounded-xl bg-bg-tertiary/40 border border-glass-border/60 flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-text-primary">{preset.label}</span>
                    <span className="text-xs font-extrabold text-accent-primary bg-accent-primary/10 px-2 py-0.5 rounded-full">
                      {(preset.rate * 100).toFixed(0)}%
                    </span>
                  </div>
                  <p className="text-[10px] text-text-muted mt-1">{preset.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between text-xs text-text-secondary bg-bg-tertiary/20 p-3 rounded-lg border border-glass-border/30">
            <span>Automated settlement takes effect immediately for all subsequent orders.</span>
            <Link to="/admin/reports/vendor" className="text-accent-primary hover:underline font-bold flex items-center gap-1">
              <span>View Earnings Report</span>
              <ArrowUpRight size={12} />
            </Link>
          </div>
        </div>
      </div>

      {/* Vendors Commission Management Table */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-text-primary">Merchant Commission Settings</h2>
            <p className="text-xs text-text-secondary">View and adjust commission rates per vendor</p>
          </div>

          {/* Search and Filters */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search vendor or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-bg-tertiary border border-glass-border rounded-lg text-text-primary text-xs px-3 py-2 outline-none focus:border-accent-primary w-full sm:w-60"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-bg-tertiary border border-glass-border rounded-lg text-text-primary text-xs font-semibold px-3 py-2 outline-none focus:border-accent-primary cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="APPROVED">Approved</option>
              <option value="PENDING_APPROVAL">Pending</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-glass-border bg-glass/5">
          {filteredVendors.length === 0 ? (
            <div className="p-12 text-center text-text-muted">
              <Store size={36} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm font-semibold">No vendors matched your search</p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-glass-border text-sm text-left">
              <thead className="bg-bg-tertiary/70 text-[11px] font-bold text-text-muted uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Store & Merchant</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Active Commission Rate</th>
                  <th className="px-6 py-4">Rate Presets</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-glass-border/40">
                {filteredVendors.map((v) => {
                  const currentRateVal = v.commissionRate != null ? parseFloat(v.commissionRate) : 0.10;
                  const isEditing = editingVendorId === v.id;
                  const isSaving = savingId === v.id;

                  return (
                    <tr key={v.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-accent-primary/10 text-accent-primary flex items-center justify-center font-bold text-sm shrink-0">
                            {v.storeName ? v.storeName.charAt(0).toUpperCase() : 'V'}
                          </div>
                          <div>
                            <div className="font-bold text-text-primary">{v.storeName}</div>
                            <div className="text-xs text-text-muted">
                              {v.user?.firstName} {v.user?.lastName} • {v.user?.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                            v.status === 'APPROVED'
                              ? 'bg-accent-secondary/10 border-accent-secondary/20 text-accent-secondary'
                              : v.status === 'REJECTED'
                              ? 'bg-accent-danger/10 border-accent-danger/20 text-accent-danger'
                              : 'bg-accent-warning/10 border-accent-warning/20 text-accent-warning'
                          }`}
                        >
                          {v.status}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        {isEditing ? (
                          <div className="flex items-center gap-2">
                            <div className="relative">
                              <input
                                type="number"
                                step="0.1"
                                min="0"
                                max="100"
                                value={editRate}
                                onChange={(e) => setEditRate(e.target.value)}
                                className="w-24 bg-bg-tertiary border border-accent-primary rounded-lg text-text-primary text-xs font-bold px-2.5 py-1.5 outline-none"
                                placeholder="10.0"
                                autoFocus
                              />
                              <span className="absolute right-2.5 top-1.5 text-xs text-text-muted font-bold">%</span>
                            </div>
                            <button
                              disabled={isSaving}
                              onClick={() => handleSaveCommission(v.id)}
                              className="inline-flex items-center gap-1 bg-accent-primary hover:bg-accent-primary-hover text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm cursor-pointer disabled:opacity-50"
                            >
                              <Check size={12} />
                              <span>{isSaving ? 'Saving...' : 'Save'}</span>
                            </button>
                            <button
                              onClick={() => setEditingVendorId(null)}
                              className="text-xs text-text-muted hover:text-text-primary px-2 py-1.5 cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2.5">
                            <span className="inline-flex items-center font-extrabold text-sm text-text-primary bg-bg-tertiary/70 border border-glass-border px-3 py-1 rounded-lg">
                              {(currentRateVal * 100).toFixed(1)}%
                            </span>
                            <span className="text-[10px] text-text-muted">
                              (Platform retains ₹{(1000 * currentRateVal).toFixed(0)} per ₹1,000)
                            </span>
                          </div>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {[0.05, 0.08, 0.10, 0.15].map((rate) => {
                            const isCurrent = Math.abs(currentRateVal - rate) < 0.001;
                            return (
                              <button
                                key={rate}
                                disabled={isSaving || isCurrent}
                                onClick={() => handleApplyPreset(v.id, rate)}
                                className={`text-[10px] font-bold px-2 py-1 rounded border transition-all cursor-pointer ${
                                  isCurrent
                                    ? 'bg-accent-primary text-white border-accent-primary font-extrabold shadow-sm'
                                    : 'bg-bg-tertiary/50 hover:bg-bg-tertiary border-glass-border text-text-secondary hover:text-text-primary'
                                }`}
                              >
                                {(rate * 100).toFixed(0)}%
                              </button>
                            );
                          })}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {!isEditing && (
                            <button
                              onClick={() => handleStartEdit(v)}
                              className="inline-flex items-center gap-1 bg-bg-tertiary hover:bg-bg-tertiary/80 text-text-primary border border-glass-border text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                            >
                              <Edit2 size={12} />
                              <span>Custom Rate</span>
                            </button>
                          )}
                          <Link
                            to="/admin/reports/vendor"
                            className="inline-flex items-center gap-1 bg-accent-primary/10 hover:bg-accent-primary/20 text-accent-primary border border-accent-primary/20 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                            title="View Financials"
                          >
                            <ArrowUpRight size={12} />
                            <span>Report</span>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
