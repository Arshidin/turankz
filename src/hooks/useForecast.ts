import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import { useCurrentFarmer } from './useCurrentFarmer';

export interface ForecastCoefficient {
  id: string;
  coefficient_type: string;
  coefficient_key: string;
  coefficient_value: number;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RegionalForecast {
  region: string;
  breeding_cows_count: number;
  calving_rate: number;
  estimated_calves: number;
  farmer_count: number;
  data_confidence: string;
}

export interface FarmerForecast {
  category: string;
  current_count: number;
  calving_rate: number;
  estimated_offspring: number;
  reporting_year: number;
  reporting_quarter: number | null;
}

/**
 * Hook to fetch forecast reference coefficients
 */
export function useForecastCoefficients() {
  return useQuery({
    queryKey: ['forecast-coefficients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('forecast_reference_coefficients')
        .select('*')
        .eq('is_active', true)
        .order('coefficient_type');

      if (error) throw error;
      return data as ForecastCoefficient[];
    },
  });
}

/**
 * Hook for admins to update forecast coefficients
 */
export function useUpdateForecastCoefficient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, coefficient_value }: { id: string; coefficient_value: number }) => {
      const { data, error } = await supabase
        .from('forecast_reference_coefficients')
        .update({ coefficient_value, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forecast-coefficients'] });
      queryClient.invalidateQueries({ queryKey: ['indicative-forecast'] });
      queryClient.invalidateQueries({ queryKey: ['farmer-forecast'] });
    },
  });
}

/**
 * Hook to get aggregated indicative forecast by region
 * Available to admin and MPK
 */
export function useIndicativeForecast(year?: number, quarter?: number) {
  const { role } = useAuthContext();

  return useQuery({
    queryKey: ['indicative-forecast', year, quarter],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_indicative_forecast_by_region', {
        p_year: year || null,
        p_quarter: quarter || null,
      });

      if (error) throw error;
      return data as RegionalForecast[];
    },
    enabled: role === 'admin' || role === 'mpk',
  });
}

/**
 * Hook to get farmer's own indicative forecast
 */
export function useFarmerForecast() {
  const { data: farmer } = useCurrentFarmer();

  return useQuery({
    queryKey: ['farmer-forecast', farmer?.id],
    queryFn: async () => {
      if (!farmer?.id) return [];
      
      const { data, error } = await supabase.rpc('get_farmer_indicative_forecast', {
        p_farmer_id: farmer.id,
      });

      if (error) throw error;
      return data as FarmerForecast[];
    },
    enabled: !!farmer?.id,
  });
}
