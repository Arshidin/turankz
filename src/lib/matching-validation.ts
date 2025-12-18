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

export type DeliveryPeriod = 'short_term' | 'mid_term' | 'long_term';

export interface MatchingValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validate if batch and request delivery periods are compatible
 * Matching can only occur if delivery periods overlap
 */
export function validateDeliveryPeriodOverlap(
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
 * Validate weight range overlap
 */
export function validateWeightOverlap(
  batchWeightMin: number | null,
  batchWeightMax: number | null,
  requestWeightMin: number | null,
  requestWeightMax: number | null
): { compatible: boolean; reason: string } {
  // If neither specifies weight, compatible
  if (
    batchWeightMin === null && batchWeightMax === null &&
    requestWeightMin === null && requestWeightMax === null
  ) {
    return { compatible: true, reason: 'No weight restrictions' };
  }

  // If only one specifies, check partial overlap
  const bMin = batchWeightMin ?? 0;
  const bMax = batchWeightMax ?? Infinity;
  const rMin = requestWeightMin ?? 0;
  const rMax = requestWeightMax ?? Infinity;

  // Check for overlap
  const overlaps = bMin <= rMax && bMax >= rMin;

  if (overlaps) {
    return { compatible: true, reason: 'Weight ranges overlap' };
  }

  return {
    compatible: false,
    reason: `Weight range mismatch: Batch (${batchWeightMin || '?'}-${batchWeightMax || '?'} kg) does not overlap with Request (${requestWeightMin || '?'}-${requestWeightMax || '?'} kg)`,
  };
}

/**
 * Validate age range overlap
 */
export function validateAgeOverlap(
  batchAgeMin: number | null,
  batchAgeMax: number | null,
  requestAgeMin: number | null,
  requestAgeMax: number | null
): { compatible: boolean; reason: string } {
  // If neither specifies age, compatible
  if (
    batchAgeMin === null && batchAgeMax === null &&
    requestAgeMin === null && requestAgeMax === null
  ) {
    return { compatible: true, reason: 'No age restrictions' };
  }

  // If only one specifies, check partial overlap
  const bMin = batchAgeMin ?? 0;
  const bMax = batchAgeMax ?? Infinity;
  const rMin = requestAgeMin ?? 0;
  const rMax = requestAgeMax ?? Infinity;

  // Check for overlap
  const overlaps = bMin <= rMax && bMax >= rMin;

  if (overlaps) {
    return { compatible: true, reason: 'Age ranges overlap' };
  }

  return {
    compatible: false,
    reason: `Age range mismatch: Batch (${batchAgeMin || '?'}-${batchAgeMax || '?'} months) does not overlap with Request (${requestAgeMin || '?'}-${requestAgeMax || '?'} months)`,
  };
}

/**
 * Full matching validation
 * Returns all validation errors and warnings
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
  }
): MatchingValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 1. Delivery Period (CRITICAL)
  const deliveryCheck = validateDeliveryPeriodOverlap(
    batch.delivery_period || null,
    request.target_delivery_period || null
  );
  if (!deliveryCheck.compatible) {
    errors.push(deliveryCheck.reason);
  }

  // 2. Region
  const regionCheck = validateRegionOverlap(batch.region, request.regions);
  if (!regionCheck.compatible) {
    errors.push(regionCheck.reason);
  }

  // 3. Grade
  const gradeCheck = validateGradeCompatibility(batch.grade, request.required_grade);
  if (!gradeCheck.compatible) {
    errors.push(gradeCheck.reason);
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
 */
export function formatDeliveryPeriod(period: DeliveryPeriod): string {
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
