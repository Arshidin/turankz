import { describe, it, expect } from 'vitest';
import {
  FARMER_PERMISSIONS,
  MPK_PERMISSIONS,
  ADMIN_PERMISSIONS,
  getPermissions,
  canView,
  canAct,
  maskSupplyForMpk,
  aggregateSupplyByRegion,
  validateAction,
  validateDataAccess,
  type UserRole,
  type MaskedSupplyData,
} from '../access-control';

// ============================================================================
// FARMER PERMISSIONS
// ============================================================================
describe('Farmer Permissions', () => {
  const role: UserRole = 'farmer';

  describe('canView permissions', () => {
    it('should allow viewing own profile', () => {
      expect(FARMER_PERMISSIONS.canView.ownProfile).toBe(true);
      expect(canView(role, 'ownProfile')).toBe(true);
    });

    it('should allow viewing own batches', () => {
      expect(FARMER_PERMISSIONS.canView.ownBatches).toBe(true);
      expect(canView(role, 'ownBatches')).toBe(true);
    });

    it('should allow viewing own calendar', () => {
      expect(FARMER_PERMISSIONS.canView.ownCalendar).toBe(true);
      expect(canView(role, 'ownCalendar')).toBe(true);
    });

    it('should allow viewing aggregated demand (anonymized)', () => {
      expect(FARMER_PERMISSIONS.canView.aggregatedDemand).toBe(true);
      expect(canView(role, 'aggregatedDemand')).toBe(true);
    });

    it('should NOT allow viewing all farmers', () => {
      expect(FARMER_PERMISSIONS.canView.allFarmers).toBe(false);
      expect(canView(role, 'allFarmers')).toBe(false);
    });

    it('should NOT allow viewing all MPKs', () => {
      expect(FARMER_PERMISSIONS.canView.allMpks).toBe(false);
      expect(canView(role, 'allMpks')).toBe(false);
    });

    it('should NOT allow viewing all batches', () => {
      expect(FARMER_PERMISSIONS.canView.allBatches).toBe(false);
      expect(canView(role, 'allBatches')).toBe(false);
    });

    it('should NOT allow viewing aggregated supply', () => {
      expect(FARMER_PERMISSIONS.canView.aggregatedSupply).toBe(false);
      expect(canView(role, 'aggregatedSupply')).toBe(false);
    });

    it('should NOT allow viewing farmer identities', () => {
      expect(FARMER_PERMISSIONS.canView.farmerIdentities).toBe(false);
      expect(canView(role, 'farmerIdentities')).toBe(false);
    });

    it('should NOT allow viewing MPK identities', () => {
      expect(FARMER_PERMISSIONS.canView.mpkIdentities).toBe(false);
      expect(canView(role, 'mpkIdentities')).toBe(false);
    });

    it('should NOT allow viewing pool requests', () => {
      expect(FARMER_PERMISSIONS.canView.poolRequests).toBe(false);
      expect(canView(role, 'poolRequests')).toBe(false);
    });

    it('should NOT allow viewing pool matches', () => {
      expect(FARMER_PERMISSIONS.canView.poolMatches).toBe(false);
      expect(canView(role, 'poolMatches')).toBe(false);
    });

    it('should NOT allow viewing reliability scores', () => {
      expect(FARMER_PERMISSIONS.canView.reliabilityScores).toBe(false);
      expect(canView(role, 'reliabilityScores')).toBe(false);
    });

    it('should NOT allow viewing audit logs', () => {
      expect(FARMER_PERMISSIONS.canView.auditLogs).toBe(false);
      expect(canView(role, 'auditLogs')).toBe(false);
    });
  });

  describe('canAct permissions', () => {
    it('should allow declaring batches', () => {
      expect(FARMER_PERMISSIONS.canAct.declareBatches).toBe(true);
      expect(canAct(role, 'declareBatches')).toBe(true);
    });

    it('should allow changing readiness', () => {
      expect(FARMER_PERMISSIONS.canAct.changeReadiness).toBe(true);
      expect(canAct(role, 'changeReadiness')).toBe(true);
    });

    it('should allow confirming pool invitation', () => {
      expect(FARMER_PERMISSIONS.canAct.confirmPoolInvitation).toBe(true);
      expect(canAct(role, 'confirmPoolInvitation')).toBe(true);
    });

    it('should allow declining pool invitation', () => {
      expect(FARMER_PERMISSIONS.canAct.declinePoolInvitation).toBe(true);
      expect(canAct(role, 'declinePoolInvitation')).toBe(true);
    });

    it('should NOT allow expressing interest', () => {
      expect(FARMER_PERMISSIONS.canAct.expressInterest).toBe(false);
      expect(canAct(role, 'expressInterest')).toBe(false);
    });

    it('should NOT allow creating pool requests', () => {
      expect(FARMER_PERMISSIONS.canAct.createPoolRequest).toBe(false);
      expect(canAct(role, 'createPoolRequest')).toBe(false);
    });

    it('should NOT allow modifying pool requests', () => {
      expect(FARMER_PERMISSIONS.canAct.modifyPoolRequest).toBe(false);
      expect(canAct(role, 'modifyPoolRequest')).toBe(false);
    });

    it('should NOT allow cancelling pool requests', () => {
      expect(FARMER_PERMISSIONS.canAct.cancelPoolRequest).toBe(false);
      expect(canAct(role, 'cancelPoolRequest')).toBe(false);
    });

    it('should NOT allow proposing match', () => {
      expect(FARMER_PERMISSIONS.canAct.proposeMatch).toBe(false);
      expect(canAct(role, 'proposeMatch')).toBe(false);
    });

    it('should NOT allow approving match', () => {
      expect(FARMER_PERMISSIONS.canAct.approveMatch).toBe(false);
      expect(canAct(role, 'approveMatch')).toBe(false);
    });

    it('should NOT allow updating farmer grading', () => {
      expect(FARMER_PERMISSIONS.canAct.updateFarmerGrading).toBe(false);
      expect(canAct(role, 'updateFarmerGrading')).toBe(false);
    });

    it('should NOT allow updating MPK status', () => {
      expect(FARMER_PERMISSIONS.canAct.updateMpkStatus).toBe(false);
      expect(canAct(role, 'updateMpkStatus')).toBe(false);
    });

    it('should NOT allow restricting access', () => {
      expect(FARMER_PERMISSIONS.canAct.restrictAccess).toBe(false);
      expect(canAct(role, 'restrictAccess')).toBe(false);
    });

    it('should NOT allow overriding status', () => {
      expect(FARMER_PERMISSIONS.canAct.overrideStatus).toBe(false);
      expect(canAct(role, 'overrideStatus')).toBe(false);
    });
  });
});

