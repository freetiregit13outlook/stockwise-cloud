import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Warehouse,
  Receipt,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

const navItems = [
  { title: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { title: 'Products', path: '/products', icon: Package },
  { title: 'Inventory', path: '/inventory', icon: Warehouse },
  { title: 'Sales', path: '/sales', icon: Receipt },
  { title: 'Analytics', path: '/analytics', icon: BarChart3 },
  { title: 'Settings', path: '/settings', icon: Settings },
];

export const AppSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <aside
      className={cn(
        'h-screen bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="p-4 border-b border-sidebar-border flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Warehouse className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-sidebar-foreground">StockFlow</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="text-sidebar-foreground hover:bg-sidebar-accent"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
      </div>

      <nav className="flex-1 p-2 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                isActive
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              )}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span className="font-medium">{item.title}</span>}
            </NavLink>
          );
        })}
      </nav>

      {!collapsed && (
        <div className="p-4 border-t border-sidebar-border">
          <p className="text-xs text-sidebar-foreground/60">
            Connected to AWS
          </p>
          <p className="text-xs text-sidebar-foreground/40 mt-1">
            Mock Mode Active
          </p>
        </div>
      )}
    </aside>
  );
};
