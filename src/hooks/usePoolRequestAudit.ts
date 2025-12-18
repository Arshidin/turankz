import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useRole } from '@/contexts/RoleContext';
import type { PoolRequest, PoolRequestStatus } from './usePoolRequests';
import type { Database } from '@/integrations/supabase/types';

type PoolRequestActivityLogInsert = Database['public']['Tables']['pool_request_activity_log']['Insert'];

export interface PoolRequestActivityLog {
  id: string;
  request_id: string;
  action_type: string;
  previous_value: string | null;
  new_value: string | null;
  performed_by: string;
  is_admin_override: boolean;
  override_reason: string | null;
  note: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

// Action types for pool request audit
export type PoolRequestActionType = 
  | 'status_change'
  | 'field_update'
  | 'admin_override'
  | 'created'
  | 'cancelled';

/**
 * Hook for pool request audit logging
 */
export function usePoolRequestAuditLog() {
  const { role, roleName } = useRole();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const logAction = useMutation({
    mutationFn: async ({
      requestId,
      actionType,
      previousValue,
      newValue,
      isAdminOverride = false,
      overrideReason,
      note,
      metadata,
    }: {
      requestId: string;
      actionType: PoolRequestActionType;
      previousValue?: string;
      newValue?: string;
      isAdminOverride?: boolean;
      overrideReason?: string;
      note?: string;
      metadata?: Record<string, unknown>;
    }) => {
      const insertData: PoolRequestActivityLogInsert = {
        request_id: requestId,
        action_type: actionType,
        previous_value: previousValue || null,
        new_value: newValue || null,
        performed_by: `${roleName} (${role})`,
        is_admin_override: isAdminOverride,
        override_reason: overrideReason || null,
        note: note || null,
        metadata: metadata as Database['public']['Tables']['pool_request_activity_log']['Insert']['metadata'],
      };

      const { error } = await supabase
        .from('pool_request_activity_log')
        .insert(insertData);

      if (error) throw error;
      return { success: true };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['pool-request-activity', variables.requestId] 
      });
    },
    onError: (error) => {
      console.error('Failed to log pool request action:', error);
    },
  });

  return { logAction: logAction.mutateAsync };
}

/**
 * Hook to fetch pool request activity history
 */
export function usePoolRequestActivityHistory(requestId: string | null) {
  return useQuery({
    queryKey: ['pool-request-activity', requestId],
    queryFn: async () => {
      if (!requestId) return [];

      const { data, error } = await supabase
        .from('pool_request_activity_log')
        .select('*')
        .eq('request_id', requestId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as PoolRequestActivityLog[];
    },
    enabled: !!requestId,
  });
}

/**
 * Hook for admin override operations on pool requests
 */
export function usePoolRequestAdminOverride() {
  const { toast } = useToast();
  const { role, roleName } = useRole();
  const queryClient = useQueryClient();
  const { logAction } = usePoolRequestAuditLog();

  // Admin modify pool request
  const adminModifyRequest = useMutation({
    mutationFn: async ({
      request,
      updates,
      reason,
    }: {
      request: PoolRequest;
      updates: Partial<PoolRequest>;
      reason: string;
    }) => {
      if (role !== 'admin') {
        throw new Error('Only admins can override pool requests');
      }

      if (!reason.trim() || reason.trim().length < 10) {
        throw new Error('A detailed reason is required for admin overrides (at least 10 characters)');
      }

      // Build change description for audit
      const changes: string[] = [];
      const changedFields: Record<string, { from: unknown; to: unknown }> = {};
      
      const requestAsRecord = request as unknown as Record<string, unknown>;
      
      Object.entries(updates).forEach(([key, value]) => {
        const oldValue = requestAsRecord[key];
        if (JSON.stringify(oldValue) !== JSON.stringify(value)) {
          changes.push(`${key}: ${JSON.stringify(oldValue)} → ${JSON.stringify(value)}`);
          changedFields[key] = { from: oldValue, to: value };
        }
      });

      if (changes.length === 0) {
        throw new Error('No changes detected');
      }

      // Update the request
      const { error: updateError } = await supabase
        .from('purchase_pool_requests')
        .update({
          ...updates,
          admin_modified: true,
          admin_modified_at: new Date().toISOString(),
          admin_modified_by: roleName,
          admin_modification_reason: reason,
        })
        .eq('id', request.id);

      if (updateError) throw updateError;

      // Log the override
      await logAction({
        requestId: request.id,
        actionType: 'admin_override',
        previousValue: JSON.stringify(changedFields),
        newValue: reason,
        isAdminOverride: true,
        overrideReason: reason,
        metadata: {
          changes: changedFields,
          request_number: request.request_number,
        },
      });

      return { requestId: request.id, changes };
    },
    onSuccess: (result, variables) => {
      toast({
        title: 'Request Modified',
        description: `Request ${variables.request.request_number} has been updated via Admin Override.`,
      });
      queryClient.invalidateQueries({ queryKey: ['pool-requests'] });
      queryClient.invalidateQueries({ 
        queryKey: ['pool-request-activity', variables.request.id] 
      });
    },
    onError: (error) => {
      toast({
        title: 'Override Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Admin status change
  const adminChangeStatus = useMutation({
    mutationFn: async ({
      request,
      newStatus,
      reason,
    }: {
      request: PoolRequest;
      newStatus: PoolRequestStatus;
      reason: string;
    }) => {
      if (role !== 'admin') {
        throw new Error('Only admins can override pool request status');
      }

      if (!reason.trim() || reason.trim().length < 10) {
        throw new Error('A detailed reason is required for admin overrides');
      }

      const previousStatus = request.status;

      // Update the request status
      const { error: updateError } = await supabase
        .from('purchase_pool_requests')
        .update({
          status: newStatus,
          admin_modified: true,
          admin_modified_at: new Date().toISOString(),
          admin_modified_by: roleName,
          admin_modification_reason: reason,
        })
        .eq('id', request.id);

      if (updateError) throw updateError;

      // Log the status change
      await logAction({
        requestId: request.id,
        actionType: 'status_change',
        previousValue: previousStatus,
        newValue: newStatus,
        isAdminOverride: true,
        overrideReason: reason,
        metadata: {
          request_number: request.request_number,
          previous_status: previousStatus,
          new_status: newStatus,
        },
      });

      return { requestId: request.id, previousStatus, newStatus };
    },
    onSuccess: (result, variables) => {
      toast({
        title: 'Status Updated',
        description: `Request ${variables.request.request_number} status changed from ${result.previousStatus} to ${result.newStatus}.`,
      });
      queryClient.invalidateQueries({ queryKey: ['pool-requests'] });
      queryClient.invalidateQueries({ 
        queryKey: ['pool-request-activity', variables.request.id] 
      });
    },
    onError: (error) => {
      toast({
        title: 'Status Change Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    adminModifyRequest,
    adminChangeStatus,
    isAdmin: role === 'admin',
  };
}

/**
 * Check if a pool request has been admin-modified
 */
export function usePoolRequestAdminModificationStatus(requestId: string) {
  return useQuery({
    queryKey: ['pool-request-admin-status', requestId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('purchase_pool_requests')
        .select('admin_modified, admin_modified_at, admin_modified_by, admin_modification_reason')
        .eq('id', requestId)
        .single();

      if (error) throw error;
      return {
        isAdminModified: data?.admin_modified ?? false,
        modifiedAt: data?.admin_modified_at,
        modifiedBy: data?.admin_modified_by,
        modificationReason: data?.admin_modification_reason,
      };
    },
    enabled: !!requestId,
  });
}
