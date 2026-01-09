import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  POOL_REQUEST_STATUSES,
  POOL_REQUEST_STATUS_LABELS,
  POOL_REQUEST_STATUS_LABELS_RU,
  isTransitionAllowed,
  canRoleTransition,
  validatePoolRequestTransition,
  getAvailableTransitions,
  canEditField,
  getEditableFields,
  canEditPoolRequest,
  isPoolRequestReadOnly,
  getFieldLockedTooltip,
  getPoolRequestLockedTooltip,
  getPoolRequestStatusStyle,
  getNextPoolRequestStatus,
  canSubmitPoolRequest,
  getSubmissionStatusMessage,
  calculateMatchingProgress,
  getMatchingProgressStatus,
  getMatchingProgressLabel,
  getMatchingProgressDescription,
  getProgressStatusStyle,
  getStatusFromProgress,
  type PoolRequestLifecycleStatus,
  type PoolRequestRole,
} from '../pool-request-lifecycle';

// ============================================================================
// STATUS DEFINITIONS
// ============================================================================
describe('Pool Request Status Definitions', () => {
  it('should have exactly 7 statuses', () => {
    expect(POOL_REQUEST_STATUSES).toEqual([
      'draft',
      'submitted',
      'matching',
      'partial',
      'fulfilled',
      'closed',
      'cancelled',
    ]);
    expect(POOL_REQUEST_STATUSES.length).toBe(7);
  });

  it('should have labels for all statuses', () => {
    POOL_REQUEST_STATUSES.forEach(status => {
      expect(POOL_REQUEST_STATUS_LABELS[status]).toBeDefined();
      expect(POOL_REQUEST_STATUS_LABELS_RU[status]).toBeDefined();
    });
  });
});

// ============================================================================
// TRANSITION ALLOWED (FSM RULES)
// ============================================================================
describe('isTransitionAllowed', () => {
  describe('valid transitions', () => {
    it('should allow draft -> submitted', () => {
      expect(isTransitionAllowed('draft', 'submitted')).toBe(true);
    });

    it('should allow draft -> cancelled', () => {
      expect(isTransitionAllowed('draft', 'cancelled')).toBe(true);
    });

    it('should allow submitted -> matching', () => {
      expect(isTransitionAllowed('submitted', 'matching')).toBe(true);
    });

    it('should allow submitted -> cancelled', () => {
      expect(isTransitionAllowed('submitted', 'cancelled')).toBe(true);
    });

    it('should allow matching -> partial', () => {
      expect(isTransitionAllowed('matching', 'partial')).toBe(true);
    });

    it('should allow matching -> fulfilled', () => {
      expect(isTransitionAllowed('matching', 'fulfilled')).toBe(true);
    });

    it('should allow matching -> cancelled', () => {
      expect(isTransitionAllowed('matching', 'cancelled')).toBe(true);
    });

    it('should allow partial -> fulfilled', () => {
      expect(isTransitionAllowed('partial', 'fulfilled')).toBe(true);
    });

    it('should allow partial -> cancelled', () => {
      expect(isTransitionAllowed('partial', 'cancelled')).toBe(true);
    });

    it('should allow fulfilled -> closed', () => {
      expect(isTransitionAllowed('fulfilled', 'closed')).toBe(true);
    });
  });

  describe('invalid transitions', () => {
    it('should NOT allow backward transitions', () => {
      expect(isTransitionAllowed('submitted', 'draft')).toBe(false);
      expect(isTransitionAllowed('matching', 'submitted')).toBe(false);
      expect(isTransitionAllowed('partial', 'matching')).toBe(false);
      expect(isTransitionAllowed('fulfilled', 'partial')).toBe(false);
      expect(isTransitionAllowed('closed', 'fulfilled')).toBe(false);
    });

    it('should NOT allow skipping states', () => {
      expect(isTransitionAllowed('draft', 'matching')).toBe(false);
      expect(isTransitionAllowed('draft', 'fulfilled')).toBe(false);
      expect(isTransitionAllowed('submitted', 'partial')).toBe(false);
      expect(isTransitionAllowed('submitted', 'fulfilled')).toBe(false);
    });

    it('should NOT allow any transitions from terminal states', () => {
      // Closed is terminal
      POOL_REQUEST_STATUSES.forEach(status => {
        if (status !== 'closed') {
          expect(isTransitionAllowed('closed', status)).toBe(false);
        }
      });

      // Cancelled is terminal
      POOL_REQUEST_STATUSES.forEach(status => {
        if (status !== 'cancelled') {
          expect(isTransitionAllowed('cancelled', status)).toBe(false);
        }
      });
    });
  });
});

