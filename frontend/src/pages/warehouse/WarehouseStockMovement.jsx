import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { stockMovements } from '../../data/warehouseData';
import styles from './warehouse.module.css';

export default function WarehouseStockMovement() {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return stockMovements;
    return stockMovements.filter((item) =>
      item.product.toLowerCase().includes(query) ||
      item.movement.toLowerCase().includes(query) ||
      item.warehouse.toLowerCase().includes(query) ||
      item.handledBy.toLowerCase().includes(query)
    );
  }, [search]);

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Stock Movement</h1>
          <p className={styles.pageSubtitle}>Review inbound and outbound inventory movements across warehouse locations.</p>
        </div>
      </div>

      <div className={styles.sectionHeader}>
        <div className={styles.sectionTitle}>Movement log</div>
        <div className={styles.searchBar}>
          <Search size={16} className="text-text-muted" />
          <input
            type="text"
            placeholder="Search product, warehouse or handler"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.inputSearch}
          />
        </div>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Product</th>
              <th>Movement</th>
              <th>Quantity</th>
              <th>Warehouse</th>
              <th>Date</th>
              <th>Handled By</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr key={item.id} className={styles.tableRow}>
                <td>{item.product}</td>
                <td>{item.movement}</td>
                <td>{item.quantity}</td>
                <td>{item.warehouse}</td>
                <td>{item.date}</td>
                <td>{item.handledBy}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
