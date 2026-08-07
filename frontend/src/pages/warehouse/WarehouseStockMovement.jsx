import { useEffect, useMemo, useState } from 'react';
import { Search, Activity } from 'lucide-react';
import { getStockMovements } from '../../api/warehouse';

export default function WarehouseStockMovement() {
  const [search, setSearch] = useState('');
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchMovements = async () => {
    try {
      const res = await getStockMovements();
      setMovements(res.data || []);
    } catch (err) {
      console.error('Failed to load stock movements', err);
      setError('Failed to load stock movements.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovements();
  }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return movements;
    return movements.filter((item) => {
      const productName = item.product?.name || '';
      const movementType = item.movementType || '';
      const warehouseName = item.warehouse?.warehouseName || '';
      const reference = item.reference || '';
      return productName.toLowerCase().includes(query) ||
             movementType.toLowerCase().includes(query) ||
             warehouseName.toLowerCase().includes(query) ||
             reference.toLowerCase().includes(query);
    });
  }, [movements, search]);

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="flex items-center gap-3 gradient-text text-3xl font-extrabold tracking-tight">
          <Activity size={28} className="text-accent-primary shrink-0" />
          <span>Stock Movement Ledger</span>
        </h1>
        <p className="text-sm text-text-secondary mt-1.5 font-medium">Review inbound and outbound stock logs across all warehouse operations.</p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-accent-danger/10 border border-accent-danger/20 text-accent-danger text-sm font-semibold">
          {error}
        </div>
      )}

      {/* Filter Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-glass-border pb-5 mb-6">
        <h2 className="text-base font-bold text-text-primary">Movement Logs</h2>
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search product, warehouse or reference"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-glass-border bg-glass/5 text-sm placeholder-text-muted focus:outline-none focus:border-accent-primary transition-colors text-text-primary"
          />
        </div>
      </div>

      {/* Movements Table */}
      <div className="overflow-x-auto rounded-xl border border-glass-border bg-glass/5">
        <table className="min-w-full divide-y divide-glass-border text-sm text-left">
          <thead className="bg-bg-tertiary/70 text-[11px] font-bold text-text-muted uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4">Product Details</th>
              <th className="px-6 py-4">Movement Type</th>
              <th className="px-6 py-4">Quantity</th>
              <th className="px-6 py-4">Warehouse</th>
              <th className="px-6 py-4">Timestamp</th>
              <th className="px-6 py-4">Reference ID / Handler</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-glass-border/40">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-text-secondary">Loading stock movements...</td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-text-secondary">No stock movements recorded.</td>
              </tr>
            ) : (
              filtered.map((item) => (
                <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-text-primary text-sm">{item.product?.name || 'Unknown'}</div>
                    <div className="text-xs text-text-muted mt-0.5">{item.product?.brand || ''}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 border rounded-full ${
                      item.movementType === 'IN' 
                        ? 'bg-accent-secondary/10 border-accent-secondary/20 text-accent-secondary' 
                        : 'bg-accent-danger/10 border-accent-danger/20 text-accent-danger'
                    }`}>
                      {item.movementType}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-semibold text-text-primary">{item.quantity} units</td>
                  <td className="px-6 py-4 text-text-secondary font-medium">{item.warehouse?.warehouseName || 'Unknown'}</td>
                  <td className="px-6 py-4 text-text-secondary">{item.createdAt ? new Date(item.createdAt).toLocaleString() : 'N/A'}</td>
                  <td className="px-6 py-4 text-text-secondary font-mono text-xs">{item.reference || 'System Auto'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