// ============================================================================
// ROLE-BASED TRANSITIONS
// ============================================================================
describe('canRoleTransition', () => {
  describe('MPK role', () => {
    it('should allow MPK to submit from draft', () => {
      expect(canRoleTransition('draft', 'submitted', 'mpk')).toBe(true);
    });

    it('should allow MPK to cancel from draft', () => {
      expect(canRoleTransition('draft', 'cancelled', 'mpk')).toBe(true);
    });

    it('should allow MPK to cancel from submitted', () => {
      expect(canRoleTransition('submitted', 'cancelled', 'mpk')).toBe(true);
    });

    it('should NOT allow MPK to transition submitted -> matching', () => {
      expect(canRoleTransition('submitted', 'matching', 'mpk')).toBe(false);
    });

    it('should NOT allow MPK to transition matching -> partial', () => {
      expect(canRoleTransition('matching', 'partial', 'mpk')).toBe(false);
    });

    it('should NOT allow MPK to cancel from matching', () => {
      expect(canRoleTransition('matching', 'cancelled', 'mpk')).toBe(false);
    });
  });

  describe('Admin role', () => {
    it('should allow Admin to cancel from draft', () => {
      expect(canRoleTransition('draft', 'cancelled', 'admin')).toBe(true);
    });

    it('should NOT allow Admin to submit (MPK only)', () => {
      expect(canRoleTransition('draft', 'submitted', 'admin')).toBe(false);
    });

    it('should allow Admin to transition submitted -> matching', () => {
      expect(canRoleTransition('submitted', 'matching', 'admin')).toBe(true);
    });

    it('should allow Admin to cancel from submitted', () => {
      expect(canRoleTransition('submitted', 'cancelled', 'admin')).toBe(true);
    });

    it('should allow Admin to transition matching -> partial', () => {
      expect(canRoleTransition('matching', 'partial', 'admin')).toBe(true);
    });

    it('should allow Admin to transition matching -> fulfilled', () => {
      expect(canRoleTransition('matching', 'fulfilled', 'admin')).toBe(true);
    });

    it('should allow Admin to cancel from matching', () => {
      expect(canRoleTransition('matching', 'cancelled', 'admin')).toBe(true);
    });

    it('should allow Admin to transition partial -> fulfilled', () => {
      expect(canRoleTransition('partial', 'fulfilled', 'admin')).toBe(true);
    });

    it('should allow Admin to cancel from partial', () => {
      expect(canRoleTransition('partial', 'cancelled', 'admin')).toBe(true);
    });

    it('should allow Admin to close fulfilled request', () => {
      expect(canRoleTransition('fulfilled', 'closed', 'admin')).toBe(true);
    });
  });
});

// ============================================================================
// VALIDATE POOL REQUEST TRANSITION
// ============================================================================
describe('validatePoolRequestTransition', () => {
  it('should return valid for allowed MPK transitions', () => {
    expect(validatePoolRequestTransition('draft', 'submitted', 'mpk')).toEqual({ valid: true });
    expect(validatePoolRequestTransition('draft', 'cancelled', 'mpk')).toEqual({ valid: true });
  });

  it('should return valid for allowed Admin transitions', () => {
    expect(validatePoolRequestTransition('submitted', 'matching', 'admin')).toEqual({ valid: true });
    expect(validatePoolRequestTransition('matching', 'fulfilled', 'admin')).toEqual({ valid: true });
  });

  it('should return invalid for backward transitions', () => {
    const result = validatePoolRequestTransition('submitted', 'draft', 'mpk');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Cannot revert');
    expect(result.errorRu).toContain('Невозможно вернуться');
  });

  it('should return invalid for skipping states', () => {
    const result = validatePoolRequestTransition('draft', 'matching', 'admin');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('cannot be skipped');
  });

  it('should return invalid for MPK trying admin-only transition', () => {
    const result = validatePoolRequestTransition('submitted', 'matching', 'mpk');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Admin');
  });

  it('should return invalid for Admin trying MPK-only transition', () => {
    const result = validatePoolRequestTransition('draft', 'submitted', 'admin');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('MPK');
  });
});

