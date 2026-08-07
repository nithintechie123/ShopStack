import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PlusCircle, Edit3, Trash2, Shield } from 'lucide-react';
import { getWarehouses, deleteWarehouse } from '../../api/warehouse';

export default function WarehouseList() {
  const navigate = useNavigate();
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWarehouses = async () => {
    try {
      const res = await getWarehouses();
      setWarehouses(res.data || []);
    } catch (err) {
      console.error('Failed to load warehouses', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const onDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this warehouse? This will also remove associated inventory allocations.')) return;
    try {
      await deleteWarehouse(id);
      fetchWarehouses();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete warehouse');
    }
  };

  const summary = useMemo(() => {
    const totalCapacity = warehouses.reduce((sum, w) => sum + (w.capacity || 0), 0);
    return {
      count: warehouses.length,
      capacity: `${totalCapacity.toLocaleString()} units`,
    };
  }, [warehouses]);

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-3 gradient-text text-3xl font-extrabold tracking-tight">
            <Shield size={28} className="text-accent-primary shrink-0" />
            <span>Warehouse Management</span>
          </h1>
          <p className="text-sm text-text-secondary mt-1.5">Review active fulfillment centers, add new locations, and maintain warehouse operations.</p>
        </div>
        <div>
          <Link
            to="/admin/create-warehouse"
            className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-accent-primary to-indigo-600 hover:from-indigo-600 hover:to-accent-primary text-white font-bold text-sm shadow-md shadow-accent-primary/10 hover:shadow-lg hover:shadow-accent-primary/25 transition-all duration-300 transform hover:-translate-y-0.5 active:scale-98 cursor-pointer"
          >
            <PlusCircle size={16} />
            <span>Create Warehouse</span>
          </Link>
        </div>
      </div>

      {/* Stats Summary Card Row */}
      <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 mb-8">
        <div className="rounded-2xl border border-glass-border bg-glass/5 p-5 shadow-sm">
          <p className="text-[10px] uppercase font-bold tracking-wider text-text-muted leading-none">Warehouse Count</p>
          <p className="text-3xl font-extrabold text-text-primary mt-2">{summary.count}</p>
        </div>
        <div className="rounded-2xl border border-glass-border bg-glass/5 p-5 shadow-sm">
          <p className="text-[10px] uppercase font-bold tracking-wider text-text-muted leading-none">Total Capacity</p>
          <p className="text-3xl font-extrabold text-text-primary mt-2">{summary.capacity}</p>
        </div>
      </div>

      {/* Warehouses Table */}
      <div className="overflow-x-auto rounded-xl border border-glass-border bg-glass/5">
        <table className="min-w-full divide-y divide-glass-border text-sm text-left">
          <thead className="bg-bg-tertiary/70 text-[11px] font-bold text-text-muted uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4">Warehouse Specs</th>
              <th className="px-6 py-4">ID</th>
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
                <td colSpan={7} className="px-6 py-12 text-center text-text-secondary">Loading warehouses...</td>
              </tr>
            ) : warehouses.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-text-secondary">No warehouses found.</td>
              </tr>
            ) : (
              warehouses.map((warehouse) => (
                <tr key={warehouse.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-text-primary text-sm">{warehouse.warehouseName}</div>
                    <div className="text-xs text-text-muted mt-0.5">{warehouse.warehouseCode}</div>
                  </td>
                  <td className="px-6 py-4 text-text-secondary font-mono text-xs">{warehouse.id}</td>
                  <td className="px-6 py-4 text-text-secondary text-sm font-medium">
                    {warehouse.address}, {warehouse.city}, {warehouse.state} {warehouse.pincode}
                  </td>
                  <td className="px-6 py-4 text-text-secondary text-sm font-semibold">
                    {warehouse.capacity ? warehouse.capacity.toLocaleString() : '100,000'} units
                  </td>
                  <td className="px-6 py-4 text-text-secondary text-sm">{warehouse.managerName}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 border rounded-full ${
                      warehouse.status === 'ACTIVE'
                        ? 'bg-accent-secondary/10 border-accent-secondary/20 text-accent-secondary'
                        : 'bg-accent-danger/10 border-accent-danger/20 text-accent-danger'
                    }`}>
                      {warehouse.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Link
                        to={`/admin/edit-warehouse/${warehouse.id}`}
                        className="inline-flex items-center gap-1 bg-accent-primary/10 hover:bg-accent-primary/20 text-accent-primary text-xs font-bold px-3 py-1.5 rounded transition-all duration-200 cursor-pointer shadow-sm"
                      >
                        <Edit3 size={12} />
                        <span>Edit</span>
                      </Link>
                      <button
                        onClick={() => onDelete(warehouse.id)}
                        className="inline-flex items-center gap-1 bg-accent-danger/10 hover:bg-accent-danger/20 text-accent-danger text-xs font-bold px-3 py-1.5 rounded transition-all duration-200 cursor-pointer shadow-sm"
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
    </div>
  );
}
