import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type PremiumType = 'standard' | 'reliability' | 'predictability' | 'volume_consistency';

export interface PremiumSetting {
  id: string;
  premium_type: PremiumType;
  level_key: string;
  level_name: string;
  premium_value: number;
  description: string | null;
  criteria: string[] | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const PREMIUM_TYPE_LABELS: Record<PremiumType, string> = {
  standard: 'Standard Compliance',
  reliability: 'Reliability',
  predictability: 'Predictability',
  volume_consistency: 'Volume Consistency',
};

export const PREMIUM_TYPE_DESCRIPTIONS: Record<PremiumType, string> = {
  standard: 'Batch fully matches price grid criteria',
  reliability: 'Based on farmer confirmation behavior',
  predictability: 'Batch confirmed early with no edits',
  volume_consistency: 'Consistent delivery over time',
};

export interface PremiumChangeLog {
  id: string;
  premium_setting_id: string;
  previous_value: number | null;
  new_value: number | null;
  changed_by: string | null;
  change_reason: string | null;
  created_at: string;
}

// Fetch all premium settings
export function usePremiumSettings() {
  return useQuery({
    queryKey: ['premium-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('premium_settings')
        .select('*')
        .order('premium_type')
        .order('sort_order');
      
      if (error) throw error;
      return data as PremiumSetting[];
    },
  });
}

// Fetch standard premiums only
export function useStandardPremiums() {
  return useQuery({
    queryKey: ['premium-settings', 'standard'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('premium_settings')
        .select('*')
        .eq('premium_type', 'standard')
        .eq('is_active', true)
        .order('sort_order');
      
      if (error) throw error;
      return data as PremiumSetting[];
    },
  });
}

// Fetch reliability premiums only
export function useReliabilityPremiums() {
  return useQuery({
    queryKey: ['premium-settings', 'reliability'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('premium_settings')
        .select('*')
        .eq('premium_type', 'reliability')
        .eq('is_active', true)
        .order('sort_order');
      
      if (error) throw error;
      return data as PremiumSetting[];
    },
  });
}

// Fetch predictability premiums only
export function usePredictabilityPremiums() {
  return useQuery({
    queryKey: ['premium-settings', 'predictability'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('premium_settings')
        .select('*')
        .eq('premium_type', 'predictability')
        .eq('is_active', true)
        .order('sort_order');
      
      if (error) throw error;
      return data as PremiumSetting[];
    },
  });
}

// Fetch volume consistency premiums only
export function useVolumeConsistencyPremiums() {
  return useQuery({
    queryKey: ['premium-settings', 'volume_consistency'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('premium_settings')
        .select('*')
        .eq('premium_type', 'volume_consistency')
        .eq('is_active', true)
        .order('sort_order');
      
      if (error) throw error;
      return data as PremiumSetting[];
    },
  });
}

// Toggle premium active state
export function useTogglePremiumActive() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, is_active, changed_by }: { id: string; is_active: boolean; changed_by: string }) => {
      const { error } = await supabase
        .from('premium_settings')
        .update({ is_active })
        .eq('id', id);
      
      if (error) throw error;

      // Log the change
      await supabase
        .from('premium_change_log')
        .insert({
          premium_setting_id: id,
          previous_value: is_active ? 0 : 1,
          new_value: is_active ? 1 : 0,
          changed_by,
          change_reason: is_active ? 'Premium enabled' : 'Premium disabled',
        });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['premium-settings'] });
    },
  });
}

// Update premium value
export function useUpdatePremium() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      id, 
      premium_value, 
      changed_by, 
      change_reason,
      previous_value 
    }: { 
      id: string; 
      premium_value: number;
      changed_by: string;
      change_reason: string;
      previous_value: number;
    }) => {
      // Update the premium setting
      const { error: updateError } = await supabase
        .from('premium_settings')
        .update({ premium_value })
        .eq('id', id);
      
      if (updateError) throw updateError;

      // Log the change
      const { error: logError } = await supabase
        .from('premium_change_log')
        .insert({
          premium_setting_id: id,
          previous_value,
          new_value: premium_value,
          changed_by,
          change_reason,
        });
      
      if (logError) throw logError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['premium-settings'] });
    },
  });
}

// Fetch premium change log
export function usePremiumChangeLog() {
  return useQuery({
    queryKey: ['premium-change-log'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('premium_change_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data as PremiumChangeLog[];
    },
  });
}

// Helper to get premium by level key
export function getPremiumByLevel(premiums: PremiumSetting[] | undefined, levelKey: string) {
  return premiums?.find(p => p.level_key === levelKey);
}

// Calculate total premium for a batch with all premium types
export function calculateTotalPremium(
  standardPremiums: PremiumSetting[] | undefined,
  reliabilityPremiums: PremiumSetting[] | undefined,
  predictabilityPremiums: PremiumSetting[] | undefined,
  volumeConsistencyPremiums: PremiumSetting[] | undefined,
  standardStatus: string,
  farmerGrading: string,
  predictabilityLevel: string,
  volumeConsistencyLevel: string
): number {
  const standardPremium = getPremiumByLevel(standardPremiums, standardStatus)?.premium_value ?? 0;
  const reliabilityPremium = getPremiumByLevel(reliabilityPremiums, farmerGrading)?.premium_value ?? 0;
  const predictabilityPremium = getPremiumByLevel(predictabilityPremiums, predictabilityLevel)?.premium_value ?? 0;
  const volumeConsistencyPremium = getPremiumByLevel(volumeConsistencyPremiums, volumeConsistencyLevel)?.premium_value ?? 0;
  return standardPremium + reliabilityPremium + predictabilityPremium + volumeConsistencyPremium;
}

// Simple calculation for backwards compatibility
export function calculateBasicPremium(
  standardPremiums: PremiumSetting[] | undefined,
  reliabilityPremiums: PremiumSetting[] | undefined,
  standardStatus: string,
  farmerGrading: string
): number {
  const standardPremium = getPremiumByLevel(standardPremiums, standardStatus)?.premium_value ?? 0;
  const reliabilityPremium = getPremiumByLevel(reliabilityPremiums, farmerGrading)?.premium_value ?? 0;
  return standardPremium + reliabilityPremium;
}

// Get standard status display info
export function getStandardStatusInfo(standardStatus: string) {
  const statusMap: Record<string, { label: string; color: string }> = {
    non_standard: { label: 'Non-Standard', color: 'default' },
    standard: { label: 'Standard', color: 'secondary' },
    high_standard: { label: 'High Standard', color: 'success' },
  };
  return statusMap[standardStatus] || statusMap.non_standard;
}
