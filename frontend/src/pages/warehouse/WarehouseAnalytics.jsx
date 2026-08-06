import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { analyticsData } from '../../data/warehouseData';
import styles from './warehouse.module.css';

const colors = ['#4338ca', '#0f766e', '#c026d3'];

export default function WarehouseAnalytics() {
  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Warehouse Analytics</h1>
          <p className={styles.pageSubtitle}>Performance insights for inventory, shipments, and packing throughput.</p>
        </div>
      </div>

      <div className={`${styles.grid} ${styles.summaryGrid}`}>
        {[
          { title: 'Total Inventory', value: analyticsData.totalInventory },
          { title: 'Received Today', value: analyticsData.receivedToday },
          { title: 'Orders Packed', value: analyticsData.ordersPacked },
          { title: 'Shipments Dispatched', value: analyticsData.shipmentsDispatched },
          { title: 'Low Stock Items', value: analyticsData.lowStockItems },
        ].map((card) => (
          <div key={card.title} className={styles.card}>
            <div className={styles.cardTitle}>{card.title}</div>
            <div className={styles.metricValue}>{card.value}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.25fr_0.8fr] mt-8">
        <div className={styles.card}>
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>Inventory by Category</h2>
              <p className={styles.sectionDescription}>Category volume across current warehouse stock.</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={analyticsData.inventoryByCategory} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
              <XAxis dataKey="category" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip />
              <Bar dataKey="value" fill="#4338ca" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className={styles.card}>
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>Shipment Status</h2>
              <p className={styles.sectionDescription}>Progress of recent dispatch readiness.</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie data={analyticsData.shipmentStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={110} innerRadius={50} paddingAngle={4}>
                {analyticsData.shipmentStatus.map((entry, index) => (
                  <Cell key={entry.name} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Legend verticalAlign="bottom" height={48} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className={styles.card} style={{ marginTop: 24 }}>
        <div className={styles.sectionHeader}>
          <div>
            <h2 className={styles.sectionTitle}>Top Inventory</h2>
            <p className={styles.sectionDescription}>Most active inventory items and movement direction.</p>
          </div>
        </div>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Product</th>
                <th>Stock</th>
                <th>Movement</th>
              </tr>
            </thead>
            <tbody>
              {analyticsData.topInventory.map((item) => (
                <tr key={item.product} className={styles.tableRow}>
                  <td>{item.product}</td>
                  <td>{item.stock}</td>
                  <td>{item.movement}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
