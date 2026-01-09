/**
 * DELIVERY PERIODS UTILITY MODULE
 *
 * Centralizes all delivery period logic across the platform.
 * Eliminates scattered references to delivery periods in:
 * - matching-validation.ts
 * - batch-lifecycle.ts
 * - pool-request-lifecycle.ts
 * - matching-window.ts
 *
 * Provides consistent handling of:
 * - Delivery period types
 * - Week ranges for each period
 * - Formatting and labels
 * - Period calculations
 */

// ============================================
// TYPE DEFINITIONS
// ============================================

/**
 * Delivery period types
 * - short_term: 0-4 weeks
 * - mid_term: 4-8 weeks
 * - long_term: 8+ weeks
 */
export type DeliveryPeriod = 'short_term' | 'mid_term' | 'long_term';

/**
 * All possible delivery periods as array for iteration
 */
export const DELIVERY_PERIODS: DeliveryPeriod[] = ['short_term', 'mid_term', 'long_term'];

// ============================================
// WEEK RANGES
// ============================================

/**
 * Week ranges for each delivery period
 * Used for validation and filtering
 */
export const DELIVERY_PERIOD_RANGES: Record<DeliveryPeriod, { min: number; max: number }> = {
  short_term: { min: 0, max: 4 },
  mid_term: { min: 4, max: 8 },
  long_term: { min: 8, max: Infinity },
};

/**
 * Delivery period display labels (English)
 */
export const DELIVERY_PERIOD_LABELS: Record<DeliveryPeriod, string> = {
  short_term: 'Short Term',
  mid_term: 'Mid Term',
  long_term: 'Long Term',
};

/**
 * Delivery period display labels (Russian)
 */
export const DELIVERY_PERIOD_LABELS_RU: Record<DeliveryPeriod, string> = {
  short_term: 'Краткосрочная',
  mid_term: 'Среднесрочная',
  long_term: 'Долгосрочная',
};

/**
 * Delivery period descriptions (English)
 */
export const DELIVERY_PERIOD_DESCRIPTIONS: Record<DeliveryPeriod, string> = {
  short_term: '0-4 weeks: Immediate delivery, high urgency',
  mid_term: '4-8 weeks: Standard delivery, moderate planning',
  long_term: '8+ weeks: Extended delivery, long-term planning',
};

/**
 * Delivery period descriptions (Russian)
 */
export const DELIVERY_PERIOD_DESCRIPTIONS_RU: Record<DeliveryPeriod, string> = {
  short_term: '0-4 недели: Срочная доставка, высокая приоритетность',
  mid_term: '4-8 недель: Стандартная доставка, умеренное планирование',
  long_term: '8+ недель: Расширенная доставка, долгосрочное планирование',
};

// ============================================
// FORMATTING FUNCTIONS
// ============================================

/**
 * Get localized label for a delivery period
 *
 * @param period - The delivery period
 * @param lang - Language (defaults to 'en')
 * @returns Localized label
 *
 * @example
 * formatDeliveryPeriod('short_term') // "Short Term (0-4 weeks)"
 * formatDeliveryPeriod('mid_term', 'ru') // "Среднесрочная (4-8 недель)"
 */
export function formatDeliveryPeriod(period: DeliveryPeriod | null, lang: 'en' | 'ru' = 'en'): string {
  if (!period) {
    return lang === 'ru' ? 'Не указан' : 'Not specified';
  }

  const labels = lang === 'ru' ? DELIVERY_PERIOD_LABELS_RU : DELIVERY_PERIOD_LABELS;
  const label = labels[period];
  const range = DELIVERY_PERIOD_RANGES[period];

  if (range.max === Infinity) {
    return lang === 'ru' ? `${label} (${range.min}+ недель)` : `${label} (${range.min}+ weeks)`;
  }

  return lang === 'ru'
    ? `${label} (${range.min}-${range.max} недель)`
    : `${label} (${range.min}-${range.max} weeks)`;
}

/**
 * Get short label for a delivery period (without week range)
 *
 * @param period - The delivery period
 * @param lang - Language (defaults to 'en')
 * @returns Short label
 *
 * @example
 * getDeliveryPeriodLabel('short_term') // "Short Term"
 * getDeliveryPeriodLabel('mid_term', 'ru') // "Среднесрочная"
 */
export function getDeliveryPeriodLabel(period: DeliveryPeriod | null, lang: 'en' | 'ru' = 'en'): string {
  if (!period) {
    return lang === 'ru' ? 'Не указан' : 'Not specified';
  }

  const labels = lang === 'ru' ? DELIVERY_PERIOD_LABELS_RU : DELIVERY_PERIOD_LABELS;
  return labels[period];
}

/**
 * Get description for a delivery period
 *
 * @param period - The delivery period
 * @param lang - Language (defaults to 'en')
 * @returns Description
 */
export function getDeliveryPeriodDescription(period: DeliveryPeriod, lang: 'en' | 'ru' = 'en'): string {
  const descriptions = lang === 'ru' ? DELIVERY_PERIOD_DESCRIPTIONS_RU : DELIVERY_PERIOD_DESCRIPTIONS;
  return descriptions[period];
}

// ============================================
// CALCULATION FUNCTIONS
// ============================================

