/**
 * SIDEBAR COMPONENT
 * 
 * Renders navigation based on role AND account status.
 * Navigation is grouped by user intent:
 * - Overview (situational awareness)
 * - Market Participation (core actions)
 * - Execution (contracts & delivery)
 * - Governance (admin only)
 */

import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useRole } from '@/contexts/RoleContext';
import { useAccountStatus } from '@/hooks/useAccountStatus';
import { useHasExecutions } from '@/hooks/useHasExecutions';
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
  Eye,
  Lock,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AccountStatus } from '@/lib/account-status';
import { useState } from 'react';

interface NavItem {
  labelKey: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  requiredStatus?: AccountStatus[];
  readOnly?: boolean;
  requiresExecutions?: boolean;
}

interface NavGroup {
  key: string;
  labelKey: string;
  items: NavItem[];
  collapsible?: boolean;
  defaultOpen?: boolean;
}

// FARMER navigation - grouped by intent
const farmerNavGroups: NavGroup[] = [
  {
    key: 'overview',
    labelKey: 'nav.groups.overview',
    items: [
      { labelKey: 'nav.overview', path: '/', icon: Home, requiredStatus: ['observer', 'active'] },
      { labelKey: 'nav.priceGrid', path: '/price-grid', icon: Grid3X3, requiredStatus: ['observer', 'active'], readOnly: true },
    ],
  },
  {
    key: 'participation',
    labelKey: 'nav.groups.participation',
    items: [
      { labelKey: 'nav.livestockBatches', path: '/farmer/batches', icon: Boxes, requiredStatus: ['active'] },
      { labelKey: 'nav.salesCalendar', path: '/farmer/calendar', icon: Calendar, requiredStatus: ['active'] },
    ],
  },
  {
    key: 'execution',
    labelKey: 'nav.groups.execution',
    items: [
      { labelKey: 'nav.contractsExecution', path: '/farmer/executions', icon: ClipboardList, requiredStatus: ['active'], requiresExecutions: true },
    ],
  },
  {
    key: 'account',
    labelKey: 'nav.groups.account',
    items: [
      { labelKey: 'nav.profile', path: '/farmer/profile', icon: User, requiredStatus: ['active'] },
    ],
  },
];

// MPK navigation - grouped by intent
const mpkNavGroups: NavGroup[] = [
  {
    key: 'overview',
    labelKey: 'nav.groups.overview',
    items: [
      { labelKey: 'nav.marketOverview', path: '/mpk/market', icon: BarChart3, requiredStatus: ['observer', 'active'] },
      { labelKey: 'nav.priceGrid', path: '/price-grid', icon: Grid3X3, requiredStatus: ['observer', 'active'], readOnly: true },
    ],
  },
  {
    key: 'participation',
    labelKey: 'nav.groups.demand',
    items: [
      { labelKey: 'nav.purchasePoolRequests', path: '/mpk/requests', icon: ShoppingCart, requiredStatus: ['active'] },
      { labelKey: 'nav.watchlist', path: '/mpk/watchlist', icon: BookmarkCheck, requiredStatus: ['active'] },
    ],
  },
  {
    key: 'execution',
    labelKey: 'nav.groups.execution',
    items: [
      { labelKey: 'nav.contractsExecution', path: '/mpk/executions', icon: ClipboardList, requiredStatus: ['active'], requiresExecutions: true },
    ],
  },
  {
    key: 'account',
    labelKey: 'nav.groups.account',
    items: [
      { labelKey: 'nav.profile', path: '/mpk/profile', icon: User, requiredStatus: ['active'] },
    ],
  },
];

