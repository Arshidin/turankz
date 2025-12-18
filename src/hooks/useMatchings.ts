import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useRole } from '@/contexts/RoleContext';
import { useEffect } from 'react';
import {
  type MatchingLifecycleStatus,
  validateMatchingTransition,
  canCreateMatching,
  type MatchingActionType,
} from '@/lib/matching-lifecycle';
import type { MatchingWindow } from '@/lib/matching-window';

export interface Matching {
  id: string;
  batch_id: string;
  request_id: string;
  heads_matched: number;
  matching_date: string;
  status: MatchingLifecycleStatus;
  created_by: string | null;
  created_at: string;
  finalized_at: string | null;
  cancelled_at: string | null;
  cancellation_reason: string | null;
  notes: string | null;
  matching_window_id: string | null;
}

export interface MatchingWithDetails extends Matching {
  batch?: {
    batch_number: string;
    region: string;
    grade: string;
    status: string;
  };
  request?: {
    request_number: string;
    mpk_name: string;
    target_week: string;
    required_grade: string;
  };
}

/**
 * Hook to fetch all matchings
 */
export function useMatchings(requestId?: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['matchings', requestId],
    queryFn: async () => {
      let queryBuilder = supabase
        .from('pool_matches')
        .select('*')
        .order('created_at', { ascending: false });

      if (requestId) {
        queryBuilder = queryBuilder.eq('request_id', requestId);
      }

      const { data, error } = await queryBuilder;
      if (error) throw error;
      return data as Matching[];
    },
  });

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('matchings-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'pool_matches' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['matchings'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return query;
}

/**
 * Hook to fetch matchings with batch and request details
 */
export function useMatchingsWithDetails(requestId?: string) {
  return useQuery({
    queryKey: ['matchings-details', requestId],
    queryFn: async () => {
      let queryBuilder = supabase
        .from('pool_matches')
        .select(`
          *,
          batches:batch_id (
            batch_number,
            region,
            grade,
            status
          ),
          purchase_pool_requests:request_id (
            request_number,
            mpk_name,
            target_week,
            required_grade
          )
        `)
        .order('created_at', { ascending: false });

      if (requestId) {
        queryBuilder = queryBuilder.eq('request_id', requestId);
      }

      const { data, error } = await queryBuilder;
      if (error) throw error;

      return data.map(item => ({
        ...item,
        batch: item.batches,
        request: item.purchase_pool_requests,
      })) as MatchingWithDetails[];
    },
  });
}

/**
 * Hook for creating matchings
 */
