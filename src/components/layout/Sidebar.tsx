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
  ChevronRight,
  Beef,
  TrendingUp,
  GraduationCap,
  BookOpen
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AccountStatus } from '@/lib/account-status';
import { useState } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useBatches } from '@/hooks/useBatches';
import { usePoolRequests } from '@/hooks/usePoolRequests';
import { useAuthContext } from '@/contexts/AuthContext';
import { useCurrentMpk } from '@/hooks/useCurrentMpk';

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

// FARMER navigation - grouped by intent with clear separation between
// "Data & Outlook" (informational, non-binding) and "Market Operations" (binding actions)
// 
// OBSERVER ACCESS: Only shows Overview, Price Grid, and National Herd Structure
// All other sections hidden until profile activation
const farmerNavGroups: NavGroup[] = [
  {
    key: 'overview',
    labelKey: 'nav.groups.overview',
    items: [
      { labelKey: 'nav.overview', path: '/overview', icon: Home, requiredStatus: ['observer', 'active'] },
      { labelKey: 'nav.priceGrid', path: '/price-grid', icon: Grid3X3, requiredStatus: ['observer', 'active'], readOnly: true },
      { labelKey: 'nav.marketWorkflow', path: '/market-workflow', icon: GraduationCap, requiredStatus: ['observer', 'active'], readOnly: true },
      // National Herd Structure - read-only for observers (uses public route)
      { labelKey: 'nav.nationalHerd', path: '/herd-overview', icon: Beef, requiredStatus: ['observer', 'active'], readOnly: true },
      { labelKey: 'nav.documentation', path: '/docs', icon: BookOpen, requiredStatus: ['observer', 'active'], readOnly: true },
    ],
  },
  // DATA & OUTLOOK: Informational only - never auto-generates batches (active only)
  // NOTE: Herd Structure removed from farmer UI - admin-only feature
  {
    key: 'data-outlook',
    labelKey: 'nav.groups.dataOutlook',
    items: [
      { labelKey: 'nav.marketIntent', path: '/farmer/intent', icon: TrendingUp, requiredStatus: ['active'] },
    ],
  },
  // MARKET OPERATIONS: Binding actions - batches are the gateway to matching
  // Observers can access batches to create drafts (but cannot publish until activated)
  {
    key: 'market-operations',
    labelKey: 'nav.groups.marketOperations',
    items: [
      { labelKey: 'nav.livestockBatches', path: '/farmer/batches', icon: Boxes, requiredStatus: ['observer', 'active'] },
      { labelKey: 'nav.salesCalendar', path: '/farmer/calendar', icon: Calendar, requiredStatus: ['active'] },
    ],
  },
  // Execution section (active only, requires executions)
  {
    key: 'execution',
    labelKey: 'nav.groups.execution',
    items: [
      { labelKey: 'nav.contractsExecution', path: '/farmer/executions', icon: ClipboardList, requiredStatus: ['active'], requiresExecutions: true },
    ],
  },
  // Account section (available for all statuses including observer)
  {
    key: 'account',
    labelKey: 'nav.groups.account',
    items: [
      { labelKey: 'nav.profile', path: '/farmer/profile', icon: User, requiredStatus: ['observer', 'active'] },
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
      { labelKey: 'nav.regionalOutlook', path: '/mpk/outlook', icon: TrendingUp, requiredStatus: ['active'] },
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

// ADMIN navigation - grouped by orchestration function
// Emphasizes market coordination and rules-based execution, not manual control
const adminNavGroups: NavGroup[] = [
  {
    key: 'overview',
    labelKey: 'nav.groups.overview',
    items: [
      { labelKey: 'nav.platformOverview', path: '/overview', icon: Home },
    ],
  },
  {
    key: 'scheduling-coordination',
    labelKey: 'nav.groups.schedulingCoordination',
    items: [
      { labelKey: 'nav.matchingWindows', path: '/admin/windows', icon: CalendarClock },
      { labelKey: 'nav.participantCoordination', path: '/admin/farmers', icon: Users },
      { labelKey: 'nav.mpkCoordination', path: '/admin/mpks', icon: Building2 },
    ],
  },
  {
    key: 'matching-execution',
    labelKey: 'nav.groups.matchingExecution',
    items: [
      { labelKey: 'nav.poolMatching', path: '/admin/matching', icon: GitMerge },
      { labelKey: 'nav.contractsExecution', path: '/admin/executions', icon: ClipboardList },
    ],
  },
  {
    key: 'governance',
    labelKey: 'nav.groups.governance',
    items: [
      { labelKey: 'nav.priceGridManagement', path: '/admin/price-grid', icon: Grid3X3 },
      { labelKey: 'nav.premiumRulesIncentives', path: '/admin/premiums', icon: Award },
      { labelKey: 'nav.nationalHerd', path: '/admin/herd-structure', icon: Beef },
      { labelKey: 'nav.marketIntentOverview', path: '/admin/market-intent', icon: TrendingUp },
      { labelKey: 'nav.activityLog', path: '/admin/activity', icon: Activity },
      { labelKey: 'nav.documentation', path: '/docs', icon: BookOpen },
      { labelKey: 'nav.docsManagement', path: '/admin/docs', icon: BookOpen },
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
  const { user } = useAuthContext();
  
  // Fetch data for indicators
  const { data: batches = [] } = useBatches();
  const { data: poolRequests = [] } = usePoolRequests();
  const { data: currentMpk } = useCurrentMpk();
  
  // Calculate indicators
  const getNavItemIndicator = (path: string): number | null => {
    if (role === 'farmer' && user?.id) {
      if (path === '/farmer/batches') {
        // Count batches requiring action
        const requiringAction = batches.filter(
          b => b.user_id === user.id && b.requires_action
        ).length;
        return requiringAction > 0 ? requiringAction : null;
      }
    }
    if (role === 'mpk' && currentMpk?.mpk_id) {
      if (path === '/mpk/requests') {
        // Count draft requests for current MPK only
        const draftRequests = poolRequests.filter(
          r => r.mpk_id === currentMpk.mpk_id && r.status === 'draft'
        ).length;
        return draftRequests > 0 ? draftRequests : null;
      }
    }
    return null;
  };
  
  // Get tooltip text for nav items
  const getNavItemTooltip = (item: NavItem): string => {
    const tooltips: Record<string, string> = {
      '/overview': t('nav.tooltips.overview', 'Dashboard with overview of your activity'),
      '/farmer/batches': t('nav.tooltips.batches', 'Manage your livestock batches'),
      '/farmer/calendar': t('nav.tooltips.calendar', 'View your sales calendar'),
      '/mpk/requests': t('nav.tooltips.requests', 'Manage purchase pool requests'),
      '/mpk/watchlist': t('nav.tooltips.watchlist', 'Track batches of interest'),
      '/price-grid': t('nav.tooltips.priceGrid', 'View reference prices'),
      '/market-workflow': t('nav.tooltips.workflow', 'Learn about the platform workflow'),
    };
    return tooltips[item.path] || t(item.labelKey);
  };
  
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
    if (path === '/overview') {
      return location.pathname === '/overview';
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
              {isObserver ? (t('accountStatus.pending', 'Pending') || 'Pending') : isSuspended ? 'Suspended' : ''}
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
                  {group.items.map((item) => {
                    const indicator = getNavItemIndicator(item.path);
                    const tooltipText = getNavItemTooltip(item);
                    // Check if this is an external link (starts with http or is documentation)
                    const isExternalLink = item.path.startsWith('http') || item.path.startsWith('https');
                    
                    return (
                      <li key={item.path}>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              {isExternalLink ? (
                                <a
                                  href={item.path}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={cn(
                                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors relative",
                                    "text-sidebar-foreground hover:bg-sidebar-accent/50"
                                  )}
                                >
                                  <item.icon className="w-4 h-4 text-sidebar-muted" />
                                  <span className="flex-1 truncate">{t(item.labelKey)}</span>
                                  <div className="flex items-center gap-1.5 flex-shrink-0">
                                    {item.readOnly && (
                                      <Eye className="w-3 h-3 text-muted-foreground" />
                                    )}
                                  </div>
                                </a>
                              ) : (
                                <NavLink
                                  to={item.path}
                                  className={cn(
                                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors relative",
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
                                  <div className="flex items-center gap-1.5 flex-shrink-0">
                                    {indicator !== null && indicator > 0 && (
                                      <Badge 
                                        variant="destructive" 
                                        className="h-5 min-w-5 px-1.5 text-[10px] font-semibold flex items-center justify-center"
                                      >
                                        {indicator > 99 ? '99+' : indicator}
                                      </Badge>
                                    )}
                                    {item.readOnly && (
                                      <Eye className="w-3 h-3 text-muted-foreground" />
                                    )}
                                  </div>
                                </NavLink>
                              )}
                            </TooltipTrigger>
                            <TooltipContent side="right" className="max-w-[200px]">
                              <p className="font-medium">{t(item.labelKey)}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {tooltipText}
                              </p>
                              {indicator !== null && indicator > 0 && (
                                <p className="text-xs text-destructive mt-1 font-medium">
                                  {indicator} {indicator === 1 
                                    ? t('nav.requiresAttention', 'requires attention')
                                    : t('nav.requireAttention', 'require attention')}
                                </p>
                              )}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </li>
                    );
                  })}
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
