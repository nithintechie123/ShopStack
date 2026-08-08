import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Database, Package, Truck, Activity, BarChart3, ArrowLeft, LogOut } from 'lucide-react';

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
    <aside className="w-64 shrink-0 bg-bg-secondary border-r border-glass-border flex flex-col min-h-screen sticky top-0">
      <div className="p-6 border-b border-glass-border flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-primary to-indigo-600 flex items-center justify-center font-display font-extrabold text-sm text-white shadow-md shadow-accent-primary/20">
          W
        </div>
        <div>
          <div className="font-bold text-text-primary text-sm font-display tracking-tight leading-none">Warehouse Hub</div>
          <div className="text-[10px] text-text-muted font-medium mt-1">Fulfillment Network</div>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-accent-primary/10 text-accent-primary'
                  : 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary/50'
              }`}
            >
              <Icon size={16} className={isActive ? 'text-accent-primary' : 'text-text-muted'} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-6 border-t border-glass-border">
        <button
          onClick={() => navigate('/warehouse/login')}
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-glass-border hover:bg-black/5 dark:hover:bg-white/5 text-text-secondary hover:text-text-primary font-bold text-sm transition-all duration-200 cursor-pointer"
          type="button"
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
