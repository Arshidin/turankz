import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';
import { toast } from '@/hooks/use-toast';

export type BatchStatus = 'forecast' | 'soft_committed' | 'confirmed' | 'delivered';

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
  notes: string | null;
  mpk_interest: string | null;
  requires_action: boolean;
  action_type: 'confirm' | 'review' | 'update' | null;
  created_at: string;
  updated_at: string;
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
        (payload) => {
          console.log('Batch change:', payload);
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
      console.error('Error updating batch:', error);
      toast({
        title: 'Error',
        description: 'Failed to update batch. Please try again.',
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
      console.error('Error confirming batch:', error);
      toast({
        title: 'Error',
        description: 'Failed to confirm batch. Please try again.',
        variant: 'destructive',
      });
    },
  });
};

export const useCreateBatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (batch: Omit<Batch, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('batches')
        .insert(batch)
        .select()
        .single();

      if (error) throw error;
      return data as Batch;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      toast({
        title: 'Batch Created',
        description: 'New batch has been added successfully.',
      });
    },
    onError: (error) => {
      console.error('Error creating batch:', error);
      toast({
        title: 'Error',
        description: 'Failed to create batch. Please try again.',
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
