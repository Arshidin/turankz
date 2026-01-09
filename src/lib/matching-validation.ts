/**
 * MATCHING VALIDATION RULES
 * 
 * Validates that batch and request can be matched based on:
 * - Delivery period compatibility
 * - Region overlap
 * - Grade compatibility
 * - Weight/Age criteria overlap
 * 
 * CRITICAL: No matching should occur without proper validation.
 */

import type { ConfirmedBatch } from '@/hooks/useConfirmedBatches';
import type { MatchingPoolRequest } from '@/hooks/useMatchingRequests';
// Sprint 6 Task 9.6.2: Use centralized delivery-periods module
import {
  type DeliveryPeriod,
  formatDeliveryPeriod as formatDeliveryPeriodUtil,
  validateDeliveryPeriodOverlap as validateDeliveryPeriodOverlapUtil,
} from './delivery-periods';

// Re-export DeliveryPeriod for backward compatibility
export type { DeliveryPeriod };

export interface MatchingValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validate if batch and request delivery periods are compatible
 * Matching can only occur if delivery periods overlap
 *
 * Sprint 6 Task 9.6.2: Updated to use centralized delivery-periods module
 * This function now wraps the centralized validateDeliveryPeriodOverlap for backward compatibility
 */
export function validateDeliveryPeriodOverlap(
  batchDeliveryPeriod: DeliveryPeriod | null,
  requestDeliveryPeriod: DeliveryPeriod | null
): { compatible: boolean; reason: string } {
  // Use centralized validation from delivery-periods module
  const result = validateDeliveryPeriodOverlapUtil(batchDeliveryPeriod, requestDeliveryPeriod);
  return {
    compatible: result.compatible,
    reason: result.reason, // Use English reason (RU available via result.reasonRu if needed)
  };
}

// LEGACY CODE BELOW - can be removed after Sprint 6 verification
// Original implementation kept temporarily for reference
/*
export function validateDeliveryPeriodOverlap_OLD(
  batchDeliveryPeriod: DeliveryPeriod | null,
  requestDeliveryPeriod: DeliveryPeriod | null
): { compatible: boolean; reason: string } {
  // If batch has no delivery period, it's compatible with any request
  if (!batchDeliveryPeriod) {
    return { compatible: true, reason: 'Batch delivery period not specified (any)' };
  }

  // If request has no delivery period, it accepts any batch
  if (!requestDeliveryPeriod) {
    return { compatible: true, reason: 'Request accepts any delivery period' };
  }

  // Exact match
  if (batchDeliveryPeriod === requestDeliveryPeriod) {
    return { compatible: true, reason: 'Delivery periods match exactly' };
  }

  // No overlap - periods must match
  return {
    compatible: false,
    reason: `Delivery period mismatch: Batch is "${formatDeliveryPeriod(batchDeliveryPeriod)}" but Request requires "${formatDeliveryPeriod(requestDeliveryPeriod)}"`,
  };
}
*/

/**
 * Validate if batch region matches request regions
 */
export function validateRegionOverlap(
  batchRegion: string,
  requestRegions: string[]
): { compatible: boolean; reason: string } {
  // Request accepts any region
  if (requestRegions.includes('Any') || requestRegions.length === 0) {
    return { compatible: true, reason: 'Request accepts any region' };
  }

  // Check if batch region is in request's accepted regions
  if (requestRegions.includes(batchRegion)) {
    return { compatible: true, reason: `Region "${batchRegion}" is accepted` };
  }

  return {
    compatible: false,
    reason: `Region mismatch: Batch is from "${batchRegion}" but Request only accepts "${requestRegions.join(', ')}"`,
  };
}

/**
 * Validate if batch grade matches request required grade
 */
export function validateGradeCompatibility(
  batchGrade: string,
  requestGrade: string
): { compatible: boolean; reason: string } {
  // Case-insensitive comparison
  if (batchGrade.toLowerCase() === requestGrade.toLowerCase()) {
    return { compatible: true, reason: 'Grades match' };
  }

  return {
    compatible: false,
    reason: `Grade mismatch: Batch is Grade "${batchGrade}" but Request requires Grade "${requestGrade}"`,
  };
}

/**
 * Generic range overlap validation
 * Consolidates weight and age validation logic
 */