// ============================================================================
// GET AVAILABLE TRANSITIONS
// ============================================================================
describe('getAvailableTransitions', () => {
  describe('MPK transitions', () => {
    it('should return [submitted, cancelled] for draft', () => {
      const transitions = getAvailableTransitions('draft', 'mpk');
      expect(transitions).toContain('submitted');
      expect(transitions).toContain('cancelled');
      expect(transitions.length).toBe(2);
    });

    it('should return [cancelled] for submitted', () => {
      expect(getAvailableTransitions('submitted', 'mpk')).toEqual(['cancelled']);
    });

    it('should return empty array for matching', () => {
      expect(getAvailableTransitions('matching', 'mpk')).toEqual([]);
    });

    it('should return empty array for partial', () => {
      expect(getAvailableTransitions('partial', 'mpk')).toEqual([]);
    });

    it('should return empty array for fulfilled', () => {
      expect(getAvailableTransitions('fulfilled', 'mpk')).toEqual([]);
    });

    it('should return empty array for closed', () => {
      expect(getAvailableTransitions('closed', 'mpk')).toEqual([]);
    });

    it('should return empty array for cancelled', () => {
      expect(getAvailableTransitions('cancelled', 'mpk')).toEqual([]);
    });
  });

  describe('Admin transitions', () => {
    it('should return [cancelled] for draft', () => {
      expect(getAvailableTransitions('draft', 'admin')).toEqual(['cancelled']);
    });

    it('should return [matching, cancelled] for submitted', () => {
      const transitions = getAvailableTransitions('submitted', 'admin');
      expect(transitions).toContain('matching');
      expect(transitions).toContain('cancelled');
      expect(transitions.length).toBe(2);
    });

    it('should return [partial, fulfilled, cancelled] for matching', () => {
      const transitions = getAvailableTransitions('matching', 'admin');
      expect(transitions).toContain('partial');
      expect(transitions).toContain('fulfilled');
      expect(transitions).toContain('cancelled');
      expect(transitions.length).toBe(3);
    });

    it('should return [fulfilled, cancelled] for partial', () => {
      const transitions = getAvailableTransitions('partial', 'admin');
      expect(transitions).toContain('fulfilled');
      expect(transitions).toContain('cancelled');
      expect(transitions.length).toBe(2);
    });

    it('should return [closed] for fulfilled', () => {
      expect(getAvailableTransitions('fulfilled', 'admin')).toEqual(['closed']);
    });
  });
});

// ============================================================================
// FIELD EDITABILITY
// ============================================================================
describe('canEditField', () => {
  describe('draft status', () => {
    it('should allow MPK to edit all fields in draft', () => {
      expect(canEditField('regions', 'draft', 'mpk')).toBe(true);
      expect(canEditField('required_volume', 'draft', 'mpk')).toBe(true);
      expect(canEditField('target_week', 'draft', 'mpk')).toBe(true);
      expect(canEditField('age_range_min', 'draft', 'mpk')).toBe(true);
      expect(canEditField('weight_range_max', 'draft', 'mpk')).toBe(true);
    });

    it('should allow Admin to edit all fields in draft', () => {
      expect(canEditField('regions', 'draft', 'admin')).toBe(true);
      expect(canEditField('required_volume', 'draft', 'admin')).toBe(true);
    });
  });

  describe('submitted status', () => {
    it('should NOT allow MPK to edit fields in submitted', () => {
      expect(canEditField('regions', 'submitted', 'mpk')).toBe(false);
      expect(canEditField('required_volume', 'submitted', 'mpk')).toBe(false);
    });

    it('should allow Admin to edit fields in submitted (override)', () => {
      expect(canEditField('regions', 'submitted', 'admin')).toBe(true);
      expect(canEditField('required_volume', 'submitted', 'admin')).toBe(true);
    });
  });

  describe('matching and beyond', () => {
    it('should NOT allow any edits in matching', () => {
      expect(canEditField('regions', 'matching', 'mpk')).toBe(false);
      expect(canEditField('regions', 'matching', 'admin')).toBe(false);
    });

    it('should NOT allow any edits in partial', () => {
      expect(canEditField('regions', 'partial', 'mpk')).toBe(false);
      expect(canEditField('regions', 'partial', 'admin')).toBe(false);
    });

    it('should NOT allow any edits in fulfilled', () => {
      expect(canEditField('regions', 'fulfilled', 'mpk')).toBe(false);
      expect(canEditField('regions', 'fulfilled', 'admin')).toBe(false);
    });

    it('should NOT allow any edits in closed', () => {
      expect(canEditField('regions', 'closed', 'mpk')).toBe(false);
      expect(canEditField('regions', 'closed', 'admin')).toBe(false);
    });

    it('should NOT allow any edits in cancelled', () => {
      expect(canEditField('regions', 'cancelled', 'mpk')).toBe(false);
      expect(canEditField('regions', 'cancelled', 'admin')).toBe(false);
    });
  });
});