// ADMIN navigation - grouped by function
const adminNavGroups: NavGroup[] = [
  {
    key: 'overview',
    labelKey: 'nav.groups.overview',
    items: [
      { labelKey: 'nav.platformOverview', path: '/', icon: Home },
      { labelKey: 'nav.matchingWindows', path: '/admin/windows', icon: CalendarClock },
    ],
  },
  {
    key: 'matching',
    labelKey: 'nav.groups.matching',
    items: [
      { labelKey: 'nav.poolMatching', path: '/admin/matching', icon: GitMerge },
      { labelKey: 'nav.contractsExecution', path: '/admin/executions', icon: ClipboardList },
    ],
  },
  {
    key: 'participants',
    labelKey: 'nav.groups.participants',
    items: [
      { labelKey: 'nav.farmerManagement', path: '/admin/farmers', icon: Users },
      { labelKey: 'nav.mpkManagement', path: '/admin/mpks', icon: Building2 },
    ],
  },
  {
    key: 'governance',
    labelKey: 'nav.groups.governance',
    items: [
      { labelKey: 'nav.priceGridManagement', path: '/admin/price-grid', icon: Grid3X3 },
      { labelKey: 'nav.premiumRulesIncentives', path: '/admin/premiums', icon: Award },
      { labelKey: 'nav.activityLog', path: '/admin/activity', icon: Activity },
    ],
    collapsible: true,
    defaultOpen: false,
  },
];

export function Sidebar() {
  const { t } = useTranslation();
  const { role } = useRole();
  const { accountStatus, isLoading, isObserver, isSuspended } = useAccountStatus();
  const { data: hasExecutions = false } = useHasExecutions();
  const location = useLocation();
  
  // Track collapsed state for collapsible groups
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  const toggleGroup = (groupKey: string) => {
    setCollapsedGroups(prev => {
      const next = new Set(prev);
      if (next.has(groupKey)) {
        next.delete(groupKey);
      } else {
        next.add(groupKey);
      }
      return next;
    });
  };

  // Get navigation groups based on role
  const getNavGroups = (): NavGroup[] => {
    switch (role) {
      case 'farmer':
        return farmerNavGroups;
      case 'mpk':
        return mpkNavGroups;
      case 'admin':
        return adminNavGroups;
      default:
        return [];
    }
  };

  // Filter items within each group
  const filterItems = (items: NavItem[]): NavItem[] => {
    if (role === 'admin') return items;
    
    return items.filter(item => {
      if (item.requiredStatus && !item.requiredStatus.includes(accountStatus)) {
        return false;
      }
      if (item.requiresExecutions && !hasExecutions) {
        return false;
      }
      return true;
    });
  };

  // Filter out empty groups
  const getFilteredGroups = (): NavGroup[] => {
    return getNavGroups()
      .map(group => ({
        ...group,
        items: filterItems(group.items),
      }))
      .filter(group => group.items.length > 0);
  };

  const navGroups = getFilteredGroups();

  const roleLabel = {
    farmer: t('roles.farmer'),
    mpk: t('roles.processingPlant'),
    admin: t('roles.administration'),
  }[role];

  // Check if path matches
  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  // Show loading skeleton
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

      {/* Navigation Groups */}
      <nav className="flex-1 px-2 pb-4">
        {navGroups.map((group, groupIndex) => {
          const isCollapsed = group.collapsible && collapsedGroups.has(group.key);
          const isDefaultCollapsed = group.collapsible && group.defaultOpen === false && !collapsedGroups.has(group.key);
          const shouldShow = !group.collapsible || !isCollapsed;

          return (
            <div key={group.key} className={cn(groupIndex > 0 && 'mt-4')}>
              {/* Group Label */}
              {group.collapsible ? (
                <button
                  onClick={() => toggleGroup(group.key)}
                  className="w-full flex items-center justify-between px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider text-sidebar-muted hover:text-sidebar-foreground transition-colors"
                >
                  <span>{t(group.labelKey)}</span>
                  {isCollapsed ? (
                    <ChevronRight className="w-3 h-3" />
                  ) : (
                    <ChevronDown className="w-3 h-3" />
                  )}
                </button>
              ) : (
                <div className="px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider text-sidebar-muted">
                  {t(group.labelKey)}
                </div>
              )}

              {/* Group Items */}
              {shouldShow && (
                <ul className="space-y-0.5 mt-1">
                  {group.items.map((item) => (
                    <li key={item.path}>
                      <NavLink
                        to={item.path}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
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
                        <span className="flex-1 truncate">{t(item.labelKey)}</span>
                        {item.readOnly && (
                          <Eye className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                        )}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border mt-auto">
        <p className="text-xs text-sidebar-muted">Turan Standard Pool v1.0</p>
      </div>
    </aside>
  );
}