// ============================================================================
// MPK PERMISSIONS
// ============================================================================
describe('MPK Permissions', () => {
  const role: UserRole = 'mpk';

  describe('canView permissions', () => {
    it('should allow viewing own profile', () => {
      expect(MPK_PERMISSIONS.canView.ownProfile).toBe(true);
      expect(canView(role, 'ownProfile')).toBe(true);
    });

    it('should allow viewing aggregated supply', () => {
      expect(MPK_PERMISSIONS.canView.aggregatedSupply).toBe(true);
      expect(canView(role, 'aggregatedSupply')).toBe(true);
    });

    it('should allow viewing own pool requests', () => {
      expect(MPK_PERMISSIONS.canView.ownPoolRequests).toBe(true);
      expect(canView(role, 'ownPoolRequests')).toBe(true);
    });

    it('should NOT allow viewing own batches', () => {
      expect(MPK_PERMISSIONS.canView.ownBatches).toBe(false);
      expect(canView(role, 'ownBatches')).toBe(false);
    });

    it('should NOT allow viewing all farmers', () => {
      expect(MPK_PERMISSIONS.canView.allFarmers).toBe(false);
      expect(canView(role, 'allFarmers')).toBe(false);
    });

    it('should NOT allow viewing farmer identities', () => {
      expect(MPK_PERMISSIONS.canView.farmerIdentities).toBe(false);
      expect(canView(role, 'farmerIdentities')).toBe(false);
    });

    it('should NOT allow viewing all batches', () => {
      expect(MPK_PERMISSIONS.canView.allBatches).toBe(false);
      expect(canView(role, 'allBatches')).toBe(false);
    });

    it('should NOT allow viewing pool requests (all)', () => {
      expect(MPK_PERMISSIONS.canView.poolRequests).toBe(false);
      expect(canView(role, 'poolRequests')).toBe(false);
    });

    it('should NOT allow viewing pool matches', () => {
      expect(MPK_PERMISSIONS.canView.poolMatches).toBe(false);
      expect(canView(role, 'poolMatches')).toBe(false);
    });

    it('should NOT allow viewing aggregated demand', () => {
      expect(MPK_PERMISSIONS.canView.aggregatedDemand).toBe(false);
      expect(canView(role, 'aggregatedDemand')).toBe(false);
    });

    it('should NOT allow viewing reliability scores', () => {
      expect(MPK_PERMISSIONS.canView.reliabilityScores).toBe(false);
      expect(canView(role, 'reliabilityScores')).toBe(false);
    });

    it('should NOT allow viewing audit logs', () => {
      expect(MPK_PERMISSIONS.canView.auditLogs).toBe(false);
      expect(canView(role, 'auditLogs')).toBe(false);
    });
  });

  describe('canAct permissions', () => {
    it('should allow expressing interest', () => {
      expect(MPK_PERMISSIONS.canAct.expressInterest).toBe(true);
      expect(canAct(role, 'expressInterest')).toBe(true);
    });

    it('should allow creating pool requests', () => {
      expect(MPK_PERMISSIONS.canAct.createPoolRequest).toBe(true);
      expect(canAct(role, 'createPoolRequest')).toBe(true);
    });

    it('should allow modifying pool requests (own)', () => {
      expect(MPK_PERMISSIONS.canAct.modifyPoolRequest).toBe(true);
      expect(canAct(role, 'modifyPoolRequest')).toBe(true);
    });

    it('should allow cancelling pool requests (own)', () => {
      expect(MPK_PERMISSIONS.canAct.cancelPoolRequest).toBe(true);
      expect(canAct(role, 'cancelPoolRequest')).toBe(true);
    });

    it('should NOT allow declaring batches', () => {
      expect(MPK_PERMISSIONS.canAct.declareBatches).toBe(false);
      expect(canAct(role, 'declareBatches')).toBe(false);
    });

    it('should NOT allow changing readiness', () => {
      expect(MPK_PERMISSIONS.canAct.changeReadiness).toBe(false);
      expect(canAct(role, 'changeReadiness')).toBe(false);
    });

    it('should NOT allow proposing match', () => {
      expect(MPK_PERMISSIONS.canAct.proposeMatch).toBe(false);
      expect(canAct(role, 'proposeMatch')).toBe(false);
    });

    it('should NOT allow approving match', () => {
      expect(MPK_PERMISSIONS.canAct.approveMatch).toBe(false);
      expect(canAct(role, 'approveMatch')).toBe(false);
    });

    it('should NOT allow overriding status', () => {
      expect(MPK_PERMISSIONS.canAct.overrideStatus).toBe(false);
      expect(canAct(role, 'overrideStatus')).toBe(false);
    });
  });
});

