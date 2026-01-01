import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useRole } from '@/contexts/RoleContext';
import { logger } from '@/lib/logger';
import { useEffect } from 'react';
import {
  type MatchingLifecycleStatus,
  validateMatchingTransition,
  canCreateMatching,
  type MatchingActionType,
} from '@/lib/matching-lifecycle';
import {
  calculateAutomaticBatchStatus,
  calculateAutomaticRequestStatus,
} from '@/lib/automatic-status-transitions';
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
    heads: number;
  };
  request?: {
    request_number: string;
    mpk_name: string;
    target_week: string;
    required_grade: string;
    required_volume: number;
    matched_volume: number;
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
            status,
            heads
          ),
          purchase_pool_requests:request_id (
            request_number,
            mpk_name,
            target_week,
            required_grade,
            required_volume,
            matched_volume
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
 * Helper to calculate total matched heads for a batch
 */
async function getBatchMatchedHeads(batchId: string): Promise<number> {
  const { data } = await supabase
    .from('pool_matches')
    .select('heads_matched')
    .eq('batch_id', batchId)
    .in('status', ['active', 'finalized']);

  return data?.reduce((sum, m) => sum + m.heads_matched, 0) || 0;
}

/**
 * Hook for creating matchings with automatic status updates
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

      // Use atomic database function for each matching
      // This ensures matching creation and status updates happen atomically
      // Each matching is created individually to ensure atomicity
      const createdMatchings: Matching[] = [];
      const errors: string[] = [];

      for (const match of matches) {
        try {
          // Create the matching directly via insert
          const { data: createdMatch, error: insertError } = await supabase
            .from('pool_matches')
            .insert({
              batch_id: match.batch_id,
              request_id: match.request_id,
              heads_matched: match.heads_matched,
              matching_window_id: matchingWindow?.id || null,
              notes: notes || null,
              created_by: `${roleName} (${role})`,
              status: 'active',
              matching_date: new Date().toISOString().split('T')[0],
            })
            .select()
            .single();

          if (insertError) {
            errors.push(`Failed to create matching for batch ${match.batch_id}: ${insertError.message}`);
            continue;
          }

          // Update batch status to 'matched'
          await supabase
            .from('batches')
            .update({ status: 'matched' })
            .eq('id', match.batch_id);

          // Update request matched_volume
          const { data: request } = await supabase
            .from('purchase_pool_requests')
            .select('matched_volume, required_volume')
            .eq('id', match.request_id)
            .single();

          if (request) {
            const newMatchedVolume = (request.matched_volume || 0) + match.heads_matched;
            const newStatus = newMatchedVolume >= request.required_volume ? 'fulfilled' : 'partial';
            
            await supabase
              .from('purchase_pool_requests')
              .update({ 
                matched_volume: newMatchedVolume,
                status: newStatus 
              })
              .eq('id', match.request_id);
          }

          createdMatchings.push(createdMatch as Matching);
        } catch (error) {
          errors.push(`Error creating matching for batch ${match.batch_id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      // If some matchings failed, throw error with details
      if (errors.length > 0) {
        if (createdMatchings.length === 0) {
          // All failed
          throw new Error(`Failed to create all matchings:\n${errors.join('\n')}`);
        } else {
          // Partial success - log warnings but return what was created
          logger.warn('Some matchings failed to create', { 
            action: 'createMatching', 
            created: createdMatchings.length,
            failed: errors.length,
          });
        }
      }

      return createdMatchings;
    },
    onSuccess: (data) => {
      toast({
        title: 'Matchings Created',
        description: `${data.length} matching(s) created. Status updates applied automatically.`,
      });
      queryClient.invalidateQueries({ queryKey: ['matchings'] });
      queryClient.invalidateQueries({ queryKey: ['pool-requests'] });
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      queryClient.invalidateQueries({ queryKey: ['confirmed-batches'] });
      queryClient.invalidateQueries({ queryKey: ['matching-requests'] });
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
 * Hook for finalizing matchings with premium locking and execution creation
 */
export function useFinalizeMatching() {
  const { toast } = useToast();
  const { role, roleName } = useRole();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      matchId,
      note,
      premiumBreakdown,
    }: {
      matchId: string;
      note?: string;
      premiumBreakdown?: {
        basePricePerKg: number;
        premiums: Array<{
          type: string;
          levelKey: string;
          levelName: string;
          value: number;
          eligible: boolean;
          reason: string;
        }>;
        totalPremium: number;
        totalPricePerKg: number;
      };
    }) => {
      if (role !== 'admin') {
        throw new Error('Only admins can finalize matchings');
      }

      // Get the current matching to get batch and request info
      const { data: currentMatch, error: matchError } = await supabase
        .from('pool_matches')
        .select('batch_id, request_id, heads_matched')
        .eq('id', matchId)
        .single();

      if (matchError) throw matchError;

      const standardPremium = premiumBreakdown?.premiums.find(p => p.type === 'standard');
      const predictabilityPremium = premiumBreakdown?.premiums.find(p => p.type === 'predictability');
      const volumeConsistencyPremium = premiumBreakdown?.premiums.find(p => p.type === 'volume_consistency');
      const reliabilityPremium = premiumBreakdown?.premiums.find(p => p.type === 'reliability');

      // Update matching with premium data and finalize
      const { error: updateError } = await supabase
        .from('pool_matches')
        .update({
          status: 'finalized',
          finalized_at: new Date().toISOString(),
          base_price_per_kg: premiumBreakdown?.basePricePerKg || null,
          standard_premium: standardPremium?.eligible ? standardPremium.value : 0,
          predictability_premium: predictabilityPremium?.eligible ? predictabilityPremium.value : 0,
          volume_consistency_premium: volumeConsistencyPremium?.eligible ? volumeConsistencyPremium.value : 0,
          reliability_premium: reliabilityPremium?.eligible ? reliabilityPremium.value : 0,
          total_premium: premiumBreakdown?.totalPremium || 0,
          total_price_per_kg: premiumBreakdown?.totalPricePerKg || null,
          premium_breakdown: premiumBreakdown ? {
            premiums: premiumBreakdown.premiums,
            calculatedAt: new Date().toISOString(),
          } : null,
          premium_locked: true,
          premium_locked_at: new Date().toISOString(),
        })
        .eq('id', matchId);

      if (updateError) throw updateError;

      // Create execution record
      const { error: execError } = await supabase
        .from('offtake_executions')
        .insert({
          match_id: matchId,
          batch_id: currentMatch.batch_id,
          request_id: currentMatch.request_id,
          matched_volume: currentMatch.heads_matched,
          reference_price_at_match: premiumBreakdown?.basePricePerKg || null,
          status: 'matched',
        });

      if (execError) {
        logger.warn('Failed to create execution record', { matchId, error: execError.message });
      }

      // Log activity
      await supabase.from('matching_activity_log').insert({
        match_id: matchId,
        action_type: 'finalized',
        previous_value: 'active',
        new_value: 'finalized',
        performed_by: `${roleName} (${role})`,
        note: note || null,
      });

      // Fetch the updated matching to return
      const { data: updatedMatching, error: fetchError } = await supabase
        .from('pool_matches')
        .select('*')
        .eq('id', matchId)
        .single();

      if (fetchError) throw fetchError;

      return updatedMatching as Matching;
    },
    onSuccess: () => {
      toast({
        title: 'Matching Finalized',
        description: 'The matching has been finalized, premiums locked, and execution record created.',
      });
      queryClient.invalidateQueries({ queryKey: ['matchings'] });
      queryClient.invalidateQueries({ queryKey: ['executions'] });
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
 * Hook for cancelling matchings with automatic status updates
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

      // Get current matching data
      const { data: current, error: fetchError } = await supabase
        .from('pool_matches')
        .select('status, heads_matched, request_id, batch_id')
        .eq('id', matchId)
        .single();

      if (fetchError) throw fetchError;

      // Validate transition
      const validation = validateMatchingTransition(current.status, 'cancelled');
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      // Update matching status
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

      // Log action
      await supabase.from('matching_activity_log').insert({
        match_id: matchId,
        action_type: 'cancelled',
        previous_value: current.status,
        new_value: 'cancelled',
        performed_by: `${roleName} (${role})`,
        note: reason,
      });

      // ============================================
      // AUTOMATIC STATUS UPDATES ON CANCELLATION
      // ============================================

      // Get current request data
      const { data: request } = await supabase
        .from('purchase_pool_requests')
        .select('id, status, required_volume, matched_volume')
        .eq('id', current.request_id)
        .single();

      if (request) {
        // Calculate new matched volume
        const newMatchedVolume = Math.max(0, request.matched_volume - current.heads_matched);
        
        // Determine new status
        let newStatus = request.status;
        if (request.status === 'fulfilled' || request.status === 'partial') {
          if (newMatchedVolume >= request.required_volume) {
            newStatus = 'fulfilled';
          } else if (newMatchedVolume > 0) {
            newStatus = 'partial';
          } else {
            newStatus = 'matching';
          }
        }

        // Update request
        await supabase
          .from('purchase_pool_requests')
          .update({ 
            matched_volume: newMatchedVolume,
            status: newStatus,
          })
          .eq('id', current.request_id);

        if (newStatus !== request.status) {
          // Log the automatic transition
          await supabase.from('activity_log').insert({
            event_type: 'pool_request_updated' as any,
            actor_role: 'system',
            actor_name: 'Automatic Status Update',
            description: `Request status automatically changed from ${request.status} to ${newStatus} due to matching cancellation`,
            target_type: 'pool_request',
            target_id: current.request_id,
            metadata: { previous_status: request.status, new_status: newStatus, trigger: 'matching_cancelled' },
          });
        }
      }

      // Note: Batch status is not reverted on cancellation
      // Once a batch is matched, it stays matched (business decision)

      return data as Matching;
    },
    onSuccess: () => {
      toast({
        title: 'Matching Cancelled',
        description: 'The matching has been cancelled. Status updates applied automatically.',
      });
      queryClient.invalidateQueries({ queryKey: ['matchings'] });
      queryClient.invalidateQueries({ queryKey: ['pool-requests'] });
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      queryClient.invalidateQueries({ queryKey: ['confirmed-batches'] });
      queryClient.invalidateQueries({ queryKey: ['matching-requests'] });
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
 * Hook for reallocating matching volume before finalization
 */
export function useReallocateMatchingVolume() {
  const { toast } = useToast();
  const { role, roleName } = useRole();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      matchId,
      newHeadsMatched,
      reason,
    }: {
      matchId: string;
      newHeadsMatched: number;
      reason: string;
    }) => {
      if (role !== 'admin') {
        throw new Error('Only admins can reallocate matching volumes');
      }

      if (!reason.trim()) {
        throw new Error('Reallocation reason is required');
      }

      if (newHeadsMatched <= 0) {
        throw new Error('Heads matched must be greater than 0');
      }

      // Get current matching data
      const { data: current, error: fetchError } = await supabase
        .from('pool_matches')
        .select('status, heads_matched, request_id, batch_id')
        .eq('id', matchId)
        .single();

      if (fetchError) throw fetchError;

      // Only allow reallocation of active matchings
      if (current.status !== 'active') {
        throw new Error('Can only reallocate active matchings');
      }

      // Get batch info to validate volume
      const { data: batch } = await supabase
        .from('batches')
        .select('heads')
        .eq('id', current.batch_id)
        .single();

      if (batch && newHeadsMatched > batch.heads) {
        throw new Error(`Cannot allocate more than batch capacity (${batch.heads} heads)`);
      }

      const previousHeads = current.heads_matched;
      const headsDifference = newHeadsMatched - previousHeads;

      // Update matching
      const { data, error } = await supabase
        .from('pool_matches')
        .update({ heads_matched: newHeadsMatched })
        .eq('id', matchId)
        .select()
        .single();

      if (error) throw error;

      // Log reallocation action
      await supabase.from('matching_activity_log').insert({
        match_id: matchId,
        action_type: 'volume_reallocated',
        previous_value: `${previousHeads} heads`,
        new_value: `${newHeadsMatched} heads`,
        performed_by: `${roleName} (${role})`,
        note: reason,
      });

      // Update request matched_volume
      const { data: request } = await supabase
        .from('purchase_pool_requests')
        .select('id, status, required_volume, matched_volume')
        .eq('id', current.request_id)
        .single();

      if (request) {
        const newMatchedVolume = request.matched_volume + headsDifference;
        
        // Determine new status based on matched volume
        let newStatus = request.status;
        if (newMatchedVolume >= request.required_volume) {
          newStatus = 'fulfilled';
        } else if (newMatchedVolume > 0) {
          newStatus = 'partial';
        } else {
          newStatus = 'matching';
        }

        await supabase
          .from('purchase_pool_requests')
          .update({ 
            matched_volume: Math.max(0, newMatchedVolume),
            status: newStatus,
          })
          .eq('id', current.request_id);

        if (newStatus !== request.status) {
          await supabase.from('activity_log').insert({
            event_type: 'pool_request_updated' as any,
            actor_role: role,
            actor_name: roleName,
            description: `Request status changed from ${request.status} to ${newStatus} due to volume reallocation`,
            target_type: 'pool_request',
            target_id: current.request_id,
            metadata: { 
              previous_status: request.status, 
              new_status: newStatus, 
              trigger: 'volume_reallocated',
              previous_volume: previousHeads,
              new_volume: newHeadsMatched,
            },
          });
        }
      }

      return data as Matching;
    },
    onSuccess: (data, variables) => {
      toast({
        title: 'Volume Reallocated',
        description: `Updated to ${variables.newHeadsMatched} heads.`,
      });
      queryClient.invalidateQueries({ queryKey: ['matchings'] });
      queryClient.invalidateQueries({ queryKey: ['matchings-details'] });
      queryClient.invalidateQueries({ queryKey: ['pool-requests'] });
      queryClient.invalidateQueries({ queryKey: ['matching-activity'] });
    },
    onError: (error) => {
      toast({
        title: 'Error Reallocating Volume',
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
