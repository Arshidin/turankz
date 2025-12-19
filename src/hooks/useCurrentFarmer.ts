import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import type { Farmer, FarmerGrading } from './useFarmers';

export function useCurrentFarmer() {
  const { user, role } = useAuthContext();

  return useQuery({
    queryKey: ['current-farmer', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('farmers')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data as Farmer | null;
    },
    enabled: !!user?.id && role === 'farmer',
  });
}

export function useFarmerGrading(): FarmerGrading | null {
  const { data: farmer } = useCurrentFarmer();
  return farmer?.grading ?? null;
}

export function useIsObserver(): { isObserver: boolean; isLoading: boolean } {
  const { data: farmer, isLoading } = useCurrentFarmer();
  const { role } = useAuthContext();
  
  // Only applies to farmers
  if (role !== 'farmer') return { isObserver: false, isLoading: false };
  
  return { 
    isObserver: farmer?.grading === 'observer',
    isLoading 
  };
}

export function useCanCreateBatches(): boolean {
  const { data: farmer, isLoading } = useCurrentFarmer();
  const { role, registrationStatus } = useAuthContext();
  
  // Only farmers can create batches
  if (role !== 'farmer') return false;
  
  // While loading, assume restricted
  if (isLoading) return false;
  
  // Must be active registration status
  if (registrationStatus !== 'active') return false;
  
  // Must be at least declared_supplier
  return farmer?.grading === 'declared_supplier' || farmer?.grading === 'standard_supplier';
}
