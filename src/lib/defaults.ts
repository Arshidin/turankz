/**
 * System Defaults
 * Turan Standard Pool Platform v1.1
 * 
 * Default values for filters, time horizons, and display settings
 */

// ============================================================================
// TIME HORIZON DEFAULTS
// ============================================================================

/**
 * Default time horizon: next 3 months
 */
export const DEFAULT_TIME_HORIZON_MONTHS = 3;

/**
 * Get the next N months as week labels (W1, W2, etc.)
 */
export function getDefaultTargetWeeks(monthsAhead: number = DEFAULT_TIME_HORIZON_MONTHS): string[] {
  const weeks: string[] = [];
  const now = new Date();
  
  for (let m = 0; m < monthsAhead; m++) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() + m, 1);
    const year = monthDate.getFullYear();
    const weekNum = getISOWeek(monthDate);
    weeks.push(`W${weekNum}`);
  }
  
  return weeks;
}

/**
 * Get the current ISO week number
 */
export function getISOWeek(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

/**
 * Get current target week label
 */
export function getCurrentTargetWeek(): string {
  const weekNum = getISOWeek(new Date());
  return `W${weekNum}`;
}

/**
 * Get next matching window (typically end of current week)
 */
export function getNextMatchingWindow(): { start: string; end: string; label: string } {
  const now = new Date();
  const weekNum = getISOWeek(now);
  const year = now.getFullYear();
  
  // Matching windows are typically Wednesday-Thursday
  const dayOfWeek = now.getDay();
  const daysUntilWednesday = (3 - dayOfWeek + 7) % 7;
  
  const windowStart = new Date(now);
  windowStart.setDate(now.getDate() + daysUntilWednesday);
  
  const windowEnd = new Date(windowStart);
  windowEnd.setDate(windowStart.getDate() + 1);
  
  return {
    start: formatShortDate(windowStart),
    end: formatShortDate(windowEnd),
    label: `W${weekNum}`,
  };
}

function formatShortDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ============================================================================
// FILTER DEFAULTS
// ============================================================================

/**
 * Default region filter
 */
export const DEFAULT_REGION_FILTER = 'All';

/**
 * Default readiness statuses to display
 */
export const DEFAULT_READINESS_STATUSES = ['forecast', 'soft_committed', 'confirmed'] as const;

/**
 * Default grade filter
 */
export const DEFAULT_GRADE_FILTER = 'All';

/**
 * All available regions
 */
export const ALL_REGIONS = [
  'Northern',
  'Southern', 
  'Eastern',
  'Western',
  'Central',
] as const;

/**
 * All available grades
 */
export const ALL_GRADES = ['A', 'B', 'C'] as const;

// ============================================================================
// DISPLAY DEFAULTS
// ============================================================================

/**
 * Default supply aggregation includes all readiness statuses
 */
export interface SupplyByReadiness {
  confirmed: number;
  soft_committed: number;
  forecast: number;
  total: number;
}

/**
 * Create empty supply by readiness object
 */
export function createEmptySupplyByReadiness(): SupplyByReadiness {
  return {
    confirmed: 0,
    soft_committed: 0,
    forecast: 0,
    total: 0,
  };
}

/**
 * Readiness status labels and colors
 */
export const READINESS_CONFIG = {
  confirmed: {
    label: 'Confirmed',
    shortLabel: 'Conf',
    description: 'Ready for matching',
  },
  soft_committed: {
    label: 'Soft Committed',
    shortLabel: 'Soft',
    description: 'Likely available',
  },
  forecast: {
    label: 'Forecast',
    shortLabel: 'Fcst',
    description: 'Planned supply',
  },
} as const;

// ============================================================================
// PAGINATION DEFAULTS
// ============================================================================

export const DEFAULT_PAGE_SIZE = 10;
export const DEFAULT_PAGE = 1;
