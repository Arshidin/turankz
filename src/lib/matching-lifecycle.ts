/**
 * MATCHING LIFECYCLE FSM
 * 
 * Formal binding layer between confirmed batches and pool requests.
 * Matchings can only be created after matching window lock_date.
 * 
 * Status Flow:
 * Active → Finalized (permanent binding)
 * Active → Cancelled (with reason)
 */

import { type MatchingWindow } from './matching-window';

// Matching lifecycle statuses
export type MatchingLifecycleStatus = 'active' | 'finalized' | 'cancelled';

// All statuses as array
export const MATCHING_STATUSES: MatchingLifecycleStatus[] = ['active', 'finalized', 'cancelled'];

// Status display labels
export const MATCHING_STATUS_LABELS: Record<MatchingLifecycleStatus, string> = {
  active: 'Active',
  finalized: 'Finalized',
  cancelled: 'Cancelled',
};

// Status descriptions
export const MATCHING_STATUS_DESCRIPTIONS: Record<MatchingLifecycleStatus, string> = {
  active: 'Matching is active and binding',
  finalized: 'Matching has been completed and finalized',
  cancelled: 'Matching was cancelled',
};

// Allowed transitions
const ALLOWED_TRANSITIONS: Record<MatchingLifecycleStatus, MatchingLifecycleStatus[]> = {
  active: ['finalized', 'cancelled'],
  finalized: [], // Terminal state
  cancelled: [], // Terminal state
};

/**
 * Validate if a matching status transition is allowed
 */
export function validateMatchingTransition(
  fromStatus: MatchingLifecycleStatus,
  toStatus: MatchingLifecycleStatus
): { valid: boolean; error?: string } {
  if (fromStatus === toStatus) {
    return { valid: false, error: 'Status is already ' + toStatus };
  }

  const allowed = ALLOWED_TRANSITIONS[fromStatus];
  if (!allowed.includes(toStatus)) {
    return {
      valid: false,
      error: `Cannot transition from ${fromStatus} to ${toStatus}. Allowed: ${allowed.join(', ') || 'none'}`,
    };
  }

  return { valid: true };
}

/**
 * Check if matching can be created based on matching window state
 */
export function canCreateMatching(matchingWindow: MatchingWindow | null): {
  allowed: boolean;
  reason?: string;
} {
  if (!matchingWindow) {
    return { allowed: false, reason: 'No active matching window' };
  }

  const now = new Date();
  const lockDate = new Date(matchingWindow.lock_date);

  // Can only create matchings after lock_date
  if (now < lockDate) {
    return {
      allowed: false,
      reason: `Matching window is not yet locked. Lock date: ${matchingWindow.lock_date}`,
    };
  }

  // Window must be in locked or closed status (not upcoming or active)
  if (matchingWindow.status !== 'locked' && matchingWindow.status !== 'closed') {
    return {
      allowed: false,
      reason: `Matching window must be locked. Current status: ${matchingWindow.status}`,
    };
  }

  return { allowed: true };
}

/**
 * Get matching creation status message
 */
export function getMatchingCreationMessage(matchingWindow: MatchingWindow | null): {
  canCreate: boolean;
  message: string;
  variant: 'success' | 'warning' | 'error';
} {
  const check = canCreateMatching(matchingWindow);

  if (check.allowed) {
    return {
      canCreate: true,
      message: 'Matching window is locked. You can create matchings.',
      variant: 'success',
    };
  }

  return {
    canCreate: false,
    message: check.reason || 'Cannot create matchings at this time',
    variant: 'warning',
  };
}

/**
 * Calculate matching statistics
 */
export interface MatchingStats {
  totalMatches: number;
  activeMatches: number;
  finalizedMatches: number;
  cancelledMatches: number;
  totalMatchedHeads: number;
  activeMatchedHeads: number;
}

export function calculateMatchingStats(matches: Array<{
  status: MatchingLifecycleStatus;
  heads_matched: number;
}>): MatchingStats {
  return {
    totalMatches: matches.length,
    activeMatches: matches.filter(m => m.status === 'active').length,
    finalizedMatches: matches.filter(m => m.status === 'finalized').length,
    cancelledMatches: matches.filter(m => m.status === 'cancelled').length,
    totalMatchedHeads: matches.reduce((sum, m) => sum + m.heads_matched, 0),
    activeMatchedHeads: matches
      .filter(m => m.status === 'active' || m.status === 'finalized')
      .reduce((sum, m) => sum + m.heads_matched, 0),
  };
}

// Action types for matching audit
export type MatchingActionType = 
  | 'created'
  | 'status_change'
  | 'finalized'
  | 'cancelled'
  | 'volume_adjusted';
