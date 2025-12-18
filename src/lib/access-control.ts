/**
 * Access Control & Permissions Framework
 * Turan Standard Pool Platform v1.1
 * 
 * This module defines the trust and power boundaries across the platform.
 * All data visibility and actions are strictly role-based.
 */

import type { UserRole } from '@/contexts/RoleContext';

export type { UserRole };

// ============================================================================
// PERMISSION DEFINITIONS
// ============================================================================

export interface RolePermissions {
  // Data visibility
  canView: {
    ownProfile: boolean;
    ownBatches: boolean;
    ownCalendar: boolean;
    allFarmers: boolean;
    allMpks: boolean;
    allBatches: boolean;
    aggregatedSupply: boolean;
    aggregatedDemand: boolean; // Anonymized demand signals for farmers
    farmerIdentities: boolean;
    mpkIdentities: boolean;
    poolRequests: boolean; // Full pool request details
    ownPoolRequests: boolean; // Own pool requests only (for MPK)
    poolMatches: boolean;
    reliabilityScores: boolean;
    auditLogs: boolean;
    governanceData: boolean;
  };
  // Actions
  canAct: {
    declareBatches: boolean;
    changeReadiness: boolean;
    confirmPoolInvitation: boolean;
    declinePoolInvitation: boolean;
    expressInterest: boolean;
    createPoolRequest: boolean;
    modifyPoolRequest: boolean;
    cancelPoolRequest: boolean;
    proposeMatch: boolean;
    approveMatch: boolean;
    updateFarmerGrading: boolean;
    updateMpkStatus: boolean;
    restrictAccess: boolean;
    overrideStatus: boolean;
  };
}

// ============================================================================
// FARMER PERMISSIONS
// - Can view and edit own profile, batches, calendar
// - Can declare batches and change readiness
// - Cannot see MPK identities, demand volumes, or other farmers
// ============================================================================
export const FARMER_PERMISSIONS: RolePermissions = {
  canView: {
    ownProfile: true,
    ownBatches: true,
    ownCalendar: true,
    allFarmers: false,
    allMpks: false,
    allBatches: false,
    aggregatedSupply: false,
    aggregatedDemand: true, // Farmers see anonymized demand signals
    farmerIdentities: false,
    mpkIdentities: false,
    poolRequests: false, // Cannot see full pool request details
    ownPoolRequests: false,
    poolMatches: false,
    reliabilityScores: false,
    auditLogs: false,
    governanceData: false,
  },
  canAct: {
    declareBatches: true,
    changeReadiness: true,
    confirmPoolInvitation: true,
    declinePoolInvitation: true,
    expressInterest: false,
    createPoolRequest: false,
    modifyPoolRequest: false,
    cancelPoolRequest: false,
    proposeMatch: false,
    approveMatch: false,
    updateFarmerGrading: false,
    updateMpkStatus: false,
    restrictAccess: false,
    overrideStatus: false,
  },
};

// ============================================================================
// MPK (MEAT PROCESSING PLANT) PERMISSIONS
// - Can view aggregated supply (anonymized)
// - Can create and manage own pool requests
// - Cannot see farmer identities, contacts, or individual batch ownership
// ============================================================================
export const MPK_PERMISSIONS: RolePermissions = {
  canView: {
    ownProfile: true,
    ownBatches: false,
    ownCalendar: false,
    allFarmers: false,
    allMpks: false,
    allBatches: false,
    aggregatedSupply: true,
    aggregatedDemand: false, // MPK sees own requests, not aggregated demand
    farmerIdentities: false,
    mpkIdentities: false,
    poolRequests: false, // Cannot see all pool requests
    ownPoolRequests: true, // Can see own pool requests
    poolMatches: false, // Cannot see individual batch matches
    reliabilityScores: false,
    auditLogs: false,
    governanceData: false,
  },
  canAct: {
    declareBatches: false,
    changeReadiness: false,
    confirmPoolInvitation: false,
    declinePoolInvitation: false,
    expressInterest: true,
    createPoolRequest: true,
    modifyPoolRequest: true, // Own requests only, within limits
    cancelPoolRequest: true, // Own requests only
    proposeMatch: false,
    approveMatch: false,
    updateFarmerGrading: false,
    updateMpkStatus: false,
    restrictAccess: false,
    overrideStatus: false,
  },
};

// ============================================================================
// ADMIN PERMISSIONS
// - Full read/write access to all data
// - Exclusive control over grading, status, matching, and visibility rules
// - Can override statuses with mandatory internal notes
// ============================================================================
export const ADMIN_PERMISSIONS: RolePermissions = {
  canView: {
    ownProfile: true,
    ownBatches: true,
    ownCalendar: true,
    allFarmers: true,
    allMpks: true,
    allBatches: true,
    aggregatedSupply: true,
    aggregatedDemand: true,
    farmerIdentities: true,
    mpkIdentities: true,
    poolRequests: true, // Full access to all pool requests
    ownPoolRequests: true,
    poolMatches: true, // Full access to individual matches
    reliabilityScores: true,
    auditLogs: true,
    governanceData: true,
  },
  canAct: {
    declareBatches: true,
    changeReadiness: true,
    confirmPoolInvitation: true,
    declinePoolInvitation: true,
    expressInterest: true,
    createPoolRequest: true,
    modifyPoolRequest: true,
    cancelPoolRequest: true,
    proposeMatch: true,
    approveMatch: true,
    updateFarmerGrading: true,
    updateMpkStatus: true,
    restrictAccess: true,
    overrideStatus: true,
  },
};

