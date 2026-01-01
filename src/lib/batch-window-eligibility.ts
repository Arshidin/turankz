/**
 * BATCH WINDOW ELIGIBILITY
 * 
 * Calculates eligibility indicators for batches relative to matching windows.
 * Provides awareness without creating commitments.
 */

import { type Batch } from '@/hooks/useBatches';
import { type MatchingWindow, getEffectiveWindowStatus, type DeliveryPeriod } from '@/lib/matching-window';
import { parseISO, isAfter, isBefore, startOfToday, differenceInWeeks } from 'date-fns';

export interface BatchEligibilityInfo {
  eligible: boolean;
  windowName: string | null;
  windowTargetWeek: string | null;
  reason: string;
  urgency: 'none' | 'low' | 'medium' | 'high';
  canConfirm: boolean; // Whether batch can be confirmed in this window
}

/**
 * Check if batch delivery period is eligible for window
 */
function isDeliveryPeriodEligible(
  batchDeliveryPeriod: DeliveryPeriod | null,
  windowEligiblePeriods: DeliveryPeriod[] | null
): boolean {
  // Window accepts all periods
  if (!windowEligiblePeriods || windowEligiblePeriods.length === 0) {
    return true;
  }

  // Batch has no specific period - allow
  if (!batchDeliveryPeriod) {
    return true;
  }

  // Check if batch's delivery period is in window's eligible periods
  return windowEligiblePeriods.includes(batchDeliveryPeriod);
}

/**
 * Check if batch target week aligns with window target week
 * Returns true if they're within 4 weeks of each other or exact match
 */
function isTargetWeekAligned(
  batchTargetWeek: string,
  windowTargetWeek: string
): boolean {
  try {
    // Parse target weeks (format: "2025-W12" or "2025-03")
    const batchWeek = parseTargetWeek(batchTargetWeek);
    const windowWeek = parseTargetWeek(windowTargetWeek);
    
    if (!batchWeek || !windowWeek) return true; // If parsing fails, allow
    
    const diff = Math.abs(differenceInWeeks(batchWeek, windowWeek));
    return diff <= 4; // Allow up to 4 weeks difference
  } catch {
    return true; // If parsing fails, allow
  }
}

/**
 * Parse target week string to Date
 * Supports formats: "2025-W12", "2025-03", "2025-03-15"
 */
function parseTargetWeek(targetWeek: string): Date | null {
  try {
    // Try ISO week format (2025-W12)
    if (targetWeek.includes('W')) {
      const [year, week] = targetWeek.split('-W');
      if (year && week) {
        const yearNum = parseInt(year, 10);
        const weekNum = parseInt(week, 10);
        // Approximate: first week of year + (week - 1) * 7 days
        const jan1 = new Date(yearNum, 0, 1);
        const daysOffset = (weekNum - 1) * 7;
        return new Date(jan1.getTime() + daysOffset * 24 * 60 * 60 * 1000);
      }
    }
    
    // Try month format (2025-03)
    if (targetWeek.match(/^\d{4}-\d{2}$/)) {
      const [year, month] = targetWeek.split('-');
      return new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
    }
    
    // Try full date format (2025-03-15)
    const parsed = parseISO(targetWeek);
    if (!isNaN(parsed.getTime())) {
      return parsed;
    }
    
    return null;
  } catch {
    return null;
  }
}

/**
 * Calculate urgency based on window status and time until lock
 */
function calculateUrgency(
  window: MatchingWindow,
  batchStatus: string
): 'none' | 'low' | 'medium' | 'high' {
  const effectiveStatus = getEffectiveWindowStatus(window);
  
  // High urgency: active window, batch not confirmed, lock date approaching
  if (effectiveStatus === 'active') {
    const now = startOfToday();
    const lockDate = parseISO(window.lock_date);
    const daysUntilLock = Math.ceil((lockDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (batchStatus !== 'confirmed' && batchStatus !== 'matched' && batchStatus !== 'closed') {
      if (daysUntilLock <= 1) return 'high';
      if (daysUntilLock <= 3) return 'medium';
      if (daysUntilLock <= 7) return 'low';
    }
  }
  
  // Medium urgency: upcoming window starting soon
  if (effectiveStatus === 'upcoming') {
    const now = startOfToday();
    const startDate = parseISO(window.start_date);
    const daysUntilStart = Math.ceil((startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilStart <= 7) return 'medium';
    if (daysUntilStart <= 14) return 'low';
  }
  
  return 'none';
}

/**
 * Get eligibility info for a batch relative to matching windows
 */
export function getBatchWindowEligibility(
  batch: Batch,
  windows: MatchingWindow[] | undefined
): BatchEligibilityInfo {
  // Default: no eligibility
  const defaultInfo: BatchEligibilityInfo = {
    eligible: false,
    windowName: null,
    windowTargetWeek: null,
    reason: 'No matching windows available',
    urgency: 'none',
    canConfirm: false,
  };

  if (!windows || windows.length === 0) {
    return defaultInfo;
  }

  // Filter out closed windows and get active/upcoming
  const relevantWindows = windows
    .map(w => ({ ...w, effectiveStatus: getEffectiveWindowStatus(w) }))
    .filter(w => w.effectiveStatus === 'active' || w.effectiveStatus === 'upcoming')
    .sort((a, b) => {
      // Sort by: active first, then by start_date (earliest first)
      if (a.effectiveStatus === 'active' && b.effectiveStatus !== 'active') return -1;
      if (b.effectiveStatus === 'active' && a.effectiveStatus !== 'active') return 1;
      return parseISO(a.start_date).getTime() - parseISO(b.start_date).getTime();
    });

  if (relevantWindows.length === 0) {
    return {
      ...defaultInfo,
      reason: 'No active or upcoming matching windows',
    };
  }

  // Check batch status - only certain statuses can be eligible
  const eligibleStatuses: string[] = ['draft', 'forecast', 'soft_committed', 'confirmed'];
  if (!eligibleStatuses.includes(batch.status)) {
    return {
      ...defaultInfo,
      reason: `Batch status "${batch.status}" cannot be confirmed in matching windows`,
      urgency: 'none',
    };
  }

  // Check each relevant window
  for (const window of relevantWindows) {
    const effectiveStatus = getEffectiveWindowStatus(window);
    
    // Check delivery period eligibility
    const deliveryEligible = isDeliveryPeriodEligible(
      batch.delivery_period,
      window.eligible_delivery_periods
    );

    if (!deliveryEligible) {
      continue; // Try next window
    }

    // Check target week alignment
    const weekAligned = isTargetWeekAligned(batch.target_week, window.target_week);
    
    if (!weekAligned) {
      continue; // Try next window
    }

    // Batch is eligible for this window
    const urgency = calculateUrgency(window, batch.status);
    const canConfirm = effectiveStatus === 'active' && batch.status !== 'confirmed';

    return {
      eligible: true,
      windowName: window.name,
      windowTargetWeek: window.target_week,
      reason: effectiveStatus === 'active'
        ? `Eligible for active window "${window.name}"`
        : `Eligible for upcoming window "${window.name}"`,
      urgency,
      canConfirm,
    };
  }

  // No eligible window found
  return {
    ...defaultInfo,
    reason: 'Batch does not match any active or upcoming window criteria',
  };
}

