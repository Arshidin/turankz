import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { type Batch, type BatchStatus } from './useBatches';
import { type CriteriaFilterState } from '@/components/livestock';
import { useAuthContext } from '@/contexts/AuthContext';

// Aggregated market data by region
export interface RegionSupply {
  region: string;
  confirmed: number;
  softCommitted: number;
  forecast: number;
  total: number;
}

// Market summary stats
export interface MarketSummary {
  confirmed: number;
  softCommitted: number;
  forecast: number;
  total: number;
}

// Check if a batch matches criteria filters
export function batchMatchesCriteria(batch: Batch, filters: CriteriaFilterState): boolean {
  // Breed filter
  if (filters.breeds.length > 0) {
    if (!batch.breed || !filters.breeds.includes(batch.breed)) {
      return false;
    }
  }
  
  // Gender filter
  if (filters.genders.length > 0) {
    if (!batch.gender || !filters.genders.includes(batch.gender)) {
      return false;
    }
  }
  
  // Age filter - check for overlap
  if (filters.ageMin !== null) {
    const batchAgeMax = batch.age_max ?? batch.age_min ?? 0;
    if (batchAgeMax < filters.ageMin) {
      return false;
    }
  }
  if (filters.ageMax !== null) {
    const batchAgeMin = batch.age_min ?? batch.age_max ?? 999;
    if (batchAgeMin > filters.ageMax) {
      return false;
    }
  }
  
  // Weight filter - check for overlap
  if (filters.weightMin !== null) {
    const batchWeightMax = batch.weight_max ?? batch.weight_min ?? 0;
    if (batchWeightMax < filters.weightMin) {
      return false;
    }
  }
  if (filters.weightMax !== null) {
    const batchWeightMin = batch.weight_min ?? batch.weight_max ?? 9999;
    if (batchWeightMin > filters.weightMax) {
      return false;
    }
  }
  
  return true;
}

// Aggregate batches by region
export function aggregateByRegion(batches: Batch[]): RegionSupply[] {
  const regionMap = new Map<string, RegionSupply>();
  
  for (const batch of batches) {
    const existing = regionMap.get(batch.region) || {
      region: batch.region,
      confirmed: 0,
      softCommitted: 0,
      forecast: 0,
      total: 0,
    };
    
    existing.total += batch.heads;
    
    // For MPK view, only soft_committed and confirmed batches are shown
    // So we only need to handle these two statuses
    if (batch.status === 'confirmed') {
      existing.confirmed += batch.heads;
    } else if (batch.status === 'soft_committed') {
      existing.softCommitted += batch.heads;
    } else {
      // Fallback for other statuses (shouldn't happen for MPK after filtering, but handle gracefully)
      existing.forecast += batch.heads;
    }
    
    regionMap.set(batch.region, existing);
  }
  
  return Array.from(regionMap.values()).sort((a, b) => b.total - a.total);
}

// Calculate market summary
export function calculateMarketSummary(batches: Batch[]): MarketSummary {
  return batches.reduce(
    (acc, batch) => {
      acc.total += batch.heads;
      // For MPK view, only soft_committed and confirmed batches are shown
      if (batch.status === 'confirmed') {
        acc.confirmed += batch.heads;
      } else if (batch.status === 'soft_committed') {
        acc.softCommitted += batch.heads;
      } else {
        // Fallback for other statuses (shouldn't happen for MPK, but handle gracefully)
        acc.forecast += batch.heads;
      }
      return acc;
    },
    { confirmed: 0, softCommitted: 0, forecast: 0, total: 0 }
  );
}

// Fetch all batches for market view (anonymous, aggregated)
// For MPKs: only select anonymized fields (no user_id, batch_number, notes, mpk_interest)
// For Admins: select all fields
// For Farmers: only their own batches (handled by RLS)
export const useMarketBatches = () => {
  const { role } = useAuthContext();
  
  return useQuery({
    queryKey: ['market-batches', role],
    queryFn: async () => {
      // For MPKs, select only anonymized fields to maintain data privacy
      // Include breed, gender, age, weight for filtering and display (these don't identify farmers)
      // Only show soft_committed and confirmed batches (not draft, forecast, matched, closed)
      if (role === 'mpk') {
        const { data, error } = await supabase
          .from('batches')
          .select('id, heads, avg_weight, grade, region, status, target_week, delivery_period, breed, gender, age_min, age_max, weight_min, weight_max, created_at, updated_at')
          .in('status', ['soft_committed', 'confirmed'])
          .order('target_week', { ascending: true });

        if (error) throw error;
        return data as Batch[];
      }
      
      // For Admins and Farmers, select all fields
      const { data, error } = await supabase
        .from('batches')
        .select('*')
        .order('target_week', { ascending: true });

      if (error) throw error;
      return data as Batch[];
    },
  });
};

// Hook to get filtered market data
export function useFilteredMarketData(filters: CriteriaFilterState) {
  const { data: batches, isLoading, error } = useMarketBatches();
  
  // Filter batches based on criteria
  const filteredBatches = batches?.filter(batch => batchMatchesCriteria(batch, filters)) || [];
  
  // Calculate summary and region data
  const summary = calculateMarketSummary(filteredBatches);
  const regions = aggregateByRegion(filteredBatches);
  
  return {
    batches: filteredBatches,
    summary,
    regions,
    isLoading,
    error,
    hasData: (batches?.length || 0) > 0,
  };
}