// ============================================================================
// GET EDITABLE FIELDS
// ============================================================================
describe('getEditableFields', () => {
  it('should return all fields for MPK in draft', () => {
    const fields = getEditableFields('draft', 'mpk');
    expect(fields.length).toBe(7);
    expect(fields).toContain('regions');
    expect(fields).toContain('required_volume');
  });

  it('should return all fields for Admin in submitted', () => {
    const fields = getEditableFields('submitted', 'admin');
    expect(fields.length).toBe(7);
  });

  it('should return empty array for MPK in submitted', () => {
    const fields = getEditableFields('submitted', 'mpk');
    expect(fields.length).toBe(0);
  });

  it('should return empty array for anyone in matching', () => {
    expect(getEditableFields('matching', 'mpk').length).toBe(0);
    expect(getEditableFields('matching', 'admin').length).toBe(0);
  });
});

// ============================================================================
// CAN EDIT POOL REQUEST
// ============================================================================
describe('canEditPoolRequest', () => {
  it('should return true for MPK in draft', () => {
    expect(canEditPoolRequest('draft', 'mpk')).toBe(true);
  });

  it('should return true for Admin in submitted', () => {
    expect(canEditPoolRequest('submitted', 'admin')).toBe(true);
  });

  it('should return false for MPK in submitted', () => {
    expect(canEditPoolRequest('submitted', 'mpk')).toBe(false);
  });

  it('should return false for anyone in matching', () => {
    expect(canEditPoolRequest('matching', 'mpk')).toBe(false);
    expect(canEditPoolRequest('matching', 'admin')).toBe(false);
  });
});

// ============================================================================
// IS POOL REQUEST READ ONLY
// ============================================================================
describe('isPoolRequestReadOnly', () => {
  it('should return false for editable states', () => {
    expect(isPoolRequestReadOnly('draft', 'mpk')).toBe(false);
    expect(isPoolRequestReadOnly('draft', 'admin')).toBe(false);
    expect(isPoolRequestReadOnly('submitted', 'admin')).toBe(false);
  });

  it('should return true for non-editable states', () => {
    expect(isPoolRequestReadOnly('submitted', 'mpk')).toBe(true);
    expect(isPoolRequestReadOnly('matching', 'mpk')).toBe(true);
    expect(isPoolRequestReadOnly('matching', 'admin')).toBe(true);
    expect(isPoolRequestReadOnly('closed', 'admin')).toBe(true);
  });
});

// ============================================================================
// FIELD LOCKED TOOLTIP
// ============================================================================
describe('getFieldLockedTooltip', () => {
  it('should return null for editable fields', () => {
    expect(getFieldLockedTooltip('regions', 'draft', 'mpk')).toBeNull();
    expect(getFieldLockedTooltip('regions', 'submitted', 'admin')).toBeNull();
  });

  it('should return tooltip for MPK in submitted', () => {
    const tooltip = getFieldLockedTooltip('regions', 'submitted', 'mpk');
    expect(tooltip).toContain('locked after submission');
  });

  it('should return tooltip for matching status', () => {
    const tooltip = getFieldLockedTooltip('regions', 'matching', 'admin');
    expect(tooltip).toContain('locked after matching');
  });

  it('should return tooltip for closed status', () => {
    const tooltip = getFieldLockedTooltip('regions', 'closed', 'admin');
    expect(tooltip).toContain('closed');
  });

  it('should return Russian tooltip when specified', () => {
    const tooltip = getFieldLockedTooltip('regions', 'submitted', 'mpk', 'ru');
    expect(tooltip).toContain('заблокирована');
  });
});

