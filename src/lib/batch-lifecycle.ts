/**
 * BATCH LIFECYCLE MANAGEMENT
 * 
 * Defines the strict, irreversible lifecycle for livestock batches.
 * Status transitions are controlled based on user role permissions.
 */

// Fixed set of batch statuses in lifecycle order
export const BATCH_STATUSES = [
  'draft',
  'forecast',
  'soft_committed',
  'confirmed',
  'matched',
  'closed',
] as const;

export type BatchLifecycleStatus = typeof BATCH_STATUSES[number];

// Labels for display
export const BATCH_STATUS_LABELS: Record<BatchLifecycleStatus, string> = {
  draft: 'Draft',
  forecast: 'Forecast',
  soft_committed: 'Soft Committed',
  confirmed: 'Confirmed',
  matched: 'Matched',
  closed: 'Closed',
};

// Russian translations for status labels
export const BATCH_STATUS_LABELS_RU: Record<BatchLifecycleStatus, string> = {
  draft: 'Черновик',
  forecast: 'Прогноз',
  soft_committed: 'Предварительно',
  confirmed: 'Подтверждено',
  matched: 'Сопоставлено',
  closed: 'Закрыто',
};

// Descriptions for each status
export const BATCH_STATUS_DESCRIPTIONS: Record<BatchLifecycleStatus, string> = {
  draft: 'Initial batch entry, not yet visible to pool',
  forecast: 'Signaled availability, visible in market overview',
  soft_committed: 'Preliminary commitment to sell',
  confirmed: 'Firm commitment, ready for pool matching',
  matched: 'Matched to a purchase pool request',
  closed: 'Transaction completed or batch removed',
};

export const BATCH_STATUS_DESCRIPTIONS_RU: Record<BatchLifecycleStatus, string> = {
  draft: 'Начальная запись, ещё не видна в пуле',
  forecast: 'Заявленная доступность, видна в обзоре рынка',
  soft_committed: 'Предварительное обязательство на продажу',
  confirmed: 'Твёрдое обязательство, готово к сопоставлению',
  matched: 'Сопоставлено с заявкой на покупку',
  closed: 'Сделка завершена или партия закрыта',
};

// Allowed transitions by role
export interface TransitionRule {
  from: BatchLifecycleStatus;
  to: BatchLifecycleStatus;
  allowedRoles: ('farmer' | 'admin')[];
}

export const ALLOWED_TRANSITIONS: TransitionRule[] = [
  // Farmer transitions (forward only)
  { from: 'draft', to: 'forecast', allowedRoles: ['farmer', 'admin'] },
  { from: 'forecast', to: 'soft_committed', allowedRoles: ['farmer', 'admin'] },
  { from: 'soft_committed', to: 'confirmed', allowedRoles: ['farmer', 'admin'] },
  
  // Admin-only transitions
  { from: 'confirmed', to: 'matched', allowedRoles: ['admin'] },
  { from: 'matched', to: 'closed', allowedRoles: ['admin'] },
  
  // Admin can also close directly from confirmed (for edge cases)
  { from: 'confirmed', to: 'closed', allowedRoles: ['admin'] },
];

/**
 * Get the index of a status in the lifecycle
 */
export function getStatusIndex(status: BatchLifecycleStatus): number {
  return BATCH_STATUSES.indexOf(status);
}

/**
 * Check if a transition is allowed for a given role
 */
export function isTransitionAllowed(
  fromStatus: BatchLifecycleStatus,
  toStatus: BatchLifecycleStatus,
  role: 'farmer' | 'admin' | 'mpk'
): boolean {
  // MPK cannot change batch status
  if (role === 'mpk') return false;
  
  const transition = ALLOWED_TRANSITIONS.find(
    t => t.from === fromStatus && t.to === toStatus
  );
  
  if (!transition) return false;
  
  return transition.allowedRoles.includes(role as 'farmer' | 'admin');
}

/**
 * @deprecated Use getAllowedTransitions() instead. This function assumes linear workflow.
 * Get the next allowed status for a given role
 */
