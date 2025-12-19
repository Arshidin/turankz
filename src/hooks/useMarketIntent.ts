import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import { useCurrentFarmer } from './useCurrentFarmer';

// Type definitions matching the database enums
export type MarketIntentHorizon = '3m' | '6m' | '12m';
export type IntentConfidenceLevel = 'low' | 'medium' | 'high';

export interface MarketAvailabilityIntent {
  id: string;
  farmer_id: string;
  horizon: MarketIntentHorizon;
  breed: string;
  estimated_heads: number;
  confidence_level: IntentConfidenceLevel;
  non_binding: boolean;
  notes: string | null;
  created_at: string;
  verification_status?: string;
  verified_at?: string | null;
  verified_by?: string | null;
}

export interface CreateIntentInput {
  horizon: MarketIntentHorizon;
  breed: string;
  estimated_heads: number;
  confidence_level: IntentConfidenceLevel;
  notes?: string;
}

export interface AggregatedIntentData {
  region: string;
  breed: string;
  horizon: MarketIntentHorizon;
  total_estimated_heads: number;
  intent_count: number;
  avg_confidence: IntentConfidenceLevel;
}

// Admin view of individual intents with farmer info
export interface AdminMarketIntent {
  id: string;
  farmer_id: string;
  farmer_name: string;
  farmer_region: string;
  horizon: MarketIntentHorizon;
  breed: string;
  estimated_heads: number;
  confidence_level: IntentConfidenceLevel;
  verification_status: string;
  verified_at: string | null;
  verified_by: string | null;
  non_binding: boolean;
  notes: string | null;
  created_at: string;
}

// Horizon labels
export const HORIZON_OPTIONS: Record<MarketIntentHorizon, { label: string; description: string; months: number }> = {
  '3m': { label: '3 Months', description: 'Short-term outlook', months: 3 },
  '6m': { label: '6 Months', description: 'Medium-term outlook', months: 6 },
  '12m': { label: '12 Months', description: 'Long-term outlook', months: 12 },
};

// Confidence level labels
export const CONFIDENCE_OPTIONS: Record<IntentConfidenceLevel, { label: string; description: string; color: string }> = {
  low: { label: 'Low', description: 'Uncertain estimate', color: 'text-amber-600' },
  medium: { label: 'Medium', description: 'Reasonable estimate', color: 'text-blue-600' },
  high: { label: 'High', description: 'Confident estimate', color: 'text-emerald-600' },
};

// Common breeds (shared with herd structure)
export const COMMON_BREEDS = [
  'Kazakh Whiteheaded',
  'Auliekol',
  'Hereford',
  'Angus',
  'Simmental',
  'Limousin',
  'Charolais',
  'Mixed/Crossbred',
  'Other',
] as const;

/**
 * Hook for farmers to view their own market intents
 */
export function useMyMarketIntents() {
  const { data: farmer } = useCurrentFarmer();

  return useQuery({
    queryKey: ['market-intents', farmer?.id],
    queryFn: async () => {
      if (!farmer?.id) return [];
      
      const { data, error } = await supabase
        .from('market_availability_intents')
        .select('*')
        .eq('farmer_id', farmer.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as MarketAvailabilityIntent[];
    },
    enabled: !!farmer?.id,
  });
}

/**
 * Hook to create new market intent
 */
export function useCreateMarketIntent() {
  const queryClient = useQueryClient();
  const { data: farmer } = useCurrentFarmer();

  return useMutation({
    mutationFn: async (input: CreateIntentInput) => {
      if (!farmer?.id) throw new Error('No farmer profile found');

      const { data, error } = await supabase
        .from('market_availability_intents')
        .insert({
          farmer_id: farmer.id,
          horizon: input.horizon,
          breed: input.breed,
          estimated_heads: input.estimated_heads,
          confidence_level: input.confidence_level,
          notes: input.notes || null,
          non_binding: true,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['market-intents'] });
      queryClient.invalidateQueries({ queryKey: ['aggregated-market-intent'] });
    },
  });
}

/**
 * Hook to delete a market intent
 */
export function useDeleteMarketIntent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('market_availability_intents')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['market-intents'] });
      queryClient.invalidateQueries({ queryKey: ['aggregated-market-intent'] });
    },
  });
}

/**
 * Hook for MPK/Admin to view aggregated market intent (no farmer details)
 * MPK sees ONLY aggregated data: by region, breed, horizon
 * No farmer names, no farm-level data, no confidence attribution per farmer
 */
export function useAggregatedMarketIntent(horizon?: MarketIntentHorizon) {
  const { role } = useAuthContext();

  return useQuery({
    queryKey: ['aggregated-market-intent', horizon],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_aggregated_market_intent', {
          p_horizon: horizon || null,
        });

      if (error) throw error;
      return data as AggregatedIntentData[];
    },
    enabled: role === 'admin' || role === 'mpk',
  });
}

/**
 * Hook for admin to view all market intents with farmer info (for verification)
 * Uses secure RPC function
 */
export function useAllMarketIntentsForAdmin() {
  const { role } = useAuthContext();

  return useQuery({
    queryKey: ['all-market-intents-admin'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_all_market_intents_for_admin');
      if (error) throw error;
      return data as AdminMarketIntent[];
    },
    enabled: role === 'admin',
  });
}

/**
 * Hook for admin to update verification status
 * Admin can ONLY update verification status - not farmer-submitted data
 */
export function useUpdateIntentVerification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, verification_status, verified_by }: { 
      id: string; 
      verification_status: string;
      verified_by: string;
    }) => {
      const { data, error } = await supabase
        .from('market_availability_intents')
        .update({ 
          verification_status,
          verified_at: new Date().toISOString(),
          verified_by,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['market-intents'] });
      queryClient.invalidateQueries({ queryKey: ['all-market-intents-admin'] });
      queryClient.invalidateQueries({ queryKey: ['aggregated-market-intent'] });
    },
  });
}
