import { useState } from 'react';
import {
  Package,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Search,
  IndianRupee,
  Plus,
  Minus,
  Save,
  RefreshCw,
  Layers,
  Download,
  ArrowUpDown,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { updateVendorStock, updateAdminStock } from '../../api/products';

export default function InventoryManager({
  products = [],
  onProductUpdate,
  userRole = 'VENDOR'
}) {
  const [filter, setFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [draftStocks, setDraftStocks] = useState({});
  const [updatingIds, setUpdatingIds] = useState({});
  const [successIds, setSuccessIds] = useState({});
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');

  // Calculate metrics
  const totalProducts = products.length;
  const outOfStockCount = products.filter((p) => p.stockQuantity === 0).length;
  const lowStockCount = products.filter((p) => p.stockQuantity > 0 && p.stockQuantity <= 5).length;
  const inStockCount = products.filter((p) => p.stockQuantity > 5).length;
  const totalValue = products.reduce((sum, p) => sum + (parseFloat(p.price || 0) * (p.stockQuantity || 0)), 0);

  // Draft stock getter
  const getStockValue = (product) => {
    if (draftStocks[product.id] !== undefined) {
      return draftStocks[product.id];
    }
    return product.stockQuantity;
  };

  const handleStockChange = (productId, newQty) => {
    const qty = Math.max(0, parseInt(newQty, 10) || 0);
    setDraftStocks((prev) => ({ ...prev, [productId]: qty }));
  };

  const handleQuickAdjust = (productId, currentVal, delta) => {
    const current = getStockValue({ id: productId, stockQuantity: currentVal });
    handleStockChange(productId, Math.max(0, current + delta));
  };

  const handleSaveStock = async (product) => {
    const newQty = getStockValue(product);
    setUpdatingIds((prev) => ({ ...prev, [product.id]: true }));
    try {
      const updateFn = userRole === 'ADMIN' ? updateAdminStock : updateVendorStock;
      const res = await updateFn(product.id, newQty);

      setSuccessIds((prev) => ({ ...prev, [product.id]: true }));
      setTimeout(() => {
        setSuccessIds((prev) => ({ ...prev, [product.id]: false }));
      }, 1500);

      if (onProductUpdate) {
        onProductUpdate(res.data);
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update stock quantity');
    } finally {
      setUpdatingIds((prev) => ({ ...prev, [product.id]: false }));
    }
  };

  const handleQuickRestock = async (product, amount = 10) => {
    const current = getStockValue(product);
    const updatedVal = current + amount;
    handleStockChange(product.id, updatedVal);
    setUpdatingIds((prev) => ({ ...prev, [product.id]: true }));
    try {
      const updateFn = userRole === 'ADMIN' ? updateAdminStock : updateVendorStock;
      const res = await updateFn(product.id, updatedVal);

      setSuccessIds((prev) => ({ ...prev, [product.id]: true }));
      setTimeout(() => {
        setSuccessIds((prev) => ({ ...prev, [product.id]: false }));
      }, 1500);

      if (onProductUpdate) {
        onProductUpdate(res.data);
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to restock product');
    } finally {
      setUpdatingIds((prev) => ({ ...prev, [product.id]: false }));
    }
  };

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category?.name?.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (filter === 'LOW_STOCK') return p.stockQuantity > 0 && p.stockQuantity <= 5;
    if (filter === 'OUT_OF_STOCK') return p.stockQuantity === 0;
    if (filter === 'IN_STOCK') return p.stockQuantity > 5;
    return true;
  });

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const renderSortIcon = (field) => {
    if (sortField !== field) {
      return <ArrowUpDown size={12} className="text-text-muted/50 ml-1.5 shrink-0" />;
    }
    return sortDirection === 'asc' 
      ? <ChevronUp size={12} className="text-accent-primary ml-1.5 shrink-0" /> 
      : <ChevronDown size={12} className="text-accent-primary ml-1.5 shrink-0" />;
  };

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    let aVal, bVal;
    if (sortField === 'name') {
      aVal = a.name?.toLowerCase() || '';
      bVal = b.name?.toLowerCase() || '';
    } else if (sortField === 'category') {
      aVal = a.category?.name?.toLowerCase() || '';
      bVal = b.category?.name?.toLowerCase() || '';
    } else if (sortField === 'price') {
      aVal = parseFloat(a.price || 0);
      bVal = parseFloat(b.price || 0);
    } else if (sortField === 'stockQuantity') {
      aVal = a.stockQuantity || 0;
      bVal = b.stockQuantity || 0;
    }

    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const exportToCSV = () => {
    const headers = ['Product ID', 'Name', 'Brand', 'Store', 'Category', 'Price (INR)', 'Stock Quantity', 'Status'];
    const rows = sortedProducts.map(p => {
      const status = p.stockQuantity === 0 ? 'Out of Stock' : p.stockQuantity <= 5 ? 'Low Stock' : 'In Stock';
      return [
        p.id || '',
        `"${(p.name || '').replace(/"/g, '""')}"`,
        `"${(p.brand || '').replace(/"/g, '""')}"`,
        `"${(p.vendor?.storeName || '').replace(/"/g, '""')}"`,
        `"${(p.category?.name || '').replace(/"/g, '""')}"`,
        p.price || 0,
        p.stockQuantity || 0,
        status
      ];
    });

    const csvString = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.setAttribute("href", url);
    const date = new Date().toISOString().split('T')[0];
    link.setAttribute("download", `shopstack_inventory_${date}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col gap-6">

      {/* Summary Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="p-4 rounded-xl border border-glass-border bg-glass/10 backdrop-blur-md flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-accent-primary/10 text-accent-primary flex items-center justify-center shrink-0">
            <Package size={18} />
          </div>
          <div>
            <p className="font-display text-xl font-extrabold text-text-primary leading-none">{totalProducts}</p>
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mt-1">Total Products</p>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-glass-border bg-glass/10 backdrop-blur-md flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-accent-secondary/10 text-accent-secondary flex items-center justify-center shrink-0">
            <CheckCircle size={18} />
          </div>
          <div>
            <p className="font-display text-xl font-extrabold text-text-primary leading-none">{inStockCount}</p>
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mt-1">In Stock (&gt; 5)</p>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-glass-border bg-glass/10 backdrop-blur-md flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
            <AlertTriangle size={18} />
          </div>
          <div>
            <p className="font-display text-xl font-extrabold text-text-primary leading-none">{lowStockCount}</p>
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mt-1">Low Stock (1-5)</p>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-glass-border bg-glass/10 backdrop-blur-md flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-accent-danger/10 text-accent-danger flex items-center justify-center shrink-0">
            <XCircle size={18} />
          </div>
          <div>
            <p className="font-display text-xl font-extrabold text-text-primary leading-none">{outOfStockCount}</p>
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mt-1">Out of Stock (0)</p>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-glass-border bg-glass/10 backdrop-blur-md flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center shrink-0">
            <IndianRupee size={18} />
          </div>
          <div>
            <p className="font-display text-lg font-extrabold text-text-primary leading-none">₹{totalValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mt-1">Inventory Value</p>
          </div>
        </div>
      </div>

      {/* Control Bar: Filters & Search */}
      <div className="p-4 rounded-xl border border-glass-border bg-glass/15 backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {[
            { key: 'ALL', label: 'All Items', count: totalProducts },
            { key: 'LOW_STOCK', label: 'Low Stock Alerts', count: lowStockCount, badgeCls: 'bg-amber-500/20 text-amber-500' },
            { key: 'OUT_OF_STOCK', label: 'Out of Stock', count: outOfStockCount, badgeCls: 'bg-accent-danger/20 text-accent-danger' },
            { key: 'IN_STOCK', label: 'Well Stocked', count: inStockCount },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${filter === tab.key
                ? 'bg-accent-primary text-white shadow-md shadow-accent-primary/20'
                : 'bg-bg-tertiary/40 border border-glass-border/40 text-text-secondary hover:text-text-primary'
                }`}
            >
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${tab.badgeCls || 'bg-black/20 text-white'}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Export CSV & Search Bar */}
        <div className="flex w-full md:w-auto items-center gap-3">
          <button
            onClick={exportToCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-bg-tertiary/60 hover:bg-bg-tertiary border border-glass-border text-text-secondary hover:text-text-primary text-xs font-bold rounded-lg cursor-pointer transition-all duration-200"
            title="Export active list to CSV"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>

          <div className="relative w-full md:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Search catalog inventory..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-bg-tertiary/60 border border-glass-border rounded-lg text-xs text-text-primary pl-9 pr-3 py-2 outline-none focus:border-accent-primary"
            />
          </div>
        </div>
      </div>

      {/* Inventory Products Table */}
      <div className="overflow-x-auto rounded-xl border border-glass-border bg-glass/5">
        {sortedProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-text-muted">
            <Package size={40} className="opacity-40" />
            <h4 className="text-sm font-bold text-text-secondary">No products match this inventory filter</h4>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-glass-border text-xs text-left">
          <thead className="bg-bg-tertiary/70 text-[10px] font-bold text-text-muted uppercase tracking-wider">
            <tr>
              <th 
                className="px-6 py-4 cursor-pointer hover:bg-bg-tertiary/90 select-none transition-colors"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center gap-1">
                  <span>Product Specs</span>
                  {renderSortIcon('name')}
                </div>
              </th>
              <th 
                className="px-6 py-4 cursor-pointer hover:bg-bg-tertiary/90 select-none transition-colors"
                onClick={() => handleSort('category')}
              >
                <div className="flex items-center gap-1">
                  <span>Category</span>
                  {renderSortIcon('category')}
                </div>
              </th>
              <th 
                className="px-6 py-4 cursor-pointer hover:bg-bg-tertiary/90 select-none transition-colors"
                onClick={() => handleSort('price')}
              >
                <div className="flex items-center gap-1">
                  <span>Unit Price</span>
                  {renderSortIcon('price')}
                </div>
              </th>
              <th 
                className="px-6 py-4 cursor-pointer hover:bg-bg-tertiary/90 select-none transition-colors"
                onClick={() => handleSort('stockQuantity')}
              >
                <div className="flex items-center gap-1">
                  <span>Stock Status</span>
                  {renderSortIcon('stockQuantity')}
                </div>
              </th>
              {userRole !== 'ADMIN' && <th className="px-6 py-4">Inline Stock Control</th>}
              {userRole !== 'ADMIN' && <th className="px-6 py-4">Action</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-glass-border/40">
            {sortedProducts.map((product) => {
              const stockVal = getStockValue(product);
              const isDraftDirty = draftStocks[product.id] !== undefined && draftStocks[product.id] !== product.stockQuantity;
              const isUpdating = updatingIds[product.id];
              const isSuccess = successIds[product.id];

              const primaryImage = product.images?.find((i) => i.isPrimary)?.imageUrl || product.images?.[0]?.imageUrl;

              return (
                <tr key={product.id} className="hover:bg-white/[0.02] transition-colors">
                  {/* Specs */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-bg-tertiary border border-glass-border/40 overflow-hidden shrink-0 flex items-center justify-center">
                        {primaryImage ? (
                          <img src={primaryImage} alt={product.name} className="w-full h-full object-contain p-1" />
                        ) : (
                          <Package size={18} className="text-text-muted opacity-60" />
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-text-primary text-xs">{product.name}</div>
                        <div className="text-[10px] text-text-muted mt-0.5">
                          {product.brand ? `${product.brand} • ` : ''} {product.vendor?.storeName ? `Store: ${product.vendor.storeName}` : ''}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="px-6 py-4 text-text-secondary font-medium">
                    {product.category?.name || '—'}
                  </td>

                  {/* Price */}
                  <td className="px-6 py-4 font-bold text-text-primary">
                    ₹{parseFloat(product.price || 0).toFixed(2)}
                  </td>

                  {/* Stock Status Badge */}
                  <td className="px-6 py-4">
                    {product.stockQuantity === 0 ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-accent-danger/10 border border-accent-danger/25 text-accent-danger">
                        <XCircle size={12} /> Out of Stock
                      </span>
                    ) : product.stockQuantity <= 5 ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-500">
                        <AlertTriangle size={12} /> Low ({product.stockQuantity})
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-accent-secondary/10 border border-accent-secondary/25 text-accent-secondary">
                        <CheckCircle size={12} /> In Stock ({product.stockQuantity})
                      </span>
                    )}
                  </td>

                  {/* Inline Stock Control */}
                  {userRole !== 'ADMIN' && (
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center border border-glass-border rounded-lg bg-bg-tertiary/40 p-1">
                          <button
                            type="button"
                            onClick={() => handleQuickAdjust(product.id, product.stockQuantity, -1)}
                            className="w-7 h-7 flex items-center justify-center rounded hover:bg-bg-tertiary text-text-primary font-bold cursor-pointer transition-colors"
                            title="Decrease by 1"
                          >
                            <Minus size={12} />
                          </button>

                          <input
                            type="number"
                            min="0"
                            value={stockVal}
                            onChange={(e) => handleStockChange(product.id, e.target.value)}
                            className="w-14 text-center bg-transparent border-none outline-none font-bold text-xs text-text-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />

                          <button
                            type="button"
                            onClick={() => handleQuickAdjust(product.id, product.stockQuantity, 1)}
                            className="w-7 h-7 flex items-center justify-center rounded hover:bg-bg-tertiary text-text-primary font-bold cursor-pointer transition-colors"
                            title="Increase by 1"
                          >
                            <Plus size={12} />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleQuickRestock(product, 10)}
                          className="bg-bg-tertiary hover:bg-bg-tertiary/80 border border-glass-border text-text-secondary hover:text-text-primary text-[10px] font-bold px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                          title="Add +10 to current inventory"
                        >
                          +10 Quick
                        </button>
                      </div>
                    </td>
                  )}

                  {/* Save Action */}
                  {userRole !== 'ADMIN' && (
                    <td className="px-6 py-4">
                      {isSuccess ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-accent-secondary">
                          <CheckCircle size={14} /> Saved
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSaveStock(product)}
                          disabled={isUpdating || !isDraftDirty}
                          className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer shadow-sm ${isDraftDirty
                            ? 'bg-accent-primary hover:bg-accent-primary-hover text-white shadow-accent-primary/20'
                            : 'bg-bg-tertiary text-text-muted border border-glass-border opacity-60 cursor-not-allowed'
                            }`}
                        >
                          {isUpdating ? (
                            <RefreshCw size={12} className="animate-spin" />
                          ) : (
                            <Save size={12} />
                          )}
                          <span>{isUpdating ? 'Saving…' : 'Save Stock'}</span>
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
        )}
      </div>
    </div>
  );
}
