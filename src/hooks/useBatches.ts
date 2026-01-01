import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { logger } from '@/lib/logger';
import { 
  type BatchLifecycleStatus, 
  isTransitionAllowed, 
  validateTransition,
  INITIAL_BATCH_STATUS,
  enforceInitialStatus,
} from '@/lib/batch-lifecycle';

// Use the strict lifecycle status type
export type BatchStatus = BatchLifecycleStatus;

export interface Batch {
  id: string;
  batch_number: string;
  user_id: string;
  heads: number;
  avg_weight: number | null;
  grade: string;
  region: string;
  status: BatchStatus;
  target_week: string;
  delivery_period: 'short_term' | 'mid_term' | 'long_term' | null;
  notes: string | null;
  mpk_interest: string | null;
  requires_action: boolean;
  action_type: 'confirm' | 'review' | 'update' | null;
  created_at: string;
  updated_at: string;
  standard_status: string | null;
  // Livestock criteria
  breed: string | null;
  gender: string | null;
  age_min: number | null;
  age_max: number | null;
  weight_min: number | null;
  weight_max: number | null;
}

export const useBatches = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['batches'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('batches')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Batch[];
    },
  });

  // Set up real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('batches-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'batches',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['batches'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return query;
};

export const useBatch = (batchNumber: string | undefined) => {
  return useQuery({
    queryKey: ['batch', batchNumber],
    queryFn: async () => {
      if (!batchNumber) return null;

      const { data, error } = await supabase
        .from('batches')
        .select('*')
        .eq('batch_number', batchNumber)
        .maybeSingle();

      if (error) throw error;
      return data as Batch | null;
    },
    enabled: !!batchNumber,
  });
};

export const useUpdateBatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Batch> & { id: string }) => {
      const { data, error } = await supabase
        .from('batches')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Batch;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['batches'] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update batch. Please try again.',
        variant: 'destructive',
      });
    },
  });
};

export const useConfirmBatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('batches')
        .update({ 
          status: 'confirmed' as BatchStatus,
          requires_action: false,
          action_type: null,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Batch;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      toast({
        title: 'Batch Confirmed',
        description: `${data.batch_number} has been confirmed for ${data.target_week}.`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to confirm batch. Please try again.',
        variant: 'destructive',
      });
    },
  });
};

export const useCreateBatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (batch: Omit<Batch, 'id' | 'created_at' | 'updated_at'>) => {
      // STRICT ENFORCEMENT: All new batches must start as Draft
      // Any external status input is ignored and overwritten
      const enforcedBatch = enforceInitialStatus(batch);
      
      const { data, error } = await supabase
        .from('batches')
        .insert(enforcedBatch)
        .select()
        .single();

      if (error) throw error;
      return data as Batch;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      toast({
        title: 'Batch Created',
        description: `New batch has been created with status "${INITIAL_BATCH_STATUS}".`,
      });
    },
    onError: (error) => {
      logger.error('Failed to create batch', error, { action: 'createBatch' });
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create batch. Please try again.',
        variant: 'destructive',
      });
    },
  });
};

// Helper to get batches requiring action
export const useBatchesRequiringAction = () => {
  return useQuery({
    queryKey: ['batches', 'requiring-action'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('batches')
        .select('*')
        .eq('requires_action', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Batch[];
    },
  });
};

// Get batch stats
export const useBatchStats = () => {
  const { data: batches } = useBatches();

  if (!batches) {
    return {
      total: 0,
      confirmed: 0,
      softCommitted: 0,
      forecast: 0,
      requiresAction: 0,
    };
  }

  return {
    total: batches.length,
    confirmed: batches.filter(b => b.status === 'confirmed').length,
    softCommitted: batches.filter(b => b.status === 'soft_committed').length,
    forecast: batches.filter(b => b.status === 'forecast').length,
    requiresAction: batches.filter(b => b.requires_action).length,
  };
};

// Helper to get batch criteria for matching
export function getBatchCriteria(batch: Batch) {
  return {
    breed: batch.breed,
    gender: batch.gender,
    age_min: batch.age_min,
    age_max: batch.age_max,
    weight_min: batch.weight_min,
    weight_max: batch.weight_max,
  };
}
