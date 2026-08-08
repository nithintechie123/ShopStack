import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createWarehouse } from '../../api/warehouse';
import { ShieldAlert } from 'lucide-react';

const initialState = {
  warehouseName: '',
  warehouseCode: '',
  address: '',
  city: '',
  state: '',
  pincode: '',
  managerName: '',
  contactNumber: '',
  capacity: '100000',
  status: 'Active',
};

export default function WarehouseCreate() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialState);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    const payload = {
      warehouseName: form.warehouseName,
      warehouseCode: form.warehouseCode,
      address: form.address,
      city: form.city,
      state: form.state,
      pincode: form.pincode,
      managerName: form.managerName,
      contactNumber: form.contactNumber,
      capacity: parseInt(form.capacity, 10) || 100000,
    };

    try {
      await createWarehouse(payload);
      setSuccess(true);
      setError('');
      setTimeout(() => navigate('/admin/warehouses'), 1100);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create warehouse.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10 px-4 sm:px-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="flex items-center gap-3 gradient-text text-3xl font-extrabold tracking-tight">
          <ShieldAlert size={28} className="text-accent-primary shrink-0" />
          <span>Create Warehouse</span>
        </h1>
        <p className="text-sm text-text-secondary mt-1.5 font-medium">Add a new warehouse location to the platform fulfillment network.</p>
      </div>

      <div className="rounded-2xl border border-glass-border bg-glass/5 p-6 md:p-8 shadow-sm">
        {success && (
          <div className="mb-6 p-4 rounded-xl bg-accent-secondary/10 border border-accent-secondary/20 text-accent-secondary text-sm font-semibold">
            Warehouse created successfully. Redirecting to the warehouse list…
          </div>
        )}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-accent-danger/10 border border-accent-danger/20 text-accent-danger text-sm font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label htmlFor="warehouseName" className="text-[10px] uppercase font-bold text-text-secondary tracking-wider">
                Warehouse Name
              </label>
              <input
                id="warehouseName"
                name="warehouseName"
                type="text"
                value={form.warehouseName}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-glass-border bg-glass/5 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-primary transition-colors"
                placeholder="e.g. Central Logistics Hub"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="warehouseCode" className="text-[10px] uppercase font-bold text-text-secondary tracking-wider">
                Warehouse Code
              </label>
              <input
                id="warehouseCode"
                name="warehouseCode"
                type="text"
                value={form.warehouseCode}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-glass-border bg-glass/5 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-primary transition-colors"
                placeholder="e.g. CWH-01"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="address" className="text-[10px] uppercase font-bold text-text-secondary tracking-wider">
              Street Address
            </label>
            <input
              id="address"
              name="address"
              type="text"
              value={form.address}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 rounded-xl border border-glass-border bg-glass/5 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-primary transition-colors"
              placeholder="e.g. 100 Main St, Suite 4B"
            />
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            <div className="flex flex-col gap-2">
              <label htmlFor="city" className="text-[10px] uppercase font-bold text-text-secondary tracking-wider">
                City
              </label>
              <input
                id="city"
                name="city"
                type="text"
                value={form.city}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-glass-border bg-glass/5 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-primary transition-colors"
                placeholder="e.g. Chicago"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="state" className="text-[10px] uppercase font-bold text-text-secondary tracking-wider">
                State
              </label>
              <input
                id="state"
                name="state"
                type="text"
                value={form.state}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-glass-border bg-glass/5 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-primary transition-colors"
                placeholder="e.g. IL"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="pincode" className="text-[10px] uppercase font-bold text-text-secondary tracking-wider">
                Pincode
              </label>
              <input
                id="pincode"
                name="pincode"
                type="text"
                value={form.pincode}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-glass-border bg-glass/5 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-primary transition-colors"
                placeholder="e.g. 60601"
              />
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label htmlFor="managerName" className="text-[10px] uppercase font-bold text-text-secondary tracking-wider">
                Manager Name
              </label>
              <input
                id="managerName"
                name="managerName"
                type="text"
                value={form.managerName}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-glass-border bg-glass/5 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-primary transition-colors"
                placeholder="Manager Name"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="contactNumber" className="text-[10px] uppercase font-bold text-text-secondary tracking-wider">
                Contact Number
              </label>
              <input
                id="contactNumber"
                name="contactNumber"
                type="text"
                value={form.contactNumber}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-glass-border bg-glass/5 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-primary transition-colors"
                placeholder="Contact Number"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="capacity" className="text-[10px] uppercase font-bold text-text-secondary tracking-wider">
              Fulfillment Capacity (units)
            </label>
            <input
              id="capacity"
              name="capacity"
              type="number"
              value={form.capacity}
              onChange={handleChange}
              required
              min="1"
              className="w-full px-4 py-2.5 rounded-xl border border-glass-border bg-glass/5 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-primary transition-colors"
              placeholder="e.g. 100000"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="status" className="text-[10px] uppercase font-bold text-text-secondary tracking-wider">
              Initial Status
            </label>
            <select
              id="status"
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl border border-glass-border bg-bg-secondary text-sm text-text-primary focus:outline-none focus:border-accent-primary transition-colors cursor-pointer"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div className="pt-4 flex gap-4">
            <button
              type="submit"
              className="flex-1 group inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-accent-primary to-indigo-600 hover:from-indigo-600 hover:to-accent-primary text-white font-bold text-sm shadow-md shadow-accent-primary/10 hover:shadow-lg hover:shadow-accent-primary/25 transition-all duration-300 transform hover:-translate-y-0.5 active:scale-98 cursor-pointer"
            >
              Create Warehouse
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/warehouses')}
              className="px-6 py-3 rounded-xl border border-glass-border hover:bg-black/5 dark:hover:bg-white/5 text-text-secondary hover:text-text-primary font-bold text-sm transition-all duration-200 cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