// ============================================================================
// ADMIN PERMISSIONS
// ============================================================================
describe('Admin Permissions', () => {
  const role: UserRole = 'admin';

  describe('canView permissions', () => {
    it('should have full view access', () => {
      expect(ADMIN_PERMISSIONS.canView.ownProfile).toBe(true);
      expect(ADMIN_PERMISSIONS.canView.ownBatches).toBe(true);
      expect(ADMIN_PERMISSIONS.canView.ownCalendar).toBe(true);
      expect(ADMIN_PERMISSIONS.canView.allFarmers).toBe(true);
      expect(ADMIN_PERMISSIONS.canView.allMpks).toBe(true);
      expect(ADMIN_PERMISSIONS.canView.allBatches).toBe(true);
      expect(ADMIN_PERMISSIONS.canView.aggregatedSupply).toBe(true);
      expect(ADMIN_PERMISSIONS.canView.aggregatedDemand).toBe(true);
      expect(ADMIN_PERMISSIONS.canView.farmerIdentities).toBe(true);
      expect(ADMIN_PERMISSIONS.canView.mpkIdentities).toBe(true);
      expect(ADMIN_PERMISSIONS.canView.poolRequests).toBe(true);
      expect(ADMIN_PERMISSIONS.canView.ownPoolRequests).toBe(true);
      expect(ADMIN_PERMISSIONS.canView.poolMatches).toBe(true);
      expect(ADMIN_PERMISSIONS.canView.reliabilityScores).toBe(true);
      expect(ADMIN_PERMISSIONS.canView.auditLogs).toBe(true);
      expect(ADMIN_PERMISSIONS.canView.governanceData).toBe(true);
    });

    it('should return true for all canView checks', () => {
      expect(canView(role, 'allFarmers')).toBe(true);
      expect(canView(role, 'allMpks')).toBe(true);
      expect(canView(role, 'allBatches')).toBe(true);
      expect(canView(role, 'farmerIdentities')).toBe(true);
      expect(canView(role, 'poolMatches')).toBe(true);
      expect(canView(role, 'auditLogs')).toBe(true);
    });
  });

  describe('canAct permissions', () => {
    it('should have full action access', () => {
      expect(ADMIN_PERMISSIONS.canAct.declareBatches).toBe(true);
      expect(ADMIN_PERMISSIONS.canAct.changeReadiness).toBe(true);
      expect(ADMIN_PERMISSIONS.canAct.confirmPoolInvitation).toBe(true);
      expect(ADMIN_PERMISSIONS.canAct.declinePoolInvitation).toBe(true);
      expect(ADMIN_PERMISSIONS.canAct.expressInterest).toBe(true);
      expect(ADMIN_PERMISSIONS.canAct.createPoolRequest).toBe(true);
      expect(ADMIN_PERMISSIONS.canAct.modifyPoolRequest).toBe(true);
      expect(ADMIN_PERMISSIONS.canAct.cancelPoolRequest).toBe(true);
      expect(ADMIN_PERMISSIONS.canAct.proposeMatch).toBe(true);
      expect(ADMIN_PERMISSIONS.canAct.approveMatch).toBe(true);
      expect(ADMIN_PERMISSIONS.canAct.updateFarmerGrading).toBe(true);
      expect(ADMIN_PERMISSIONS.canAct.updateMpkStatus).toBe(true);
      expect(ADMIN_PERMISSIONS.canAct.restrictAccess).toBe(true);
      expect(ADMIN_PERMISSIONS.canAct.overrideStatus).toBe(true);
    });

    it('should return true for all canAct checks', () => {
      expect(canAct(role, 'proposeMatch')).toBe(true);
      expect(canAct(role, 'approveMatch')).toBe(true);
      expect(canAct(role, 'overrideStatus')).toBe(true);
      expect(canAct(role, 'updateFarmerGrading')).toBe(true);
      expect(canAct(role, 'restrictAccess')).toBe(true);
    });
  });
});