// ============================================================================
// POOL REQUEST LOCKED TOOLTIP
// ============================================================================
describe('getPoolRequestLockedTooltip', () => {
  it('should return tooltip for closed request', () => {
    expect(getPoolRequestLockedTooltip('closed', 'admin')).toContain('closed');
  });

  it('should return tooltip for cancelled request', () => {
    expect(getPoolRequestLockedTooltip('cancelled', 'admin')).toContain('closed');
  });

  it('should return tooltip for matching status', () => {
    expect(getPoolRequestLockedTooltip('matching', 'mpk')).toContain('locked');
  });

  it('should return admin override message for MPK in submitted', () => {
    expect(getPoolRequestLockedTooltip('submitted', 'mpk')).toContain('Admin');
  });

  it('should return Russian tooltip when specified', () => {
    expect(getPoolRequestLockedTooltip('closed', 'admin', 'ru')).toContain('закрыта');
  });
});

// ============================================================================
// STATUS STYLE
// ============================================================================
describe('getPoolRequestStatusStyle', () => {
  it('should return outline variant for all statuses', () => {
    POOL_REQUEST_STATUSES.forEach(status => {
      const style = getPoolRequestStatusStyle(status);
      expect(style.variant).toBe('outline');
      expect(style.className).toBeDefined();
    });
  });

  it('should return specific class for draft', () => {
    const style = getPoolRequestStatusStyle('draft');
    expect(style.className).toContain('muted');
  });

  it('should return specific class for submitted', () => {
    const style = getPoolRequestStatusStyle('submitted');
    expect(style.className).toContain('blue');
  });

  it('should return specific class for fulfilled', () => {
    const style = getPoolRequestStatusStyle('fulfilled');
    expect(style.className).toContain('emerald');
  });

  it('should return specific class for cancelled', () => {
    const style = getPoolRequestStatusStyle('cancelled');
    expect(style.className).toContain('destructive');
  });
});

// ============================================================================
// GET NEXT POOL REQUEST STATUS
// ============================================================================
describe('getNextPoolRequestStatus', () => {
  it('should return submitted for MPK in draft', () => {
    expect(getNextPoolRequestStatus('draft', 'mpk')).toBe('submitted');
  });

  it('should return null for MPK in submitted (no non-cancel transition)', () => {
    expect(getNextPoolRequestStatus('submitted', 'mpk')).toBeNull();
  });

  it('should return matching for Admin in submitted', () => {
    expect(getNextPoolRequestStatus('submitted', 'admin')).toBe('matching');
  });

  it('should return partial for Admin in matching', () => {
    expect(getNextPoolRequestStatus('matching', 'admin')).toBe('partial');
  });

  it('should return fulfilled for Admin in partial', () => {
    expect(getNextPoolRequestStatus('partial', 'admin')).toBe('fulfilled');
  });

  it('should return closed for Admin in fulfilled', () => {
    expect(getNextPoolRequestStatus('fulfilled', 'admin')).toBe('closed');
  });

  it('should return null for closed status', () => {
    expect(getNextPoolRequestStatus('closed', 'admin')).toBeNull();
  });
});

// ============================================================================
// MATCHING WINDOW SUBMISSION VALIDATION
// ============================================================================

// Helper to create test MatchingWindow objects with all required fields
const createTestWindow = (overrides: Partial<{
  id: string;
  name: string;
  status: 'upcoming' | 'active' | 'locked' | 'closed';
  start_date: string;
  lock_date: string;
  close_date: string;
  target_week: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}> = {}) => ({
  id: 'window-1',
  name: 'Test Window',
  status: 'active' as const,
  start_date: '2025-01-01',
  lock_date: '2025-01-15',
  close_date: '2025-01-20',
  target_week: '2025-W03',
  notes: null,
  created_at: '2025-01-01',
  updated_at: '2025-01-01',
  created_by: null,
  ...overrides,
});

