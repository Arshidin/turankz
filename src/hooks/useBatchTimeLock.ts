/**
 * Hook for checking batch time-based lock status
 */

import { useCurrentMatchingWindow } from './useMatchingWindows';
import { useRole } from '@/contexts/RoleContext';
import { 
  getBatchLockStatus, 
  canEditBatch, 
  canTransitionBatch,
  getBatchLockBannerInfo,
  type BatchLockStatus,
} from '@/lib/batch-time-lock';
import { type BatchLifecycleStatus } from '@/lib/batch-lifecycle';

/**
 * Get the current batch lock status based on matching window
 */
export function useBatchTimeLock(batchStatus: BatchLifecycleStatus) {
  const { data: matchingWindow, isLoading } = useCurrentMatchingWindow();
  const { role } = useRole();
  
  const lockStatus = getBatchLockStatus(
    batchStatus, 
    matchingWindow, 
    role as 'farmer' | 'admin' | 'mpk'
  );
  
  const canEdit = canEditBatch(
    batchStatus,
    matchingWindow, 
    role as 'farmer' | 'admin' | 'mpk'
  );
  
  const canTransition = canTransitionBatch(
    batchStatus, 
    matchingWindow, 
    role as 'farmer' | 'admin' | 'mpk'
  );
  
  const bannerInfo = getBatchLockBannerInfo(batchStatus, matchingWindow);

  return {
    lockStatus,
    canEdit,
    canTransition,
    bannerInfo,
    matchingWindow,
    isLoading,
  };
}

/**
 * Check if any batch in a list should show lock indicators
 */
export function useGlobalBatchLockStatus() {
  const { data: matchingWindow, isLoading } = useCurrentMatchingWindow();
  const { role } = useRole();
  
  const checkBatchLock = (batchStatus: BatchLifecycleStatus): BatchLockStatus => {
    return getBatchLockStatus(
      batchStatus, 
      matchingWindow, 
      role as 'farmer' | 'admin' | 'mpk'
    );
  };

  return {
    checkBatchLock,
    matchingWindow,
    isLoading,
  };
}
