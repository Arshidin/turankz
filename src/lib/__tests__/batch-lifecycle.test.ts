import { describe, it, expect } from 'vitest';
import {
  BATCH_STATUSES,
  INITIAL_BATCH_STATUS,
  enforceInitialStatus,
  getStatusIndex,
  isTransitionAllowed,
  canRoleTransition,
  getAllowedTransitions,
  getNextAllowedStatus,
  getEditRulesForStatus,
  isFieldEditable,
  requiresEditConfirmation,
  canEditBatchData,
  isBatchReadOnly,
  isCommitted,
  isVisibleForMatching,
  isLifecycleComplete,
  validateTransition,
  getTransitionConfirmation,
  requiresTransitionConfirmation,
  getBlockedTransitions,
  getDisabledTransitionTooltip,
  getTransitionActionLabel,
  getBatchCreationInfo,
  mapLegacyStatus,
  type BatchLifecycleStatus,
  type BatchRole,
} from '../batch-lifecycle';

// ============================================================================
// BATCH STATUS DEFINITIONS (FSM v2 - Simplified)
// ============================================================================
describe('Batch Status Definitions', () => {
  it('should have exactly 4 statuses in correct order', () => {
    expect(BATCH_STATUSES).toEqual([
      'draft',
      'available',
      'committed',
      'completed',
    ]);
    expect(BATCH_STATUSES.length).toBe(4);
  });

  it('should have draft as initial status', () => {
    expect(INITIAL_BATCH_STATUS).toBe('draft');
  });
});

// ============================================================================
// LEGACY STATUS MAPPING
// ============================================================================
describe('mapLegacyStatus', () => {
  it('should map draft to draft', () => {
    expect(mapLegacyStatus('draft')).toBe('draft');
  });

  it('should map forecast to available', () => {
    expect(mapLegacyStatus('forecast')).toBe('available');
  });

  it('should map soft_committed to available', () => {
    expect(mapLegacyStatus('soft_committed')).toBe('available');
  });

  it('should map confirmed to committed', () => {
    expect(mapLegacyStatus('confirmed')).toBe('committed');
  });

  it('should map matched to completed', () => {
    expect(mapLegacyStatus('matched')).toBe('completed');
  });

  it('should map closed to completed', () => {
    expect(mapLegacyStatus('closed')).toBe('completed');
  });

  it('should return draft for unknown status', () => {
    expect(mapLegacyStatus('unknown')).toBe('draft');
  });
});

// ============================================================================
// ENFORCE INITIAL STATUS
// ============================================================================
describe('enforceInitialStatus', () => {
  it('should always return draft status regardless of input', () => {
    const result = enforceInitialStatus({ name: 'Test Batch', status: 'committed' });
    expect(result.status).toBe('draft');
    expect(result.name).toBe('Test Batch');
  });

  it('should strip any external status input', () => {
    const inputWithAvailable = enforceInitialStatus({ status: 'available', heads: 100 });
    expect(inputWithAvailable.status).toBe('draft');

    const inputWithCommitted = enforceInitialStatus({ status: 'committed', heads: 50 });
    expect(inputWithCommitted.status).toBe('draft');

    const inputWithCompleted = enforceInitialStatus({ status: 'completed', heads: 25 });
    expect(inputWithCompleted.status).toBe('draft');
  });

  it('should handle input without status', () => {
    const input = { heads: 100, region: 'Almaty' } as { heads?: number; region?: string; status?: unknown };
    const result = enforceInitialStatus(input);
    expect(result.status).toBe('draft');
    expect((result as Record<string, unknown>).heads).toBe(100);
    expect((result as Record<string, unknown>).region).toBe('Almaty');
  });

  it('should preserve all other fields', () => {
    const input = {
      status: 'committed',
      heads: 100,
      avg_weight: 450,
      region: 'Almaty',
      breed: 'Angus',
      target_week: '2025-W01',
    };
    const result = enforceInitialStatus(input);
    expect(result).toEqual({
      status: 'draft',
      heads: 100,
      avg_weight: 450,
      region: 'Almaty',
      breed: 'Angus',
      target_week: '2025-W01',
    });
  });
});

