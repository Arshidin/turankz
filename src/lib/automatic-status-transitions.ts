/**
 * AUTOMATIC STATUS TRANSITIONS
 * 
 * Centralized logic for automatic status updates based on matching results.
 * These transitions are system-driven and cannot be manually overridden.
 */

import type { BatchLifecycleStatus } from './batch-lifecycle';
import type { PoolRequestLifecycleStatus } from './pool-request-lifecycle';

// ============================================================================
// BATCH AUTOMATIC TRANSITIONS
// ============================================================================

/**
 * Batch transitions that are automatic (triggered by matching events)
 * These transitions cannot be triggered manually.
 */
export const BATCH_AUTOMATIC_TRANSITIONS: Array<{
  from: BatchLifecycleStatus;
  to: BatchLifecycleStatus;
  trigger: string;
}> = [
  { from: 'confirmed', to: 'matched', trigger: 'matching_created' },
  { from: 'matched', to: 'closed', trigger: 'volume_fully_allocated' },
];

/**
 * Check if a batch transition should be automatic (not manually triggerable)
 */
export function isBatchTransitionAutomatic(
  fromStatus: BatchLifecycleStatus,
  toStatus: BatchLifecycleStatus
): boolean {
  return BATCH_AUTOMATIC_TRANSITIONS.some(
    t => t.from === fromStatus && t.to === toStatus
  );
}

/**
 * Calculate the automatic batch status based on matching data
 * @param currentStatus - Current batch status
 * @param totalHeads - Total heads in the batch
 * @param matchedHeads - Sum of heads in active/finalized matchings
 * @returns The appropriate status, or null if no change needed
 */
export function calculateAutomaticBatchStatus(
  currentStatus: BatchLifecycleStatus,
  totalHeads: number,
  matchedHeads: number
): BatchLifecycleStatus | null {
  // Confirmed → Matched: When any matching is created
  if (currentStatus === 'confirmed' && matchedHeads > 0) {
    return 'matched';
  }

  // Matched → Closed: When batch volume is fully allocated
  if (currentStatus === 'matched' && matchedHeads >= totalHeads) {
    return 'closed';
  }

  return null;
}

/**
 * Check if batch can be manually transitioned to a status
 * Prevents manual triggers of automatic transitions
 */
export function canManuallyTransitionBatch(
  fromStatus: BatchLifecycleStatus,
  toStatus: BatchLifecycleStatus
): { allowed: boolean; reason?: string } {
  // Check if this is an automatic transition
  if (isBatchTransitionAutomatic(fromStatus, toStatus)) {
    const transition = BATCH_AUTOMATIC_TRANSITIONS.find(
      t => t.from === fromStatus && t.to === toStatus
    );
    return {
      allowed: false,
      reason: `This transition is automatic and triggered by: ${transition?.trigger}. Cannot be manually overridden.`,
    };
  }

  return { allowed: true };
}

// ============================================================================
// POOL REQUEST AUTOMATIC TRANSITIONS
// ============================================================================

/**
 * Pool request transitions that are automatic (triggered by matching events)
 */
export const POOL_REQUEST_AUTOMATIC_TRANSITIONS: Array<{
  from: PoolRequestLifecycleStatus;
  to: PoolRequestLifecycleStatus;
  trigger: string;
}> = [
  { from: 'matching', to: 'partial', trigger: 'partial_match' },
  { from: 'matching', to: 'fulfilled', trigger: 'full_match' },
  { from: 'partial', to: 'fulfilled', trigger: 'full_match' },
];

/**
 * Check if a pool request transition should be automatic
 */
export function isPoolRequestTransitionAutomatic(
  fromStatus: PoolRequestLifecycleStatus,
  toStatus: PoolRequestLifecycleStatus
): boolean {
  return POOL_REQUEST_AUTOMATIC_TRANSITIONS.some(
    t => t.from === fromStatus && t.to === toStatus
  );
}

/**
 * Calculate the automatic pool request status based on matching data
 * @param currentStatus - Current request status
 * @param requiredVolume - Required volume
 * @param matchedVolume - Current matched volume
 * @returns The appropriate status, or null if no change needed
 */
export function calculateAutomaticRequestStatus(
  currentStatus: PoolRequestLifecycleStatus,
  requiredVolume: number,
  matchedVolume: number
): PoolRequestLifecycleStatus | null {
  // Only apply to matching or partial status
  if (currentStatus !== 'matching' && currentStatus !== 'partial') {
    return null;
  }

  // Fully matched → Fulfilled
  if (matchedVolume >= requiredVolume) {
    return 'fulfilled';
  }

  // Partially matched → Partial
  if (matchedVolume > 0 && currentStatus === 'matching') {
    return 'partial';
  }

  return null;
}

/**
 * Check if pool request can be manually transitioned to a status
 * Prevents manual triggers of automatic transitions
 */
