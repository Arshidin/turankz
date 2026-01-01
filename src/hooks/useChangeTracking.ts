import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useRole } from '@/contexts/RoleContext';
import { logActivity, type ActivityEventType } from '@/hooks/useActivityLog';
import { logger } from '@/lib/logger';

export interface ChangeRecord {
  entityType: 'batch' | 'pool_request';
  entityId: string;
  changeType: string;
  fieldName: string;
  previousValue: string | null;
  newValue: string | null;
  reason?: string;
  requiresReview?: boolean;
}

/**
 * Hook for tracking and logging data changes
 * Provides audit trail for sensitive modifications
 */
export function useChangeTracking() {
  const { role, roleName } = useRole();

  /**
   * Log a change to the activity log
   */
  const trackChange = useCallback(async (record: ChangeRecord) => {
    const eventType: ActivityEventType = record.entityType === 'batch' 
      ? 'batch_confirmed' // Using closest available type
      : 'pool_request_updated';

    const description = `${record.fieldName} changed from "${record.previousValue || 'none'}" to "${record.newValue}"`;

    try {
      await logActivity({
        event_type: eventType,
        actor_role: role,
        actor_name: roleName,
        target_type: record.entityType,
        target_id: record.entityId,
        description,
        metadata: {
          change_type: record.changeType,
          field_name: record.fieldName,
          previous_value: record.previousValue,
          new_value: record.newValue,
          reason: record.reason,
          requires_review: record.requiresReview,
        },
      });
      
      return { success: true };
    } catch (error) {
      logger.error('Failed to log change tracking', error, { action: 'logChange', changeRecord });
      return { success: false, error };
    }
  }, [role, roleName]);

  /**
   * Track a batch quantity change
   */
  const trackBatchQuantityChange = useCallback((
    batchId: string,
    previousQuantity: number,
    newQuantity: number,
    reason?: string
  ) => {
    const isReduction = newQuantity < previousQuantity;
    return trackChange({
      entityType: 'batch',
      entityId: batchId,
      changeType: isReduction ? 'quantity_reduction' : 'quantity_increase',
      fieldName: 'Quantity (heads)',
      previousValue: String(previousQuantity),
      newValue: String(newQuantity),
      reason,
      requiresReview: isReduction,
    });
  }, [trackChange]);

  /**
   * Track a batch readiness change
   */
  const trackReadinessChange = useCallback((
    batchId: string,
    previousStatus: string,
    newStatus: string,
    reason?: string
  ) => {
    const isDowngrade = 
      (previousStatus === 'confirmed' && newStatus !== 'confirmed') ||
      (previousStatus === 'soft_committed' && newStatus === 'forecast');
    
    return trackChange({
      entityType: 'batch',
      entityId: batchId,
      changeType: isDowngrade ? 'readiness_downgrade' : 'readiness_upgrade',
      fieldName: 'Readiness Status',
      previousValue: previousStatus,
      newValue: newStatus,
      reason,
      requiresReview: isDowngrade,
    });
  }, [trackChange]);

  /**
   * Track a batch month change
   */
  const trackMonthChange = useCallback((
    batchId: string,
    previousMonth: string,
    newMonth: string,
    reason?: string
  ) => {
    const isDelay = new Date(newMonth) > new Date(previousMonth);
    return trackChange({
      entityType: 'batch',
      entityId: batchId,
      changeType: isDelay ? 'month_delay' : 'month_advance',
      fieldName: 'Target Week',
      previousValue: previousMonth,
      newValue: newMonth,
      reason,
      requiresReview: isDelay,
    });
  }, [trackChange]);

  /**
   * Track a pool request volume change
   */
  const trackVolumeChange = useCallback((
    requestId: string,
    previousVolume: number,
    newVolume: number,
    reason?: string
  ) => {
    return trackChange({
      entityType: 'pool_request',
      entityId: requestId,
      changeType: 'volume_change',
      fieldName: 'Required Volume',
      previousValue: String(previousVolume),
      newValue: String(newVolume),
      reason,
      requiresReview: true,
    });
  }, [trackChange]);

  /**
   * Track a pool request region change
   */
  const trackRegionChange = useCallback((
    requestId: string,
    previousRegions: string[],
    newRegions: string[],
    reason?: string
  ) => {
    return trackChange({
      entityType: 'pool_request',
      entityId: requestId,
      changeType: 'region_change',
      fieldName: 'Regions',
      previousValue: previousRegions.join(', '),
      newValue: newRegions.join(', '),
      reason,
      requiresReview: true,
    });
  }, [trackChange]);

  /**
   * Track a pool request target week change
   */
  const trackTargetWeekChange = useCallback((
    requestId: string,
    previousWeek: string,
    newWeek: string,
    reason?: string
  ) => {
    return trackChange({
      entityType: 'pool_request',
      entityId: requestId,
      changeType: 'target_week_change',
      fieldName: 'Target Week',
      previousValue: previousWeek,
      newValue: newWeek,
      reason,
      requiresReview: true,
    });
  }, [trackChange]);

  return {
    trackChange,
    trackBatchQuantityChange,
    trackReadinessChange,
    trackMonthChange,
    trackVolumeChange,
    trackRegionChange,
    trackTargetWeekChange,
  };
}
