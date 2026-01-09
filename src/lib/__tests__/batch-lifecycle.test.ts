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
  type BatchLifecycleStatus,
  type BatchRole,
} from '../batch-lifecycle';

// ============================================================================
// BATCH STATUS DEFINITIONS
// ============================================================================
describe('Batch Status Definitions', () => {
  it('should have exactly 6 statuses in correct order', () => {
    expect(BATCH_STATUSES).toEqual([
      'draft',
      'forecast',
      'soft_committed',
      'confirmed',
      'matched',
      'closed',
    ]);
    expect(BATCH_STATUSES.length).toBe(6);
  });

  it('should have draft as initial status', () => {
    expect(INITIAL_BATCH_STATUS).toBe('draft');
  });
});

// ============================================================================
// ENFORCE INITIAL STATUS
// ============================================================================
describe('enforceInitialStatus', () => {
  it('should always return draft status regardless of input', () => {
    const result = enforceInitialStatus({ name: 'Test Batch', status: 'confirmed' });
    expect(result.status).toBe('draft');
    expect(result.name).toBe('Test Batch');
  });

  it('should strip any external status input', () => {
    const inputWithForecast = enforceInitialStatus({ status: 'forecast', heads: 100 });
    expect(inputWithForecast.status).toBe('draft');

    const inputWithMatched = enforceInitialStatus({ status: 'matched', heads: 50 });
    expect(inputWithMatched.status).toBe('draft');

    const inputWithClosed = enforceInitialStatus({ status: 'closed', heads: 25 });
    expect(inputWithClosed.status).toBe('draft');
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
      status: 'confirmed',
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
    expect(getStatusIndex('forecast')).toBe(1);
    expect(getStatusIndex('soft_committed')).toBe(2);
    expect(getStatusIndex('confirmed')).toBe(3);
    expect(getStatusIndex('matched')).toBe(4);
    expect(getStatusIndex('closed')).toBe(5);
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
    it('should allow draft -> forecast', () => {
      expect(isTransitionAllowed('draft', 'forecast')).toBe(true);
    });

    it('should allow forecast -> soft_committed', () => {
      expect(isTransitionAllowed('forecast', 'soft_committed')).toBe(true);
    });

    it('should allow soft_committed -> confirmed', () => {
      expect(isTransitionAllowed('soft_committed', 'confirmed')).toBe(true);
    });

    it('should allow confirmed -> matched', () => {
      expect(isTransitionAllowed('confirmed', 'matched')).toBe(true);
    });

    it('should allow confirmed -> closed (admin direct close)', () => {
      expect(isTransitionAllowed('confirmed', 'closed')).toBe(true);
    });

    it('should allow matched -> closed', () => {
      expect(isTransitionAllowed('matched', 'closed')).toBe(true);
    });
  });

  describe('backward transitions (NOT allowed)', () => {
    it('should NOT allow forecast -> draft', () => {
      expect(isTransitionAllowed('forecast', 'draft')).toBe(false);
    });

    it('should NOT allow soft_committed -> forecast', () => {
      expect(isTransitionAllowed('soft_committed', 'forecast')).toBe(false);
    });

    it('should NOT allow confirmed -> soft_committed', () => {
      expect(isTransitionAllowed('confirmed', 'soft_committed')).toBe(false);
    });

    it('should NOT allow matched -> confirmed', () => {
      expect(isTransitionAllowed('matched', 'confirmed')).toBe(false);
    });

    it('should NOT allow closed -> matched', () => {
      expect(isTransitionAllowed('closed', 'matched')).toBe(false);
    });
  });

  describe('skipping states (NOT allowed)', () => {
    it('should NOT allow draft -> soft_committed (skip forecast)', () => {
      expect(isTransitionAllowed('draft', 'soft_committed')).toBe(false);
    });

    it('should NOT allow draft -> confirmed (skip 2 states)', () => {
      expect(isTransitionAllowed('draft', 'confirmed')).toBe(false);
    });

    it('should NOT allow forecast -> confirmed (skip soft_committed)', () => {
      expect(isTransitionAllowed('forecast', 'confirmed')).toBe(false);
    });

    it('should NOT allow soft_committed -> matched (skip confirmed)', () => {
      expect(isTransitionAllowed('soft_committed', 'matched')).toBe(false);
    });
  });

  describe('terminal state (closed)', () => {
    it('should NOT allow any transitions from closed', () => {
      for (const status of BATCH_STATUSES) {
        if (status !== 'closed') {
          expect(isTransitionAllowed('closed', status)).toBe(false);
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
    it('should allow farmer to transition draft -> forecast', () => {
      expect(canRoleTransition('draft', 'forecast', 'farmer')).toBe(true);
    });

    it('should allow farmer to transition forecast -> soft_committed', () => {
      expect(canRoleTransition('forecast', 'soft_committed', 'farmer')).toBe(true);
    });

    it('should allow farmer to transition soft_committed -> confirmed', () => {
      expect(canRoleTransition('soft_committed', 'confirmed', 'farmer')).toBe(true);
    });

    it('should NOT allow farmer to transition confirmed -> matched', () => {
      expect(canRoleTransition('confirmed', 'matched', 'farmer')).toBe(false);
    });

    it('should NOT allow farmer to transition confirmed -> closed', () => {
      expect(canRoleTransition('confirmed', 'closed', 'farmer')).toBe(false);
    });

    it('should NOT allow farmer to transition matched -> closed', () => {
      expect(canRoleTransition('matched', 'closed', 'farmer')).toBe(false);
    });
  });

  describe('admin role', () => {
    it('should allow admin to perform all allowed transitions', () => {
      expect(canRoleTransition('draft', 'forecast', 'admin')).toBe(true);
      expect(canRoleTransition('forecast', 'soft_committed', 'admin')).toBe(true);
      expect(canRoleTransition('soft_committed', 'confirmed', 'admin')).toBe(true);
      expect(canRoleTransition('confirmed', 'matched', 'admin')).toBe(true);
      expect(canRoleTransition('confirmed', 'closed', 'admin')).toBe(true);
      expect(canRoleTransition('matched', 'closed', 'admin')).toBe(true);
    });

    it('should NOT allow admin to perform invalid FSM transitions', () => {
      expect(canRoleTransition('draft', 'confirmed', 'admin')).toBe(false);
      expect(canRoleTransition('forecast', 'draft', 'admin')).toBe(false);
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
    it('should return [forecast] for draft', () => {
      expect(getAllowedTransitions('draft', 'farmer')).toEqual(['forecast']);
    });

    it('should return [soft_committed] for forecast', () => {
      expect(getAllowedTransitions('forecast', 'farmer')).toEqual(['soft_committed']);
    });

    it('should return [confirmed] for soft_committed', () => {
      expect(getAllowedTransitions('soft_committed', 'farmer')).toEqual(['confirmed']);
    });

    it('should return empty array for confirmed (admin-only transitions)', () => {
      expect(getAllowedTransitions('confirmed', 'farmer')).toEqual([]);
    });

    it('should return empty array for matched', () => {
      expect(getAllowedTransitions('matched', 'farmer')).toEqual([]);
    });

    it('should return empty array for closed', () => {
      expect(getAllowedTransitions('closed', 'farmer')).toEqual([]);
    });
  });

  describe('admin transitions', () => {
    it('should return [forecast] for draft', () => {
      expect(getAllowedTransitions('draft', 'admin')).toEqual(['forecast']);
    });

    it('should return [matched, closed] for confirmed', () => {
      const transitions = getAllowedTransitions('confirmed', 'admin');
      expect(transitions).toContain('matched');
      expect(transitions).toContain('closed');
      expect(transitions.length).toBe(2);
    });

    it('should return [closed] for matched', () => {
      expect(getAllowedTransitions('matched', 'admin')).toEqual(['closed']);
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
    expect(getNextAllowedStatus('draft', 'farmer')).toBe('forecast');
    expect(getNextAllowedStatus('forecast', 'farmer')).toBe('soft_committed');
    expect(getNextAllowedStatus('soft_committed', 'farmer')).toBe('confirmed');
    expect(getNextAllowedStatus('confirmed', 'farmer')).toBeNull();
  });

  it('should return first allowed status for admin', () => {
    expect(getNextAllowedStatus('draft', 'admin')).toBe('forecast');
    expect(getNextAllowedStatus('confirmed', 'admin')).toBe('matched');
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

  it('should return editable for forecast', () => {
    const rules = getEditRulesForStatus('forecast');
    expect(rules.rule).toBe('editable');
    expect(rules.fields.length).toBeGreaterThan(0);
  });

  it('should return editable_with_confirmation for soft_committed', () => {
    const rules = getEditRulesForStatus('soft_committed');
    expect(rules.rule).toBe('editable_with_confirmation');
    expect(rules.confirmationMessage).toBeDefined();
  });

  it('should return read_only for confirmed', () => {
    const rules = getEditRulesForStatus('confirmed');
    expect(rules.rule).toBe('read_only');
    expect(rules.fields).toEqual([]);
    expect(rules.lockedMessage).toBeDefined();
  });

  it('should return read_only for matched', () => {
    const rules = getEditRulesForStatus('matched');
    expect(rules.rule).toBe('read_only');
  });

  it('should return read_only for closed', () => {
    const rules = getEditRulesForStatus('closed');
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

  it('should return true for target_week in forecast', () => {
    expect(isFieldEditable('forecast', 'target_week')).toBe(true);
  });

  it('should return true for breed in soft_committed', () => {
    expect(isFieldEditable('soft_committed', 'breed')).toBe(true);
  });

  it('should return false for any field in confirmed', () => {
    expect(isFieldEditable('confirmed', 'heads')).toBe(false);
    expect(isFieldEditable('confirmed', 'target_week')).toBe(false);
  });

  it('should return false for any field in matched', () => {
    expect(isFieldEditable('matched', 'heads')).toBe(false);
  });

  it('should return false for any field in closed', () => {
    expect(isFieldEditable('closed', 'heads')).toBe(false);
  });
});

// ============================================================================
// EDIT CONFIRMATION
// ============================================================================
describe('requiresEditConfirmation', () => {
  it('should return false for draft', () => {
    expect(requiresEditConfirmation('draft')).toBe(false);
  });

  it('should return false for forecast', () => {
    expect(requiresEditConfirmation('forecast')).toBe(false);
  });

  it('should return true for soft_committed', () => {
    expect(requiresEditConfirmation('soft_committed')).toBe(true);
  });

  it('should return false for confirmed (read-only)', () => {
    expect(requiresEditConfirmation('confirmed')).toBe(false);
  });
});

// ============================================================================
// BATCH DATA EDITABILITY
// ============================================================================
describe('canEditBatchData', () => {
  it('should return true for draft, forecast, soft_committed', () => {
    expect(canEditBatchData('draft')).toBe(true);
    expect(canEditBatchData('forecast')).toBe(true);
    expect(canEditBatchData('soft_committed')).toBe(true);
  });

  it('should return false for confirmed, matched, closed', () => {
    expect(canEditBatchData('confirmed')).toBe(false);
    expect(canEditBatchData('matched')).toBe(false);
    expect(canEditBatchData('closed')).toBe(false);
  });
});

// ============================================================================
// READ-ONLY CHECK
// ============================================================================
describe('isBatchReadOnly', () => {
  it('should return false for draft, forecast, soft_committed', () => {
    expect(isBatchReadOnly('draft')).toBe(false);
    expect(isBatchReadOnly('forecast')).toBe(false);
    expect(isBatchReadOnly('soft_committed')).toBe(false);
  });

  it('should return true for confirmed, matched, closed', () => {
    expect(isBatchReadOnly('confirmed')).toBe(true);
    expect(isBatchReadOnly('matched')).toBe(true);
    expect(isBatchReadOnly('closed')).toBe(true);
  });
});

// ============================================================================
// COMMITMENT CHECK
// ============================================================================
describe('isCommitted', () => {
  it('should return false for draft and forecast', () => {
    expect(isCommitted('draft')).toBe(false);
    expect(isCommitted('forecast')).toBe(false);
  });

  it('should return true for soft_committed and higher', () => {
    expect(isCommitted('soft_committed')).toBe(true);
    expect(isCommitted('confirmed')).toBe(true);
    expect(isCommitted('matched')).toBe(true);
    expect(isCommitted('closed')).toBe(true);
  });
});

// ============================================================================
// MATCHING VISIBILITY
// ============================================================================
describe('isVisibleForMatching', () => {
  it('should return false for draft and forecast', () => {
    expect(isVisibleForMatching('draft')).toBe(false);
    expect(isVisibleForMatching('forecast')).toBe(false);
  });

  it('should return true for soft_committed and confirmed', () => {
    expect(isVisibleForMatching('soft_committed')).toBe(true);
    expect(isVisibleForMatching('confirmed')).toBe(true);
  });

  it('should return false for matched and closed', () => {
    expect(isVisibleForMatching('matched')).toBe(false);
    expect(isVisibleForMatching('closed')).toBe(false);
  });
});

// ============================================================================
// LIFECYCLE COMPLETION
// ============================================================================
describe('isLifecycleComplete', () => {
  it('should return false for draft through confirmed', () => {
    expect(isLifecycleComplete('draft')).toBe(false);
    expect(isLifecycleComplete('forecast')).toBe(false);
    expect(isLifecycleComplete('soft_committed')).toBe(false);
    expect(isLifecycleComplete('confirmed')).toBe(false);
  });

  it('should return true for matched and closed', () => {
    expect(isLifecycleComplete('matched')).toBe(true);
    expect(isLifecycleComplete('closed')).toBe(true);
  });
});

// ============================================================================
// VALIDATE TRANSITION
// ============================================================================
describe('validateTransition', () => {
  it('should return valid for allowed farmer transitions', () => {
    expect(validateTransition('draft', 'forecast', 'farmer')).toEqual({ valid: true });
    expect(validateTransition('forecast', 'soft_committed', 'farmer')).toEqual({ valid: true });
    expect(validateTransition('soft_committed', 'confirmed', 'farmer')).toEqual({ valid: true });
  });

  it('should return valid for allowed admin transitions', () => {
    expect(validateTransition('confirmed', 'matched', 'admin')).toEqual({ valid: true });
    expect(validateTransition('matched', 'closed', 'admin')).toEqual({ valid: true });
  });

  it('should return invalid with error for same status', () => {
    const result = validateTransition('draft', 'draft', 'farmer');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('already set');
  });

  it('should return invalid with error for farmer trying admin-only transition', () => {
    const result = validateTransition('confirmed', 'matched', 'farmer');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Admin');
  });

  it('should return invalid with error for MPK trying any transition', () => {
    const result = validateTransition('draft', 'forecast', 'mpk');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('MPK');
  });

  it('should return invalid with error for backward transition', () => {
    const result = validateTransition('forecast', 'draft', 'farmer');
    expect(result.valid).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('should return invalid with error for skipping states', () => {
    const result = validateTransition('draft', 'confirmed', 'admin');
    expect(result.valid).toBe(false);
    expect(result.error).toBeDefined();
  });
});

// ============================================================================
// TRANSITION CONFIRMATION
// ============================================================================
describe('getTransitionConfirmation', () => {
  it('should require confirmation for soft_committed -> confirmed', () => {
    const confirmation = getTransitionConfirmation('soft_committed', 'confirmed');
    expect(confirmation.requiresConfirmation).toBe(true);
    expect(confirmation.warning).toBeTruthy();
  });

  it('should require confirmation for confirmed -> matched', () => {
    const confirmation = getTransitionConfirmation('confirmed', 'matched');
    expect(confirmation.requiresConfirmation).toBe(true);
  });

  it('should require confirmation for matched -> closed', () => {
    const confirmation = getTransitionConfirmation('matched', 'closed');
    expect(confirmation.requiresConfirmation).toBe(true);
  });

  it('should NOT require confirmation for draft -> forecast', () => {
    const confirmation = getTransitionConfirmation('draft', 'forecast');
    expect(confirmation.requiresConfirmation).toBe(false);
  });

  it('should NOT require confirmation for forecast -> soft_committed', () => {
    const confirmation = getTransitionConfirmation('forecast', 'soft_committed');
    expect(confirmation.requiresConfirmation).toBe(false);
  });

  it('should return Russian translations when lang is ru', () => {
    const confirmationRu = getTransitionConfirmation('soft_committed', 'confirmed', 'ru');
    expect(confirmationRu.title).toContain('Подтвердить');
  });
});

// ============================================================================
// REQUIRES TRANSITION CONFIRMATION
// ============================================================================
describe('requiresTransitionConfirmation', () => {
  it('should return true for critical transitions', () => {
    expect(requiresTransitionConfirmation('soft_committed', 'confirmed')).toBe(true);
    expect(requiresTransitionConfirmation('confirmed', 'matched')).toBe(true);
    expect(requiresTransitionConfirmation('confirmed', 'closed')).toBe(true);
    expect(requiresTransitionConfirmation('matched', 'closed')).toBe(true);
  });

  it('should return false for non-critical transitions', () => {
    expect(requiresTransitionConfirmation('draft', 'forecast')).toBe(false);
    expect(requiresTransitionConfirmation('forecast', 'soft_committed')).toBe(false);
  });
});

// ============================================================================
// BLOCKED TRANSITIONS
// ============================================================================
describe('getBlockedTransitions', () => {
  it('should return blocked transitions for farmer from confirmed', () => {
    const blocked = getBlockedTransitions('confirmed', 'farmer');

    // Should include matched and closed as admin_only
    const matchedBlock = blocked.find(b => b.toStatus === 'matched');
    expect(matchedBlock).toBeDefined();
    expect(matchedBlock?.type).toBe('admin_only');

    const closedBlock = blocked.find(b => b.toStatus === 'closed');
    expect(closedBlock).toBeDefined();
    expect(closedBlock?.type).toBe('admin_only');
  });

  it('should mark backward transitions as revert type', () => {
    const blocked = getBlockedTransitions('forecast', 'farmer');
    const draftBlock = blocked.find(b => b.toStatus === 'draft');
    expect(draftBlock).toBeDefined();
    expect(draftBlock?.type).toBe('revert');
  });

  it('should return all transitions blocked for MPK', () => {
    const blocked = getBlockedTransitions('draft', 'mpk');
    expect(blocked.length).toBe(5); // All except draft itself
  });
});

// ============================================================================
// DISABLED TRANSITION TOOLTIP
// ============================================================================
describe('getDisabledTransitionTooltip', () => {
  it('should return MPK message for MPK role', () => {
    const tooltip = getDisabledTransitionTooltip('draft', 'forecast', 'mpk');
    expect(tooltip).toContain('MPK');
  });

  it('should return revert message for backward transition', () => {
    const tooltip = getDisabledTransitionTooltip('forecast', 'draft', 'farmer');
    expect(tooltip).toContain('revert');
  });

  it('should return admin message for admin-only transition', () => {
    const tooltip = getDisabledTransitionTooltip('confirmed', 'matched', 'farmer');
    expect(tooltip).toContain('Admin');
  });
});

// ============================================================================
// TRANSITION ACTION LABELS
// ============================================================================
describe('getTransitionActionLabel', () => {
  it('should return correct labels for each transition', () => {
    expect(getTransitionActionLabel('forecast')).toBe('Publish to Market');
    expect(getTransitionActionLabel('soft_committed')).toBe('Commit Preliminarily');
    expect(getTransitionActionLabel('confirmed')).toBe('Confirm Availability');
    expect(getTransitionActionLabel('matched')).toBe('Mark as Matched');
    expect(getTransitionActionLabel('closed')).toBe('Close Batch');
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
