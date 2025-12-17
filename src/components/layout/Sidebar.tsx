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
  Award,
  GitMerge
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
}

const commonNav: NavItem[] = [
  { label: 'Overview', path: '/', icon: Home },
];

const farmerNav: NavItem[] = [
  { label: 'My Profile', path: '/farmer/profile', icon: User },
  { label: 'Livestock Batches', path: '/farmer/batches', icon: Boxes },
  { label: 'Sales Calendar', path: '/farmer/calendar', icon: Calendar },
];

const mpkNav: NavItem[] = [
  { label: 'Market Overview', path: '/mpk/market', icon: BarChart3 },
  { label: 'Watchlist', path: '/mpk/watchlist', icon: BookmarkCheck },
  { label: 'Purchase Pool Requests', path: '/mpk/requests', icon: ShoppingCart },
];

const adminNav: NavItem[] = [
  { label: 'Farmers Management', path: '/admin/farmers', icon: Users },
  { label: 'Grading & Status', path: '/admin/grading', icon: Award },
  { label: 'Pool Matching', path: '/admin/matching', icon: GitMerge },
];

export function Sidebar() {
  const { role } = useRole();
  const location = useLocation();

  const roleSpecificNav = {
    farmer: farmerNav,
    mpk: mpkNav,
    admin: adminNav,
  }[role];

  const roleLabel = {
    farmer: 'Farmer',
    mpk: 'Processing Plant',
    admin: 'Administration',
  }[role];

  return (
    <aside className="w-56 bg-sidebar border-r border-sidebar-border flex flex-col">
      <nav className="flex-1 py-4">
        <div className="px-3 mb-4">
          <span className="text-[11px] font-medium uppercase tracking-wider text-sidebar-muted">
            General
          </span>
        </div>
        <ul className="space-y-0.5 px-2">
          {commonNav.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                  location.pathname === item.path
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="px-3 mt-6 mb-4">
          <span className="text-[11px] font-medium uppercase tracking-wider text-sidebar-muted">
            {roleLabel}
          </span>
        </div>
        <ul className="space-y-0.5 px-2">
          {roleSpecificNav.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                  location.pathname === item.path
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <p className="text-xs text-sidebar-muted">Turan Standard Pool v1.0</p>
      </div>
    </aside>
  );
}
