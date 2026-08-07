import { Outlet } from 'react-router-dom';
import WarehouseSidebar from './WarehouseSidebar';

export default function WarehouseLayout() {
  return (
    <div className="flex min-h-screen bg-bg-primary text-text-primary">
      <WarehouseSidebar />
      <main className="flex-1 overflow-y-auto px-6 sm:px-8 lg:px-10 py-8">
        <Outlet />
      </main>
    </div>
  );
}
