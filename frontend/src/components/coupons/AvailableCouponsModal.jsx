import { useState, useEffect } from 'react';
import { getActiveCoupons } from '../../api/coupons';
import { Ticket, X, Check, Copy, AlertCircle, Sparkles, Tag, ChevronRight } from 'lucide-react';

export default function AvailableCouponsModal({ isOpen, onClose, onApplyCoupon, currentSubtotal = 0 }) {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState('');

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      getActiveCoupons()
        .then((res) => {
          setCoupons(res.data || []);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(''), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-bg-primary border border-glass-border rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl text-text-primary flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-glass-border bg-bg-secondary shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-accent-primary/10 text-accent-primary">
              <Sparkles size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold">Available Offers & Coupons</h3>
              <p className="text-[11px] text-text-muted">Select an offer to apply discount at checkout</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary transition-colors cursor-pointer p-1 rounded-lg hover:bg-bg-tertiary"
          >
            <X size={20} />
          </button>
        </div>

        {/* List of Coupons */}
        <div className="p-6 overflow-y-auto space-y-4">
          {loading ? (
            <div className="py-8 text-center text-sm text-text-muted flex flex-col items-center gap-2">
              <Ticket className="animate-spin text-accent-primary" size={24} />
              <span>Fetching best offers for you...</span>
            </div>
          ) : coupons.length === 0 ? (
            <div className="py-12 text-center text-text-muted space-y-2">
              <Ticket size={36} className="mx-auto opacity-30" />
              <p className="text-sm font-semibold">No promotional coupons available right now.</p>
              <p className="text-xs">Check back soon for exclusive discounts!</p>
            </div>
          ) : (
            coupons.map((c) => {
              const isMinSpendMet = !c.minOrderAmount || currentSubtotal >= parseFloat(c.minOrderAmount);
              const remainingSpend = c.minOrderAmount ? parseFloat(c.minOrderAmount) - currentSubtotal : 0;

              return (
                <div
                  key={c.id || c.code}
                  className={`relative p-4 rounded-xl border transition-all ${
                    isMinSpendMet
                      ? 'border-accent-primary/30 bg-accent-primary/[0.03] hover:border-accent-primary hover:shadow-md'
                      : 'border-glass-border bg-bg-tertiary/30 opacity-80'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    {/* Left details */}
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-extrabold text-sm text-accent-primary bg-accent-primary/10 border border-accent-primary/20 px-2.5 py-0.5 rounded-lg flex items-center gap-1">
                          <Tag size={12} />
                          {c.code}
                        </span>
                        {c.discountType === 'PERCENTAGE' ? (
                          <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded">
                            {c.discountValue}% OFF
                          </span>
                        ) : (
                          <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
                            ₹{parseFloat(c.discountValue).toFixed(0)} FLAT OFF
                          </span>
                        )}
                      </div>

                      {c.description && (
                        <p className="text-xs text-text-primary font-medium leading-relaxed">
                          {c.description}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-text-muted pt-1">
                        {c.minOrderAmount && (
                          <span>Min Spend: <strong className="text-text-secondary">₹{c.minOrderAmount}</strong></span>
                        )}
                        {c.maxDiscountAmount && (
                          <span>Max Discount: <strong className="text-text-secondary">₹{c.maxDiscountAmount}</strong></span>
                        )}
                        {c.expiryDate && (
                          <span>Valid till: <strong className="text-text-secondary">{new Date(c.expiryDate).toLocaleDateString()}</strong></span>
                        )}
                      </div>

                      {!isMinSpendMet && (
                        <p className="text-[11px] font-semibold text-amber-400 flex items-center gap-1 mt-1">
                          <AlertCircle size={12} />
                          Add ₹{remainingSpend.toFixed(2)} more to unlock this coupon!
                        </p>
                      )}
                    </div>

                    {/* Right action button */}
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <button
                        disabled={!isMinSpendMet}
                        onClick={() => {
                          onApplyCoupon(c.code);
                          onClose();
                        }}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                          isMinSpendMet
                            ? 'bg-accent-primary hover:bg-accent-primary-hover text-white shadow-sm shadow-accent-primary/20'
                            : 'bg-glass-border/40 text-text-muted cursor-not-allowed'
                        }`}
                      >
                        <span>Apply</span>
                        <ChevronRight size={14} />
                      </button>

                      <button
                        onClick={() => copyCode(c.code)}
                        className="text-[11px] text-text-muted hover:text-text-primary flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        {copiedCode === c.code ? (
                          <>
                            <Check size={12} className="text-emerald-500" />
                            <span className="text-emerald-500 font-semibold">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy size={12} />
                            <span>Copy Code</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-glass-border bg-bg-secondary text-center text-xs text-text-muted shrink-0">
          Coupons cannot be combined with other ongoing promotions.
        </div>
      </div>
    </div>
  );
}
