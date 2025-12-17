import { NavLink, useLocation } from 'react-router-dom';
import { useRole } from '@/contexts/RoleContext';
import { 
  Home, 
  User, 
  Boxes, 
  Calendar,
  BarChart3,
  BookmarkCheck,
  ShoppingCart,
  Users,
  Building2,
  GitMerge,
  Activity,
  Grid3X3
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
}

/**
 * Navigation Structure
 * 
 * Farmer:
 * - Overview
 * - Livestock Batches
 * - Sales Calendar
 * - Price Grid
 * - Profile
 * 
 * MPK:
 * - Market Overview
 * - Watchlist
 * - Purchase Pool Requests
 * - Price Grid
 * - Profile
 * 
 * Admin:
 * - Platform Overview
 * - Pool Matching
 * - Farmer Management
 * - MPK Management
 * - Price Grid
 * - Activity Log
 */

const farmerNav: NavItem[] = [
  { label: 'Overview', path: '/', icon: Home },
  { label: 'Livestock Batches', path: '/farmer/batches', icon: Boxes },
  { label: 'Sales Calendar', path: '/farmer/calendar', icon: Calendar },
  { label: 'Price Grid', path: '/price-grid', icon: Grid3X3 },
  { label: 'Profile', path: '/farmer/profile', icon: User },
];

const mpkNav: NavItem[] = [
  { label: 'Market Overview', path: '/mpk/market', icon: BarChart3 },
  { label: 'Watchlist', path: '/mpk/watchlist', icon: BookmarkCheck },
  { label: 'Purchase Pool Requests', path: '/mpk/requests', icon: ShoppingCart },
  { label: 'Price Grid', path: '/price-grid', icon: Grid3X3 },
  { label: 'Profile', path: '/mpk/profile', icon: User },
];

const adminNav: NavItem[] = [
  { label: 'Platform Overview', path: '/', icon: Home },
  { label: 'Pool Matching', path: '/admin/matching', icon: GitMerge },
  { label: 'Farmer Management', path: '/admin/farmers', icon: Users },
  { label: 'MPK Management', path: '/admin/mpks', icon: Building2 },
  { label: 'Price Grid', path: '/price-grid', icon: Grid3X3 },
  { label: 'Activity Log', path: '/admin/activity', icon: Activity },
];

export function Sidebar() {
  const { role } = useRole();
  const location = useLocation();

  const navItems = {
    farmer: farmerNav,
    mpk: mpkNav,
    admin: adminNav,
  }[role];

  const roleLabel = {
    farmer: 'Farmer',
    mpk: 'Processing Plant',
    admin: 'Administration',
  }[role];

  // Check if path matches (exact or starts with for nested routes)
  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <aside className="w-56 bg-sidebar border-r border-sidebar-border flex flex-col shrink-0">
      {/* Role Section Header */}
      <div className="px-4 pt-5 pb-3">
        <span className="text-[11px] font-medium uppercase tracking-wider text-sidebar-muted">
          {roleLabel}
        </span>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-2">
        <ul className="space-y-0.5">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors",
                  isActive(item.path)
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                )}
              >
                <item.icon className={cn(
                  "w-4 h-4",
                  isActive(item.path) 
                    ? "text-primary" 
                    : "text-sidebar-muted"
                )} />
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border mt-auto">
        <p className="text-xs text-sidebar-muted">Turan Standard Pool v1.0</p>
      </div>
    </aside>
  );
}