/**
 * Get delivery period from number of weeks
 *
 * @param weeks - Number of weeks until delivery
 * @returns Corresponding delivery period
 *
 * @example
 * getDeliveryPeriodFromWeeks(2) // 'short_term'
 * getDeliveryPeriodFromWeeks(6) // 'mid_term'
 * getDeliveryPeriodFromWeeks(10) // 'long_term'
 */
export function getDeliveryPeriodFromWeeks(weeks: number): DeliveryPeriod {
  if (weeks < 0) {
    throw new Error('Weeks cannot be negative');
  }

  if (weeks >= 0 && weeks < 4) {
    return 'short_term';
  } else if (weeks >= 4 && weeks < 8) {
    return 'mid_term';
  } else {
    return 'long_term';
  }
}

/**
 * Check if a number of weeks falls within a delivery period range
 *
 * @param weeks - Number of weeks
 * @param period - Delivery period to check against
 * @returns True if weeks fall within the period range
 *
 * @example
 * isWeeksInPeriod(3, 'short_term') // true
 * isWeeksInPeriod(5, 'short_term') // false
 * isWeeksInPeriod(5, 'mid_term') // true
 */
export function isWeeksInPeriod(weeks: number, period: DeliveryPeriod): boolean {
  const range = DELIVERY_PERIOD_RANGES[period];
  return weeks >= range.min && weeks < range.max;
}

/**
 * Get week range for a delivery period as a formatted string
 *
 * @param period - Delivery period
 * @param lang - Language (defaults to 'en')
 * @returns Formatted week range
 *
 * @example
 * getWeekRangeString('short_term') // "0-4 weeks"
 * getWeekRangeString('long_term', 'ru') // "8+ недель"
 */
export function getWeekRangeString(period: DeliveryPeriod, lang: 'en' | 'ru' = 'en'): string {
  const range = DELIVERY_PERIOD_RANGES[period];
  const weeksLabel = lang === 'ru' ? 'недель' : 'weeks';

  if (range.max === Infinity) {
    return `${range.min}+ ${weeksLabel}`;
  }

  return `${range.min}-${range.max} ${weeksLabel}`;
}

// ============================================
// VALIDATION FUNCTIONS
// ============================================

/**
 * Check if two delivery periods are compatible (overlap)
 *
 * @param period1 - First delivery period
 * @param period2 - Second delivery period
 * @returns True if periods overlap or are adjacent
 *
 * @example
 * arePeriodsCompatible('short_term', 'mid_term') // true (adjacent)
 * arePeriodsCompatible('short_term', 'long_term') // false (no overlap)
 */
export function arePeriodsCompatible(period1: DeliveryPeriod | null, period2: DeliveryPeriod | null): boolean {
  // If either is null, consider compatible (no restriction)
  if (!period1 || !period2) {
    return true;
  }

  // Same period is always compatible
  if (period1 === period2) {
    return true;
  }

  const range1 = DELIVERY_PERIOD_RANGES[period1];
  const range2 = DELIVERY_PERIOD_RANGES[period2];

  // Check for overlap
  // Ranges overlap if: (start1 <= end2) AND (start2 <= end1)
  const overlaps = range1.min <= range2.max && range2.min <= range1.max;

  return overlaps;
}

/**
 * Validate delivery period overlap between batch and pool request
 *
 * @param batchPeriod - Batch delivery period
 * @param requestPeriod - Pool request target delivery period
 * @returns Validation result with compatibility flag and reason
 */
export function validateDeliveryPeriodOverlap(
  batchPeriod: DeliveryPeriod | null,
  requestPeriod: DeliveryPeriod | null
): {
  compatible: boolean;
  reason: string;
  reasonRu: string;
} {
  // If either is null, no restriction
  if (!batchPeriod || !requestPeriod) {
    return {
      compatible: true,
      reason: 'No delivery period restriction',
      reasonRu: 'Нет ограничения по периоду доставки',
    };
  }

  // Check compatibility
  const compatible = arePeriodsCompatible(batchPeriod, requestPeriod);

  if (compatible) {
    return {
      compatible: true,
      reason: `Delivery periods compatible: ${getDeliveryPeriodLabel(batchPeriod)} matches ${getDeliveryPeriodLabel(requestPeriod)}`,
      reasonRu: `Периоды доставки совместимы: ${getDeliveryPeriodLabel(batchPeriod, 'ru')} соответствует ${getDeliveryPeriodLabel(requestPeriod, 'ru')}`,
    };
  }

  return {
    compatible: false,
    reason: `Delivery period mismatch: Batch is ${getDeliveryPeriodLabel(batchPeriod)} (${getWeekRangeString(batchPeriod)}), Request requires ${getDeliveryPeriodLabel(requestPeriod)} (${getWeekRangeString(requestPeriod)})`,
    reasonRu: `Несоответствие периода доставки: Партия - ${getDeliveryPeriodLabel(batchPeriod, 'ru')} (${getWeekRangeString(batchPeriod, 'ru')}), Запрос требует ${getDeliveryPeriodLabel(requestPeriod, 'ru')} (${getWeekRangeString(requestPeriod, 'ru')})`,
  };
}

/**
 * Check if a delivery period is valid
 */
export function isValidDeliveryPeriod(period: string): period is DeliveryPeriod {
  return DELIVERY_PERIODS.includes(period as DeliveryPeriod);
}
