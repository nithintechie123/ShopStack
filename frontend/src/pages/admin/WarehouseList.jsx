import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PlusCircle, Eye, Edit3, Trash2 } from 'lucide-react';
import { getWarehouses, deleteWarehouse } from '../../data/warehouseData';
import styles from '../warehouse/warehouse.module.css';

export default function WarehouseList() {
  const navigate = useNavigate();
  const [warehouses, setWarehouses] = useState(getWarehouses());

  const onDelete = (id) => {
    if (!window.confirm('Delete this warehouse record?')) return;
    deleteWarehouse(id);
    setWarehouses(getWarehouses());
  };

  const summary = useMemo(() => ({
    count: warehouses.length,
    capacity: `${warehouses.length * 95000} units`,
  }), [warehouses]);

  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Warehouse Management</h1>
          <p className={styles.pageSubtitle}>Review active fulfillment centers, add new locations, and maintain warehouse operations.</p>
        </div>
        <div className={styles.headerActions}>
          <Link to="/admin/create-warehouse" className={`${styles.actionButton} ${styles.primaryButton}`}>
            <PlusCircle size={16} /> Create Warehouse
          </Link>
        </div>
      </div>

      <div className={styles.grid} style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', marginBottom: 22 }}>
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Warehouse Count</h2>
          <div className={styles.metricValue}>{summary.count}</div>
          <p className={styles.metricNote}>Active and managed warehouse locations.</p>
        </div>
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Total Capacity</h2>
          <div className={styles.metricValue}>{summary.capacity}</div>
          <p className={styles.metricNote}>Combined fulfillment capacity across warehouses.</p>
        </div>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Warehouse</th>
              <th>ID</th>
              <th>Location</th>
              <th>Capacity</th>
              <th>Manager</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {warehouses.map((warehouse) => (
              <tr key={warehouse.id} className={styles.tableRow}>
                <td>
                  <div className="font-semibold text-text-primary">{warehouse.warehouseName}</div>
                  <div className="text-xs text-text-muted">{warehouse.warehouseCode}</div>
                </td>
                <td className="text-text-secondary text-sm">{warehouse.id}</td>
                <td className="text-text-secondary text-sm">{warehouse.address}, {warehouse.city}, {warehouse.state}</td>
                <td className="text-text-secondary text-sm">{warehouse.capacity}</td>
                <td className="text-text-secondary text-sm">{warehouse.managerName}</td>
                <td>
                  <span className={`${styles.badge} ${warehouse.status === 'Active' ? styles.badgeSuccess : warehouse.status === 'Maintenance' ? styles.badgeWarning : styles.badgeDanger}`}>
                    {warehouse.status}
                  </span>
                </td>
                <td className="text-right">
                  <div className={styles.tableActions}>
                    <Link to={`/admin/edit-warehouse/${warehouse.id}`} className={styles.actionPill}>
                      <Edit3 size={14} /> Edit
                    </Link>
                    <button type="button" className={styles.actionPill} onClick={() => onDelete(warehouse.id)}>
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
