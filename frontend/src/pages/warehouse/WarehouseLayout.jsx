import { Outlet } from 'react-router-dom';
import WarehouseSidebar from './WarehouseSidebar';
import styles from './warehouse.module.css';

export default function WarehouseLayout() {
  return (
    <div className={styles.shell}>
      <WarehouseSidebar />
      <div className={styles.pageContainer}>
        <Outlet />
      </div>
    </div>
  );
}