// ============================================================================
// GET PERMISSIONS
// ============================================================================
describe('getPermissions', () => {
  it('should return correct permissions for each role', () => {
    expect(getPermissions('farmer')).toEqual(FARMER_PERMISSIONS);
    expect(getPermissions('mpk')).toEqual(MPK_PERMISSIONS);
    expect(getPermissions('admin')).toEqual(ADMIN_PERMISSIONS);
  });
});

// ============================================================================
// DATA MASKING
// ============================================================================
describe('maskSupplyForMpk', () => {
  const testBatches = [
    {
      id: 'batch-1',
      batch_number: 'ALM-2025-001',
      region: 'Almaty',
      status: 'confirmed',
      grade: 'A',
      heads: 100,
      target_week: '2025-W10',
      user_id: 'farmer-123',
    },
    {
      id: 'batch-2',
      batch_number: 'AST-2025-002',
      region: 'Astana',
      status: 'soft_committed',
      grade: 'B',
      heads: 50,
      target_week: '2025-W11',
      user_id: 'farmer-456',
    },
  ];

  it('should remove farmer identifying information', () => {
    const masked = maskSupplyForMpk(testBatches);

    expect(masked.length).toBe(2);

    // Check that identifying info is removed
    masked.forEach(batch => {
      expect(batch).not.toHaveProperty('id');
      expect(batch).not.toHaveProperty('batch_number');
      expect(batch).not.toHaveProperty('user_id');
    });
  });

  it('should preserve supply data (region, grade, heads)', () => {
    const masked = maskSupplyForMpk(testBatches);

    expect(masked[0]).toEqual({
      region: 'Almaty',
      readiness: 'confirmed',
      grade: 'A',
      heads: 100,
      targetWeek: '2025-W10',
    });

    expect(masked[1]).toEqual({
      region: 'Astana',
      readiness: 'soft_committed',
      grade: 'B',
      heads: 50,
      targetWeek: '2025-W11',
    });
  });

  it('should handle empty array', () => {
    const masked = maskSupplyForMpk([]);
    expect(masked).toEqual([]);
  });

  it('should correctly map status to readiness', () => {
    const batchWithForecast = [{
      id: 'batch-3',
      batch_number: 'TEST-001',
      region: 'Test',
      status: 'forecast',
      grade: 'A',
      heads: 10,
      target_week: '2025-W01',
      user_id: 'farmer-789',
    }];

    const masked = maskSupplyForMpk(batchWithForecast);
    expect(masked[0].readiness).toBe('forecast');
  });
});

