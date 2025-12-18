import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface AggregatedDemand {
  target_week: string;
  regions: string[];
  required_grade: string;
  total_volume: number;
  total_matched: number;
  request_count: number;
  weight_min: number | null;
  weight_max: number | null;
  age_min: number | null;
  age_max: number | null;
}

export function useAggregatedDemand() {
  return useQuery({
    queryKey: ['aggregated-demand'],
    queryFn: async () => {
      // Use the RPC function to get aggregated demand
      const { data, error } = await supabase.rpc('get_aggregated_demand');

      if (error) throw error;
      return (data || []) as AggregatedDemand[];
    },
  });
}

// Helper to calculate remaining demand
export function getRemainingDemand(demand: AggregatedDemand): number {
  return demand.total_volume - demand.total_matched;
}

// Helper to get demand fulfillment percentage
export function getDemandFulfillment(demand: AggregatedDemand): number {
  if (demand.total_volume === 0) return 0;
  return Math.round((demand.total_matched / demand.total_volume) * 100);
}
