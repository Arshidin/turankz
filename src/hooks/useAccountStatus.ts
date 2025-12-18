/**
 * ACCOUNT STATUS HOOK
 * 
 * Derives account status from user's profile data.
 * Uses farmer grading or MPK status to determine access level.
 */

import { useAuthContext } from '@/contexts/AuthContext';
import { useCurrentFarmer } from '@/hooks/useCurrentFarmer';
import { useMpks } from '@/hooks/useMpks';
import { 
  AccountStatus, 
  deriveFarmerAccountStatus, 
  deriveMpkAccountStatus, 
  deriveAdminAccountStatus,
  isRouteAccessible,
  getAccessibleNavItems,
  canPerformActions,
  getAccountStatusLabel,
} from '@/lib/account-status';

interface UseAccountStatusReturn {
  accountStatus: AccountStatus;
  isLoading: boolean;
  canPerformActions: boolean;
  isObserver: boolean;
  isActive: boolean;
  isSuspended: boolean;
  getStatusLabel: (lang?: 'en' | 'ru') => string;
  checkRouteAccess: (path: string) => { accessible: boolean; readOnly?: boolean; reason?: string };
  getAccessibleNavItems: () => { path: string; requiredStatus: AccountStatus[]; readOnly?: boolean }[];
}

export function useAccountStatus(): UseAccountStatusReturn {
  const { role, user } = useAuthContext();
  const { data: currentFarmer, isLoading: farmerLoading } = useCurrentFarmer();
  const { data: mpks, isLoading: mpksLoading } = useMpks();
  
  // Derive account status based on role
  let accountStatus: AccountStatus = 'observer';
  let isLoading = false;
  
  if (role === 'admin') {
    accountStatus = deriveAdminAccountStatus();
    isLoading = false;
  } else if (role === 'farmer') {
    isLoading = farmerLoading;
    if (currentFarmer) {
      accountStatus = deriveFarmerAccountStatus(
        currentFarmer.grading,
        currentFarmer.is_restricted
      );
    }
  } else if (role === 'mpk') {
    isLoading = mpksLoading;
    // Find current MPK by user_id
    const currentMpk = mpks?.find(m => m.user_id === user?.id);
    if (currentMpk) {
      accountStatus = deriveMpkAccountStatus(
        currentMpk.status,
        currentMpk.registration_status
      );
    }
  }
  
  return {
    accountStatus,
    isLoading,
    canPerformActions: canPerformActions(accountStatus),
    isObserver: accountStatus === 'observer',
    isActive: accountStatus === 'active',
    isSuspended: accountStatus === 'suspended',
    getStatusLabel: (lang?: 'en' | 'ru') => getAccountStatusLabel(accountStatus, lang),
    checkRouteAccess: (path: string) => {
      if (!role) return { accessible: false, reason: 'No role assigned' };
      return isRouteAccessible(role, accountStatus, path);
    },
    getAccessibleNavItems: () => {
      if (!role) return [];
      return getAccessibleNavItems(role, accountStatus);
    },
  };
}
