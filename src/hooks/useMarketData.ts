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

// Aggregated batch group for MPK view (prevents deanonymization)
export interface AggregatedBatchGroup {
  region: string;
  target_week: string;
  grade: string | null;
  status: BatchStatus;
  total_heads: number;
  avg_weight: number | null;
  // Aggregated criteria ranges (min of mins, max of maxs)
  breeds: string[];
  genders: string[];
  age_min: number | null;
  age_max: number | null;
  weight_min: number | null;
  weight_max: number | null;
  // Count of batches in this group (for reference, but not identifying)
  batch_count: number;
}

// Aggregate batches by region, target_week, grade, and status to prevent deanonymization
export function aggregateBatchesForMpk(batches: Batch[]): AggregatedBatchGroup[] {
  const groupMap = new Map<string, AggregatedBatchGroup>();
  
  for (const batch of batches) {
    // Create a unique key: region + target_week + grade + status
    const key = `${batch.region}|${batch.target_week || 'unknown'}|${batch.grade || 'no-grade'}|${batch.status}`;
    
    const existing = groupMap.get(key);
    
    if (existing) {
      // Aggregate: sum heads, update ranges, collect unique breeds/genders
      existing.total_heads += batch.heads;
      existing.batch_count += 1;
      
      // Update age range (min of mins, max of maxs)
      if (batch.age_min !== null) {
        existing.age_min = existing.age_min === null ? batch.age_min : Math.min(existing.age_min, batch.age_min);
      }
      if (batch.age_max !== null) {
        existing.age_max = existing.age_max === null ? batch.age_max : Math.max(existing.age_max, batch.age_max);
      }
      
      // Update weight range
      if (batch.weight_min !== null) {
        existing.weight_min = existing.weight_min === null ? batch.weight_min : Math.min(existing.weight_min, batch.weight_min);
      }
      if (batch.weight_max !== null) {
        existing.weight_max = existing.weight_max === null ? batch.weight_max : Math.max(existing.weight_max, batch.weight_max);
      }
      
      // Collect unique breeds and genders
      if (batch.breed && !existing.breeds.includes(batch.breed)) {
        existing.breeds.push(batch.breed);
      }
      if (batch.gender && !existing.genders.includes(batch.gender)) {
        existing.genders.push(batch.gender);
      }
      
      // Update avg_weight (weighted average)
      if (batch.avg_weight !== null) {
        const totalWeight = (existing.avg_weight || 0) * (existing.total_heads - batch.heads) + batch.avg_weight * batch.heads;
        existing.avg_weight = totalWeight / existing.total_heads;
      }
    } else {
      // Create new group
      groupMap.set(key, {
        region: batch.region,
        target_week: batch.target_week || 'unknown',
        grade: batch.grade || null,
        status: batch.status,
        total_heads: batch.heads,
        avg_weight: batch.avg_weight,
        breeds: batch.breed ? [batch.breed] : [],
        genders: batch.gender ? [batch.gender] : [],
        age_min: batch.age_min,
        age_max: batch.age_max,
        weight_min: batch.weight_min,
        weight_max: batch.weight_max,
        batch_count: 1,
      });
    }
  }
  
  // Sort by target_week, then by region, then by total_heads (descending)
  return Array.from(groupMap.values()).sort((a, b) => {
    if (a.target_week !== b.target_week) {
      return a.target_week.localeCompare(b.target_week);
    }
    if (a.region !== b.region) {
      return a.region.localeCompare(b.region);
    }
    return b.total_heads - a.total_heads;
  });
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
