import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type StandardStatus = 'non_standard' | 'standard' | 'high_standard';

interface UpdateStandardStatusParams {
  batchId: string;
  standardStatus: StandardStatus;
  adminNote?: string;
}

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
      console.error('Error updating standard status:', error);
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
      console.error('Error bulk updating standard status:', error);
      toast.error('Failed to update standard status');
    },
  });
}
