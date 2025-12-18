/**
 * Hook for checking batch time-based lock status
 * Supports admin unlock overrides
 */

import { useCurrentMatchingWindow } from './useMatchingWindows';
import { useRole } from '@/contexts/RoleContext';
import { 
  getBatchLockStatus, 
  canEditBatch, 
  canTransitionBatch,
  getBatchLockBannerInfo,
  type BatchLockStatus,
  type AdminUnlockInfo,
} from '@/lib/batch-time-lock';
import { type BatchLifecycleStatus } from '@/lib/batch-lifecycle';

interface UseBatchTimeLockOptions {
  adminUnlockInfo?: AdminUnlockInfo;
}

/**
 * Get the current batch lock status based on matching window
 * Now supports admin unlock overrides
 */
export function useBatchTimeLock(
  batchStatus: BatchLifecycleStatus,
  options?: UseBatchTimeLockOptions
) {
  const { data: matchingWindow, isLoading } = useCurrentMatchingWindow();
  const { role } = useRole();
  
  const lockStatus = getBatchLockStatus(
    batchStatus, 
    matchingWindow, 
    role as 'farmer' | 'admin' | 'mpk',
    options?.adminUnlockInfo
  );
  
  // canEdit now respects admin unlock
  const canEdit = !lockStatus.isLocked;
  
  const canTransition = canTransitionBatch(
    batchStatus, 
    matchingWindow, 
    role as 'farmer' | 'admin' | 'mpk'
  );
  
  // Don't show lock banner if batch is admin-unlocked
  const bannerInfo = lockStatus.isAdminUnlocked 
    ? null 
    : getBatchLockBannerInfo(batchStatus, matchingWindow);

  return {
    lockStatus,
    canEdit,
    canTransition,
    bannerInfo,
    matchingWindow,
    isLoading,
    isAdminUnlocked: lockStatus.isAdminUnlocked,
  };
}

/**
 * Check if any batch in a list should show lock indicators
 */
export function useGlobalBatchLockStatus() {
  const { data: matchingWindow, isLoading } = useCurrentMatchingWindow();
  const { role } = useRole();
  
  const checkBatchLock = (
    batchStatus: BatchLifecycleStatus,
    adminUnlockInfo?: AdminUnlockInfo
  ): BatchLockStatus => {
    return getBatchLockStatus(
      batchStatus, 
      matchingWindow, 
      role as 'farmer' | 'admin' | 'mpk',
      adminUnlockInfo
    );
  };

  return {
    checkBatchLock,
    matchingWindow,
    isLoading,
  };
}
