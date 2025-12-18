/**
 * ACCOUNT STATUS MODEL
 * 
 * Account status is SEPARATE from role.
 * Role defines WHO the user is (farmer, mpk, admin).
 * Account status defines WHAT the user is allowed to do.
 * 
 * Observer is NOT a role - it's a restricted account state.
 */

import type { AppRole } from '@/hooks/useAuth';

export type AccountStatus = 'observer' | 'active' | 'suspended';

export interface AccountStatusConfig {
  label: string;
  labelRu: string;
  description: string;
  descriptionRu: string;
  canPerformActions: boolean;
  badgeVariant: 'default' | 'secondary' | 'destructive' | 'outline';
}

export const ACCOUNT_STATUS_CONFIG: Record<AccountStatus, AccountStatusConfig> = {
  observer: {
    label: 'Observer',
    labelRu: 'Наблюдатель',
    description: 'Read-only access. Awaiting activation by Admin.',
    descriptionRu: 'Доступ только для просмотра. Ожидайте активации Администратором.',
    canPerformActions: false,
    badgeVariant: 'secondary',
  },
  active: {
    label: 'Active',
    labelRu: 'Активный',
    description: 'Full platform access enabled.',
    descriptionRu: 'Полный доступ к платформе.',
    canPerformActions: true,
    badgeVariant: 'default',
  },
  suspended: {
    label: 'Suspended',
    labelRu: 'Приостановлен',
    description: 'Account temporarily suspended. Contact Admin.',
    descriptionRu: 'Аккаунт временно приостановлен. Свяжитесь с Администратором.',
    canPerformActions: false,
    badgeVariant: 'destructive',
  },
};

/**
 * Derive account status from farmer grading
 * Observer grading = observer account status
 * declared_supplier or standard_supplier = active
 */
export function deriveFarmerAccountStatus(
  grading: string | null | undefined,
  isRestricted: boolean = false
): AccountStatus {
  if (isRestricted) return 'suspended';
  if (!grading || grading === 'observer') return 'observer';
  return 'active';
}

/**
 * Derive account status from MPK status
 */
export function deriveMpkAccountStatus(
  mpkStatus: string | null | undefined,
  registrationStatus: string | null | undefined
): AccountStatus {
  if (mpkStatus === 'restricted' || mpkStatus === 'inactive') return 'suspended';
  if (registrationStatus !== 'active') return 'observer';
  return 'active';
}

/**
 * Admin always has active status
 */
export function deriveAdminAccountStatus(): AccountStatus {
  return 'active';
}

/**
 * Get account status label
 */
export function getAccountStatusLabel(
  status: AccountStatus,
  lang: 'en' | 'ru' = 'en'
): string {
  return lang === 'ru' 
    ? ACCOUNT_STATUS_CONFIG[status].labelRu 
    : ACCOUNT_STATUS_CONFIG[status].label;
}

/**
 * Check if account can perform domain actions
 */
export function canPerformActions(status: AccountStatus): boolean {
  return ACCOUNT_STATUS_CONFIG[status].canPerformActions;
}

/**
 * Navigation items available by role and account status
 */
export interface NavPermission {
  path: string;
  requiredStatus: AccountStatus[];
  readOnly?: boolean;
}

export const FARMER_NAV_PERMISSIONS: NavPermission[] = [
  { path: '/', requiredStatus: ['observer', 'active'], readOnly: false },
  { path: '/farmer/batches', requiredStatus: ['active'] },
  { path: '/farmer/calendar', requiredStatus: ['active'] },
  { path: '/price-grid', requiredStatus: ['observer', 'active'], readOnly: true },
  { path: '/farmer/profile', requiredStatus: ['active'] },
];

export const MPK_NAV_PERMISSIONS: NavPermission[] = [
  { path: '/mpk/market', requiredStatus: ['observer', 'active'], readOnly: false },
  { path: '/mpk/requests', requiredStatus: ['active'] },
  { path: '/mpk/watchlist', requiredStatus: ['active'] },
  { path: '/price-grid', requiredStatus: ['observer', 'active'], readOnly: true },
  { path: '/mpk/profile', requiredStatus: ['active'] },
];

export const ADMIN_NAV_PERMISSIONS: NavPermission[] = [
  { path: '/', requiredStatus: ['active'] },
  { path: '/admin/windows', requiredStatus: ['active'] },
  { path: '/admin/matching', requiredStatus: ['active'] },
  { path: '/admin/executions', requiredStatus: ['active'] },
  { path: '/admin/farmers', requiredStatus: ['active'] },
  { path: '/admin/mpks', requiredStatus: ['active'] },
  { path: '/admin/price-grid', requiredStatus: ['active'] },
  { path: '/admin/premiums', requiredStatus: ['active'] },
  { path: '/admin/activity', requiredStatus: ['active'] },
];

/**
 * Check if a route is accessible for given role and account status
 */
export function isRouteAccessible(
  role: AppRole,
  accountStatus: AccountStatus,
  path: string
): { accessible: boolean; readOnly?: boolean; reason?: string } {
  let permissions: NavPermission[];
  
  switch (role) {
    case 'farmer':
      permissions = FARMER_NAV_PERMISSIONS;
      break;
    case 'mpk':
      permissions = MPK_NAV_PERMISSIONS;
      break;
    case 'admin':
      permissions = ADMIN_NAV_PERMISSIONS;
      break;
    default:
      return { accessible: false, reason: 'Invalid role' };
  }
  
  // Find matching permission
  const permission = permissions.find(p => {
    if (p.path === '/') {
      return path === '/';
    }
    return path === p.path || path.startsWith(p.path + '/');
  });
  
  if (!permission) {
    return { accessible: false, reason: 'Route not found for this role' };
  }
  
  if (!permission.requiredStatus.includes(accountStatus)) {
    return { 
      accessible: false, 
      reason: accountStatus === 'observer' 
        ? 'This feature requires an active account. Please wait for Admin activation.'
        : 'Your account has been suspended. Please contact Admin.',
    };
  }
  
  return { accessible: true, readOnly: permission.readOnly };
}

/**
 * Get navigation items filtered by account status
 */
export function getAccessibleNavItems(
  role: AppRole,
  accountStatus: AccountStatus
): NavPermission[] {
  let permissions: NavPermission[];
  
  switch (role) {
    case 'farmer':
      permissions = FARMER_NAV_PERMISSIONS;
      break;
    case 'mpk':
      permissions = MPK_NAV_PERMISSIONS;
      break;
    case 'admin':
      permissions = ADMIN_NAV_PERMISSIONS;
      break;
    default:
      return [];
  }
  
  return permissions.filter(p => p.requiredStatus.includes(accountStatus));
}
