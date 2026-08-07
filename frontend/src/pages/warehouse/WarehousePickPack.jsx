import { useState } from 'react';
import styles from './warehouse.module.css';
import { ArrowRightCircle } from 'lucide-react';

const orderRows = [
  { id: 'OID-7F2A5B1C', customer: 'Keira Vincent', items: 7, status: 'Pending' },
  { id: 'OID-2B8D0C9F', customer: 'Noah Bennett', items: 3, status: 'Pending' },
  { id: 'OID-4E5F1A2D', customer: 'Mason Reed', items: 5, status: 'Packed' },
  { id: 'OID-9C1B7D3A', customer: 'Ella Morgan', items: 2, status: 'Pending' },
];

export default function WarehousePickPack() {
  const [orders, setOrders] = useState(orderRows);

  const updateStatus = (orderId) => {
    setOrders((prev) => prev.map((order) => order.id === orderId ? { ...order, status: 'Packed' } : order));
  };

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Pick & Pack Orders</h1>
          <p className={styles.pageSubtitle}>Manage fulfillment tasks for pending orders and move packages through the warehouse workflow.</p>
        </div>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className={styles.tableRow}>
                <td>{order.id}</td>
                <td>{order.customer}</td>
                <td>{order.items}</td>
                <td>
                  <span className={`${styles.badge} ${order.status === 'Packed' ? styles.badgeSuccess : styles.badgeWarning}`}>
                    {order.status}
                  </span>
                </td>
                <td className="text-right">
                  <button
                    type="button"
                    onClick={() => updateStatus(order.id)}
                    disabled={order.status === 'Packed'}
                    className={`${styles.actionButton} ${styles.secondaryButton} ${order.status === 'Packed' ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <ArrowRightCircle size={16} /> {order.status === 'Packed' ? 'Packed' : 'Pack Order'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
