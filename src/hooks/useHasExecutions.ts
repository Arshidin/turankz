import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import { useRole } from '@/contexts/RoleContext';
import { useCurrentFarmer } from '@/hooks/useCurrentFarmer';
import { useCurrentMpk } from '@/hooks/useCurrentMpk';
import { Database } from '@/integrations/supabase/types';
import { logger } from '@/lib/logger';

type ExecutionStatus = Database['public']['Enums']['execution_status'];

/**
 * Hook to check if the current user has any active execution records.
 * Used for conditional visibility of "Contracts & Execution" menu item.
 * 
 * Returns true if user has at least one execution with status in:
 * matched, scheduled, delivered, confirmed, settled
 */
export function useHasExecutions() {
  const { user } = useAuthContext();
  const { role } = useRole();
  const { data: currentFarmer } = useCurrentFarmer();
  const { data: currentMpk } = useCurrentMpk();

  return useQuery({
    queryKey: ['has-executions', user?.id, role, currentFarmer?.id, currentMpk?.mpk_id],
    queryFn: async () => {
      // Admin always has access
      if (role === 'admin') {
        return true;
      }

      const activeStatuses: ExecutionStatus[] = ['matched', 'scheduled', 'delivered', 'confirmed', 'settled'];

      if (role === 'farmer' && currentFarmer?.user_id) {
        // Check if farmer has any batches with executions
        const { data: batches } = await supabase
          .from('batches')
          .select('id')
          .eq('user_id', currentFarmer.user_id);

        if (!batches || batches.length === 0) {
          return false;
        }

        const batchIds = batches.map(b => b.id);

        const { count, error } = await supabase
          .from('offtake_executions')
          .select('id', { count: 'exact', head: true })
          .in('batch_id', batchIds)
          .in('status', activeStatuses);

        if (error) {
          logger.error('Failed to check farmer executions', error, { action: 'checkFarmerExecutions', role: 'farmer' });
          return false;
        }

        return (count ?? 0) > 0;
      }

      if (role === 'mpk' && currentMpk?.mpk_id) {
        // Check if MPK has any requests with executions
        const { data: requests } = await supabase
          .from('purchase_pool_requests')
          .select('id')
          .eq('mpk_id', currentMpk.mpk_id);

        if (!requests || requests.length === 0) {
          return false;
        }

        const requestIds = requests.map(r => r.id);

        const { count, error } = await supabase
          .from('offtake_executions')
          .select('id', { count: 'exact', head: true })
          .in('request_id', requestIds)
          .in('status', activeStatuses);

        if (error) {
          logger.error('Failed to check MPK executions', error, { action: 'checkMpkExecutions', role: 'mpk' });
          return false;
        }

        return (count ?? 0) > 0;
      }

      return false;
    },
    enabled: !!user && (role === 'admin' || !!currentFarmer || !!currentMpk),
    staleTime: 30000, // Cache for 30 seconds
  });
}