// ============================================================================
// STATUS INDEX
// ============================================================================
describe('getStatusIndex', () => {
  it('should return correct index for each status', () => {
    expect(getStatusIndex('draft')).toBe(0);
    expect(getStatusIndex('available')).toBe(1);
    expect(getStatusIndex('committed')).toBe(2);
    expect(getStatusIndex('completed')).toBe(3);
  });

  it('should return -1 for invalid status', () => {
    expect(getStatusIndex('invalid' as BatchLifecycleStatus)).toBe(-1);
  });
});

// ============================================================================
// TRANSITION ALLOWED (FSM RULES)
// ============================================================================
describe('isTransitionAllowed', () => {
  describe('forward transitions', () => {
    it('should allow draft -> available', () => {
      expect(isTransitionAllowed('draft', 'available')).toBe(true);
    });

    it('should allow available -> committed', () => {
      expect(isTransitionAllowed('available', 'committed')).toBe(true);
    });

    it('should allow committed -> completed', () => {
      expect(isTransitionAllowed('committed', 'completed')).toBe(true);
    });
  });

  describe('backward transitions (NOT allowed)', () => {
    it('should NOT allow available -> draft', () => {
      expect(isTransitionAllowed('available', 'draft')).toBe(false);
    });

    it('should NOT allow committed -> available', () => {
      expect(isTransitionAllowed('committed', 'available')).toBe(false);
    });

    it('should NOT allow completed -> committed', () => {
      expect(isTransitionAllowed('completed', 'committed')).toBe(false);
    });
  });

  describe('skipping states (NOT allowed)', () => {
    it('should NOT allow draft -> committed (skip available)', () => {
      expect(isTransitionAllowed('draft', 'committed')).toBe(false);
    });

    it('should NOT allow draft -> completed (skip 2 states)', () => {
      expect(isTransitionAllowed('draft', 'completed')).toBe(false);
    });

    it('should NOT allow available -> completed (skip committed)', () => {
      expect(isTransitionAllowed('available', 'completed')).toBe(false);
    });
  });

  describe('terminal state (completed)', () => {
    it('should NOT allow any transitions from completed', () => {
      for (const status of BATCH_STATUSES) {
        if (status !== 'completed') {
          expect(isTransitionAllowed('completed', status)).toBe(false);
        }
      }
    });
  });
});

// ============================================================================
// ROLE-BASED TRANSITIONS
// ============================================================================
describe('canRoleTransition', () => {
  describe('farmer role', () => {
    it('should allow farmer to transition draft -> available', () => {
      expect(canRoleTransition('draft', 'available', 'farmer')).toBe(true);
    });

    it('should allow farmer to transition available -> committed', () => {
      expect(canRoleTransition('available', 'committed', 'farmer')).toBe(true);
    });

    it('should NOT allow farmer to transition committed -> completed', () => {
      expect(canRoleTransition('committed', 'completed', 'farmer')).toBe(false);
    });
  });

  describe('admin role', () => {
    it('should allow admin to perform all allowed transitions', () => {
      expect(canRoleTransition('draft', 'available', 'admin')).toBe(true);
      expect(canRoleTransition('available', 'committed', 'admin')).toBe(true);
      expect(canRoleTransition('committed', 'completed', 'admin')).toBe(true);
    });

    it('should NOT allow admin to perform invalid FSM transitions', () => {
      expect(canRoleTransition('draft', 'committed', 'admin')).toBe(false);
      expect(canRoleTransition('available', 'draft', 'admin')).toBe(false);
    });
  });

  describe('mpk role', () => {
    it('should NOT allow MPK to change batch status at all', () => {
      for (const fromStatus of BATCH_STATUSES) {
        for (const toStatus of BATCH_STATUSES) {
          if (fromStatus !== toStatus) {
            expect(canRoleTransition(fromStatus, toStatus, 'mpk')).toBe(false);
          }
        }
      }
    });
  });
});

