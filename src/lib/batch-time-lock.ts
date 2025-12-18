/**
 * BATCH TIME-BASED LOCKING
 * 
 * Enforces time constraints on batch editing and status transitions
 * based on the active Matching Window's lock_date.
 */

import { type MatchingWindow } from './matching-window';
import { type BatchLifecycleStatus } from './batch-lifecycle';

export interface BatchLockStatus {
  isLocked: boolean;
  lockReason: string;
  lockReasonRu: string;
  canAdminOverride: boolean;
  lockDate?: string;
}

/**
 * Statuses that are subject to time-based locking
 * (before they become confirmed/matched/closed)
 */
const LOCKABLE_STATUSES: BatchLifecycleStatus[] = ['draft', 'forecast', 'soft_committed'];

/**
 * Check if the current date is past the matching window's lock_date
 */
export function isPastLockDate(matchingWindow: MatchingWindow | null | undefined): boolean {
  if (!matchingWindow) return false;
  
  const now = new Date();
  const lockDate = new Date(matchingWindow.lock_date);
  
  // Set to end of lock date (23:59:59) to be inclusive
  lockDate.setHours(23, 59, 59, 999);
  
  return now > lockDate;
}

/**
 * Check if the matching window status is locked or closed
 */
export function isWindowLocked(matchingWindow: MatchingWindow | null | undefined): boolean {
  if (!matchingWindow) return false;
  return matchingWindow.status === 'locked' || matchingWindow.status === 'closed';
}

/**
 * Determine if a batch is locked based on matching window constraints
 */
export function getBatchLockStatus(
  batchStatus: BatchLifecycleStatus,
  matchingWindow: MatchingWindow | null | undefined,
  role: 'farmer' | 'admin' | 'mpk' = 'farmer'
): BatchLockStatus {
  // If batch is already in a terminal state, use status-based rules (not time-based)
  if (!LOCKABLE_STATUSES.includes(batchStatus)) {
    return {
      isLocked: false,
      lockReason: '',
      lockReasonRu: '',
      canAdminOverride: false,
    };
  }

  // No matching window = no time-based lock
  if (!matchingWindow) {
    return {
      isLocked: false,
      lockReason: '',
      lockReasonRu: '',
      canAdminOverride: false,
    };
  }

  // Check if we're past the lock date
  const pastLockDate = isPastLockDate(matchingWindow);
  
  // Check if window status is locked/closed
  const windowLocked = isWindowLocked(matchingWindow);

  if (pastLockDate || windowLocked) {
    // Admin can still override
    if (role === 'admin') {
      return {
        isLocked: false,
        lockReason: 'Admin override active - window is locked for other users.',
        lockReasonRu: 'Админ-режим - окно заблокировано для других пользователей.',
        canAdminOverride: true,
        lockDate: matchingWindow.lock_date,
      };
    }

    return {
      isLocked: true,
      lockReason: 'Edits are locked due to the Matching Window deadline.',
      lockReasonRu: 'Редактирование заблокировано из-за дедлайна Окна сопоставления.',
      canAdminOverride: true,
      lockDate: matchingWindow.lock_date,
    };
  }

  return {
    isLocked: false,
    lockReason: '',
    lockReasonRu: '',
    canAdminOverride: false,
    lockDate: matchingWindow.lock_date,
  };
}

/**
 * Check if batch editing is allowed (combines status-based and time-based rules)
 */
export function canEditBatch(
  batchStatus: BatchLifecycleStatus,
  matchingWindow: MatchingWindow | null | undefined,
  role: 'farmer' | 'admin' | 'mpk' = 'farmer'
): boolean {
  const lockStatus = getBatchLockStatus(batchStatus, matchingWindow, role);
  return !lockStatus.isLocked;
}

/**
 * Check if status transitions are allowed (combines role-based and time-based rules)
 */
export function canTransitionBatch(
  batchStatus: BatchLifecycleStatus,
  matchingWindow: MatchingWindow | null | undefined,
  role: 'farmer' | 'admin' | 'mpk' = 'farmer'
): boolean {
  // MPK can never transition batches
  if (role === 'mpk') return false;
  
  const lockStatus = getBatchLockStatus(batchStatus, matchingWindow, role);
  return !lockStatus.isLocked;
}

/**
 * Get the lock banner message for batch detail page
 */
export function getBatchLockBannerInfo(
  batchStatus: BatchLifecycleStatus,
  matchingWindow: MatchingWindow | null | undefined,
  lang: 'en' | 'ru' = 'en'
): {
  show: boolean;
  title: string;
  description: string;
  variant: 'warning' | 'info';
} | null {
  if (!matchingWindow) return null;
  
  const pastLockDate = isPastLockDate(matchingWindow);
  const windowLocked = isWindowLocked(matchingWindow);
  
  if (!LOCKABLE_STATUSES.includes(batchStatus)) return null;
  
  if (pastLockDate || windowLocked) {
    return {
      show: true,
      title: lang === 'ru' 
        ? 'Партия заблокирована Окном сопоставления' 
        : 'Batch locked by Matching Window',
      description: lang === 'ru'
        ? 'Редактирование и изменение статуса недоступны до начала нового окна.'
        : 'Editing and status changes are disabled until the next window opens.',
      variant: 'warning',
    };
  }

  return null;
}

/**
 * Get tooltip for locked action button
 */
export function getTimeLockedTooltip(lang: 'en' | 'ru' = 'en'): string {
  return lang === 'ru'
    ? 'Редактирование заблокировано из-за дедлайна Окна сопоставления.'
    : 'Edits are locked due to the Matching Window deadline.';
}

/**
 * Format lock date for display
 */
export function formatLockDate(lockDate: string, lang: 'en' | 'ru' = 'en'): string {
  const date = new Date(lockDate);
  return date.toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
