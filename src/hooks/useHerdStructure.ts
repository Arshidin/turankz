import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import { useCurrentFarmer } from './useCurrentFarmer';

// Type definitions matching the database enums
export type LivestockCategory = 'breeding_cows' | 'replacement_heifers' | 'bulls' | 'calves';
export type DataConfidenceLevel = 'self_declared' | 'reviewed' | 'verified';
export type ReportingPeriodType = 'annual' | 'quarterly';

export interface HerdStructureSnapshot {
  id: string;
  farmer_id: string;
  reporting_period_type: ReportingPeriodType;
  reporting_year: number;
  reporting_quarter: number | null;
  breed: string;
  category: LivestockCategory;
  count: number;
  data_confidence_level: DataConfidenceLevel;
  notes: string | null;
  created_at: string;
}

export interface CreateSnapshotInput {
  farmer_id: string;
  reporting_period_type: ReportingPeriodType;
  reporting_year: number;
  reporting_quarter?: number | null;
  breed: string;
  category: LivestockCategory;
  count: number;
  notes?: string;
}

export interface AggregatedHerdData {
  region: string;
  breed: string;
  category: LivestockCategory;
  total_count: number;
  farmer_count: number;
  avg_confidence: DataConfidenceLevel;
}

// Livestock category labels
export const LIVESTOCK_CATEGORIES: Record<LivestockCategory, { label: string; description: string }> = {
  breeding_cows: { label: 'Breeding Cows', description: 'Mature cows kept for breeding' },
  replacement_heifers: { label: 'Replacement Heifers', description: 'Young females to replace breeding stock' },
  bulls: { label: 'Bulls', description: 'Breeding bulls' },
  calves: { label: 'Calves', description: 'Young animals under 12 months' },
};

// Common breeds
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

// Confidence level labels
export const CONFIDENCE_LEVELS: Record<DataConfidenceLevel, { label: string; description: string }> = {
  self_declared: { label: 'Self-Declared', description: 'Farmer-reported data' },
  reviewed: { label: 'Reviewed', description: 'Admin has reviewed the data' },
  verified: { label: 'Verified', description: 'Independently verified' },
};

/**
 * Hook for farmers to view their own herd structure snapshots
 */
export function useMyHerdSnapshots() {
  const { data: farmer } = useCurrentFarmer();

  return useQuery({
    queryKey: ['herd-snapshots', farmer?.id],
    queryFn: async () => {
      if (!farmer?.id) return [];
      
      const { data, error } = await supabase
        .from('herd_structure_snapshots')
        .select('*')
        .eq('farmer_id', farmer.id)
        .order('reporting_year', { ascending: false })
        .order('reporting_quarter', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as HerdStructureSnapshot[];
    },
    enabled: !!farmer?.id,
  });
}

/**
 * Hook to create new herd structure snapshot
 */
export function useCreateHerdSnapshot() {
  const queryClient = useQueryClient();
  const { data: farmer } = useCurrentFarmer();

  return useMutation({
    mutationFn: async (inputs: Omit<CreateSnapshotInput, 'farmer_id'>[]) => {
      if (!farmer?.id) throw new Error('No farmer profile found');

      const snapshots = inputs.map(input => ({
        farmer_id: farmer.id,
        reporting_period_type: input.reporting_period_type,
        reporting_year: input.reporting_year,
        reporting_quarter: input.reporting_period_type === 'quarterly' ? input.reporting_quarter : null,
        breed: input.breed,
        category: input.category,
        count: input.count,
        notes: input.notes || null,
        data_confidence_level: 'self_declared' as DataConfidenceLevel,
      }));

      const { data, error } = await supabase
        .from('herd_structure_snapshots')
        .insert(snapshots)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['herd-snapshots'] });
    },
  });
}

/**
 * Hook for admin to view aggregated national herd structure
 */
export function useAggregatedHerdStructure(year?: number, quarter?: number) {
  const { role } = useAuthContext();

  return useQuery({
    queryKey: ['aggregated-herd-structure', year, quarter],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_aggregated_herd_structure', {
          p_year: year || null,
          p_quarter: quarter || null,
        });

      if (error) throw error;
      return data as AggregatedHerdData[];
    },
    enabled: role === 'admin',
  });
}

/**
 * Hook for admin to view all snapshots (for detailed inspection)
 */
export function useAllHerdSnapshots(filters?: { year?: number; quarter?: number }) {
  const { role } = useAuthContext();

  return useQuery({
    queryKey: ['all-herd-snapshots', filters],
    queryFn: async () => {
      let query = supabase
        .from('herd_structure_snapshots')
        .select(`
          *,
          farmers!inner(name, region, farmer_id)
        `)
        .order('created_at', { ascending: false });

      if (filters?.year) {
        query = query.eq('reporting_year', filters.year);
      }
      if (filters?.quarter) {
        query = query.eq('reporting_quarter', filters.quarter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: role === 'admin',
  });
}

/**
 * Hook for admin to update confidence level
 */
export function useUpdateSnapshotConfidence() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, confidence_level }: { id: string; confidence_level: DataConfidenceLevel }) => {
      const { data, error } = await supabase
        .from('herd_structure_snapshots')
        .update({ data_confidence_level: confidence_level })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['herd-snapshots'] });
      queryClient.invalidateQueries({ queryKey: ['all-herd-snapshots'] });
      queryClient.invalidateQueries({ queryKey: ['aggregated-herd-structure'] });
    },
  });
}
