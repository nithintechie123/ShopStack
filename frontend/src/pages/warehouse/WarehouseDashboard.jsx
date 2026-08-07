import { useMemo } from 'react';
import { ArrowUpRight, ArrowDown, Package, Truck, Layers, Bell, ClipboardList, ArrowRight, CircleDollarSign } from 'lucide-react';
import { inventoryItems, inboundOrders, shipments } from '../../data/warehouseData';
import styles from './warehouse.module.css';

export default function WarehouseDashboard() {
  const totalInventory = useMemo(
    () => inventoryItems.reduce((sum, item) => sum + item.availableStock, 0),
    []
  );

  const incomingShipments = useMemo(
    () => shipments.filter((item) => item.status === 'Ready').length,
    []
  );
  const ordersToPack = useMemo(
    () => inboundOrders.filter((item) => item.status === 'Pending').length,
    []
  );
  const readyToShip = useMemo(
    () => shipments.filter((item) => item.status === 'Ready').length,
    []
  );
  const lowStockItems = useMemo(
    () => inventoryItems.filter((item) => item.availableStock <= 20).length,
    []
  );

  const activities = [
    { label: 'Received new stock for Pro Active Camera', time: '14 min ago' },
    { label: 'Picked and packed OID-3D8A5B2C', time: '40 min ago' },
    { label: 'Shipment ready for dispatch', time: '2 hrs ago' },
    { label: 'Low stock alert triggered for Kitchen Smart Scale', time: 'Yesterday' },
  ];

  return (
    <div>
      <div className={styles.pageHeader} style={{ alignItems: 'flex-start' }}>
        <div>
          <div className={styles.pageBanner}>
            <div>
              <p className={styles.bannerLabel}>Central Warehouse</p>
              <h1 className={styles.pageTitle}>Warehouse Dashboard</h1>
              <p className={styles.pageSubtitle}>A unified view of fulfillment operations for the warehouse team.</p>
            </div>
            <div className={styles.bannerMeta}>
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Warehouse Name</p>
                <p className="font-semibold text-text-primary">Central Warehouse</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Staff</p>
                <p className="font-semibold text-text-primary">Warehouse Staff</p>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.headerActions}>
          <button type="button" className={`${styles.actionButton} ${styles.dangerButton}`}>Logout</button>
        </div>
      </div>

      <div className={`${styles.grid} ${styles.summaryGrid}`}>
        {[
          { icon: Layers, title: 'Total Inventory', value: totalInventory, tone: 'blue' },
          { icon: CircleDollarSign, title: 'Incoming Shipments', value: incomingShipments, tone: 'green' },
          { icon: Package, title: 'Orders to Pack', value: ordersToPack, tone: 'orange' },
          { icon: Truck, title: 'Ready to Ship', value: readyToShip, tone: 'violet' },
          { icon: Bell, title: 'Low Stock Items', value: lowStockItems, tone: 'red' },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.title} className={styles.card}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`${styles.metricIcon} ${styles[`icon${card.tone.charAt(0).toUpperCase() + card.tone.slice(1)}`]}`}>
                  <Icon size={18} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-text-secondary">{card.title}</p>
                  <p className="text-3xl font-extrabold text-text-primary">{card.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.card} style={{ marginTop: 24 }}>
        <div className={styles.sectionHeader}>
          <div>
            <h2 className={styles.sectionTitle}>Quick Actions</h2>
            <p className={styles.sectionDescription}>Jump to a key fulfillment workflow.</p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Receive Inventory', description: 'Add newly arrived inventory.', icon: ArrowDown },
            { label: 'Pick & Pack', description: 'Prepare customer orders for shipment.', icon: Package },
            { label: 'Prepare Shipment', description: 'Dispatch ready orders.', icon: Truck },
            { label: 'Inventory Status', description: 'Review warehouse stock levels.', icon: ClipboardList },
          ].map((action) => (
            <button key={action.label} type="button" className={`${styles.actionTile}`}>
              <div className="flex items-center gap-3 mb-3">
                <span className="inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-slate-100 text-slate-700">
                  <action.icon size={18} />
                </span>
                <div>
                  <p className="font-semibold text-text-primary">{action.label}</p>
                </div>
              </div>
              <p className="text-sm text-text-secondary">{action.description}</p>
            </button>
          ))}
        </div>
      </div>

      <div className={styles.card} style={{ marginTop: 24 }}>
        <div className={styles.sectionHeader}>
          <div>
            <h2 className={styles.sectionTitle}>Recent Activities</h2>
            <p className={styles.sectionDescription}>Latest operational updates from the warehouse floor.</p>
          </div>
        </div>
        <div className={styles.activityList}>
          {activities.map((activity) => (
            <div key={activity.label} className={styles.activityItem}>
              <div>
                <div className={styles.activityLabel}>{activity.label}</div>
                <p className={styles.activityTime}>{activity.time}</p>
              </div>
              <div className="text-sm text-text-muted">Warehouse Team</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