// ============================================================================
// AGGREGATE SUPPLY BY REGION
// ============================================================================
describe('aggregateSupplyByRegion', () => {
  const maskedData: MaskedSupplyData[] = [
    { region: 'Almaty', readiness: 'confirmed', grade: 'A', heads: 100, targetWeek: '2025-W10' },
    { region: 'Almaty', readiness: 'soft_committed', grade: 'B', heads: 50, targetWeek: '2025-W10' },
    { region: 'Almaty', readiness: 'forecast', grade: 'A', heads: 30, targetWeek: '2025-W11' },
    { region: 'Astana', readiness: 'confirmed', grade: 'A', heads: 200, targetWeek: '2025-W10' },
    { region: 'Astana', readiness: 'confirmed', grade: 'B', heads: 75, targetWeek: '2025-W10' },
  ];

  it('should aggregate heads by region and readiness', () => {
    const aggregated = aggregateSupplyByRegion(maskedData);

    expect(aggregated['Almaty']).toEqual({
      confirmed: 100,
      soft_committed: 50,
      forecast: 30,
      total: 180,
    });

    expect(aggregated['Astana']).toEqual({
      confirmed: 275, // 200 + 75
      soft_committed: 0,
      forecast: 0,
      total: 275,
    });
  });

  it('should handle empty array', () => {
    const aggregated = aggregateSupplyByRegion([]);
    expect(aggregated).toEqual({});
  });

  it('should handle single region', () => {
    const singleRegion: MaskedSupplyData[] = [
      { region: 'Karaganda', readiness: 'confirmed', grade: 'A', heads: 100, targetWeek: '2025-W10' },
    ];

    const aggregated = aggregateSupplyByRegion(singleRegion);
    expect(aggregated['Karaganda']).toEqual({
      confirmed: 100,
      soft_committed: 0,
      forecast: 0,
      total: 100,
    });
  });

  it('should correctly calculate totals', () => {
    const aggregated = aggregateSupplyByRegion(maskedData);

    // Verify total = sum of all readiness states
    expect(aggregated['Almaty'].total).toBe(
      aggregated['Almaty'].confirmed +
      aggregated['Almaty'].soft_committed +
      aggregated['Almaty'].forecast
    );
  });
});

// ============================================================================
// VALIDATE ACTION
// ============================================================================
describe('validateAction', () => {
  describe('farmer actions', () => {
    it('should allow farmer to declare batches', () => {
      const result = validateAction('farmer', 'declareBatches');
      expect(result.allowed).toBe(true);
    });

    it('should NOT allow farmer to propose match', () => {
      const result = validateAction('farmer', 'proposeMatch');
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('farmer');
      expect(result.reason).toContain('proposeMatch');
    });

    it('should NOT allow farmer to override status', () => {
      const result = validateAction('farmer', 'overrideStatus');
      expect(result.allowed).toBe(false);
    });
  });

  describe('mpk actions', () => {
    it('should allow MPK to create pool request', () => {
      const result = validateAction('mpk', 'createPoolRequest');
      expect(result.allowed).toBe(true);
    });

    it('should allow MPK to cancel pool request', () => {
      const result = validateAction('mpk', 'cancelPoolRequest');
      expect(result.allowed).toBe(true);
    });

    it('should NOT allow MPK to declare batches', () => {
      const result = validateAction('mpk', 'declareBatches');
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('mpk');
    });

    it('should NOT allow MPK to approve match', () => {
      const result = validateAction('mpk', 'approveMatch');
      expect(result.allowed).toBe(false);
    });
  });

  describe('admin actions', () => {
    it('should allow admin to perform all actions', () => {
      expect(validateAction('admin', 'declareBatches').allowed).toBe(true);
      expect(validateAction('admin', 'proposeMatch').allowed).toBe(true);
      expect(validateAction('admin', 'approveMatch').allowed).toBe(true);
      expect(validateAction('admin', 'overrideStatus').allowed).toBe(true);
      expect(validateAction('admin', 'restrictAccess').allowed).toBe(true);
    });
  });

  describe('admin override with note requirement', () => {
    it('should require note for admin override', () => {
      const result = validateAction('admin', 'overrideStatus', {
        requiresNote: true,
        note: undefined,
      });
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('mandatory note');
    });

    it('should allow admin override with note', () => {
      const result = validateAction('admin', 'overrideStatus', {
        requiresNote: true,
        note: 'Emergency override for system maintenance',
      });
      expect(result.allowed).toBe(true);
    });

    it('should allow admin override without note when not required', () => {
      const result = validateAction('admin', 'overrideStatus', {
        requiresNote: false,
      });
      expect(result.allowed).toBe(true);
    });
  });
});