// ============================================================================
// GET ALLOWED TRANSITIONS
// ============================================================================
describe('getAllowedTransitions', () => {
  describe('farmer transitions', () => {
    it('should return [available] for draft', () => {
      expect(getAllowedTransitions('draft', 'farmer')).toEqual(['available']);
    });

    it('should return [committed] for available', () => {
      expect(getAllowedTransitions('available', 'farmer')).toEqual(['committed']);
    });

    it('should return empty array for committed (admin-only transition)', () => {
      expect(getAllowedTransitions('committed', 'farmer')).toEqual([]);
    });

    it('should return empty array for completed', () => {
      expect(getAllowedTransitions('completed', 'farmer')).toEqual([]);
    });
  });

  describe('admin transitions', () => {
    it('should return [available] for draft', () => {
      expect(getAllowedTransitions('draft', 'admin')).toEqual(['available']);
    });

    it('should return [committed] for available', () => {
      expect(getAllowedTransitions('available', 'admin')).toEqual(['committed']);
    });

    it('should return [completed] for committed', () => {
      expect(getAllowedTransitions('committed', 'admin')).toEqual(['completed']);
    });

    it('should return empty array for completed', () => {
      expect(getAllowedTransitions('completed', 'admin')).toEqual([]);
    });
  });

  describe('mpk transitions', () => {
    it('should return empty array for all statuses', () => {
      for (const status of BATCH_STATUSES) {
        expect(getAllowedTransitions(status, 'mpk')).toEqual([]);
      }
    });
  });
});

// ============================================================================
// GET NEXT ALLOWED STATUS (deprecated but still used)
// ============================================================================
describe('getNextAllowedStatus', () => {
  it('should return first allowed status for farmer', () => {
    expect(getNextAllowedStatus('draft', 'farmer')).toBe('available');
    expect(getNextAllowedStatus('available', 'farmer')).toBe('committed');
    expect(getNextAllowedStatus('committed', 'farmer')).toBeNull();
    expect(getNextAllowedStatus('completed', 'farmer')).toBeNull();
  });

  it('should return first allowed status for admin', () => {
    expect(getNextAllowedStatus('draft', 'admin')).toBe('available');
    expect(getNextAllowedStatus('available', 'admin')).toBe('committed');
    expect(getNextAllowedStatus('committed', 'admin')).toBe('completed');
    expect(getNextAllowedStatus('completed', 'admin')).toBeNull();
  });
});

// ============================================================================
// EDIT RULES
// ============================================================================
describe('getEditRulesForStatus', () => {
  it('should return editable for draft', () => {
    const rules = getEditRulesForStatus('draft');
    expect(rules.rule).toBe('editable');
    expect(rules.fields.length).toBeGreaterThan(0);
  });

  it('should return editable_with_confirmation for available', () => {
    const rules = getEditRulesForStatus('available');
    expect(rules.rule).toBe('editable_with_confirmation');
    expect(rules.confirmationMessage).toBeDefined();
  });

  it('should return read_only for committed', () => {
    const rules = getEditRulesForStatus('committed');
    expect(rules.rule).toBe('read_only');
    expect(rules.fields).toEqual([]);
    expect(rules.lockedMessage).toBeDefined();
  });

  it('should return read_only for completed', () => {
    const rules = getEditRulesForStatus('completed');
    expect(rules.rule).toBe('read_only');
  });
});

// ============================================================================
// FIELD EDITABILITY
// ============================================================================
describe('isFieldEditable', () => {
  it('should return true for heads in draft', () => {
    expect(isFieldEditable('draft', 'heads')).toBe(true);
  });

  it('should return true for target_week in available', () => {
    expect(isFieldEditable('available', 'target_week')).toBe(true);
  });

  it('should return false for any field in committed', () => {
    expect(isFieldEditable('committed', 'heads')).toBe(false);
    expect(isFieldEditable('committed', 'target_week')).toBe(false);
  });

  it('should return false for any field in completed', () => {
    expect(isFieldEditable('completed', 'heads')).toBe(false);
  });
});

