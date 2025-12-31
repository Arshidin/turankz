import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';
import type { AcceptanceCriteria } from '@/lib/livestock-criteria';
import { 
  type PoolRequestLifecycleStatus,
  validatePoolRequestTransition,
  type PoolRequestRole,
} from '@/lib/pool-request-lifecycle';

// Updated status type to match new lifecycle
export type PoolRequestStatus = PoolRequestLifecycleStatus;

export interface PoolRequest {
  id: string;
  request_number: string;
  mpk_id: string;
  mpk_name: string;
  target_week: string;
  target_delivery_period: 'short_term' | 'mid_term' | 'long_term' | null;
  required_volume: number;
  required_grade: string;
  regions: string[];
  matched_volume: number;
  status: PoolRequestStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Acceptance criteria
  accepted_breeds: string[];
  accepted_genders: string[];
  age_range_min: number | null;
  age_range_max: number | null;
  weight_range_min: number | null;
  weight_range_max: number | null;
}

export type MatchingStatus = 'active' | 'finalized' | 'cancelled';

export interface PoolMatch {
  id: string;
  request_id: string;
  batch_id: string;
  heads_matched: number;
  status: MatchingStatus;
  matching_date: string;
  created_by: string | null;
  created_at: string;
  finalized_at: string | null;
  cancelled_at: string | null;
  cancellation_reason: string | null;
  notes: string | null;
  matching_window_id: string | null;
}

export function usePoolRequests() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['pool-requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('purchase_pool_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as PoolRequest[];
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel('pool-requests-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'purchase_pool_requests' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['pool-requests'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return query;
}

export function useUpdatePoolRequest() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<PoolRequest> & { id: string }) => {
      const { data, error } = await supabase
        .from('purchase_pool_requests')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pool-requests'] });
    },
    onError: (error) => {
      toast({
        title: 'Error updating request',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function usePoolMatches(requestId: string | null) {
  return useQuery({
    queryKey: ['pool-matches', requestId],
    queryFn: async () => {
      if (!requestId) return [];
      const { data, error } = await supabase
        .from('pool_matches')
        .select('*')
        .eq('request_id', requestId);

      if (error) throw error;
      return data as PoolMatch[];
    },
    enabled: !!requestId,
  });
}

export function useCreatePoolMatch() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (matches: Array<{
      request_id: string;
      batch_id: string;
      heads_matched: number;
      status?: MatchingStatus;
    }>) => {
      const insertData = matches.map(m => ({
        request_id: m.request_id,
        batch_id: m.batch_id,
        heads_matched: m.heads_matched,
        status: m.status || 'active' as MatchingStatus,
        matching_date: new Date().toISOString().split('T')[0],
      }));
      
      const { data, error } = await supabase
        .from('pool_matches')
        .insert(insertData)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pool-matches'] });
      queryClient.invalidateQueries({ queryKey: ['pool-requests'] });
      toast({
        title: 'Match proposed',
        description: 'The match has been proposed successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error creating match',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useAvailableBatchesForMatching() {
  return useQuery({
    queryKey: ['batches-for-matching'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('batches')
        .select('id, batch_number, region, status, grade, heads, breed, gender, age_min, age_max, weight_min, weight_max, standard_status')
        .in('status', ['confirmed', 'soft_committed', 'forecast'])
        .order('status', { ascending: true });

      if (error) throw error;
      return data;
    },
  });
}

// Generate a request number
function generateRequestNumber() {
  const year = new Date().getFullYear();
  const num = Math.floor(100 + Math.random() * 900);
  return `REQ-${year}-${num}`;
}

// Create new pool request
export function useCreatePoolRequest() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (request: {
      mpk_id: string;
      mpk_name: string;
      required_volume: number;
      required_grade: string;
      regions: string[];
      target_week: string;
      target_delivery_period?: 'short_term' | 'mid_term' | 'long_term';
      notes: string | null;
      // Acceptance criteria
      accepted_breeds?: string[];
      accepted_genders?: string[];
      age_range_min?: number | null;
      age_range_max?: number | null;
      weight_range_min?: number | null;
      weight_range_max?: number | null;
    }) => {
      const { data, error } = await supabase
        .from('purchase_pool_requests')
        .insert({
          ...request,
          request_number: generateRequestNumber(),
          matched_volume: 0,
          status: 'draft' as PoolRequestStatus, // All new requests start as 'draft' (must be submitted explicitly)
          target_delivery_period: request.target_delivery_period || 'short_term',
          accepted_breeds: request.accepted_breeds || [],
          accepted_genders: request.accepted_genders || [],
          age_range_min: request.age_range_min ?? null,
          age_range_max: request.age_range_max ?? null,
          weight_range_min: request.weight_range_min ?? null,
          weight_range_max: request.weight_range_max ?? null,
        })
        .select()
        .single();

      if (error) throw error;
      return data as PoolRequest;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pool-requests'] });
      toast({
        title: 'Request created',
        description: 'Your purchase request has been created as draft. Submit it when ready.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error creating request',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

// Cancel pool request
export function useCancelPoolRequest() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('purchase_pool_requests')
        .update({ status: 'cancelled' as PoolRequestStatus })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pool-requests'] });
      toast({
        title: 'Request cancelled',
        description: 'The purchase request has been cancelled.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error cancelling request',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

// Transition pool request status with FSM validation
export function useTransitionPoolRequestStatus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      id,
      fromStatus,
      toStatus,
      role,
    }: {
      id: string;
      fromStatus: PoolRequestLifecycleStatus;
      toStatus: PoolRequestLifecycleStatus;
      role: PoolRequestRole;
    }) => {
      // Validate transition
      const validation = validatePoolRequestTransition(fromStatus, toStatus, role);
      
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      const { data, error } = await supabase
        .from('purchase_pool_requests')
        .update({ status: toStatus })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pool-requests'] });
      toast({
        title: 'Status updated',
        description: `Request status changed to ${variables.toStatus}.`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Transition blocked',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

// Helper to extract acceptance criteria from a request
export function getAcceptanceCriteria(request: PoolRequest): AcceptanceCriteria {
  return {
    accepted_breeds: request.accepted_breeds || [],
    accepted_genders: request.accepted_genders || [],
    age_range_min: request.age_range_min,
    age_range_max: request.age_range_max,
    weight_range_min: request.weight_range_min,
    weight_range_max: request.weight_range_max,
  };
}
