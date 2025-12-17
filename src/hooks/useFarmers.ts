import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';

export type FarmerGrading = 'observer' | 'declared_supplier' | 'standard_supplier';
export type FarmerReliability = 'high' | 'medium' | 'low';

export interface Farmer {
  id: string;
  user_id: string | null;
  farmer_id: string;
  name: string;
  region: string;
  district: string | null;
  contact_name: string | null;
  phone: string | null;
  email: string | null;
  farm_type: string | null;
  grading: FarmerGrading;
  reliability: FarmerReliability;
  is_restricted: boolean;
  restriction_reason: string | null;
  last_activity_at: string | null;
  total_confirmations: number;
  total_declines: number;
  missed_updates: number;
  created_at: string;
  updated_at: string;
}

export interface FarmerActivityLog {
  id: string;
  farmer_id: string;
  action_type: string;
  previous_value: string | null;
  new_value: string | null;
  note: string | null;
  performed_by: string | null;
  created_at: string;
}

export function useFarmers() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['farmers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('farmers')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      return data as Farmer[];
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel('farmers-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'farmers' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['farmers'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return query;
}

export function useFarmerActivityLog(farmerId: string | null) {
  return useQuery({
    queryKey: ['farmer-activity-log', farmerId],
    queryFn: async () => {
      if (!farmerId) return [];
      const { data, error } = await supabase
        .from('farmer_activity_log')
        .select('*')
        .eq('farmer_id', farmerId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data as FarmerActivityLog[];
    },
    enabled: !!farmerId,
  });
}

export function useUpdateFarmerGrading() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      farmerId, 
      newGrading, 
      previousGrading, 
      note 
    }: { 
      farmerId: string; 
      newGrading: FarmerGrading; 
      previousGrading: FarmerGrading;
      note: string;
    }) => {
      // Update farmer grading
      const { error: updateError } = await supabase
        .from('farmers')
        .update({ grading: newGrading })
        .eq('id', farmerId);

      if (updateError) throw updateError;

      // Log the activity
      const { error: logError } = await supabase
        .from('farmer_activity_log')
        .insert({
          farmer_id: farmerId,
          action_type: 'grading_change',
          previous_value: previousGrading,
          new_value: newGrading,
          note,
          performed_by: 'Admin',
        });

      if (logError) throw logError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['farmers'] });
      queryClient.invalidateQueries({ queryKey: ['farmer-activity-log'] });
      toast({
        title: 'Grading updated',
        description: 'Farmer grading has been updated successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error updating grading',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useToggleFarmerRestriction() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      farmerId, 
      isRestricted, 
      reason,
      note 
    }: { 
      farmerId: string; 
      isRestricted: boolean; 
      reason?: string;
      note: string;
    }) => {
      const { error: updateError } = await supabase
        .from('farmers')
        .update({ 
          is_restricted: isRestricted,
          restriction_reason: isRestricted ? reason : null,
        })
        .eq('id', farmerId);

      if (updateError) throw updateError;

      const { error: logError } = await supabase
        .from('farmer_activity_log')
        .insert({
          farmer_id: farmerId,
          action_type: isRestricted ? 'restriction_applied' : 'restriction_removed',
          previous_value: isRestricted ? 'unrestricted' : 'restricted',
          new_value: isRestricted ? 'restricted' : 'unrestricted',
          note,
          performed_by: 'Admin',
        });

      if (logError) throw logError;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['farmers'] });
      queryClient.invalidateQueries({ queryKey: ['farmer-activity-log'] });
      toast({
        title: variables.isRestricted ? 'Access restricted' : 'Access restored',
        description: variables.isRestricted 
          ? 'Farmer has been restricted from pool invitations.'
          : 'Farmer access has been restored.',
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

export function useFarmerBatchStats(userId: string | null) {
  return useQuery({
    queryKey: ['farmer-batch-stats', userId],
    queryFn: async () => {
      if (!userId) return { total: 0, forecast: 0, soft_committed: 0, confirmed: 0 };
      
      const { data, error } = await supabase
        .from('batches')
        .select('status, heads')
        .eq('user_id', userId);

      if (error) throw error;

      const stats = {
        total: 0,
        forecast: 0,
        soft_committed: 0,
        confirmed: 0,
      };

      data?.forEach(batch => {
        stats.total += batch.heads;
        if (batch.status === 'forecast') stats.forecast += batch.heads;
        if (batch.status === 'soft_committed') stats.soft_committed += batch.heads;
        if (batch.status === 'confirmed') stats.confirmed += batch.heads;
      });

      return stats;
    },
    enabled: !!userId,
  });
}

// Fetch single farmer by ID
export function useFarmer(farmerId: string | null) {
  return useQuery({
    queryKey: ['farmer', farmerId],
    queryFn: async () => {
      if (!farmerId) return null;
      const { data, error } = await supabase
        .from('farmers')
        .select('*')
        .eq('id', farmerId)
        .maybeSingle();

      if (error) throw error;
      return data as Farmer | null;
    },
    enabled: !!farmerId,
  });
}

// Fetch farmer by farmer_id (the display ID like FRM-001)
export function useFarmerByFarmerId(farmerId: string | null) {
  return useQuery({
    queryKey: ['farmer-by-farmer-id', farmerId],
    queryFn: async () => {
      if (!farmerId) return null;
      const { data, error } = await supabase
        .from('farmers')
        .select('*')
        .eq('farmer_id', farmerId)
        .maybeSingle();

      if (error) throw error;
      return data as Farmer | null;
    },
    enabled: !!farmerId,
  });
}

// Update farmer profile
export function useUpdateFarmerProfile() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      id, 
      ...updates 
    }: { 
      id: string; 
      name?: string;
      contact_name?: string;
      region?: string;
      district?: string;
      phone?: string;
      email?: string;
      farm_type?: string;
    }) => {
      const { data, error } = await supabase
        .from('farmers')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Farmer;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['farmers'] });
      queryClient.invalidateQueries({ queryKey: ['farmer', data.id] });
      queryClient.invalidateQueries({ queryKey: ['farmer-by-farmer-id', data.farmer_id] });
      toast({
        title: 'Profile updated',
        description: 'Your farm profile has been saved.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error updating profile',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}