export function canManuallyTransitionRequest(
  fromStatus: PoolRequestLifecycleStatus,
  toStatus: PoolRequestLifecycleStatus
): { allowed: boolean; reason?: string } {
  // Check if this is an automatic transition
  if (isPoolRequestTransitionAutomatic(fromStatus, toStatus)) {
    const transition = POOL_REQUEST_AUTOMATIC_TRANSITIONS.find(
      t => t.from === fromStatus && t.to === toStatus
    );
    return {
      allowed: false,
      reason: `This transition is automatic and triggered by: ${transition?.trigger}. Cannot be manually overridden.`,
    };
  }

  // Special case: fulfilled → closed is Admin manual action
  if (fromStatus === 'fulfilled' && toStatus === 'closed') {
    return { allowed: true };
  }

  return { allowed: true };
}

// ============================================================================
// MATCHING EVENT HANDLERS
// ============================================================================

export interface MatchingEventResult {
  batchUpdates: Array<{
    batchId: string;
    newStatus: BatchLifecycleStatus;
    reason: string;
  }>;
  requestUpdates: Array<{
    requestId: string;
    newStatus: PoolRequestLifecycleStatus;
    reason: string;
  }>;
}

/**
 * Calculate all status updates needed after matching creation
 */
export function calculateStatusUpdatesOnMatchingCreated(
  matchings: Array<{
    batchId: string;
    requestId: string;
    headsMatched: number;
  }>,
  batchData: Map<string, { status: BatchLifecycleStatus; totalHeads: number; currentMatchedHeads: number }>,
  requestData: Map<string, { status: PoolRequestLifecycleStatus; requiredVolume: number; currentMatchedVolume: number }>
): MatchingEventResult {
  const result: MatchingEventResult = {
    batchUpdates: [],
    requestUpdates: [],
  };

  // Track cumulative updates
  const batchMatchedHeads = new Map<string, number>();
  const requestMatchedVolume = new Map<string, number>();

  // Initialize with current values
  for (const [id, data] of batchData) {
    batchMatchedHeads.set(id, data.currentMatchedHeads);
  }
  for (const [id, data] of requestData) {
    requestMatchedVolume.set(id, data.currentMatchedVolume);
  }

  // Add new matching heads
  for (const m of matchings) {
    batchMatchedHeads.set(m.batchId, (batchMatchedHeads.get(m.batchId) || 0) + m.headsMatched);
    requestMatchedVolume.set(m.requestId, (requestMatchedVolume.get(m.requestId) || 0) + m.headsMatched);
  }

  // Calculate batch status updates
  for (const [batchId, matchedHeads] of batchMatchedHeads) {
    const data = batchData.get(batchId);
    if (!data) continue;

    const newStatus = calculateAutomaticBatchStatus(data.status, data.totalHeads, matchedHeads);
    if (newStatus && newStatus !== data.status) {
      result.batchUpdates.push({
        batchId,
        newStatus,
        reason: newStatus === 'matched' 
          ? 'Matching created' 
          : 'Batch volume fully allocated',
      });
    }
  }

  // Calculate request status updates
  for (const [requestId, matchedVolume] of requestMatchedVolume) {
    const data = requestData.get(requestId);
    if (!data) continue;

    const newStatus = calculateAutomaticRequestStatus(data.status, data.requiredVolume, matchedVolume);
    if (newStatus && newStatus !== data.status) {
      result.requestUpdates.push({
        requestId,
        newStatus,
        reason: newStatus === 'fulfilled' 
          ? 'Request fully matched' 
          : 'Partial match created',
      });
    }
  }

  return result;
}

/**
 * Calculate status updates needed after matching cancellation
 */
export function calculateStatusUpdatesOnMatchingCancelled(
  batchId: string,
  requestId: string,
  cancelledHeads: number,
  batchData: { status: BatchLifecycleStatus; totalHeads: number; currentMatchedHeads: number },
  requestData: { status: PoolRequestLifecycleStatus; requiredVolume: number; currentMatchedVolume: number }
): MatchingEventResult {
  const result: MatchingEventResult = {
    batchUpdates: [],
    requestUpdates: [],
  };

  // Recalculate matched volumes after cancellation
  const newBatchMatchedHeads = Math.max(0, batchData.currentMatchedHeads - cancelledHeads);
  const newRequestMatchedVolume = Math.max(0, requestData.currentMatchedVolume - cancelledHeads);

  // Batch: If matched but now has no matchings, could revert (but we keep matched status)
  // We don't auto-revert batch status as it's already been committed

  // Request: Update status based on new matched volume
  if (requestData.status === 'fulfilled' || requestData.status === 'partial') {
    if (newRequestMatchedVolume >= requestData.requiredVolume) {
      // Still fulfilled, no change
    } else if (newRequestMatchedVolume > 0) {
      if (requestData.status === 'fulfilled') {
        result.requestUpdates.push({
          requestId,
          newStatus: 'partial',
          reason: 'Matching cancelled, request no longer fully matched',
        });
      }
    } else {
      // No matches left, revert to matching
      result.requestUpdates.push({
        requestId,
        newStatus: 'matching',
        reason: 'All matchings cancelled, request reverted to matching status',
      });
    }
  }

  return result;
}
