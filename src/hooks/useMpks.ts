import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';

export type MpkStatus = 'active' | 'restricted' | 'inactive';

export interface Mpk {
  id: string;
  mpk_id: string;
  name: string;
  intake_regions: string[];
  status: MpkStatus;
  is_request_restricted: boolean;
  restriction_reason: string | null;
  max_active_requests: number | null;
  typical_volume_min: number | null;
  typical_volume_max: number | null;
  common_target_weeks: string[] | null;
  total_requests: number;
  fulfilled_requests: number;
  partial_requests: number;
  cancelled_requests: number;
  request_changes_count: number;
  last_activity_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface MpkActivityLog {
  id: string;
  mpk_id: string;
  action_type: string;
  previous_value: string | null;
  new_value: string | null;
  note: string | null;
  performed_by: string | null;
  created_at: string;
}

export function useMpks() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['mpks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mpks')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      return data as Mpk[];
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel('mpks-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'mpks' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['mpks'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return query;
}

export function useMpkActivityLog(mpkId: string | null) {
  return useQuery({
    queryKey: ['mpk-activity-log', mpkId],
    queryFn: async () => {
      if (!mpkId) return [];
      const { data, error } = await supabase
        .from('mpk_activity_log')
        .select('*')
        .eq('mpk_id', mpkId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data as MpkActivityLog[];
    },
    enabled: !!mpkId,
  });
}

export function useUpdateMpkStatus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      mpkId, 
      newStatus, 
      previousStatus, 
      note 
    }: { 
      mpkId: string; 
      newStatus: MpkStatus; 
      previousStatus: MpkStatus;
      note: string;
    }) => {
      const { error: updateError } = await supabase
        .from('mpks')
        .update({ status: newStatus })
        .eq('id', mpkId);

      if (updateError) throw updateError;

      const { error: logError } = await supabase
        .from('mpk_activity_log')
        .insert({
          mpk_id: mpkId,
          action_type: 'status_change',
          previous_value: previousStatus,
          new_value: newStatus,
          note,
          performed_by: 'Admin',
        });

      if (logError) throw logError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mpks'] });
      queryClient.invalidateQueries({ queryKey: ['mpk-activity-log'] });
      toast({
        title: 'Status updated',
        description: 'MPK status has been updated successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error updating status',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useToggleMpkRequestRestriction() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      mpkId, 
      isRestricted, 
      reason,
      note 
    }: { 
      mpkId: string; 
      isRestricted: boolean; 
      reason?: string;
      note: string;
    }) => {
      const { error: updateError } = await supabase
        .from('mpks')
        .update({ 
          is_request_restricted: isRestricted,
          restriction_reason: isRestricted ? reason : null,
        })
        .eq('id', mpkId);

      if (updateError) throw updateError;

      const { error: logError } = await supabase
        .from('mpk_activity_log')
        .insert({
          mpk_id: mpkId,
          action_type: isRestricted ? 'request_restriction_applied' : 'request_restriction_removed',
          previous_value: isRestricted ? 'unrestricted' : 'restricted',
          new_value: isRestricted ? 'restricted' : 'unrestricted',
          note,
          performed_by: 'Admin',
        });

      if (logError) throw logError;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['mpks'] });
      queryClient.invalidateQueries({ queryKey: ['mpk-activity-log'] });
      toast({
        title: variables.isRestricted ? 'Requests restricted' : 'Requests enabled',
        description: variables.isRestricted 
          ? 'MPK can no longer create pool requests.'
          : 'MPK can now create pool requests.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error updating restriction',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateMpkMaxRequests() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      mpkId, 
      maxRequests,
      previousMax,
      note 
    }: { 
      mpkId: string; 
      maxRequests: number;
      previousMax: number | null;
      note: string;
    }) => {
      const { error: updateError } = await supabase
        .from('mpks')
        .update({ max_active_requests: maxRequests })
        .eq('id', mpkId);

      if (updateError) throw updateError;

      const { error: logError } = await supabase
        .from('mpk_activity_log')
        .insert({
          mpk_id: mpkId,
          action_type: 'max_requests_changed',
          previous_value: previousMax?.toString() || 'unlimited',
          new_value: maxRequests.toString(),
          note,
          performed_by: 'Admin',
        });

      if (logError) throw logError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mpks'] });
      queryClient.invalidateQueries({ queryKey: ['mpk-activity-log'] });
      toast({
        title: 'Limit updated',
        description: 'Maximum active requests limit has been updated.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error updating limit',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export interface MpkRequestStats {
  mpk_id: string;
  total: number;
  fulfilled: number;
  partial: number;
  pending: number;
  cancelled: number;
}

export function useMpkRequestStats() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['mpk-request-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('purchase_pool_requests')
        .select('mpk_id, status');

      if (error) throw error;

      // Aggregate stats by mpk_id
      const statsMap = new Map<string, MpkRequestStats>();
      
      data?.forEach(request => {
        const existing = statsMap.get(request.mpk_id) || {
          mpk_id: request.mpk_id,
          total: 0,
          fulfilled: 0,
          partial: 0,
          pending: 0,
          cancelled: 0,
        };
        
        existing.total++;
        if (request.status === 'fulfilled') existing.fulfilled++;
        else if (request.status === 'partial') existing.partial++;
        else if (request.status === 'pending') existing.pending++;
        else if (request.status === 'cancelled') existing.cancelled++;
        
        statsMap.set(request.mpk_id, existing);
      });

      return Object.fromEntries(statsMap);
    },
  });

  // Subscribe to real-time updates on purchase_pool_requests
  useEffect(() => {
    const channel = supabase
      .channel('mpk-request-stats-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'purchase_pool_requests' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['mpk-request-stats'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return query;
}

export function useMpkPoolRequests(mpkId: string | null) {
  return useQuery({
    queryKey: ['mpk-pool-requests', mpkId],
    queryFn: async () => {
      if (!mpkId) return [];
      const { data, error } = await supabase
        .from('purchase_pool_requests')
        .select('*')
        .eq('mpk_id', mpkId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data;
    },
    enabled: !!mpkId,
  });
}
