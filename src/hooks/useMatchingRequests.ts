import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useMemo } from 'react';
import type { PoolRequest } from './usePoolRequests';

export interface MatchingPoolRequest extends PoolRequest {
  remaining_volume: number;
}

export interface MatchingRequestFilters {
  region?: string;
  minWeight?: number;
  maxWeight?: number;
  minAge?: number;
  maxAge?: number;
  minRemainingVolume?: number;
}

/**
 * Fetch pool requests in matching status with calculated remaining volume
 */
export function useMatchingRequests(filters?: MatchingRequestFilters) {
  return useQuery({
    queryKey: ['matching-requests', filters],
    queryFn: async () => {
      // Fetch requests available for matching (submitted, matching, partial)
      const { data, error } = await supabase
        .from('purchase_pool_requests')
        .select('*')
        .in('status', ['submitted', 'matching', 'partial'])
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Calculate remaining volume
      const result: MatchingPoolRequest[] = (data || []).map(r => ({
        ...r,
        remaining_volume: Math.max(0, r.required_volume - r.matched_volume),
      }));

      // Apply filters
      let filtered = result;

      if (filters?.region && filters.region !== 'all') {
        filtered = filtered.filter(r => r.regions.includes(filters.region!) || r.regions.includes('Any'));
      }

      if (filters?.minWeight !== undefined) {
        filtered = filtered.filter(r => r.weight_range_min === null || r.weight_range_min >= filters.minWeight!);
      }

      if (filters?.maxWeight !== undefined) {
        filtered = filtered.filter(r => r.weight_range_max === null || r.weight_range_max <= filters.maxWeight!);
      }

      if (filters?.minAge !== undefined) {
        filtered = filtered.filter(r => r.age_range_min === null || r.age_range_min >= filters.minAge!);
      }

      if (filters?.maxAge !== undefined) {
        filtered = filtered.filter(r => r.age_range_max === null || r.age_range_max <= filters.maxAge!);
      }

      if (filters?.minRemainingVolume !== undefined) {
        filtered = filtered.filter(r => r.remaining_volume >= filters.minRemainingVolume!);
      }

      return filtered;
    },
  });
}

/**
 * Get unique regions from matching requests for filter dropdown
 */
export function useMatchingRequestRegions() {
  const { data: requests } = useMatchingRequests();
  
  return useMemo(() => {
    if (!requests) return [];
    const regions = new Set<string>();
    requests.forEach(r => r.regions.forEach(region => regions.add(region)));
    return Array.from(regions).filter(r => r !== 'Any').sort();
  }, [requests]);
}
