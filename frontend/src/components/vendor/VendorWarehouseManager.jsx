import { useState, useEffect } from 'react';
import { getWarehouses, createWarehouse, updateWarehouse, deleteWarehouse } from '../../api/warehouse';
import { PlusCircle, Edit3, Trash2, MapPin, Phone, User, Activity, AlertCircle } from 'lucide-react';

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
  status: 'ACTIVE',
};

export default function VendorWarehouseManager() {
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(initialState);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchWarehouses = async () => {
    try {
      setLoading(true);
      const res = await getWarehouses();
      setWarehouses(res.data || []);
    } catch (err) {
      console.error('Failed to load warehouses', err);
      setError('Failed to load warehouses.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEdit = (w) => {
    setForm({
      warehouseName: w.warehouseName || '',
      warehouseCode: w.warehouseCode || '',
      address: w.address || '',
      city: w.city || '',
      state: w.state || '',
      pincode: w.pincode || '',
      managerName: w.managerName || '',
      contactNumber: w.contactNumber || '',
      capacity: String(w.capacity || 100000),
      status: w.status || 'ACTIVE',
    });
    setEditingId(w.id);
    setShowForm(true);
    setError('');
    setSuccess('');
  };

  const handleCancel = () => {
    setForm(initialState);
    setEditingId(null);
    setShowForm(false);
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const payload = {
      ...form,
      capacity: parseInt(form.capacity, 10) || 100000,
    };

    try {
      if (editingId) {
        await updateWarehouse(editingId, payload);
        setSuccess('Warehouse updated successfully.');
      } else {
        await createWarehouse(payload);
        setSuccess('Warehouse created successfully.');
      }
      fetchWarehouses();
      setTimeout(() => {
        handleCancel();
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save warehouse.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this warehouse? This will also remove associated inventory.')) return;
    setError('');
    setSuccess('');
    try {
      await deleteWarehouse(id);
      setSuccess('Warehouse deleted successfully.');
      fetchWarehouses();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete warehouse.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-text-primary">Warehouse List</h2>
          <p className="text-sm text-text-secondary">Register and manage fulfillment center locations where you keep stock.</p>
        </div>
        <button
          onClick={() => {
            if (showForm) {
              handleCancel();
            } else {
              setShowForm(true);
            }
          }}
          className="group inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-accent-primary to-indigo-600 hover:from-indigo-600 hover:to-accent-primary text-white font-bold text-sm shadow-md transition-all duration-300 transform hover:-translate-y-0.5 active:scale-98 cursor-pointer"
        >
          <PlusCircle size={16} />
          <span>{showForm ? 'View List' : 'Add Warehouse'}</span>
        </button>
      </div>

      {success && (
        <div className="p-4 rounded-xl bg-accent-secondary/10 border border-accent-secondary/20 text-accent-secondary text-sm font-semibold">
          {success}
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-accent-danger/10 border border-accent-danger/20 text-accent-danger text-sm font-semibold flex items-center gap-2">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {showForm ? (
        <div className="rounded-2xl border border-glass-border bg-glass/5 p-6 md:p-8 shadow-sm">
          <h3 className="text-md font-bold text-text-primary mb-6">
            {editingId ? 'Edit Warehouse Details' : 'New Warehouse Details'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase font-bold text-text-secondary tracking-wider">
                  Warehouse Name *
                </label>
                <input
                  name="warehouseName"
                  type="text"
                  value={form.warehouseName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-glass-border bg-glass/5 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-primary transition-colors"
                  placeholder="e.g. West Coast Storage"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase font-bold text-text-secondary tracking-wider">
                  Warehouse Code *
                </label>
                <input
                  name="warehouseCode"
                  type="text"
                  value={form.warehouseCode}
                  onChange={handleChange}
                  required
                  disabled={!!editingId}
                  className="w-full px-4 py-2.5 rounded-xl border border-glass-border bg-glass/5 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-primary transition-colors disabled:opacity-55"
                  placeholder="e.g. WC-01"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] uppercase font-bold text-text-secondary tracking-wider">
                Street Address *
              </label>
              <input
                name="address"
                type="text"
                value={form.address}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-glass-border bg-glass/5 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-primary transition-colors"
                placeholder="e.g. 500 Industrial Pkwy"
              />
            </div>

            <div className="grid gap-6 sm:grid-cols-3">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase font-bold text-text-secondary tracking-wider">
                  City *
                </label>
                <input
                  name="city"
                  type="text"
                  value={form.city}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-glass-border bg-glass/5 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-primary transition-colors"
                  placeholder="e.g. Los Angeles"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase font-bold text-text-secondary tracking-wider">
                  State *
                </label>
                <input
                  name="state"
                  type="text"
                  value={form.state}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-glass-border bg-glass/5 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-primary transition-colors"
                  placeholder="e.g. CA"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase font-bold text-text-secondary tracking-wider">
                  Pincode *
                </label>
                <input
                  name="pincode"
                  type="text"
                  value={form.pincode}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-glass-border bg-glass/5 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-primary transition-colors"
                  placeholder="e.g. 90001"
                />
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase font-bold text-text-secondary tracking-wider">
                  Manager Name *
                </label>
                <input
                  name="managerName"
                  type="text"
                  value={form.managerName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-glass-border bg-glass/5 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-primary transition-colors"
                  placeholder="Manager's Full Name"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase font-bold text-text-secondary tracking-wider">
                  Contact Number *
                </label>
                <input
                  name="contactNumber"
                  type="text"
                  value={form.contactNumber}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-glass-border bg-glass/5 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-primary transition-colors"
                  placeholder="Manager's Contact Number"
                />
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase font-bold text-text-secondary tracking-wider">
                  Capacity (units)
                </label>
                <input
                  name="capacity"
                  type="number"
                  value={form.capacity}
                  onChange={handleChange}
                  required
                  min="1"
                  className="w-full px-4 py-2.5 rounded-xl border border-glass-border bg-glass/5 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-primary transition-colors"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase font-bold text-text-secondary tracking-wider">
                  Status
                </label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-glass-border bg-bg-secondary text-sm text-text-primary focus:outline-none focus:border-accent-primary cursor-pointer"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>
            </div>

            <div className="pt-4 flex gap-4">
              <button
                type="submit"
                className="flex-1 group inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-accent-primary to-indigo-600 hover:from-indigo-600 hover:to-accent-primary text-white font-bold text-sm shadow-md transition-all duration-300 transform hover:-translate-y-0.5 active:scale-98 cursor-pointer"
              >
                {editingId ? 'Save Changes' : 'Create Warehouse'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-3 rounded-xl border border-glass-border hover:bg-black/5 dark:hover:bg-white/5 text-text-secondary hover:text-text-primary font-bold text-sm transition-all duration-200 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-glass-border bg-glass/5">
          <table className="min-w-full divide-y divide-glass-border text-sm text-left">
            <thead className="bg-bg-tertiary/70 text-[11px] font-bold text-text-muted uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Warehouse Specs</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4">Capacity</th>
                <th className="px-6 py-4">Manager</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-glass-border/40">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-text-secondary">Loading warehouses...</td>
                </tr>
              ) : warehouses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-text-secondary">
                    No warehouses registered yet. Click "Add Warehouse" to get started!
                  </td>
                </tr>
              ) : (
                warehouses.map((w) => (
                  <tr key={w.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-text-primary text-sm">{w.warehouseName}</div>
                      <div className="text-xs text-text-muted mt-0.5">{w.warehouseCode}</div>
                    </td>
                    <td className="px-6 py-4 text-text-secondary text-sm">
                      <div className="flex items-center gap-1.5 font-medium">
                        <MapPin size={13} className="text-text-muted shrink-0" />
                        <span>{w.address}, {w.city}, {w.state} {w.pincode}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-text-secondary text-sm font-semibold">
                      {w.capacity ? w.capacity.toLocaleString() : '100,000'} units
                    </td>
                    <td className="px-6 py-4 text-text-secondary text-xs font-medium">
                      <div className="flex flex-col gap-0.5">
                        <span className="flex items-center gap-1 font-semibold text-text-primary">
                          <User size={11} className="text-text-muted shrink-0" />
                          {w.managerName}
                        </span>
                        <span className="flex items-center gap-1 text-text-muted font-normal">
                          <Phone size={10} className="text-text-muted shrink-0" />
                          {w.contactNumber}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 border rounded-full ${
                        w.status === 'ACTIVE'
                          ? 'bg-accent-secondary/10 border-accent-secondary/20 text-accent-secondary'
                          : 'bg-accent-danger/10 border-accent-danger/20 text-accent-danger'
                      }`}>
                        <Activity size={10} />
                        {w.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(w)}
                          className="inline-flex items-center gap-1.5 bg-accent-primary/10 hover:bg-accent-primary/20 text-accent-primary text-xs font-bold px-3 py-1.5 rounded transition-all duration-200 cursor-pointer shadow-sm"
                        >
                          <Edit3 size={12} />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(w.id)}
                          className="inline-flex items-center gap-1.5 bg-accent-danger/10 hover:bg-accent-danger/20 text-accent-danger text-xs font-bold px-3 py-1.5 rounded transition-all duration-200 cursor-pointer shadow-sm"
                        >
                          <Trash2 size={12} />
                          <span>Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
