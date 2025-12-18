import { useRole } from '@/contexts/RoleContext';
import { FarmerMatchingView } from './FarmerMatchingView';
import { MpkMatchingView } from './MpkMatchingView';
import { MatchingListPanel } from '@/components/admin/MatchingListPanel';

interface RoleAwareMatchingViewProps {
  /** For farmer view - shows matchings for a specific batch */
  batchId?: string;
  /** For MPK view - shows matchings for a specific request */
  requestId?: string;
  /** For admin panel - compact mode */
  compact?: boolean;
}

/**
 * Role-aware component that displays matching outcomes based on user role:
 * - Farmer: Sees own batches, matched volume (no MPK identity)
 * - MPK: Sees matched volume per request, delivery schedule (no farmer identity)
 * - Admin: Sees full matching details
 */
export function RoleAwareMatchingView({ 
  batchId, 
  requestId, 
  compact = false 
}: RoleAwareMatchingViewProps) {
  const { role } = useRole();

  switch (role) {
    case 'farmer':
      return <FarmerMatchingView batchId={batchId} />;
    
    case 'mpk':
      return <MpkMatchingView requestId={requestId} />;
    
    case 'admin':
      return <MatchingListPanel requestId={requestId} compact={compact} />;
    
    default:
      return null;
  }
}