export function useCreateMatching() {
  const { toast } = useToast();
  const { role, roleName } = useRole();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      matches,
      matchingWindow,
      notes,
    }: {
      matches: Array<{
        request_id: string;
        batch_id: string;
        heads_matched: number;
      }>;
      matchingWindow: MatchingWindow | null;
      notes?: string;
    }) => {
      // Validate admin role
      if (role !== 'admin') {
        throw new Error('Only admins can create matchings');
      }

      // Validate matching window state
      const canCreate = canCreateMatching(matchingWindow);
      if (!canCreate.allowed) {
        throw new Error(canCreate.reason);
      }

      // Insert matchings
      const insertData = matches.map(m => ({
        request_id: m.request_id,
        batch_id: m.batch_id,
        heads_matched: m.heads_matched,
        matching_date: new Date().toISOString().split('T')[0],
        status: 'active' as MatchingLifecycleStatus,
        created_by: roleName,
        notes: notes || null,
        matching_window_id: matchingWindow?.id || null,
      }));

      const { data, error } = await supabase
        .from('pool_matches')
        .insert(insertData)
        .select();

      if (error) throw error;

      // Log each matching creation
      for (const match of data) {
        await supabase.from('matching_activity_log').insert({
          match_id: match.id,
          action_type: 'created',
          new_value: `${match.heads_matched} heads matched`,
          performed_by: `${roleName} (${role})`,
          note: notes || null,
        });
      }

      return data as Matching[];
    },
    onSuccess: (data) => {
      toast({
        title: 'Matchings Created',
        description: `${data.length} matching(s) created successfully.`,
      });
      queryClient.invalidateQueries({ queryKey: ['matchings'] });
      queryClient.invalidateQueries({ queryKey: ['pool-requests'] });
      queryClient.invalidateQueries({ queryKey: ['batches'] });
    },
    onError: (error) => {
      toast({
        title: 'Error Creating Matchings',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook for finalizing matchings
 */
export function useFinalizeMatching() {
  const { toast } = useToast();
  const { role, roleName } = useRole();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      matchId,
      note,
    }: {
      matchId: string;
      note?: string;
    }) => {
      if (role !== 'admin') {
        throw new Error('Only admins can finalize matchings');
      }

      // Get current status
      const { data: current, error: fetchError } = await supabase
        .from('pool_matches')
        .select('status')
        .eq('id', matchId)
        .single();

      if (fetchError) throw fetchError;

      // Validate transition
      const validation = validateMatchingTransition(current.status, 'finalized');
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      // Update status
      const { data, error } = await supabase
        .from('pool_matches')
        .update({
          status: 'finalized',
          finalized_at: new Date().toISOString(),
        })
        .eq('id', matchId)
        .select()
        .single();

      if (error) throw error;

      // Log action
      await supabase.from('matching_activity_log').insert({
        match_id: matchId,
        action_type: 'finalized',
        previous_value: current.status,
        new_value: 'finalized',
        performed_by: `${roleName} (${role})`,
        note: note || null,
      });

      return data as Matching;
    },
    onSuccess: () => {
      toast({
        title: 'Matching Finalized',
        description: 'The matching has been finalized.',
      });
      queryClient.invalidateQueries({ queryKey: ['matchings'] });
    },
    onError: (error) => {
      toast({
        title: 'Error Finalizing Matching',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook for cancelling matchings
 */
export function useCancelMatching() {
  const { toast } = useToast();
  const { role, roleName } = useRole();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      matchId,
      reason,
    }: {
      matchId: string;
      reason: string;
    }) => {
      if (role !== 'admin') {
        throw new Error('Only admins can cancel matchings');
      }

      if (!reason.trim()) {
        throw new Error('Cancellation reason is required');
      }

      // Get current status
      const { data: current, error: fetchError } = await supabase
        .from('pool_matches')
        .select('status, heads_matched, request_id')
        .eq('id', matchId)
        .single();

      if (fetchError) throw fetchError;

      // Validate transition
      const validation = validateMatchingTransition(current.status, 'cancelled');
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      // Update status
      const { data, error } = await supabase
        .from('pool_matches')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
          cancellation_reason: reason,
        })
        .eq('id', matchId)
        .select()
        .single();

      if (error) throw error;

      // Update the pool request matched_volume (subtract cancelled heads)
      // Get current request and update
      const { data: req } = await supabase
        .from('purchase_pool_requests')
        .select('matched_volume')
        .eq('id', current.request_id)
        .single();

      if (req) {
        await supabase
          .from('purchase_pool_requests')
          .update({ matched_volume: Math.max(0, req.matched_volume - current.heads_matched) })
          .eq('id', current.request_id);
      }

      // Log action
      await supabase.from('matching_activity_log').insert({
        match_id: matchId,
        action_type: 'cancelled',
        previous_value: current.status,
        new_value: 'cancelled',
        performed_by: `${roleName} (${role})`,
        note: reason,
      });

      return data as Matching;
    },
    onSuccess: () => {
      toast({
        title: 'Matching Cancelled',
        description: 'The matching has been cancelled.',
      });
      queryClient.invalidateQueries({ queryKey: ['matchings'] });
      queryClient.invalidateQueries({ queryKey: ['pool-requests'] });
    },
    onError: (error) => {
      toast({
        title: 'Error Cancelling Matching',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook to fetch matching activity history
 */
export function useMatchingActivityHistory(matchId: string | null) {
  return useQuery({
    queryKey: ['matching-activity', matchId],
    queryFn: async () => {
      if (!matchId) return [];

      const { data, error } = await supabase
        .from('matching_activity_log')
        .select('*')
        .eq('match_id', matchId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!matchId,
  });
}
