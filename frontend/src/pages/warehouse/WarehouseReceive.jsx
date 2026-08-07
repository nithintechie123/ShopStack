import { useEffect, useState } from 'react';
import { getWarehouses, addWarehouseInventory } from '../../api/warehouse';
import { searchProducts } from '../../api/products';
import { PackageOpen } from 'lucide-react';

export default function WarehouseReceive() {
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    warehouseId: '',
    productId: '',
    availableQuantity: 1,
  });
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [wRes, pRes] = await Promise.all([
          getWarehouses(),
          searchProducts(),
        ]);
        setWarehouses(wRes.data || []);
        setProducts(pRes.data || []);
        setForm({
          warehouseId: wRes.data?.[0]?.id || '',
          productId: pRes.data?.[0]?.id || '',
          availableQuantity: 1,
        });
      } catch (err) {
        console.error('Failed to load options', err);
        setError('Failed to load warehouses or products.');
      } finally {
        setLoading(false);
      }
    };
    loadOptions();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSuccess(false);
    setError('');

    if (!form.warehouseId || !form.productId || !form.availableQuantity) {
      setError('Please select a warehouse, product, and quantity.');
      return;
    }

    try {
      await addWarehouseInventory({
        warehouseId: form.warehouseId,
        productId: form.productId,
        availableQuantity: parseInt(form.availableQuantity, 10),
      });
      setSuccess(true);
      setError('');
      setForm((prev) => ({ ...prev, availableQuantity: 1 }));
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add inventory.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="flex items-center gap-3 gradient-text text-3xl font-extrabold tracking-tight">
          <PackageOpen size={28} className="text-accent-primary shrink-0" />
          <span>Receive Inventory</span>
        </h1>
        <p className="text-sm text-text-secondary mt-1.5">Capture inbound stock and register new products in the warehouse system.</p>
      </div>

      <div className="rounded-2xl border border-glass-border bg-glass/5 p-6 md:p-8 shadow-sm">
        {success && (
          <div className="mb-6 p-4 rounded-xl bg-accent-secondary/10 border border-accent-secondary/20 text-accent-secondary text-sm font-semibold">
            Inventory received successfully.
          </div>
        )}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-accent-danger/10 border border-accent-danger/20 text-accent-danger text-sm font-semibold">
            {error}
          </div>
        )}
        
        {loading ? (
          <div className="text-center py-12 text-text-secondary text-sm">Loading receive options...</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label htmlFor="warehouseId" className="text-[10px] uppercase font-bold text-text-secondary tracking-wider">
                  Warehouse
                </label>
                <select
                  id="warehouseId"
                  name="warehouseId"
                  value={form.warehouseId}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-glass-border bg-bg-secondary text-sm text-text-primary focus:outline-none focus:border-accent-primary transition-colors cursor-pointer"
                >
                  <option value="">Select Warehouse...</option>
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>{w.warehouseName} ({w.warehouseCode})</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="productId" className="text-[10px] uppercase font-bold text-text-secondary tracking-wider">
                  Product
                </label>
                <select
                  id="productId"
                  name="productId"
                  value={form.productId}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-glass-border bg-bg-secondary text-sm text-text-primary focus:outline-none focus:border-accent-primary transition-colors cursor-pointer"
                >
                  <option value="">Select Product...</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} ({p.brand})</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="availableQuantity" className="text-[10px] uppercase font-bold text-text-secondary tracking-wider">
                Quantity (Units)
              </label>
              <input
                id="availableQuantity"
                name="availableQuantity"
                type="number"
                min="1"
                value={form.availableQuantity}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-glass-border bg-glass/5 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-primary transition-colors"
                placeholder="Enter stock quantity..."
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full group inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-accent-primary to-indigo-600 hover:from-indigo-600 hover:to-accent-primary text-white font-bold text-sm shadow-md shadow-accent-primary/10 hover:shadow-lg hover:shadow-accent-primary/25 transition-all duration-300 transform hover:-translate-y-0.5 active:scale-98 cursor-pointer"
              >
                Receive Inventory
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