// ============================================================================
// EDIT CONFIRMATION
// ============================================================================
describe('requiresEditConfirmation', () => {
  it('should return false for draft', () => {
    expect(requiresEditConfirmation('draft')).toBe(false);
  });

  it('should return true for available', () => {
    expect(requiresEditConfirmation('available')).toBe(true);
  });

  it('should return false for committed (read-only)', () => {
    expect(requiresEditConfirmation('committed')).toBe(false);
  });

  it('should return false for completed (read-only)', () => {
    expect(requiresEditConfirmation('completed')).toBe(false);
  });
});

// ============================================================================
// BATCH DATA EDITABILITY
// ============================================================================
describe('canEditBatchData', () => {
  it('should return true for draft and available', () => {
    expect(canEditBatchData('draft')).toBe(true);
    expect(canEditBatchData('available')).toBe(true);
  });

  it('should return false for committed and completed', () => {
    expect(canEditBatchData('committed')).toBe(false);
    expect(canEditBatchData('completed')).toBe(false);
  });
});

// ============================================================================
// READ-ONLY CHECK
// ============================================================================
describe('isBatchReadOnly', () => {
  it('should return false for draft and available', () => {
    expect(isBatchReadOnly('draft')).toBe(false);
    expect(isBatchReadOnly('available')).toBe(false);
  });

  it('should return true for committed and completed', () => {
    expect(isBatchReadOnly('committed')).toBe(true);
    expect(isBatchReadOnly('completed')).toBe(true);
  });
});

// ============================================================================
// COMMITMENT CHECK
// ============================================================================
describe('isCommitted', () => {
  it('should return false for draft and available', () => {
    expect(isCommitted('draft')).toBe(false);
    expect(isCommitted('available')).toBe(false);
  });

  it('should return true for committed and completed', () => {
    expect(isCommitted('committed')).toBe(true);
    expect(isCommitted('completed')).toBe(true);
  });
});

// ============================================================================
// MATCHING VISIBILITY
// ============================================================================
describe('isVisibleForMatching', () => {
  it('should return false for draft', () => {
    expect(isVisibleForMatching('draft')).toBe(false);
  });

  it('should return true for available and committed', () => {
    expect(isVisibleForMatching('available')).toBe(true);
    expect(isVisibleForMatching('committed')).toBe(true);
  });

  it('should return false for completed', () => {
    expect(isVisibleForMatching('completed')).toBe(false);
  });
});

// ============================================================================
// LIFECYCLE COMPLETION
// ============================================================================
describe('isLifecycleComplete', () => {
  it('should return false for draft, available, and committed', () => {
    expect(isLifecycleComplete('draft')).toBe(false);
    expect(isLifecycleComplete('available')).toBe(false);
    expect(isLifecycleComplete('committed')).toBe(false);
  });

  it('should return true for completed', () => {
    expect(isLifecycleComplete('completed')).toBe(true);
  });
});