function validateRangeOverlap(
  batchMin: number | null,
  batchMax: number | null,
  requestMin: number | null,
  requestMax: number | null,
  fieldName: string,
  unit: string
): { compatible: boolean; reason: string } {
  // If neither specifies the field, compatible
  if (
    batchMin === null && batchMax === null &&
    requestMin === null && requestMax === null
  ) {
    return { compatible: true, reason: `No ${fieldName} restrictions` };
  }

  // Use 0 and Infinity as defaults for null values
  const bMin = batchMin ?? 0;
  const bMax = batchMax ?? Infinity;
  const rMin = requestMin ?? 0;
  const rMax = requestMax ?? Infinity;

  // Check for overlap: ranges overlap if bMin <= rMax AND bMax >= rMin
  const overlaps = bMin <= rMax && bMax >= rMin;

  if (overlaps) {
    return { compatible: true, reason: `${fieldName} ranges overlap` };
  }

  return {
    compatible: false,
    reason: `${fieldName} range mismatch: Batch (${batchMin || '?'}-${batchMax || '?'} ${unit}) does not overlap with Request (${requestMin || '?'}-${requestMax || '?'} ${unit})`,
  };
}

/**
 * Validate weight range overlap between batch and request
 */
export function validateWeightOverlap(
  batchWeightMin: number | null,
  batchWeightMax: number | null,
  requestWeightMin: number | null,
  requestWeightMax: number | null
): { compatible: boolean; reason: string } {
  return validateRangeOverlap(
    batchWeightMin,
    batchWeightMax,
    requestWeightMin,
    requestWeightMax,
    'Weight',
    'kg'
  );
}

/**
 * Validate age range overlap between batch and request
 */
export function validateAgeOverlap(
  batchAgeMin: number | null,
  batchAgeMax: number | null,
  requestAgeMin: number | null,
  requestAgeMax: number | null
): { compatible: boolean; reason: string } {
  return validateRangeOverlap(
    batchAgeMin,
    batchAgeMax,
    requestAgeMin,
    requestAgeMax,
    'Age',
    'months'
  );
}

/**
 * Full matching validation
 * Returns all validation errors and warnings
 * 
 * NOTE: For admin users, delivery period, region, and grade mismatches are warnings (not errors)
 * because admin can intentionally create matchings with mismatches for operational reasons.
 */
