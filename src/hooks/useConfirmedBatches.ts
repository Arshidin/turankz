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
  standard_status: string | null;
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
        .select('id, batch_number, user_id, heads, grade, region, status, target_week, breed, gender, age_min, age_max, weight_min, weight_max, standard_status')
        .eq('status', 'confirmed')
        .order('batch_number', { ascending: true });

      if (batchError) throw batchError;

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

      // Build result with available volume
      const result: ConfirmedBatch[] = (batches || []).map(b => {
        const matchedHeads = matchedByBatch.get(b.id) || 0;
        return {
          ...b,
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