// ============================================================================
// VALIDATE DATA ACCESS
// ============================================================================
describe('validateDataAccess', () => {
  describe('own resource access', () => {
    it('should allow access to own profile', () => {
      const result = validateDataAccess('farmer', 'ownProfile', 'user-123', 'user-123');
      expect(result.allowed).toBe(true);
    });

    it('should deny access to another user\'s profile', () => {
      const result = validateDataAccess('farmer', 'ownProfile', 'user-123', 'user-456');
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('another user');
    });

    it('should allow access to own batches', () => {
      const result = validateDataAccess('farmer', 'ownBatches', 'farmer-123', 'farmer-123');
      expect(result.allowed).toBe(true);
    });

    it('should deny farmer access to other\'s batches', () => {
      const result = validateDataAccess('farmer', 'ownBatches', 'farmer-123', 'farmer-456');
      expect(result.allowed).toBe(false);
    });
  });

  describe('role-based resource access', () => {
    it('should deny farmer access to allFarmers', () => {
      const result = validateDataAccess('farmer', 'allFarmers');
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('farmer');
      expect(result.reason).toContain('allFarmers');
    });

    it('should deny MPK access to farmerIdentities', () => {
      const result = validateDataAccess('mpk', 'farmerIdentities');
      expect(result.allowed).toBe(false);
    });

    it('should allow admin access to all resources', () => {
      expect(validateDataAccess('admin', 'allFarmers').allowed).toBe(true);
      expect(validateDataAccess('admin', 'allMpks').allowed).toBe(true);
      expect(validateDataAccess('admin', 'farmerIdentities').allowed).toBe(true);
      expect(validateDataAccess('admin', 'poolMatches').allowed).toBe(true);
      expect(validateDataAccess('admin', 'auditLogs').allowed).toBe(true);
    });
  });

  describe('MPK specific access', () => {
    it('should allow MPK to view aggregatedSupply', () => {
      const result = validateDataAccess('mpk', 'aggregatedSupply');
      expect(result.allowed).toBe(true);
    });

    it('should allow MPK to view ownPoolRequests', () => {
      const result = validateDataAccess('mpk', 'ownPoolRequests', 'mpk-123', 'mpk-123');
      expect(result.allowed).toBe(true);
    });

    it('should deny MPK access to other MPK\'s pool requests', () => {
      const result = validateDataAccess('mpk', 'ownPoolRequests', 'mpk-123', 'mpk-456');
      expect(result.allowed).toBe(false);
    });
  });
});

// ============================================================================
// EDGE CASES AND BOUNDARY CONDITIONS
// ============================================================================
describe('Edge Cases', () => {
  it('should handle undefined owner/requester IDs in validateDataAccess', () => {
    // When no IDs provided, should just check role permission
    const result = validateDataAccess('farmer', 'aggregatedDemand');
    expect(result.allowed).toBe(true);
  });

  it('should handle empty string IDs', () => {
    const result = validateDataAccess('farmer', 'ownBatches', '', '');
    expect(result.allowed).toBe(true); // Empty strings are equal
  });

  it('should correctly differentiate between poolRequests and ownPoolRequests', () => {
    // MPK cannot see all pool requests
    expect(canView('mpk', 'poolRequests')).toBe(false);
    // But can see own pool requests
    expect(canView('mpk', 'ownPoolRequests')).toBe(true);
  });
});