// ============================================================================
// VALIDATE TRANSITION
// ============================================================================
describe('validateTransition', () => {
  it('should return valid for allowed farmer transitions', () => {
    expect(validateTransition('draft', 'available', 'farmer')).toEqual({ valid: true });
    expect(validateTransition('available', 'committed', 'farmer')).toEqual({ valid: true });
  });

  it('should return valid for allowed admin transitions', () => {
    expect(validateTransition('draft', 'available', 'admin')).toEqual({ valid: true });
    expect(validateTransition('available', 'committed', 'admin')).toEqual({ valid: true });
    expect(validateTransition('committed', 'completed', 'admin')).toEqual({ valid: true });
  });

  it('should return invalid with error for same status', () => {
    const result = validateTransition('draft', 'draft', 'farmer');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('already set');
  });

  it('should return invalid with error for farmer trying admin-only transition', () => {
    const result = validateTransition('committed', 'completed', 'farmer');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Admin');
  });

  it('should return invalid with error for MPK trying any transition', () => {
    const result = validateTransition('draft', 'available', 'mpk');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('MPK');
  });

  it('should return invalid with error for backward transition', () => {
    const result = validateTransition('available', 'draft', 'farmer');
    expect(result.valid).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('should return invalid with error for skipping states', () => {
    const result = validateTransition('draft', 'committed', 'admin');
    expect(result.valid).toBe(false);
    expect(result.error).toBeDefined();
  });
});

// ============================================================================
// TRANSITION CONFIRMATION
// ============================================================================
describe('getTransitionConfirmation', () => {
  it('should require confirmation for available -> committed', () => {
    const confirmation = getTransitionConfirmation('available', 'committed');
    expect(confirmation.requiresConfirmation).toBe(true);
    expect(confirmation.warning).toBeTruthy();
  });

  it('should require confirmation for committed -> completed', () => {
    const confirmation = getTransitionConfirmation('committed', 'completed');
    expect(confirmation.requiresConfirmation).toBe(true);
  });

  it('should NOT require confirmation for draft -> available', () => {
    const confirmation = getTransitionConfirmation('draft', 'available');
    expect(confirmation.requiresConfirmation).toBe(false);
  });

  it('should return Russian translations when lang is ru', () => {
    const confirmationRu = getTransitionConfirmation('available', 'committed', 'ru');
    expect(confirmationRu.title).toContain('Подтвердить');
  });
});

// ============================================================================
// REQUIRES TRANSITION CONFIRMATION
// ============================================================================
describe('requiresTransitionConfirmation', () => {
  it('should return true for critical transitions', () => {
    expect(requiresTransitionConfirmation('available', 'committed')).toBe(true);
    expect(requiresTransitionConfirmation('committed', 'completed')).toBe(true);
  });

  it('should return false for non-critical transitions', () => {
    expect(requiresTransitionConfirmation('draft', 'available')).toBe(false);
  });
});

// ============================================================================
// BLOCKED TRANSITIONS
// ============================================================================
describe('getBlockedTransitions', () => {
  it('should return blocked transitions for farmer from committed', () => {
    const blocked = getBlockedTransitions('committed', 'farmer');

    // Should include completed as admin_only
    const completedBlock = blocked.find(b => b.toStatus === 'completed');
    expect(completedBlock).toBeDefined();
    expect(completedBlock?.type).toBe('admin_only');
  });

  it('should mark backward transitions as revert type', () => {
    const blocked = getBlockedTransitions('available', 'farmer');
    const draftBlock = blocked.find(b => b.toStatus === 'draft');
    expect(draftBlock).toBeDefined();
    expect(draftBlock?.type).toBe('revert');
  });

  it('should return all transitions blocked for MPK', () => {
    const blocked = getBlockedTransitions('draft', 'mpk');
    expect(blocked.length).toBe(3); // available, committed, completed
  });
});

// ============================================================================
// DISABLED TRANSITION TOOLTIP
// ============================================================================
describe('getDisabledTransitionTooltip', () => {
  it('should return MPK message for MPK role', () => {
    const tooltip = getDisabledTransitionTooltip('draft', 'available', 'mpk');
    expect(tooltip).toContain('MPK');
  });

  it('should return revert message for backward transition', () => {
    const tooltip = getDisabledTransitionTooltip('available', 'draft', 'farmer');
    expect(tooltip).toContain('revert');
  });

  it('should return admin message for admin-only transition', () => {
    const tooltip = getDisabledTransitionTooltip('committed', 'completed', 'farmer');
    expect(tooltip).toContain('Admin');
  });
});

// ============================================================================
// TRANSITION ACTION LABELS
// ============================================================================
describe('getTransitionActionLabel', () => {
  it('should return correct labels for each transition', () => {
    expect(getTransitionActionLabel('available')).toBe('Publish to Market');
    expect(getTransitionActionLabel('committed')).toBe('Confirm Commitment');
    expect(getTransitionActionLabel('completed')).toBe('Mark as Completed');
  });
});

// ============================================================================
// BATCH CREATION INFO
// ============================================================================
describe('getBatchCreationInfo', () => {
  it('should return English info by default', () => {
    const info = getBatchCreationInfo();
    expect(info.title).toBe('Batch Lifecycle');
    expect(info.description).toContain('Draft');
  });

  it('should return Russian info when specified', () => {
    const info = getBatchCreationInfo('ru');
    expect(info.title).toContain('Жизненный цикл');
    expect(info.description).toContain('Черновик');
  });
});
