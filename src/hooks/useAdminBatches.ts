import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { calculateStandardStatus, type StandardStatus } from '@/lib/standard-status';
import { logger } from '@/lib/logger';

interface UpdateStandardStatusParams {
  batchId: string;
  standardStatus: StandardStatus;
  adminNote?: string;
}

export type { StandardStatus };

export function useUpdateBatchStandardStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ batchId, standardStatus, adminNote }: UpdateStandardStatusParams) => {
      const { data, error } = await supabase
        .from('batches')
        .update({ standard_status: standardStatus })
        .eq('id', batchId)
        .select()
        .single();

      if (error) throw error;

      // Log to activity log
      await supabase.from('activity_log').insert({
        event_type: 'batch_confirmed',
        actor_role: 'admin',
        actor_name: 'Admin',
        description: `Standard status updated to ${standardStatus}`,
        target_type: 'batch',
        target_id: batchId,
        metadata: { standard_status: standardStatus, note: adminNote },
      });

      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['batches-for-matching'] });
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      toast.success(`Batch standard status updated to ${variables.standardStatus.replace('_', ' ')}`);
    },
    onError: (error) => {
      logger.error('Failed to update batch standard status', error, { action: 'updateStandardStatus' });
      toast.error('Failed to update standard status');
    },
  });
}

// Bulk update standard status for multiple batches
export function useBulkUpdateStandardStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ batchIds, standardStatus }: { batchIds: string[]; standardStatus: StandardStatus }) => {
      const { error } = await supabase
        .from('batches')
        .update({ standard_status: standardStatus })
        .in('id', batchIds);

      if (error) throw error;

      // Log bulk action
      await supabase.from('activity_log').insert({
        event_type: 'batch_confirmed',
        actor_role: 'admin',
        actor_name: 'Admin',
        description: `Bulk update: ${batchIds.length} batches set to ${standardStatus}`,
        metadata: { batch_count: batchIds.length, standard_status: standardStatus },
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['batches-for-matching'] });
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      toast.success(`${variables.batchIds.length} batches updated to ${variables.standardStatus.replace('_', ' ')}`);
    },
    onError: (error) => {
      logger.error('Failed to bulk update standard status', error, { action: 'bulkUpdateStandardStatus' });
      toast.error('Failed to update standard status');
    },
  });
}

// Auto-calculate and apply standard status for multiple batches
export function useAutoCalculateStandardStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (batches: Array<{
      id: string;
      breed: string | null;
      gender: string | null;
      age_min: number | null;
      age_max: number | null;
      weight_min: number | null;
      weight_max: number | null;
    }>) => {
      const updates: { id: string; status: StandardStatus }[] = [];
      
      for (const batch of batches) {
        const result = calculateStandardStatus({
          breed: batch.breed,
          gender: batch.gender,
          age_min: batch.age_min,
          age_max: batch.age_max,
          weight_min: batch.weight_min,
          weight_max: batch.weight_max,
        });
        updates.push({ id: batch.id, status: result.status });
      }

      // Group by status for batch updates
      const byStatus = updates.reduce((acc, u) => {
        if (!acc[u.status]) acc[u.status] = [];
        acc[u.status].push(u.id);
        return acc;
      }, {} as Record<StandardStatus, string[]>);

      // Update each status group
      for (const [status, ids] of Object.entries(byStatus)) {
        if (ids.length > 0) {
          const { error } = await supabase
            .from('batches')
            .update({ standard_status: status })
            .in('id', ids);

          if (error) throw error;
        }
      }

      // Log the action
      await supabase.from('activity_log').insert({
        event_type: 'batch_confirmed',
        actor_role: 'admin',
        actor_name: 'Admin',
        description: `Auto-calculated standard status for ${batches.length} batches`,
        metadata: {
          batch_count: batches.length,
          results: {
            high_standard: byStatus.high_standard?.length || 0,
            standard: byStatus.standard?.length || 0,
            non_standard: byStatus.non_standard?.length || 0,
          },
        },
      });

      return {
        total: batches.length,
        results: {
          high_standard: byStatus.high_standard?.length || 0,
          standard: byStatus.standard?.length || 0,
          non_standard: byStatus.non_standard?.length || 0,
        },
      };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['batches-for-matching'] });
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      toast.success(
        `Auto-calculated: ${result.results.high_standard} High Standard, ${result.results.standard} Standard, ${result.results.non_standard} Non-Standard`
      );
    },
    onError: (error) => {
      logger.error('Failed to auto-calculate standard status', error, { action: 'autoCalculateStandardStatus' });
      toast.error('Failed to auto-calculate standard status');
    },
  });
}

