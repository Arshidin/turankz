import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useRole } from '@/contexts/RoleContext';
import { logger } from '@/lib/logger';

export interface AdminOverride {
  id: string;
  created_at: string;
  override_type: 'batch_unlock' | 'window_extend' | 'window_adjust';
  target_type: 'batch' | 'matching_window';
  target_id: string;
  target_name: string | null;
  previous_value: string | null;
  new_value: string | null;
  reason: string;
  performed_by: string;
  metadata: Record<string, unknown> | null;
}

/**
 * Hook for admin override operations
 */
export function useAdminOverride() {
  const { toast } = useToast();
  const { role, roleName } = useRole();
  const queryClient = useQueryClient();

  // Unlock a specific batch (admin only)
  const unlockBatch = useMutation({
    mutationFn: async ({
      batchId,
      batchNumber,
      reason,
    }: {
      batchId: string;
      batchNumber: string;
      reason: string;
    }) => {
      if (role !== 'admin') {
        throw new Error('Only admins can unlock batches');
      }

      if (!reason.trim()) {
        throw new Error('A reason is required for admin overrides');
      }

      // Update batch with admin_unlocked flag
      const { error: batchError } = await supabase
        .from('batches')
        .update({
          admin_unlocked: true,
          admin_unlock_reason: reason,
          admin_unlocked_at: new Date().toISOString(),
          admin_unlocked_by: roleName,
        })
        .eq('id', batchId);

      if (batchError) throw batchError;

      // Log the override action
      const { error: logError } = await supabase
        .from('admin_overrides')
        .insert({
          override_type: 'batch_unlock',
          target_type: 'batch',
          target_id: batchId,
          target_name: batchNumber,
          previous_value: 'locked',
          new_value: 'unlocked',
          reason: reason,
          performed_by: roleName,
          metadata: { batch_id: batchId },
        });

      if (logError) {
        logger.error('Failed to log admin override', logError, { action: 'logAdminOverride', overrideType, targetId });
        // Don't throw - the main action succeeded
      }

      return { batchId };
    },
    onSuccess: (_, variables) => {
      toast({
        title: 'Batch Unlocked',
        description: `Batch ${variables.batchNumber} has been unlocked via Admin Override.`,
      });
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      queryClient.invalidateQueries({ queryKey: ['batch', variables.batchId] });
      queryClient.invalidateQueries({ queryKey: ['admin-overrides'] });
    },
    onError: (error) => {
      toast({
        title: 'Unlock Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Re-lock a batch (remove admin override)
  const relockBatch = useMutation({
    mutationFn: async ({
      batchId,
      batchNumber,
      reason,
    }: {
      batchId: string;
      batchNumber: string;
      reason: string;
    }) => {
      if (role !== 'admin') {
        throw new Error('Only admins can manage batch locks');
      }

      // Remove admin_unlocked flag
      const { error: batchError } = await supabase
        .from('batches')
        .update({
          admin_unlocked: false,
          admin_unlock_reason: null,
          admin_unlocked_at: null,
          admin_unlocked_by: null,
        })
        .eq('id', batchId);

      if (batchError) throw batchError;

      // Log the action
      const { error: logError } = await supabase
        .from('admin_overrides')
        .insert({
          override_type: 'batch_unlock',
          target_type: 'batch',
          target_id: batchId,
          target_name: batchNumber,
          previous_value: 'unlocked (admin)',
          new_value: 'locked',
          reason: reason,
          performed_by: roleName,
          metadata: { batch_id: batchId, action: 'relock' },
        });

      if (logError) {
        logger.error('Failed to log admin relock', logError, { action: 'logAdminRelock', targetId });
      }

      return { batchId };
    },
    onSuccess: (_, variables) => {
      toast({
        title: 'Batch Re-Locked',
        description: `Batch ${variables.batchNumber} is now locked again.`,
      });
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      queryClient.invalidateQueries({ queryKey: ['batch', variables.batchId] });
      queryClient.invalidateQueries({ queryKey: ['admin-overrides'] });
    },
    onError: (error) => {
      toast({
        title: 'Re-Lock Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    unlockBatch,
    relockBatch,
    isAdmin: role === 'admin',
  };
}

/**
 * Hook to fetch admin override history
 */
export function useAdminOverrideHistory(targetType?: string, targetId?: string) {
  return useQuery({
    queryKey: ['admin-overrides', targetType, targetId],
    queryFn: async () => {
      let query = supabase
        .from('admin_overrides')
        .select('*')
        .order('created_at', { ascending: false });

      if (targetType) {
        query = query.eq('target_type', targetType);
      }
      if (targetId) {
        query = query.eq('target_id', targetId);
      }

      const { data, error } = await query.limit(50);

      if (error) throw error;
      return data as AdminOverride[];
    },
  });
}

/**
 * Check if a batch has been admin-unlocked
 */
export function useBatchAdminUnlockStatus(batchId: string) {
  return useQuery({
    queryKey: ['batch-admin-unlock', batchId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('batches')
        .select('admin_unlocked, admin_unlock_reason, admin_unlocked_at, admin_unlocked_by')
        .eq('id', batchId)
        .single();

      if (error) throw error;
      return {
        isAdminUnlocked: data?.admin_unlocked ?? false,
        unlockReason: data?.admin_unlock_reason,
        unlockedAt: data?.admin_unlocked_at,
        unlockedBy: data?.admin_unlocked_by,
      };
    },
    enabled: !!batchId,
  });
}
