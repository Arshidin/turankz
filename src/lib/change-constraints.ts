/**
 * CHANGE CONSTRAINTS CONFIGURATION
 * 
 * Admin-configurable rules for data integrity and change management.
 * These settings control friction points and lockout periods.
 */

export interface ChangeConstraintsConfig {
  // Days before matching window when batch changes are locked
  batchLockoutDays: number;
  
  // Days before target week when request changes are locked
  requestLockoutDays: number;
  
  // Number of changes within period that triggers "frequent changes" warning
  frequentChangeThreshold: number;
  
  // Period in days to count changes for frequent change detection
  frequentChangePeriodDays: number;
}

// Default configuration - can be overridden by admin settings
export const DEFAULT_CONSTRAINTS: ChangeConstraintsConfig = {
  batchLockoutDays: 3,
  requestLockoutDays: 5,
  frequentChangeThreshold: 3,
  frequentChangePeriodDays: 7,
};

/**
 * Change types that require confirmation
 */
export type SensitiveChangeType = 
  | 'quantity_reduction'
  | 'month_delay'
  | 'readiness_downgrade'
  | 'volume_change'
  | 'region_change'
  | 'target_week_change';

export const SENSITIVE_CHANGE_LABELS: Record<SensitiveChangeType, string> = {
  quantity_reduction: 'Reduce Quantity',
  month_delay: 'Delay to Later Month',
  readiness_downgrade: 'Downgrade Readiness',
  volume_change: 'Change Target Volume',
  region_change: 'Change Regions',
  target_week_change: 'Change Target Week',
};

export const SENSITIVE_CHANGE_WARNINGS: Record<SensitiveChangeType, string> = {
  quantity_reduction: 'Reducing quantity may affect active pool matching.',
  month_delay: 'Moving to a later month may reduce matching priority.',
  readiness_downgrade: 'Downgrading from Confirmed status will be logged for review.',
  volume_change: 'Changing volume after matching has begun may delay fulfillment.',
  region_change: 'Changing regions may reset matching progress.',
  target_week_change: 'Changing target week may affect matching availability.',
};

/**
 * Helper messages for edit forms
 */
export const EDIT_HELPER_MESSAGES = {
  farmer: {
    frequentChanges: 'Frequent changes reduce matching priority.',
    lockoutApproaching: (days: number) => 
      `Changes will be locked ${days} days before the matching window.`,
    locked: 'This batch is locked for the current matching window.',
  },
  mpk: {
    frequentChanges: 'Frequent changes may delay fulfillment.',
    lockoutApproaching: (days: number) => 
      `Parameter changes will be locked ${days} days before target week.`,
    locked: 'This request is locked. Contact Admin to make changes.',
    matchingStarted: 'Matching has begun. Changes require Admin approval.',
  },
};

/**
 * Readiness transition rules
 */
export const READINESS_TRANSITIONS = {
  // Always allowed transitions (no confirmation needed)
  allowed: [
    { from: 'forecast', to: 'soft_committed' },
    { from: 'soft_committed', to: 'confirmed' },
    { from: 'forecast', to: 'confirmed' },
  ],
  
  // Transitions requiring confirmation
  requiresConfirmation: [
    { from: 'confirmed', to: 'soft_committed' },
    { from: 'confirmed', to: 'forecast' },
    { from: 'soft_committed', to: 'forecast' },
  ],
};

/**
 * Check if a readiness transition requires confirmation
 */
export function requiresReadinessConfirmation(
  fromStatus: string,
  toStatus: string
): boolean {
  return READINESS_TRANSITIONS.requiresConfirmation.some(
    (t) => t.from === fromStatus && t.to === toStatus
  );
}

/**
 * Check if a value change is significant enough to require confirmation
 */
export function isSignificantChange(
  changeType: SensitiveChangeType,
  oldValue: unknown,
  newValue: unknown
): boolean {
  switch (changeType) {
    case 'quantity_reduction':
      return Number(newValue) < Number(oldValue);
    case 'volume_change':
      // More than 10% change is significant
      const percentChange = Math.abs(Number(newValue) - Number(oldValue)) / Number(oldValue);
      return percentChange > 0.1;
    default:
      return oldValue !== newValue;
  }
}

/**
 * Calculate days until a target date
 */
export function daysUntil(targetDate: Date): number {
  const now = new Date();
  const diffTime = targetDate.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Check if changes are locked based on time constraints
 */
export function isChangeLocked(
  targetDate: Date,
  lockoutDays: number
): { locked: boolean; daysRemaining: number } {
  const days = daysUntil(targetDate);
  return {
    locked: days <= lockoutDays,
    daysRemaining: days,
  };
}