describe('canSubmitPoolRequest', () => {
  it('should return false when no matching window', () => {
    const result = canSubmitPoolRequest(null);
    expect(result.canSubmit).toBe(false);
    expect(result.isLocked).toBe(true);
    expect(result.reason).toContain('No active matching window');
  });

  it('should return false for upcoming window', () => {
    // Create a window with future start_date to ensure it's treated as upcoming
    const futureStart = new Date();
    futureStart.setDate(futureStart.getDate() + 30);
    const futureLock = new Date();
    futureLock.setDate(futureLock.getDate() + 45);
    const futureClose = new Date();
    futureClose.setDate(futureClose.getDate() + 60);

    const upcomingWindow = createTestWindow({
      status: 'upcoming',
      start_date: futureStart.toISOString(),
      lock_date: futureLock.toISOString(),
      close_date: futureClose.toISOString(),
    });

    const result = canSubmitPoolRequest(upcomingWindow);
    expect(result.canSubmit).toBe(false);
    expect(result.isLocked).toBe(true);
    // Window has not started yet
    expect(result.reason).toBeTruthy();
  });

  it('should return false for locked window', () => {
    const lockedWindow = createTestWindow({
      status: 'locked',
      lock_date: '2025-01-10',
    });

    const result = canSubmitPoolRequest(lockedWindow);
    expect(result.canSubmit).toBe(false);
    expect(result.isLocked).toBe(true);
    expect(result.reason).toContain('locked');
  });

  it('should return true for active window before lock date', () => {
    // Create window with future lock_date
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    const futureCloseDate = new Date();
    futureCloseDate.setDate(futureCloseDate.getDate() + 14);

    const activeWindow = createTestWindow({
      status: 'active',
      start_date: '2025-01-01',
      lock_date: futureDate.toISOString(),
      close_date: futureCloseDate.toISOString(),
    });

    const result = canSubmitPoolRequest(activeWindow);
    expect(result.canSubmit).toBe(true);
    expect(result.isLocked).toBe(false);
    expect(result.deadline).toBeDefined();
  });
});

// ============================================================================
// SUBMISSION STATUS MESSAGE
// ============================================================================
describe('getSubmissionStatusMessage', () => {
  it('should return blocked message when no window', () => {
    const result = getSubmissionStatusMessage(null);
    expect(result.urgency).toBe('blocked');
    expect(result.showCountdown).toBe(false);
  });

  it('should return blocked message when no window (Russian)', () => {
    const result = getSubmissionStatusMessage(null, 'ru');
    expect(result.urgency).toBe('blocked');
    expect(result.title).toContain('закрыто');
  });

  it('should return upcoming message for upcoming window', () => {
    const upcomingWindow = createTestWindow({
      status: 'upcoming',
      start_date: '2025-02-01',
      lock_date: '2025-02-15',
      close_date: '2025-02-20',
    });

    const result = getSubmissionStatusMessage(upcomingWindow);
    expect(result.urgency).toBe('normal');
    expect(result.title).toContain('Upcoming');
  });

  it('should return blocked for locked window', () => {
    const lockedWindow = createTestWindow({
      status: 'locked',
      lock_date: '2025-01-10',
    });

    const result = getSubmissionStatusMessage(lockedWindow);
    expect(result.urgency).toBe('blocked');
    expect(result.title).toContain('Locked');
  });
});

// ============================================================================
// MATCHING PROGRESS CALCULATION
// ============================================================================
describe('calculateMatchingProgress', () => {
  it('should calculate basic progress', () => {
    const progress = calculateMatchingProgress(100, 50);
    expect(progress.requestedVolume).toBe(100);
    expect(progress.matchedVolume).toBe(50);
    expect(progress.remainingVolume).toBe(50);
    expect(progress.fillPercentage).toBe(50);
    expect(progress.isComplete).toBe(false);
  });

  it('should mark as complete when fully matched', () => {
    const progress = calculateMatchingProgress(100, 100);
    expect(progress.fillPercentage).toBe(100);
    expect(progress.remainingVolume).toBe(0);
    expect(progress.isComplete).toBe(true);
  });

  it('should handle over-matching', () => {
    const progress = calculateMatchingProgress(100, 120);
    expect(progress.fillPercentage).toBe(100); // capped at 100
    expect(progress.remainingVolume).toBe(0); // no negative
    expect(progress.isComplete).toBe(true);
  });

  it('should calculate projected percentage with selected heads', () => {
    const progress = calculateMatchingProgress(100, 50, 30);
    expect(progress.projectedFillPercentage).toBe(80);
  });

  it('should handle zero requested volume', () => {
    const progress = calculateMatchingProgress(0, 0);
    expect(progress.fillPercentage).toBe(0);
    expect(progress.projectedFillPercentage).toBe(0);
  });
});

