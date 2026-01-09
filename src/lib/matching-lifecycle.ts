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

import { type MatchingWindow, getEffectiveWindowStatus } from './matching-window';

// Matching lifecycle statuses
export type MatchingLifecycleStatus = 'active' | 'finalized' | 'cancelled';

// All statuses as array
export const MATCHING_STATUSES: MatchingLifecycleStatus[] = ['active', 'finalized', 'cancelled'];

// Role types that can perform transitions
export type MatchingRole = 'farmer' | 'mpk' | 'admin';

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

// Unified transition rules: combines allowed transitions with role permissions
// Only admins can modify matching status
interface TransitionRule {
  to: MatchingLifecycleStatus;
  roles: MatchingRole[];
}

const TRANSITION_RULES: Record<MatchingLifecycleStatus, TransitionRule[]> = {
  active: [
    { to: 'finalized', roles: ['admin'] },
    { to: 'cancelled', roles: ['admin'] },
  ],
  finalized: [], // Terminal state - no transitions allowed
  cancelled: [], // Terminal state - no transitions allowed
};

/**
 * Check if a transition is allowed by the FSM (regardless of role)
 */
export function isTransitionAllowed(
  fromStatus: MatchingLifecycleStatus,
  toStatus: MatchingLifecycleStatus
): boolean {
  const rules = TRANSITION_RULES[fromStatus] || [];
  return rules.some(rule => rule.to === toStatus);
}

/**
 * Check if a role can perform a specific transition
 */
export function canRoleTransition(
  fromStatus: MatchingLifecycleStatus,
  toStatus: MatchingLifecycleStatus,
  role: MatchingRole
): boolean {
  // Only admins can modify matching status
  if (role !== 'admin') return false;

  const rules = TRANSITION_RULES[fromStatus] || [];
  const matchingRule = rules.find(rule => rule.to === toStatus);
  return matchingRule?.roles.includes(role) ?? false;
}

/**
 * Validate if a matching status transition is allowed for a given role
 */
export function validateMatchingTransition(
  fromStatus: MatchingLifecycleStatus,
  toStatus: MatchingLifecycleStatus,
  role: MatchingRole = 'admin'
): { valid: boolean; error?: string } {
  if (fromStatus === toStatus) {
    return { valid: false, error: 'Status is already ' + toStatus };
  }

  if (!canRoleTransition(fromStatus, toStatus, role)) {
    if (role !== 'admin') {
      return { valid: false, error: 'Only admins can modify matching status' };
    }
    const allowedStatuses = TRANSITION_RULES[fromStatus].map(r => r.to);
    return {
      valid: false,
      error: `Cannot transition from ${fromStatus} to ${toStatus}. Allowed: ${allowedStatuses.join(', ') || 'none'}`,
    };
  }

  return { valid: true };
}

/**
 * Check if matching can be created based on matching window state
 * Uses computed effective status instead of database status
 */
export function canCreateMatching(matchingWindow: MatchingWindow | null): {
  allowed: boolean;
  reason?: string;
} {
  if (!matchingWindow) {
    return { allowed: false, reason: 'No active matching window' };
  }

  // Use computed effective status (based on dates) instead of stored status
  const effectiveStatus = getEffectiveWindowStatus(matchingWindow);

  // Can create matchings when window is locked or closed (computed from dates)
  // This allows matching creation after lock_date, regardless of manual status updates
  if (effectiveStatus === 'locked' || effectiveStatus === 'closed') {
    return { allowed: true };
  }

  // Window is upcoming or active and before lock_date
  const now = new Date();
  const lockDate = new Date(matchingWindow.lock_date);
  lockDate.setHours(23, 59, 59, 999); // End of lock date

  if (now >= lockDate && effectiveStatus === 'active') {
    // Edge case: we're past lock_date but status computation might not have caught up
    // Allow matching creation if we're past lock_date
    return { allowed: true };
  }

  // Window is upcoming or active and before lock_date
  return {
    allowed: false,
    reason: `Matching window is not yet locked. Lock date: ${matchingWindow.lock_date}. Current effective status: ${effectiveStatus}`,
  };
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
