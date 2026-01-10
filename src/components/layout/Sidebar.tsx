/**
 * SIDEBAR COMPONENT - Design System Specification
 *
 * Width: 260px fixed (w-sidebar custom utility)
 * Background: bg-base (#0D0D0D)
 * Border-right: 1px solid border-subtle (#2A2A2A)
 *
 * Sidebar Item:
 * - Height: 32-36px
 * - Padding: 8px 12px
 * - Border-radius: 6px
 * - Icon: 16px, text-tertiary
 * - Text: 13px, weight 500, text-secondary
 * - Hover: bg-surface-hover
 * - Active: bg-surface-active, text-primary
 *
 * Section Header:
 * - 11px, weight 600, text-tertiary, uppercase
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

// FARMER navigation - simplified structure (Sprint 2)
const farmerNavGroups: NavGroup[] = [
  {
    key: 'dashboard',
    labelKey: 'nav.groups.dashboard',
    items: [
      { labelKey: 'nav.overview', path: '/overview', icon: Home, requiredStatus: ['observer', 'active'] },
    ],
  },
  {
    key: 'operations',
    labelKey: 'nav.groups.operations',
    items: [
      { labelKey: 'nav.myBatches', path: '/farmer/batches', icon: Boxes, requiredStatus: ['observer', 'active'] },
      { labelKey: 'nav.salesCalendar', path: '/farmer/calendar', icon: Calendar, requiredStatus: ['active'] },
      { labelKey: 'nav.executions', path: '/farmer/executions', icon: ClipboardList, requiredStatus: ['active'], requiresExecutions: true },
    ],
  },
  {
    key: 'planning',
    labelKey: 'nav.groups.planning',
    items: [
      { labelKey: 'nav.marketIntent', path: '/farmer/intent', icon: TrendingUp, requiredStatus: ['active'] },
    ],
  },
  {
    key: 'reference',
    labelKey: 'nav.groups.reference',
    items: [
      { labelKey: 'nav.priceGrid', path: '/price-grid', icon: Grid3X3, requiredStatus: ['observer', 'active'], readOnly: true },
      { labelKey: 'nav.documentation', path: '/docs', icon: BookOpen, requiredStatus: ['observer', 'active'], readOnly: true },
    ],
  },
  {
    key: 'account',
    labelKey: 'nav.groups.account',
    items: [
      { labelKey: 'nav.profile', path: '/farmer/profile', icon: User, requiredStatus: ['observer', 'active'] },
    ],
  },
];

// MPK navigation
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

// ADMIN navigation
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
        const requiringAction = batches.filter(
          b => b.user_id === user.id && b.requires_action
        ).length;
        return requiringAction > 0 ? requiringAction : null;
      }
    }
    if (role === 'mpk' && currentMpk?.mpk_id) {
      if (path === '/mpk/requests') {
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
      <aside className="w-[260px] bg-[var(--bg-base)] border-r border-[var(--border-subtle)] flex flex-col shrink-0 h-full overflow-y-auto">
        <div className="px-[16px] pt-[20px] pb-[12px]">
          <Skeleton className="h-3 w-20" />
        </div>
        <nav className="flex-1 px-[8px]">
          <div className="space-y-[4px]">
            {[1, 2, 3, 4, 5].map(i => (
              <Skeleton key={i} className="h-[32px] w-full rounded-[6px]" />
            ))}
          </div>
        </nav>
      </aside>
    );
  }

  return (
    <aside className="w-[260px] bg-[var(--bg-base)] border-r border-[var(--border-subtle)] flex flex-col shrink-0 h-full overflow-y-auto">
      {/* Role Section Header */}
      <div className="px-[16px] pt-[20px] pb-[12px]">
        <div className="flex items-center gap-[8px]">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-[var(--text-tertiary)]">
            {roleLabel}
          </span>
          {role !== 'admin' && (
            <Badge
              variant={isObserver ? 'secondary' : isSuspended ? 'destructive' : 'outline'}
              className="text-[9px] px-[6px] py-0 h-[16px]"
            >
              {isObserver && <Eye className="w-[10px] h-[10px] mr-[2px]" />}
              {isSuspended && <Lock className="w-[10px] h-[10px] mr-[2px]" />}
              {isObserver ? (t('accountStatus.pending', 'Pending') || 'Pending') : isSuspended ? 'Suspended' : ''}
            </Badge>
          )}
        </div>
      </div>

      {/* Suspended Mode Banner */}
      {isSuspended && (
        <div className="mx-[8px] mb-[8px] px-[12px] py-[8px] rounded-[6px] bg-[var(--color-error)]/10 border border-[var(--color-error)]/20">
          <div className="flex items-center gap-[8px]">
            <Lock className="w-[14px] h-[14px] text-[var(--color-error)]" />
            <span className="text-[12px] text-[var(--color-error)]">
              {t('nav.suspendedMode') || 'Account suspended'}
            </span>
          </div>
        </div>
      )}

      {/* Navigation Groups */}
      <nav className="flex-1 px-[8px] pb-[16px]">
        {navGroups.map((group, groupIndex) => {
          const isCollapsed = group.collapsible && collapsedGroups.has(group.key);
          const shouldShow = !group.collapsible || !isCollapsed;

          return (
            <div key={group.key} className={cn(groupIndex > 0 && 'mt-[16px]')}>
              {/* Group Label */}
              {group.collapsible ? (
                <button
                  onClick={() => toggleGroup(group.key)}
                  className="w-full flex items-center justify-between px-[12px] py-[6px] text-[10px] font-semibold uppercase tracking-wide text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors duration-[100ms]"
                >
                  <span>{t(group.labelKey)}</span>
                  {isCollapsed ? (
                    <ChevronRight className="w-[12px] h-[12px]" />
                  ) : (
                    <ChevronDown className="w-[12px] h-[12px]" />
                  )}
                </button>
              ) : (
                <div className="px-[12px] py-[6px] text-[10px] font-semibold uppercase tracking-wide text-[var(--text-tertiary)]">
                  {t(group.labelKey)}
                </div>
              )}

              {/* Group Items */}
              {shouldShow && (
                <ul className="space-y-[2px] mt-[4px]">
                  {group.items.map((item) => {
                    const indicator = getNavItemIndicator(item.path);
                    const tooltipText = getNavItemTooltip(item);
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
                                    "flex items-center gap-[8px] px-[12px] py-[8px] rounded-[6px] text-[13px] font-medium transition-colors duration-[100ms] relative",
                                    "h-[32px]",
                                    "text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)]"
                                  )}
                                >
                                  <item.icon className="w-[16px] h-[16px] text-[var(--text-tertiary)]" />
                                  <span className="flex-1 truncate">{t(item.labelKey)}</span>
                                  <div className="flex items-center gap-[6px] flex-shrink-0">
                                    {item.readOnly && (
                                      <Eye className="w-[12px] h-[12px] text-[var(--text-muted)]" />
                                    )}
                                  </div>
                                </a>
                              ) : (
                                <NavLink
                                  to={item.path}
                                  className={cn(
                                    "flex items-center gap-[8px] px-[12px] py-[8px] rounded-[6px] text-[13px] font-medium transition-colors duration-[100ms] relative",
                                    "h-[32px]",
                                    isActive(item.path)
                                      ? "bg-[var(--bg-surface-active)] text-[var(--text-primary)]"
                                      : "text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)]"
                                  )}
                                >
                                  <item.icon className={cn(
                                    "w-[16px] h-[16px]",
                                    isActive(item.path)
                                      ? "text-[var(--accent-primary)]"
                                      : "text-[var(--text-tertiary)]"
                                  )} />
                                  <span className="flex-1 truncate">{t(item.labelKey)}</span>
                                  <div className="flex items-center gap-[6px] flex-shrink-0">
                                    {indicator !== null && indicator > 0 && (
                                      <Badge
                                        variant="destructive"
                                        className="h-[20px] min-w-[20px] px-[6px] text-[10px] font-semibold flex items-center justify-center"
                                      >
                                        {indicator > 99 ? '99+' : indicator}
                                      </Badge>
                                    )}
                                    {item.readOnly && (
                                      <Eye className="w-[12px] h-[12px] text-[var(--text-muted)]" />
                                    )}
                                  </div>
                                </NavLink>
                              )}
                            </TooltipTrigger>
                            <TooltipContent side="right" className="max-w-[200px]">
                              <p className="font-medium text-[13px]">{t(item.labelKey)}</p>
                              <p className="text-[12px] text-[var(--text-secondary)] mt-[4px]">
                                {tooltipText}
                              </p>
                              {indicator !== null && indicator > 0 && (
                                <p className="text-[12px] text-[var(--color-error)] mt-[4px] font-medium">
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
      <div className="p-[16px] border-t border-[var(--border-subtle)] mt-auto">
        <p className="text-[12px] text-[var(--text-muted)]">Turan Standard Pool v1.0</p>
      </div>
    </aside>
  );
}