export function getNextAllowedStatus(
  currentStatus: BatchLifecycleStatus,
  role: 'farmer' | 'admin' | 'mpk'
): BatchLifecycleStatus | null {
  const allowed = getAllowedTransitions(currentStatus, role);
  return allowed.length > 0 ? allowed[0] : null;
}

/**
 * PRIMARY FUNCTION: Get all allowed transitions from current status for a given role.
 * Returns an array of valid target statuses (no linear assumptions).
 */
export function getAllowedTransitions(
  currentStatus: BatchLifecycleStatus,
  role: 'farmer' | 'admin' | 'mpk'
): BatchLifecycleStatus[] {
  if (role === 'mpk') return [];
  
  return ALLOWED_TRANSITIONS
    .filter(t => t.from === currentStatus && t.allowedRoles.includes(role as 'farmer' | 'admin'))
    .map(t => t.to);
}

/**
 * @deprecated Alias for getAllowedTransitions. Use getAllowedTransitions() directly.
 */
export function getAllNextStatuses(
  currentStatus: BatchLifecycleStatus,
  role: 'farmer' | 'admin' | 'mpk'
): BatchLifecycleStatus[] {
  return getAllowedTransitions(currentStatus, role);
}

// Editable fields for batch
export const BATCH_EDITABLE_FIELDS = [
  'heads',
  'target_week',
  'breed',
  'gender',
  'age_min',
  'age_max',
  'weight_min',
  'weight_max',
] as const;

export type BatchEditableField = typeof BATCH_EDITABLE_FIELDS[number];

// Edit rules by status
export type BatchEditRule = 'editable' | 'editable_with_confirmation' | 'read_only';

export interface BatchEditRules {
  rule: BatchEditRule;
  fields: BatchEditableField[];
  confirmationMessage?: string;
  lockedMessage?: string;
}

/**
 * Get edit rules for a specific status
 */
export function getEditRulesForStatus(status: BatchLifecycleStatus): BatchEditRules {
  switch (status) {
    case 'draft':
    case 'forecast':
      return {
        rule: 'editable',
        fields: [...BATCH_EDITABLE_FIELDS],
      };
    case 'soft_committed':
      return {
        rule: 'editable_with_confirmation',
        fields: [...BATCH_EDITABLE_FIELDS],
        confirmationMessage: 'Changing batch details after Soft Commitment may affect matching priority.',
      };
    case 'confirmed':
    case 'matched':
    case 'closed':
      return {
        rule: 'read_only',
        fields: [],
        lockedMessage: 'Batch is Confirmed and cannot be edited.',
      };
    default:
      return {
        rule: 'read_only',
        fields: [],
        lockedMessage: 'Batch cannot be edited at this status.',
      };
  }
}

/**
 * Check if a specific field is editable for a given status
 */
export function isFieldEditable(status: BatchLifecycleStatus, field: BatchEditableField): boolean {
  const rules = getEditRulesForStatus(status);
  return rules.rule !== 'read_only' && rules.fields.includes(field);
}

/**
 * Check if editing requires confirmation
 */
export function requiresEditConfirmation(status: BatchLifecycleStatus): boolean {
  return getEditRulesForStatus(status).rule === 'editable_with_confirmation';
}

/**
 * Get the locked field tooltip message
 */
export function getLockedFieldTooltip(status: BatchLifecycleStatus): string {
  const rules = getEditRulesForStatus(status);
  return rules.lockedMessage || 'This field cannot be edited.';
}

/**
 * Check if status can be edited (batch data changes)
 * Draft, forecast, and soft_committed batches can have their data edited
 */
export function canEditBatchData(status: BatchLifecycleStatus): boolean {
  return status === 'draft' || status === 'forecast' || status === 'soft_committed';
}

/**
 * Check if batch is fully read-only
 */
export function isBatchReadOnly(status: BatchLifecycleStatus): boolean {
  return status === 'confirmed' || status === 'matched' || status === 'closed';
}

/**
 * Check if batch is in a "committed" state (soft_committed or higher)
 */
export function isCommitted(status: BatchLifecycleStatus): boolean {
  const index = getStatusIndex(status);
  return index >= getStatusIndex('soft_committed');
}

/**
 * Check if batch is visible in pool matching
 * Only soft_committed and confirmed batches are considered for matching
 */
