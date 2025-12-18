import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import type { Mpk } from './useMpks';

export function useCurrentMpk() {
  const { user, role } = useAuthContext();

  return useQuery({
    queryKey: ['current-mpk', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('mpks')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data as Mpk | null;
    },
    enabled: !!user?.id && role === 'mpk',
  });
}

export function useCanCreateRequests(): boolean {
  const { data: mpk, isLoading } = useCurrentMpk();
  const { role, registrationStatus } = useAuthContext();
  
  // Only MPKs can create requests
  if (role !== 'mpk') return false;
  
  // While loading, assume restricted
  if (isLoading) return false;
  
  // Must be active registration status
  if (registrationStatus !== 'active') return false;
  
  // Must not be request-restricted
  return mpk?.status === 'active' && !mpk?.is_request_restricted;
}
