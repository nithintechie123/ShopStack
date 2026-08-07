import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Database, Package, Truck, Activity, BarChart3, ArrowLeft, LogOut } from 'lucide-react';
import styles from './warehouse.module.css';

const navItems = [
  { label: 'Dashboard', to: '/warehouse/dashboard', icon: LayoutDashboard },
  { label: 'Inventory Status', to: '/warehouse/inventory', icon: Database },
  { label: 'Receive Inventory', to: '/warehouse/receive', icon: Package },
  { label: 'Pick & Pack Orders', to: '/warehouse/pick-pack', icon: Truck },
  { label: 'Shipment Preparation', to: '/warehouse/shipment', icon: Activity },
  { label: 'Stock Movement', to: '/warehouse/stock-movement', icon: ArrowLeft },
  { label: 'Warehouse Analytics', to: '/warehouse/analytics', icon: BarChart3 },
];

export default function WarehouseSidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <div className={styles.brandLogo}>W</div>
        <div className={styles.brandText}>
          <div className={styles.brandTitle}>Warehouse Hub</div>
          <div className={styles.brandSubtext}>Manage fulfillment operations</div>
        </div>
      </div>

      <div className={styles.navList}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`${styles.navItem} ${isActive ? styles.activeItem : ''}`}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      <div className={styles.sidebarFooter}>
        <div className={styles.sidebarDivider} />
        <button
          onClick={() => navigate('/warehouse/login')}
          className={`${styles.actionButton} ${styles.ghostButton} ${styles.fullWidth}`}
          type="button"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </aside>
  );
}