export function isVisibleForMatching(status: BatchLifecycleStatus): boolean {
  return status === 'soft_committed' || status === 'confirmed';
}

/**
 * Check if batch lifecycle is complete (matched or closed)
 */
export function isLifecycleComplete(status: BatchLifecycleStatus): boolean {
  return status === 'matched' || status === 'closed';
}

/**
 * Get the action label for transitioning to a status
 */
export function getTransitionActionLabel(toStatus: BatchLifecycleStatus): string {
  switch (toStatus) {
    case 'forecast':
      return 'Publish to Market';
    case 'soft_committed':
      return 'Commit Preliminarily';
    case 'confirmed':
      return 'Confirm Availability';
    case 'matched':
      return 'Mark as Matched';
    case 'closed':
      return 'Close Batch';
    default:
      return 'Update Status';
  }
}

export function getTransitionActionLabelRu(toStatus: BatchLifecycleStatus): string {
  switch (toStatus) {
    case 'forecast':
      return 'Опубликовать';
    case 'soft_committed':
      return 'Предварительно подтвердить';
    case 'confirmed':
      return 'Подтвердить доступность';
    case 'matched':
      return 'Отметить как сопоставлено';
    case 'closed':
      return 'Закрыть партию';
    default:
      return 'Обновить статус';
  }
}

/**
 * Get tooltip message for disabled transition button
 */
export function getDisabledTransitionTooltip(
  currentStatus: BatchLifecycleStatus,
  targetStatus: BatchLifecycleStatus,
  role: 'farmer' | 'admin' | 'mpk'
): string {
  if (role === 'mpk') {
    return 'MPK users cannot change batch status.';
  }
  
  const currentIndex = getStatusIndex(currentStatus);
  const targetIndex = getStatusIndex(targetStatus);
  
  // Trying to go backwards
  if (targetIndex < currentIndex) {
    return 'Cannot revert to a previous status. Batch lifecycle is irreversible.';
  }
  
  // Check if transition exists but is admin-only
  const transition = ALLOWED_TRANSITIONS.find(
    t => t.from === currentStatus && t.to === targetStatus
  );
  
  if (transition && !transition.allowedRoles.includes(role as 'farmer' | 'admin')) {
    return 'This action requires Admin privileges.';
  }
  
  // Transition not defined in FSM
  if (!transition) {
    return 'This transition is not allowed from the current status.';
  }
  
  return 'This action is not allowed at the current batch status.';
}

export function getDisabledTransitionTooltipRu(
  currentStatus: BatchLifecycleStatus,
  targetStatus: BatchLifecycleStatus,
  role: 'farmer' | 'admin' | 'mpk'
): string {
  if (role === 'mpk') {
    return 'Пользователи МПК не могут изменять статус партии.';
  }
  
  const currentIndex = getStatusIndex(currentStatus);
  const targetIndex = getStatusIndex(targetStatus);
  
  if (targetIndex < currentIndex) {
    return 'Невозможно вернуться к предыдущему статусу. Жизненный цикл партии необратим.';
  }
  
  const transition = ALLOWED_TRANSITIONS.find(
    t => t.from === currentStatus && t.to === targetStatus
  );
  
  if (transition && !transition.allowedRoles.includes(role as 'farmer' | 'admin')) {
    return 'Это действие требует прав Администратора.';
  }
  
  if (!transition) {
    return 'Этот переход недоступен из текущего статуса.';
  }
  
  return 'Это действие недоступно при текущем статусе партии.';
}

/**
 * Validate a status transition and return error if invalid
 */
export function validateTransition(
  fromStatus: BatchLifecycleStatus,
  toStatus: BatchLifecycleStatus,
  role: 'farmer' | 'admin' | 'mpk'
): { valid: boolean; error?: string } {
  if (fromStatus === toStatus) {
    return { valid: false, error: 'Status is already set to this value.' };
  }
  
  if (!isTransitionAllowed(fromStatus, toStatus, role)) {
    return { 
      valid: false, 
      error: getDisabledTransitionTooltip(fromStatus, toStatus, role) 
    };
  }
  
  return { valid: true };
}

