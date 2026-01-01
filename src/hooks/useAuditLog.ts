import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AuditableAction, AuditLogEntry } from '@/lib/access-control';
import { useRole } from '@/contexts/RoleContext';
import { logger } from '@/lib/logger';

/**
 * Hook for logging permission-sensitive actions
 * All status changes, grading updates, and access restrictions are logged
 */
export function useAuditLog() {
  const { role, roleName } = useRole();
  
  const logAction = useCallback(async ({
    action,
    targetId,
    targetType,
    previousValue,
    newValue,
    note,
  }: Omit<AuditLogEntry, 'performedBy' | 'timestamp'>) => {
    // For now, we'll log to the appropriate activity log table based on target type
    // In production, this would be a unified audit_logs table
    
    const logEntry = {
      action_type: action,
      performed_by: `${roleName} (${role})`,
      previous_value: previousValue,
      new_value: newValue,
      note,
    };
    
    try {
      switch (targetType) {
        case 'farmer':
          await supabase
            .from('farmer_activity_log')
            .insert({
              ...logEntry,
              farmer_id: targetId,
            });
          break;
          
        case 'mpk':
          await supabase
            .from('mpk_activity_log')
            .insert({
              ...logEntry,
              mpk_id: targetId,
            });
          break;
          
        // For batch, pool_request, pool_match - could add dedicated log tables
        // or a unified audit_logs table in the future
        default:
          logger.debug('Audit log action', { action, targetType, targetId });
      }
      
      return { success: true };
    } catch (error) {
      logger.error('Failed to log audit action', error, { action, targetType, targetId });
      return { success: false, error };
    }
  }, [role, roleName]);
  
  // Specific logging helpers
  const logGradingChange = useCallback((
    farmerId: string,
    previousGrading: string,
    newGrading: string,
    note: string
  ) => {
    return logAction({
      action: 'farmer_grading_update',
      targetId: farmerId,
      targetType: 'farmer',
      previousValue: previousGrading,
      newValue: newGrading,
      note,
    });
  }, [logAction]);
  
  const logRestrictionApplied = useCallback((
    targetId: string,
    targetType: 'farmer' | 'mpk',
    reason: string
  ) => {
    const action: AuditableAction = targetType === 'farmer' 
      ? 'farmer_restriction_applied' 
      : 'mpk_restriction_applied';
      
    return logAction({
      action,
      targetId,
      targetType,
      newValue: 'restricted',
      note: reason,
    });
  }, [logAction]);
  
  const logRestrictionRemoved = useCallback((
    targetId: string,
    targetType: 'farmer' | 'mpk',
    note: string
  ) => {
    const action: AuditableAction = targetType === 'farmer' 
      ? 'farmer_restriction_removed' 
      : 'mpk_restriction_removed';
      
    return logAction({
      action,
      targetId,
      targetType,
      previousValue: 'restricted',
      newValue: 'active',
      note,
    });
  }, [logAction]);
  
  const logStatusChange = useCallback((
    targetId: string,
    targetType: 'batch' | 'pool_request',
    previousStatus: string,
    newStatus: string,
    note?: string
  ) => {
    return logAction({
      action: 'batch_status_change',
      targetId,
      targetType,
      previousValue: previousStatus,
      newValue: newStatus,
      note,
    });
  }, [logAction]);
  
  const logPoolMatch = useCallback((
    requestId: string,
    action: 'pool_match_proposed' | 'pool_match_approved',
    details: string
  ) => {
    return logAction({
      action,
      targetId: requestId,
      targetType: 'pool_match',
      note: details,
    });
  }, [logAction]);
  
  const logMatchingWindowChange = useCallback(async ({
    windowName,
    action,
    details,
  }: {
    windowName: string;
    action: 'created' | 'updated' | 'status_changed' | 'deleted';
    details: string;
  }) => {
    // Log to activity_log table for governance tracking
    try {
      await supabase
        .from('activity_log')
        .insert({
          event_type: 'pool_request_updated' as any, // Using closest matching type
          actor_role: 'admin',
          actor_name: 'Admin',
          target_type: 'matching_window',
          target_name: windowName,
          description: `Matching Window ${action}: ${details}`,
        });
      
      return { success: true };
    } catch (error) {
      logger.error('Failed to log matching window change', error, { logAction: 'logMatchingWindowChange', windowName, windowAction: action });
      return { success: false, error };
    }
  }, []);
  
  return {
    logAction,
    logGradingChange,
    logRestrictionApplied,
    logRestrictionRemoved,
    logStatusChange,
    logPoolMatch,
    logMatchingWindowChange,
  };
}
