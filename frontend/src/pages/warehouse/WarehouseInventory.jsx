import { useMemo, useState } from 'react';
import { Search, RefreshCcw } from 'lucide-react';
import { inventoryItems } from '../../data/warehouseData';
import styles from './warehouse.module.css';

const getStatus = (available) => {
  if (available === 0) return { label: 'Out of Stock', variant: styles.badgeDanger };
  if (available <= 20) return { label: 'Low Stock', variant: styles.badgeWarning };
  return { label: 'In Stock', variant: styles.badgeSuccess };
};

export default function WarehouseInventory() {
  const [search, setSearch] = useState('');
  const [lastSync, setLastSync] = useState('2 minutes ago');

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return inventoryItems;
    return inventoryItems.filter((item) =>
      item.product.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query)
    );
  }, [search]);

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Inventory Status</h1>
          <p className={styles.pageSubtitle}>Track product availability, reserved stock, and warehouse inventory health.</p>
        </div>
        <div className={styles.headerActions}>
          <button type="button" className={`${styles.actionButton} ${styles.primaryButton}`} onClick={() => setLastSync('Just now')}>
            <RefreshCcw size={16} /> Sync Inventory
          </button>
        </div>
      </div>

      <div className={styles.sectionHeader}>
        <div className={styles.sectionTitle}>Search inventory</div>
        <div className={styles.searchBar}>
          <Search size={16} className="text-text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.inputSearch}
            placeholder="Search product or category..."
          />
        </div>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Available Stock</th>
              <th>Reserved</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item) => {
              const status = getStatus(item.availableStock);
              return (
                <tr key={item.id} className={styles.tableRow}>
                  <td>{item.product}</td>
                  <td>{item.category}</td>
                  <td>{item.availableStock}</td>
                  <td>{item.reserved}</td>
                  <td><span className={`${styles.badge} ${status.variant}`}>{status.label}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-6 text-sm text-text-secondary">Last inventory sync: {lastSync}</div>
    </div>
  );
}