// ============================================================================
// MATCHING PROGRESS STATUS
// ============================================================================
describe('getMatchingProgressStatus', () => {
  it('should return fulfilled when complete', () => {
    const progress = calculateMatchingProgress(100, 100);
    expect(getMatchingProgressStatus(progress)).toBe('fulfilled');
  });

  it('should return near-complete for 80%+', () => {
    const progress = calculateMatchingProgress(100, 85);
    expect(getMatchingProgressStatus(progress)).toBe('near-complete');
  });

  it('should return partial for 50-79%', () => {
    const progress = calculateMatchingProgress(100, 60);
    expect(getMatchingProgressStatus(progress)).toBe('partial');
  });

  it('should return at-risk for 1-49%', () => {
    const progress = calculateMatchingProgress(100, 30);
    expect(getMatchingProgressStatus(progress)).toBe('at-risk');
  });

  it('should return not-started for 0%', () => {
    const progress = calculateMatchingProgress(100, 0);
    expect(getMatchingProgressStatus(progress)).toBe('not-started');
  });
});

// ============================================================================
// MATCHING PROGRESS LABEL
// ============================================================================
describe('getMatchingProgressLabel', () => {
  it('should return English labels by default', () => {
    expect(getMatchingProgressLabel('fulfilled')).toBe('Fulfilled');
    expect(getMatchingProgressLabel('partial')).toBe('Partial');
    expect(getMatchingProgressLabel('not-started')).toBe('Not Started');
  });

  it('should return Russian labels when specified', () => {
    expect(getMatchingProgressLabel('fulfilled', 'ru')).toBe('Выполнено');
    expect(getMatchingProgressLabel('partial', 'ru')).toBe('Частично');
    expect(getMatchingProgressLabel('not-started', 'ru')).toBe('Не начато');
  });
});

// ============================================================================
// MATCHING PROGRESS DESCRIPTION
// ============================================================================
describe('getMatchingProgressDescription', () => {
  it('should return Russian descriptions by default', () => {
    expect(getMatchingProgressDescription('fulfilled')).toContain('полностью');
    expect(getMatchingProgressDescription('at-risk')).toContain('Низкий');
  });

  it('should return English descriptions when specified', () => {
    expect(getMatchingProgressDescription('fulfilled', 'en')).toContain('fully matched');
    expect(getMatchingProgressDescription('at-risk', 'en')).toContain('Low fill rate');
  });
});

// ============================================================================
// PROGRESS STATUS STYLE
// ============================================================================
describe('getProgressStatusStyle', () => {
  it('should return emerald for fulfilled', () => {
    const style = getProgressStatusStyle('fulfilled');
    expect(style.textClass).toContain('emerald');
    expect(style.barClass).toContain('emerald');
  });

  it('should return blue for near-complete', () => {
    const style = getProgressStatusStyle('near-complete');
    expect(style.textClass).toContain('blue');
  });

  it('should return amber for partial', () => {
    const style = getProgressStatusStyle('partial');
    expect(style.textClass).toContain('amber');
  });

  it('should return orange for at-risk', () => {
    const style = getProgressStatusStyle('at-risk');
    expect(style.textClass).toContain('orange');
  });

  it('should return muted for not-started', () => {
    const style = getProgressStatusStyle('not-started');
    expect(style.textClass).toContain('muted');
  });
});

// ============================================================================
// GET STATUS FROM PROGRESS
// ============================================================================
describe('getStatusFromProgress', () => {
  it('should return fulfilled when complete', () => {
    const progress = calculateMatchingProgress(100, 100);
    expect(getStatusFromProgress(progress)).toBe('fulfilled');
  });

  it('should return partial when partially matched', () => {
    const progress = calculateMatchingProgress(100, 50);
    expect(getStatusFromProgress(progress)).toBe('partial');
  });

  it('should return matching when not started', () => {
    const progress = calculateMatchingProgress(100, 0);
    expect(getStatusFromProgress(progress)).toBe('matching');
  });
});
