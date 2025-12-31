import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import { usePoolRequests } from './usePoolRequests';
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

export interface CanCreateRequestsResult {
  canCreate: boolean;
  reason?: string;
  reasonRu?: string;
  activeRequestsCount?: number;
  maxActiveRequests?: number | null;
}

export function useCanCreateRequests(): CanCreateRequestsResult {
  const { data: mpk, isLoading } = useCurrentMpk();
  const { role, registrationStatus } = useAuthContext();
  const { data: requests } = usePoolRequests();
  
  // Only MPKs can create requests
  if (role !== 'mpk') {
    return { canCreate: false, reason: 'Only MPK users can create requests' };
  }
  
  // While loading, assume restricted
  if (isLoading || !mpk) {
    return { canCreate: false, reason: 'Loading MPK profile...' };
  }
  
  // Must be active registration status
  if (registrationStatus !== 'active') {
    return { 
      canCreate: false, 
      reason: 'Account activation required',
      reasonRu: 'Требуется активация аккаунта'
    };
  }
  
  // Must not be request-restricted
  if (mpk.status !== 'active' || mpk.is_request_restricted) {
    return { 
      canCreate: false, 
      reason: 'Account is restricted from creating requests',
      reasonRu: 'Аккаунт ограничен в создании заявок'
    };
  }
  
  // Check max_active_requests limit
  if (mpk.max_active_requests !== null && mpk.max_active_requests > 0) {
    // Count active requests (excluding draft, cancelled, closed)
    const activeRequests = requests?.filter(r => 
      r.mpk_id === mpk.mpk_id && 
      r.status !== 'draft' && 
      r.status !== 'cancelled' && 
      r.status !== 'closed'
    ) || [];
    
    const activeCount = activeRequests.length;
    
    if (activeCount >= mpk.max_active_requests) {
      return {
        canCreate: false,
        reason: `Maximum active requests limit reached (${mpk.max_active_requests}). Cancel or close existing requests to create new ones.`,
        reasonRu: `Достигнут лимит активных заявок (${mpk.max_active_requests}). Отмените или закройте существующие заявки для создания новых.`,
        activeRequestsCount: activeCount,
        maxActiveRequests: mpk.max_active_requests,
      };
    }
  }
  
  return { 
    canCreate: true,
    activeRequestsCount: requests?.filter(r => 
      r.mpk_id === mpk.mpk_id && 
      r.status !== 'draft' && 
      r.status !== 'cancelled' && 
      r.status !== 'closed'
    ).length || 0,
    maxActiveRequests: mpk.max_active_requests,
  };
}
