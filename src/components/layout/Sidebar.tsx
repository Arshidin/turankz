import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
  Grid3X3,
  Award,
  ClipboardList,
  CalendarClock
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  labelKey: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
}

const farmerNav: NavItem[] = [
  { labelKey: 'nav.overview', path: '/', icon: Home },
  { labelKey: 'nav.livestockBatches', path: '/farmer/batches', icon: Boxes },
  { labelKey: 'nav.salesCalendar', path: '/farmer/calendar', icon: Calendar },
  { labelKey: 'nav.priceGrid', path: '/price-grid', icon: Grid3X3 },
  { labelKey: 'nav.profile', path: '/farmer/profile', icon: User },
];

const mpkNav: NavItem[] = [
  { labelKey: 'nav.marketOverview', path: '/mpk/market', icon: BarChart3 },
  { labelKey: 'nav.watchlist', path: '/mpk/watchlist', icon: BookmarkCheck },
  { labelKey: 'nav.purchasePoolRequests', path: '/mpk/requests', icon: ShoppingCart },
  { labelKey: 'nav.priceGrid', path: '/price-grid', icon: Grid3X3 },
  { labelKey: 'nav.profile', path: '/mpk/profile', icon: User },
];

const adminNav: NavItem[] = [
  { labelKey: 'nav.platformOverview', path: '/', icon: Home },
  { labelKey: 'nav.matchingWindows', path: '/admin/windows', icon: CalendarClock },
  { labelKey: 'nav.poolMatching', path: '/admin/matching', icon: GitMerge },
  { labelKey: 'nav.contractsExecution', path: '/admin/executions', icon: ClipboardList },
  { labelKey: 'nav.farmerManagement', path: '/admin/farmers', icon: Users },
  { labelKey: 'nav.mpkManagement', path: '/admin/mpks', icon: Building2 },
  { labelKey: 'nav.priceGridManagement', path: '/admin/price-grid', icon: Grid3X3 },
  { labelKey: 'nav.premiumRulesIncentives', path: '/admin/premiums', icon: Award },
  { labelKey: 'nav.activityLog', path: '/admin/activity', icon: Activity },
];

export function Sidebar() {
  const { t } = useTranslation();
  const { role } = useRole();
  const location = useLocation();

  const navItems = {
    farmer: farmerNav,
    mpk: mpkNav,
    admin: adminNav,
  }[role];

  const roleLabel = {
    farmer: t('roles.farmer'),
    mpk: t('roles.processingPlant'),
    admin: t('roles.administration'),
  }[role];

  // Check if path matches (exact or starts with for nested routes)
  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <aside className="w-56 bg-sidebar border-r border-sidebar-border flex flex-col shrink-0 h-full overflow-y-auto">
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
                <span>{t(item.labelKey)}</span>
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
