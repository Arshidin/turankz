import { useRole } from '@/contexts/RoleContext';
import { 
  getPermissions, 
  canView, 
  canAct, 
  validateAction,
  validateDataAccess,
  RolePermissions,
  UserRole
} from '@/lib/access-control';

/**
 * Hook for checking permissions based on current user role
 * Provides type-safe access to permission checks throughout the app
 */
export function usePermissions() {
  const { role } = useRole();
  
  const permissions = getPermissions(role);
  
  return {
    role,
    permissions,
    
    // View permissions
    canViewOwnProfile: () => canView(role, 'ownProfile'),
    canViewOwnBatches: () => canView(role, 'ownBatches'),
    canViewOwnCalendar: () => canView(role, 'ownCalendar'),
    canViewAllFarmers: () => canView(role, 'allFarmers'),
    canViewAllMpks: () => canView(role, 'allMpks'),
    canViewAllBatches: () => canView(role, 'allBatches'),
    canViewAggregatedSupply: () => canView(role, 'aggregatedSupply'),
    canViewFarmerIdentities: () => canView(role, 'farmerIdentities'),
    canViewMpkIdentities: () => canView(role, 'mpkIdentities'),
    canViewPoolRequests: () => canView(role, 'poolRequests'),
    canViewPoolMatches: () => canView(role, 'poolMatches'),
    canViewReliabilityScores: () => canView(role, 'reliabilityScores'),
    canViewAuditLogs: () => canView(role, 'auditLogs'),
    canViewGovernanceData: () => canView(role, 'governanceData'),
    
    // Action permissions
    canDeclareBatches: () => canAct(role, 'declareBatches'),
    canChangeReadiness: () => canAct(role, 'changeReadiness'),
    canConfirmPoolInvitation: () => canAct(role, 'confirmPoolInvitation'),
    canDeclinePoolInvitation: () => canAct(role, 'declinePoolInvitation'),
    canExpressInterest: () => canAct(role, 'expressInterest'),
    canCreatePoolRequest: () => canAct(role, 'createPoolRequest'),
    canModifyPoolRequest: () => canAct(role, 'modifyPoolRequest'),
    canCancelPoolRequest: () => canAct(role, 'cancelPoolRequest'),
    canProposeMatch: () => canAct(role, 'proposeMatch'),
    canApproveMatch: () => canAct(role, 'approveMatch'),
    canUpdateFarmerGrading: () => canAct(role, 'updateFarmerGrading'),
    canUpdateMpkStatus: () => canAct(role, 'updateMpkStatus'),
    canRestrictAccess: () => canAct(role, 'restrictAccess'),
    canOverrideStatus: () => canAct(role, 'overrideStatus'),
    
    // Role checks
    isAdmin: () => role === 'admin',
    isFarmer: () => role === 'farmer',
    isMpk: () => role === 'mpk',
    
    // Validation helpers
    validateAction: (action: keyof RolePermissions['canAct'], context?: { requiresNote?: boolean; note?: string }) => 
      validateAction(role, action, context),
    
    validateDataAccess: (resource: keyof RolePermissions['canView'], ownerId?: string, requesterId?: string) =>
      validateDataAccess(role, resource, ownerId, requesterId),
  };
}

/**
 * Hook for conditional rendering based on permissions
 */
export function useConditionalAccess() {
  const { role } = useRole();
  
  return {
    // Show only to specific roles
    showForAdmin: (content: React.ReactNode) => role === 'admin' ? content : null,
    showForFarmer: (content: React.ReactNode) => role === 'farmer' ? content : null,
    showForMpk: (content: React.ReactNode) => role === 'mpk' ? content : null,
    
    // Hide from specific roles
    hideFromFarmer: (content: React.ReactNode) => role !== 'farmer' ? content : null,
    hideFromMpk: (content: React.ReactNode) => role !== 'mpk' ? content : null,
    
    // Show to multiple roles
    showForRoles: (roles: UserRole[], content: React.ReactNode) => 
      roles.includes(role) ? content : null,
  };
}