// ============================================================================
// PERMISSION LOOKUP
// ============================================================================
const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  farmer: FARMER_PERMISSIONS,
  mpk: MPK_PERMISSIONS,
  admin: ADMIN_PERMISSIONS,
};

export function getPermissions(role: UserRole): RolePermissions {
  return ROLE_PERMISSIONS[role];
}

export function canView(role: UserRole, resource: keyof RolePermissions['canView']): boolean {
  return ROLE_PERMISSIONS[role].canView[resource];
}

export function canAct(role: UserRole, action: keyof RolePermissions['canAct']): boolean {
  return ROLE_PERMISSIONS[role].canAct[action];
}

// ============================================================================
// DATA MASKING RULES
// All supply shown to MPK is aggregated and anonymized
// ============================================================================
export interface MaskedSupplyData {
  region: string;
  readiness: 'confirmed' | 'soft_committed' | 'forecast';
  grade: string;
  heads: number;
  targetWeek: string;
  // NO farmer identity, batch number, or contact info
}

export interface AdminSupplyData extends MaskedSupplyData {
  batchNumber: string;
  farmerId: string;
  farmerName: string;
  farmerRegion: string;
  reliabilityScore: string;
}

/**
 * Masks batch data for MPK view - removes all farmer-identifying information
 */
export function maskSupplyForMpk(batches: Array<{
  id: string;
  batch_number: string;
  region: string;
  status: string;
  grade: string;
  heads: number;
  target_week: string;
  user_id: string;
}>): MaskedSupplyData[] {
  return batches.map(batch => ({
    region: batch.region,
    readiness: batch.status as 'confirmed' | 'soft_committed' | 'forecast',
    grade: batch.grade,
    heads: batch.heads,
    targetWeek: batch.target_week,
  }));
}

/**
 * Aggregates supply data by region and readiness for MPK overview
 */
export function aggregateSupplyByRegion(batches: MaskedSupplyData[]): Record<string, {
  confirmed: number;
  soft_committed: number;
  forecast: number;
  total: number;
}> {
  const result: Record<string, { confirmed: number; soft_committed: number; forecast: number; total: number }> = {};
  
  for (const batch of batches) {
    if (!result[batch.region]) {
      result[batch.region] = { confirmed: 0, soft_committed: 0, forecast: 0, total: 0 };
    }
    result[batch.region][batch.readiness] += batch.heads;
    result[batch.region].total += batch.heads;
  }
  
  return result;
}

// ============================================================================
// AUDIT ACTIONS - Actions that require logging
// ============================================================================
export type AuditableAction =
  | 'batch_status_change'
  | 'farmer_grading_update'
  | 'farmer_restriction_applied'
  | 'farmer_restriction_removed'
  | 'mpk_status_update'
  | 'mpk_restriction_applied'
  | 'mpk_restriction_removed'
  | 'pool_match_proposed'
  | 'pool_match_approved'
  | 'pool_request_created'
  | 'pool_request_modified'
  | 'pool_request_cancelled'
  | 'admin_override';

export interface AuditLogEntry {
  action: AuditableAction;
  performedBy: string;
  targetId: string;
  targetType: 'farmer' | 'mpk' | 'batch' | 'pool_request' | 'pool_match';
  previousValue?: string;
  newValue?: string;
  note?: string; // Mandatory for admin overrides
  timestamp: string;
}

// ============================================================================
// TRUST BOUNDARY HELPERS
// ============================================================================

/**
 * Validates that an action is permitted for the given role
 */
export function validateAction(
  role: UserRole,
  action: keyof RolePermissions['canAct'],
  context?: { requiresNote?: boolean; note?: string }
): { allowed: boolean; reason?: string } {
  if (!canAct(role, action)) {
    return { allowed: false, reason: `Role '${role}' is not permitted to perform '${action}'` };
  }
  
  // Admin overrides require mandatory notes
  if (action === 'overrideStatus' && context?.requiresNote && !context?.note) {
    return { allowed: false, reason: 'Admin overrides require a mandatory note' };
  }
  
  return { allowed: true };
}

/**
 * Checks if data should be visible to the given role
 */
export function validateDataAccess(
  role: UserRole,
  resource: keyof RolePermissions['canView'],
  ownerId?: string,
  requesterId?: string
): { allowed: boolean; reason?: string } {
  // For 'own' resources, check ownership
  if (resource.startsWith('own') && ownerId && requesterId && ownerId !== requesterId) {
    return { allowed: false, reason: 'Cannot access another user\'s data' };
  }
  
  if (!canView(role, resource)) {
    return { allowed: false, reason: `Role '${role}' cannot view '${resource}'` };
  }
  
  return { allowed: true };
}
