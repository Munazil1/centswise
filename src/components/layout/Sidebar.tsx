import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Receipt, 
  TrendingDown, 
  Package, 
  FileText, 
  Settings,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Add Credit', href: '/add-credit', icon: Receipt, malayalam: 'സംഭാവന' },
  { name: 'Add Expense', href: '/add-expense', icon: TrendingDown },
  { name: 'Transactions', href: '/transactions', icon: FileText },
  { name: 'Property', href: '/property', icon: Package },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const location = useLocation();
  const { logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile menu button */}
      <button 
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-sidebar text-sidebar-foreground"
      >
        {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed lg:static inset-y-0 left-0 z-40 w-72 bg-sidebar flex flex-col transition-transform duration-300",
        mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Logo */}
        <div className="p-6 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sidebar-primary flex items-center justify-center">
              <span className="text-sidebar-primary-foreground font-bold text-lg">₹</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-sidebar-foreground">CentsWise</h1>
              <p className="text-xs text-sidebar-foreground/60 font-malayalam">സാന്ത്വനം ഫണ്ട്</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "sidebar-nav-item",
                  isActive && "active"
                )}
              >
                <item.icon className="w-5 h-5" />
                <div className="flex flex-col">
                  <span>{item.name}</span>
                  {item.malayalam && (
                    <span className="text-xs opacity-60 font-malayalam">{item.malayalam}</span>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Unit Info */}
        <div className="p-4 border-t border-sidebar-border">
          <div className="p-4 rounded-lg bg-sidebar-accent/50">
            <p className="text-sm font-medium text-sidebar-foreground font-malayalam">
              പുറത്തീൽ യൂണിറ്റ്
            </p>
            <p className="text-xs text-sidebar-foreground/60 mt-1">
              SYS Puratheel Unit
            </p>
          </div>
        </div>

        {/* Logout */}
        <div className="p-4 border-t border-sidebar-border">
          <button 
            onClick={logout}
            className="sidebar-nav-item w-full text-sidebar-foreground/70 hover:text-destructive"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
