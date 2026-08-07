import { useEffect, useMemo, useState } from 'react';
import { Search, RefreshCcw, Layers } from 'lucide-react';
import { getWarehouseInventory } from '../../api/warehouse';

const getStatus = (available) => {
  if (available === 0) {
    return { label: 'Out of Stock', variant: 'bg-accent-danger/10 border-accent-danger/20 text-accent-danger' };
  }
  if (available <= 20) {
    return { label: 'Low Stock', variant: 'bg-amber-500/10 border-amber-500/20 text-amber-600' };
  }
  return { label: 'In Stock', variant: 'bg-accent-secondary/10 border-accent-secondary/20 text-accent-secondary' };
};

export default function WarehouseInventory() {
  const [search, setSearch] = useState('');
  const [items, setItems] = useState([]);
  const [lastSync, setLastSync] = useState('2 minutes ago');
  const [loading, setLoading] = useState(true);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await getWarehouseInventory();
      setItems(res.data || []);
      setLastSync('Just now');
    } catch (err) {
      console.error('Failed to load inventory', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return items;
    return items.filter((item) => {
      const productName = item.product?.name || '';
      const categoryName = item.product?.category?.name || '';
      return productName.toLowerCase().includes(query) ||
             categoryName.toLowerCase().includes(query);
    });
  }, [items, search]);

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-3 gradient-text text-3xl font-extrabold tracking-tight">
            <Layers size={28} className="text-accent-primary shrink-0" />
            <span>Inventory Status</span>
          </h1>
          <p className="text-sm text-text-secondary mt-1.5">Track product availability, reserved stock, and warehouse inventory health.</p>
        </div>
        <div>
          <button
            type="button"
            className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-accent-primary to-indigo-600 hover:from-indigo-600 hover:to-accent-primary text-white font-bold text-sm shadow-md shadow-accent-primary/10 hover:shadow-lg hover:shadow-accent-primary/25 transition-all duration-300 transform hover:-translate-y-0.5 active:scale-98 cursor-pointer"
            onClick={fetchInventory}
            disabled={loading}
          >
            <RefreshCcw size={16} className={`${loading ? 'animate-spin' : ''}`} />
            <span>Sync Inventory</span>
          </button>
        </div>
      </div>

      {/* Search Filter Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-glass-border pb-5 mb-6">
        <h2 className="text-base font-bold text-text-primary">In-Stock Products</h2>
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-glass-border bg-glass/5 text-sm placeholder-text-muted focus:outline-none focus:border-accent-primary transition-colors"
            placeholder="Search product or category..."
          />
        </div>
      </div>

      {/* Inventory Table */}
      <div className="overflow-x-auto rounded-xl border border-glass-border bg-glass/5">
        <table className="min-w-full divide-y divide-glass-border text-sm text-left">
          <thead className="bg-bg-tertiary/70 text-[11px] font-bold text-text-muted uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4">Product Specs</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">Available Stock</th>
              <th className="px-6 py-4">Reserved Stock</th>
              <th className="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-glass-border/40">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-text-secondary">Loading inventory...</td>
              </tr>
            ) : filteredItems.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-text-secondary">No inventory items found.</td>
              </tr>
            ) : (
              filteredItems.map((item) => {
                const status = getStatus(item.availableQuantity);
                return (
                  <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-text-primary text-sm">{item.product?.name || 'Unknown Product'}</div>
                      <div className="text-xs text-text-muted mt-0.5">{item.product?.brand || ''}</div>
                    </td>
                    <td className="px-6 py-4 text-text-secondary font-medium">{item.product?.category?.name || 'Uncategorized'}</td>
                    <td className="px-6 py-4 font-bold text-text-primary">{item.availableQuantity} units</td>
                    <td className="px-6 py-4 text-text-secondary">{item.reservedQuantity} units</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 border rounded-full ${status.variant}`}>
                        {status.label}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6 text-xs text-text-muted">Last inventory sync: {lastSync}</div>
    </div>
  );
}
