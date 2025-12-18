/**
 * SIDEBAR COMPONENT
 * 
 * Renders navigation based on role AND account status.
 * Components are NOT mounted if access is not allowed.
 */

import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useRole } from '@/contexts/RoleContext';
import { useAccountStatus } from '@/hooks/useAccountStatus';
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
  CalendarClock,
  HelpCircle,
  Eye,
  Lock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AccountStatus } from '@/lib/account-status';

interface NavItem {
  labelKey: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  requiredStatus?: AccountStatus[];
  readOnly?: boolean;
}

// FARMER navigation - filtered by account status
const farmerNavItems: NavItem[] = [
  { labelKey: 'nav.overview', path: '/', icon: Home, requiredStatus: ['observer', 'active'] },
  { labelKey: 'nav.livestockBatches', path: '/farmer/batches', icon: Boxes, requiredStatus: ['active'] },
  { labelKey: 'nav.salesCalendar', path: '/farmer/calendar', icon: Calendar, requiredStatus: ['active'] },
  { labelKey: 'nav.priceGrid', path: '/price-grid', icon: Grid3X3, requiredStatus: ['observer', 'active'], readOnly: true },
  { labelKey: 'nav.profile', path: '/farmer/profile', icon: User, requiredStatus: ['active'] },
  { labelKey: 'nav.help', path: '/help', icon: HelpCircle, requiredStatus: ['observer', 'active'] },
];

// MPK navigation - filtered by account status
const mpkNavItems: NavItem[] = [
  { labelKey: 'nav.marketOverview', path: '/mpk/market', icon: BarChart3, requiredStatus: ['observer', 'active'] },
  { labelKey: 'nav.purchasePoolRequests', path: '/mpk/requests', icon: ShoppingCart, requiredStatus: ['active'] },
  { labelKey: 'nav.watchlist', path: '/mpk/watchlist', icon: BookmarkCheck, requiredStatus: ['active'] },
  { labelKey: 'nav.priceGrid', path: '/price-grid', icon: Grid3X3, requiredStatus: ['observer', 'active'], readOnly: true },
  { labelKey: 'nav.profile', path: '/mpk/profile', icon: User, requiredStatus: ['active'] },
  { labelKey: 'nav.help', path: '/help', icon: HelpCircle, requiredStatus: ['observer', 'active'] },
];

// ADMIN navigation - full access
const adminNavItems: NavItem[] = [
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
  const { accountStatus, isLoading, isObserver, isSuspended } = useAccountStatus();
  const location = useLocation();

  // Get navigation items based on role
  const getNavItems = (): NavItem[] => {
    switch (role) {
      case 'farmer':
        return farmerNavItems;
      case 'mpk':
        return mpkNavItems;
      case 'admin':
        return adminNavItems;
      default:
        return [];
    }
  };

  // Filter nav items by account status
  const getFilteredNavItems = (): NavItem[] => {
    const items = getNavItems();
    
    // Admin always has full access
    if (role === 'admin') return items;
    
    // Filter items based on required status
    return items.filter(item => {
      if (!item.requiredStatus) return true;
      return item.requiredStatus.includes(accountStatus);
    });
  };

  const navItems = getFilteredNavItems();

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

  // Show loading skeleton while determining account status
  if (isLoading) {
    return (
      <aside className="w-56 bg-sidebar border-r border-sidebar-border flex flex-col shrink-0 h-full overflow-y-auto">
        <div className="px-4 pt-5 pb-3">
          <Skeleton className="h-3 w-20" />
        </div>
        <nav className="flex-1 px-2">
          <div className="space-y-1">
            {[1, 2, 3, 4, 5].map(i => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </nav>
      </aside>
    );
  }

  return (
    <aside className="w-56 bg-sidebar border-r border-sidebar-border flex flex-col shrink-0 h-full overflow-y-auto">
      {/* Role Section Header */}
      <div className="px-4 pt-5 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-medium uppercase tracking-wider text-sidebar-muted">
            {roleLabel}
          </span>
          {/* Account Status Badge */}
          {role !== 'admin' && (
            <Badge 
              variant={isObserver ? 'secondary' : isSuspended ? 'destructive' : 'outline'}
              className="text-[9px] px-1.5 py-0"
            >
              {isObserver && <Eye className="w-2.5 h-2.5 mr-0.5" />}
              {isSuspended && <Lock className="w-2.5 h-2.5 mr-0.5" />}
              {isObserver ? 'Observer' : isSuspended ? 'Suspended' : ''}
            </Badge>
          )}
        </div>
      </div>

      {/* Observer Mode Banner */}
      {isObserver && role !== 'admin' && (
        <div className="mx-2 mb-2 px-3 py-2 rounded-md bg-amber-500/10 border border-amber-500/20">
          <div className="flex items-center gap-2">
            <Eye className="w-3.5 h-3.5 text-amber-600" />
            <span className="text-xs text-amber-700 dark:text-amber-400">
              {t('nav.observerMode') || 'Read-only mode'}
            </span>
          </div>
        </div>
      )}

      {/* Suspended Mode Banner */}
      {isSuspended && (
        <div className="mx-2 mb-2 px-3 py-2 rounded-md bg-destructive/10 border border-destructive/20">
          <div className="flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-destructive" />
            <span className="text-xs text-destructive">
              {t('nav.suspendedMode') || 'Account suspended'}
            </span>
          </div>
        </div>
      )}

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
                <span className="flex-1">{t(item.labelKey)}</span>
                {item.readOnly && (
                  <Eye className="w-3 h-3 text-muted-foreground" />
                )}
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
