/**
 * Date and time utility functions
 * Centralized date parsing and formatting utilities
 */

import { format, startOfMonth } from 'date-fns';

/**
 * Parse target_week string to extract year and week number
 * Supports formats:
 * - YYYY-WXX (e.g., 2025-W01)
 * - WXX-YYYY (e.g., W01-2025)
 * - Week XX, YYYY (e.g., Week 1, 2025)
 */
export function parseTargetWeek(targetWeek: string): { year: number; week: number } {
  let year: number;
  let week: number;
  
  if (targetWeek.includes('-W')) {
    // Format: YYYY-WXX (e.g., 2025-W01)
    const [yearStr, weekStr] = targetWeek.split('-W');
    year = parseInt(yearStr);
    week = parseInt(weekStr);
  } else if (targetWeek.startsWith('W')) {
    // Format: WXX-YYYY (e.g., W01-2025)
    const parts = targetWeek.split('-');
    week = parseInt(parts[0].replace('W', ''));
    year = parseInt(parts[1]);
  } else if (targetWeek.includes('Week')) {
    // Format: Week XX, YYYY (e.g., Week 1, 2025)
    const matches = targetWeek.match(/\d+/g);
    if (matches && matches.length >= 2) {
      week = parseInt(matches[0]);
      year = parseInt(matches[1]);
    } else {
      throw new Error(`Invalid target_week format: ${targetWeek}`);
    }
  } else {
    // Fallback: try to extract any numbers
    const matches = targetWeek.match(/\d+/g);
    if (matches && matches.length >= 2) {
      if (parseInt(matches[1]) > 100) {
        week = parseInt(matches[0]);
        year = parseInt(matches[1]);
      } else {
        year = parseInt(matches[0]);
        week = parseInt(matches[1]);
      }
    } else {
      // Fallback to current week
      const now = new Date();
      year = now.getFullYear();
      week = 1;
    }
  }
  
  return { year, week };
}

/**
 * Get month key from target_week (format: yyyy-MM)
 * Used for grouping batches/requests by month
 */
export function getMonthKeyFromTargetWeek(targetWeek: string | null | undefined): string {
  if (!targetWeek) return 'Unknown';
  
  try {
    const { year, week } = parseTargetWeek(targetWeek);
    
    // Calculate date from week
    const date = new Date(year, 0, 1);
    date.setDate(date.getDate() + (week - 1) * 7);
    
    // Get start of month and format as YYYY-MM
    const monthStart = startOfMonth(date);
    return format(monthStart, 'yyyy-MM');
  } catch {
    return 'Unknown';
  }
}

/**
 * Get month label from target_week (format: MMMM yyyy)
 * Used for display purposes
 */
export function getMonthLabelFromTargetWeek(targetWeek: string | null | undefined): string {
  if (!targetWeek) return 'Unknown';
  
  try {
    const { year, week } = parseTargetWeek(targetWeek);
    
    // Calculate date from week
    const date = new Date(year, 0, 1);
    date.setDate(date.getDate() + (week - 1) * 7);
    
    // Format month (e.g., "January 2025")
    return format(date, 'MMMM yyyy');
  } catch {
    return 'Unknown';
  }
}

/**
 * Get week label from target_week (format: Week XX)
 * Used for display purposes
 */
export function getWeekLabelFromTargetWeek(targetWeek: string | null | undefined): string {
  if (!targetWeek) return 'Unknown';
  
  try {
    const { week } = parseTargetWeek(targetWeek);
    return `Week ${week}`;
  } catch {
    return 'Unknown';
  }
}

/**
 * Parse target_week and return both month and week labels
 */
export function parseTargetWeekLabels(targetWeek: string): { targetMonth: string; targetWeekLabel: string } {
  try {
    const { year, week } = parseTargetWeek(targetWeek);
    
    // Calculate date from week
    const date = new Date(year, 0, 1);
    date.setDate(date.getDate() + (week - 1) * 7);
    
    // Format month (e.g., "January 2025")
    const targetMonth = format(date, 'MMMM yyyy');
    const targetWeekLabel = `Week ${week}`;
    
    return { targetMonth, targetWeekLabel };
  } catch {
    return { targetMonth: 'Unknown', targetWeekLabel: 'Unknown' };
  }
}

/**
 * Get Date object from target_week
 * Returns the start of the month for that week
 */
export function getDateFromTargetWeek(targetWeek: string): Date {
  const { year, week } = parseTargetWeek(targetWeek);
  
  const date = new Date(year, 0, 1);
  date.setDate(date.getDate() + (week - 1) * 7);
  
  return startOfMonth(date);
}

/**
 * Validate target week is within reasonable range (next N weeks)
 */
export function validateTargetWeek(targetWeek: string, maxWeeksAhead: number = 12): boolean {
  if (!targetWeek) return false;
  
  try {
    const { year, week } = parseTargetWeek(targetWeek);
    
    // Calculate date from week
    const targetDate = new Date(year, 0, 1);
    targetDate.setDate(targetDate.getDate() + (week - 1) * 7);
    
    // Check if within range
    const now = new Date();
    const maxDate = new Date(now);
    maxDate.setDate(maxDate.getDate() + maxWeeksAhead * 7);
    
    // Check if not in the past and not more than maxWeeksAhead weeks ahead
    return targetDate >= now && targetDate <= maxDate;
  } catch {
    return false;
  }
}

