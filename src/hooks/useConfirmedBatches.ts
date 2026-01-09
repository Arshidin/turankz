import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useMemo } from 'react';

export interface ConfirmedBatch {
  id: string;
  batch_number: string;
  user_id: string;
  heads: number;
  grade: string;
  region: string;
  status: string;
  target_week: string;
  breed: string | null;
  gender: string | null;
  age_min: number | null;
  age_max: number | null;
  weight_min: number | null;
  weight_max: number | null;
  avg_weight: number | null;
  standard_status: string | null;
  delivery_period: 'short_term' | 'mid_term' | 'long_term' | null;
  created_at: string;
  updated_at: string;
  // Farmer info (admin-only)
  farmer_name: string | null;
  farmer_id_display: string | null;
  farmer_grading: string | null;
  farmer_reliability: string | null;
  // Calculated fields
  matched_heads: number;
  available_heads: number;
}

export interface ConfirmedBatchFilters {
  region?: string;
  minWeight?: number;
  maxWeight?: number;
  minAge?: number;
  maxAge?: number;
  minAvailableVolume?: number;
}

/**
 * Fetch confirmed batches with calculated available volume
 * Available volume = batch heads - sum of active/finalized matching heads
 */
export function useConfirmedBatches(filters?: ConfirmedBatchFilters) {
  return useQuery({
    queryKey: ['confirmed-batches', filters],
    queryFn: async () => {
      // Fetch confirmed batches
      const { data: batches, error: batchError } = await supabase
        .from('batches')
        .select('id, batch_number, user_id, heads, grade, region, status, target_week, breed, gender, age_min, age_max, weight_min, weight_max, avg_weight, standard_status, delivery_period, created_at, updated_at')
        .eq('status', 'confirmed')
        .order('batch_number', { ascending: true });

      if (batchError) throw batchError;

      // Fetch farmer info for admin view
      const userIds = [...new Set((batches || []).map(b => b.user_id))];
      const { data: farmers } = await supabase
        .from('farmers')
        .select('user_id, name, farmer_id, grading, reliability')
        .in('user_id', userIds);

      const farmerByUserId = new Map<string, { name: string; farmer_id: string; grading: string; reliability: string }>();
      for (const f of farmers || []) {
        if (f.user_id) {
          farmerByUserId.set(f.user_id, {
            name: f.name,
            farmer_id: f.farmer_id,
            grading: f.grading,
            reliability: f.reliability,
          });
        }
      }

      // Fetch all active/finalized matchings to calculate used volume
      const { data: matchings, error: matchError } = await supabase
        .from('pool_matches')
        .select('batch_id, heads_matched, status')
        .in('status', ['active', 'finalized']);

      if (matchError) throw matchError;

      // Calculate matched heads per batch
      const matchedByBatch = new Map<string, number>();
      for (const m of matchings || []) {
        const current = matchedByBatch.get(m.batch_id) || 0;
        matchedByBatch.set(m.batch_id, current + m.heads_matched);
      }

      // Build result with available volume and farmer info
      const result: ConfirmedBatch[] = (batches || []).map(b => {
        const matchedHeads = matchedByBatch.get(b.id) || 0;
        const farmer = farmerByUserId.get(b.user_id);
        return {
          ...b,
          farmer_name: farmer?.name || null,
          farmer_id_display: farmer?.farmer_id || null,
          farmer_grading: farmer?.grading || null,
          farmer_reliability: farmer?.reliability || null,
          matched_heads: matchedHeads,
          available_heads: Math.max(0, b.heads - matchedHeads),
        };
      });

      // Apply filters
      let filtered = result;

      if (filters?.region && filters.region !== 'all') {
        filtered = filtered.filter(b => b.region === filters.region);
      }

      if (filters?.minWeight !== undefined) {
        filtered = filtered.filter(b => b.weight_min === null || b.weight_min >= filters.minWeight!);
      }

      if (filters?.maxWeight !== undefined) {
        filtered = filtered.filter(b => b.weight_max === null || b.weight_max <= filters.maxWeight!);
      }

      if (filters?.minAge !== undefined) {
        filtered = filtered.filter(b => b.age_min === null || b.age_min >= filters.minAge!);
      }

      if (filters?.maxAge !== undefined) {
        filtered = filtered.filter(b => b.age_max === null || b.age_max <= filters.maxAge!);
      }

      if (filters?.minAvailableVolume !== undefined) {
        filtered = filtered.filter(b => b.available_heads >= filters.minAvailableVolume!);
      }

      return filtered;
    },
  });
}

/**
 * Get unique regions from confirmed batches for filter dropdown
 */
export function useConfirmedBatchRegions() {
  const { data: batches } = useConfirmedBatches();
  
  return useMemo(() => {
    if (!batches) return [];
    const regions = new Set(batches.map(b => b.region));
    return Array.from(regions).sort();
  }, [batches]);
}