export function validateMatchingCriteria(
  batch: {
    region: string;
    grade: string;
    weight_min: number | null;
    weight_max: number | null;
    age_min: number | null;
    age_max: number | null;
    delivery_period?: DeliveryPeriod | null;
  },
  request: {
    regions: string[];
    required_grade: string;
    weight_range_min: number | null;
    weight_range_max: number | null;
    age_range_min: number | null;
    age_range_max: number | null;
    target_delivery_period?: DeliveryPeriod | null;
  },
  options?: {
    allowAdminOverride?: boolean; // If true, criteria mismatches become warnings instead of errors
  }
): MatchingValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const isAdminOverride = options?.allowAdminOverride === true;

  // 1. Delivery Period
  // For admin: warning (can override), For others: error (blocking)
  const deliveryCheck = validateDeliveryPeriodOverlap(
    batch.delivery_period || null,
    request.target_delivery_period || null
  );
  if (!deliveryCheck.compatible) {
    if (isAdminOverride) {
      warnings.push(deliveryCheck.reason);
    } else {
      errors.push(deliveryCheck.reason);
    }
  }

  // 2. Region
  // For admin: warning (can override), For others: error (blocking)
  const regionCheck = validateRegionOverlap(batch.region, request.regions);
  if (!regionCheck.compatible) {
    if (isAdminOverride) {
      warnings.push(regionCheck.reason);
    } else {
      errors.push(regionCheck.reason);
    }
  }

  // 3. Grade
  // For admin: warning (can override), For others: error (blocking)
  const gradeCheck = validateGradeCompatibility(batch.grade, request.required_grade);
  if (!gradeCheck.compatible) {
    if (isAdminOverride) {
      warnings.push(gradeCheck.reason);
    } else {
      errors.push(gradeCheck.reason);
    }
  }

  // 4. Weight (Warning only - admin can override)
  const weightCheck = validateWeightOverlap(
    batch.weight_min,
    batch.weight_max,
    request.weight_range_min,
    request.weight_range_max
  );
  if (!weightCheck.compatible) {
    warnings.push(weightCheck.reason);
  }

  // 5. Age (Warning only - admin can override)
  const ageCheck = validateAgeOverlap(
    batch.age_min,
    batch.age_max,
    request.age_range_min,
    request.age_range_max
  );
  if (!ageCheck.compatible) {
    warnings.push(ageCheck.reason);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate batch against matching window eligible delivery periods
 */
export function validateBatchForWindow(
  batchDeliveryPeriod: DeliveryPeriod | null,
  windowEligiblePeriods: DeliveryPeriod[] | null
): { eligible: boolean; reason: string } {
  // Window accepts all periods
  if (!windowEligiblePeriods || windowEligiblePeriods.length === 0) {
    return { eligible: true, reason: 'Window accepts all delivery periods' };
  }

  // Batch has no specific period - allow
  if (!batchDeliveryPeriod) {
    return { eligible: true, reason: 'Batch has no specific delivery period' };
  }

  // Check if batch's delivery period is in window's eligible periods
  if (windowEligiblePeriods.includes(batchDeliveryPeriod)) {
    return { eligible: true, reason: `Batch delivery period "${formatDeliveryPeriod(batchDeliveryPeriod)}" is eligible for this window` };
  }

  return {
    eligible: false,
    reason: `Batch delivery period "${formatDeliveryPeriod(batchDeliveryPeriod)}" is not eligible. Window accepts: ${windowEligiblePeriods.map(formatDeliveryPeriod).join(', ')}`,
  };
}

/**
 * Format delivery period for display
 *
 * Sprint 6 Task 9.6.2: Updated to use centralized delivery-periods module
 * This function now wraps the centralized formatDeliveryPeriod for backward compatibility
 */
export function formatDeliveryPeriod(period: DeliveryPeriod | null): string {
  return formatDeliveryPeriodUtil(period, 'en');
}

// LEGACY CODE BELOW - can be removed after Sprint 6 verification
/*
export function formatDeliveryPeriod_OLD(period: DeliveryPeriod): string {
  switch (period) {
    case 'short_term':
      return 'Short Term (0-4 weeks)';
    case 'mid_term':
      return 'Mid Term (4-8 weeks)';
    case 'long_term':
      return 'Long Term (8+ weeks)';
    default:
      return period;
  }
}
*/

/**
 * Get short delivery period label
 */
export function getDeliveryPeriodLabel(period: DeliveryPeriod | null): string {
  if (!period) return 'Any';
  switch (period) {
    case 'short_term':
      return 'Short Term';
    case 'mid_term':
      return 'Mid Term';
    case 'long_term':
      return 'Long Term';
    default:
      return period;
  }
}

/**
 * Match confidence calculation
 * Calculates a 0-100 score based on how well batch and request match
 */
export interface MatchConfidence {
  score: number; // 0-100
  level: 'perfect' | 'good' | 'acceptable' | 'poor';
  color: 'emerald' | 'blue' | 'amber' | 'red';
  label: string;
}

export function calculateMatchConfidence(
  batch: {
    region: string;
    grade: string;
    weight_min: number | null;
    weight_max: number | null;
    age_min: number | null;
    age_max: number | null;
    delivery_period?: DeliveryPeriod | null;
  },
  request: {
    regions: string[];
    required_grade: string;
    weight_range_min: number | null;
    weight_range_max: number | null;
    age_range_min: number | null;
    age_range_max: number | null;
    target_delivery_period?: DeliveryPeriod | null;
  }
): MatchConfidence {
  let score = 0;

  // Delivery Period (30 points)
  const deliveryCheck = validateDeliveryPeriodOverlap(
    batch.delivery_period || null,
    request.target_delivery_period || null
  );
  if (deliveryCheck.compatible) {
    score += 30;
  }

  // Region (25 points)
  const regionCheck = validateRegionOverlap(batch.region, request.regions);
  if (regionCheck.compatible) {
    score += 25;
  }

  // Grade (25 points)
  const gradeCheck = validateGradeCompatibility(batch.grade, request.required_grade);
  if (gradeCheck.compatible) {
    score += 25;
  }

  // Weight range (10 points)
  const weightCheck = validateWeightOverlap(
    batch.weight_min,
    batch.weight_max,
    request.weight_range_min,
    request.weight_range_max
  );
  if (weightCheck.compatible) {
    score += 10;
  }

  // Age range (10 points)
  const ageCheck = validateAgeOverlap(
    batch.age_min,
    batch.age_max,
    request.age_range_min,
    request.age_range_max
  );
  if (ageCheck.compatible) {
    score += 10;
  }

  // Determine level and color
  let level: MatchConfidence['level'];
  let color: MatchConfidence['color'];
  let label: string;

  if (score === 100) {
    level = 'perfect';
    color = 'emerald';
    label = 'Perfect Match';
  } else if (score >= 80) {
    level = 'good';
    color = 'blue';
    label = 'Good Match';
  } else if (score >= 50) {
    level = 'acceptable';
    color = 'amber';
    label = 'Acceptable Match';
  } else {
    level = 'poor';
    color = 'red';
    label = 'Poor Match';
  }

  return { score, level, color, label };
}
