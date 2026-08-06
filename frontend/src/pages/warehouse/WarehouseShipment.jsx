import { useState } from 'react';
import styles from './warehouse.module.css';

const initialShipments = [
  { id: 'SHP-8B1F6C3D', orderId: 'OID-7F2A5B1C', customer: 'Keira Vincent', courier: 'RapidX', status: 'Ready' },
  { id: 'SHP-5D9E0A2F', orderId: 'OID-2B8D0C9F', customer: 'Noah Bennett', courier: 'ShipPoint', status: 'Ready' },
  { id: 'SHP-4C3B8D0E', orderId: 'OID-4E5F1A2D', customer: 'Mason Reed', courier: 'FleetWave', status: 'Dispatched' },
];

export default function WarehouseShipment() {
  const [shipments, setShipments] = useState(initialShipments);

  const dispatchShipment = (id) => {
    setShipments((prev) => prev.map((item) => item.id === id ? { ...item, status: 'Dispatched' } : item));
  };

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Shipment Preparation</h1>
          <p className={styles.pageSubtitle}>Track upcoming shipments and move them into dispatch status.</p>
        </div>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Shipment ID</th>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Courier</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {shipments.map((shipment) => (
              <tr key={shipment.id} className={styles.tableRow}>
                <td>{shipment.id}</td>
                <td>{shipment.orderId}</td>
                <td>{shipment.customer}</td>
                <td>{shipment.courier}</td>
                <td>
                  <span className={`${styles.badge} ${shipment.status === 'Dispatched' ? styles.badgeSuccess : styles.badgeWarning}`}>
                    {shipment.status}
                  </span>
                </td>
                <td className="text-right">
                  <button
                    type="button"
                    onClick={() => dispatchShipment(shipment.id)}
                    disabled={shipment.status === 'Dispatched'}
                    className={`${styles.actionButton} ${styles.secondaryButton} ${shipment.status === 'Dispatched' ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {shipment.status === 'Dispatched' ? 'Dispatched' : 'Dispatch'}
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