/**
 * GUARDRAIL: Explicitly check for invalid direct transitions
 * This provides a hard block for transitions that should never happen
 */
export function isInvalidDirectTransition(
  fromStatus: BatchLifecycleStatus,
  toStatus: BatchLifecycleStatus
): { invalid: boolean; reason?: string } {
  // Block: Draft → Confirmed (must go through Forecast and Soft Committed)
  if (fromStatus === 'draft' && toStatus === 'confirmed') {
    return { 
      invalid: true, 
      reason: 'Cannot confirm directly from Draft. Must progress through Forecast and Soft Committed first.' 
    };
  }
  
  // Block: Forecast → Confirmed (must go through Soft Committed)
  if (fromStatus === 'forecast' && toStatus === 'confirmed') {
    return { 
      invalid: true, 
      reason: 'Cannot confirm directly from Forecast. Must Soft Commit first.' 
    };
  }
  
  // Block: Any status → Draft (no reverting)
  if (toStatus === 'draft' && fromStatus !== 'draft') {
    return { 
      invalid: true, 
      reason: 'Cannot revert to Draft. Batch lifecycle is irreversible.' 
    };
  }
  
  // Block: Confirmed/Matched/Closed → Any earlier status
  if (isBatchReadOnly(fromStatus) && getStatusIndex(toStatus) < getStatusIndex(fromStatus)) {
    return { 
      invalid: true, 
      reason: 'Cannot revert from a locked status. Batch data is final.' 
    };
  }
  
  // Block: Skipping to Matched or Closed without being Confirmed first
  if ((toStatus === 'matched' || toStatus === 'closed') && fromStatus !== 'confirmed' && fromStatus !== 'matched') {
    return { 
      invalid: true, 
      reason: 'Cannot skip to Matched or Closed. Batch must be Confirmed first.' 
    };
  }
  
  return { invalid: false };
}

/**
 * Combined validation: checks both role permissions and FSM rules
 */
export function validateTransitionComplete(
  fromStatus: BatchLifecycleStatus,
  toStatus: BatchLifecycleStatus,
  role: 'farmer' | 'admin' | 'mpk'
): { valid: boolean; error?: string; errorType?: 'permission' | 'fsm_rule' | 'invalid' } {
  // First check FSM rules
  const fsmCheck = isInvalidDirectTransition(fromStatus, toStatus);
  if (fsmCheck.invalid) {
    return { valid: false, error: fsmCheck.reason, errorType: 'fsm_rule' };
  }
  
  // Then check role permissions
  const permissionCheck = validateTransition(fromStatus, toStatus, role);
  if (!permissionCheck.valid) {
    return { valid: false, error: permissionCheck.error, errorType: 'permission' };
  }
  
  return { valid: true };
}

/**
 * Get a list of all blocked actions with explanations
 * Useful for displaying in the FSM panel
 */
export function getBlockedTransitions(
  currentStatus: BatchLifecycleStatus,
  role: 'farmer' | 'admin' | 'mpk'
): Array<{ 
  toStatus: BatchLifecycleStatus; 
  reason: string; 
  type: 'admin_only' | 'blocked' | 'invalid' | 'revert' 
}> {
  const blocked: Array<{ toStatus: BatchLifecycleStatus; reason: string; type: 'admin_only' | 'blocked' | 'invalid' | 'revert' }> = [];
  
  for (const status of BATCH_STATUSES) {
    if (status === currentStatus) continue;
    
    const validation = validateTransitionComplete(currentStatus, status, role);
    if (!validation.valid) {
      let type: 'admin_only' | 'blocked' | 'invalid' | 'revert' = 'blocked';
      
      // Determine type
      const statusIndex = getStatusIndex(status);
      const currentIndex = getStatusIndex(currentStatus);
      
      if (statusIndex < currentIndex) {
        type = 'revert';
      } else if (validation.errorType === 'fsm_rule') {
        type = 'invalid';
      } else if (validation.error?.includes('Admin')) {
        type = 'admin_only';
      }
      
      blocked.push({
        toStatus: status,
        reason: validation.error || 'Transition not allowed',
        type,
      });
    }
  }
  
  return blocked;
}
