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

/**
 * STRICT BATCH CREATION RULES
 * All newly created batches MUST start with this status.
 * This is the only valid entry point into the batch lifecycle.
 */
export const INITIAL_BATCH_STATUS: BatchLifecycleStatus = 'draft';

/**
 * Enforce initial batch status - strips any external status input
 * and returns the mandatory initial status.
 */
export function enforceInitialStatus<T extends { status?: unknown }>(
  batchData: T
): Omit<T, 'status'> & { status: typeof INITIAL_BATCH_STATUS } {
  // Remove any external status input and enforce draft
  const { status: _ignoredStatus, ...rest } = batchData;
  return {
    ...rest,
    status: INITIAL_BATCH_STATUS,
  };
}

/**
 * Get informational text about batch lifecycle entry
 */
export function getBatchCreationInfo(lang: 'en' | 'ru' = 'en'): {
  title: string;
  description: string;
} {
  return lang === 'ru' 
    ? {
        title: 'Жизненный цикл партии',
        description: 'Все партии начинаются со статуса "Черновик" и должны проходить через определённые этапы жизненного цикла.',
      }
    : {
        title: 'Batch Lifecycle',
        description: 'All batches start in Draft and must progress through defined lifecycle stages.',
      };
}

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

// Role types that can perform transitions
export type BatchRole = 'farmer' | 'admin' | 'mpk';

// Unified transition rules: combines allowed transitions with role permissions
// This eliminates duplication and follows the same pattern as pool-request-lifecycle.ts
interface TransitionRule {
  to: BatchLifecycleStatus;
  roles: ('farmer' | 'admin')[];
}

const TRANSITION_RULES: Record<BatchLifecycleStatus, TransitionRule[]> = {
  draft: [
    { to: 'forecast', roles: ['farmer', 'admin'] },
  ],
  forecast: [
    { to: 'soft_committed', roles: ['farmer', 'admin'] },
  ],
  soft_committed: [
    { to: 'confirmed', roles: ['farmer', 'admin'] },
  ],
  confirmed: [
    { to: 'matched', roles: ['admin'] },
    { to: 'closed', roles: ['admin'] }, // Admin can close directly from confirmed
  ],
  matched: [
    { to: 'closed', roles: ['admin'] },
  ],
  closed: [], // Terminal state - no transitions allowed
};

/**
 * Get the index of a status in the lifecycle
 */
export function getStatusIndex(status: BatchLifecycleStatus): number {
  return BATCH_STATUSES.indexOf(status);
}

/**
 * Check if a transition is allowed by the FSM (regardless of role)
 */
export function isTransitionAllowed(
  fromStatus: BatchLifecycleStatus,
  toStatus: BatchLifecycleStatus
): boolean {
  const rules = TRANSITION_RULES[fromStatus] || [];
  return rules.some(rule => rule.to === toStatus);
}

/**
 * Check if a role can perform a specific transition
 */
export function canRoleTransition(
  fromStatus: BatchLifecycleStatus,
  toStatus: BatchLifecycleStatus,
  role: BatchRole
): boolean {
  // MPK cannot change batch status
  if (role === 'mpk') return false;

  const rules = TRANSITION_RULES[fromStatus] || [];
  const matchingRule = rules.find(rule => rule.to === toStatus);
  return matchingRule?.roles.includes(role as 'farmer' | 'admin') ?? false;
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
  role: BatchRole
): BatchLifecycleStatus[] {
  if (role === 'mpk') return [];

  const rules = TRANSITION_RULES[currentStatus] || [];
  return rules
    .filter(rule => rule.roles.includes(role as 'farmer' | 'admin'))
    .map(rule => rule.to);
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
 * CONFIRMATION DIALOG CONFIGURATION
 * Centralized confirmation messages for critical status transitions.
 */
export interface TransitionConfirmation {
  title: string;
  message: string;
  warning: string;
  requiresConfirmation: boolean;
}

/**
 * Get confirmation dialog configuration for a transition
 */
export function getTransitionConfirmation(
  fromStatus: BatchLifecycleStatus,
  toStatus: BatchLifecycleStatus,
  lang: 'en' | 'ru' = 'en'
): TransitionConfirmation {
  // Soft Committed → Confirmed
  if (fromStatus === 'soft_committed' && toStatus === 'confirmed') {
    return lang === 'ru' ? {
      title: 'Подтвердить доступность партии',
      message: 'Вы принимаете твёрдое обязательство. Данные партии будут заблокированы и недоступны для изменения после этого действия.',
      warning: 'Это действие необратимо. Убедитесь, что все данные партии корректны перед подтверждением.',
      requiresConfirmation: true,
    } : {
      title: 'Confirm Batch Availability',
      message: 'You are making a firm commitment. Batch data will be locked and cannot be modified after this action.',
      warning: 'This action is irreversible. Ensure all batch details are correct before confirming.',
      requiresConfirmation: true,
    };
  }

  // Confirmed → Matched (Admin only)
  if (fromStatus === 'confirmed' && toStatus === 'matched') {
    return lang === 'ru' ? {
      title: 'Отметить партию как сопоставленную',
      message: 'Партия будет отмечена как сопоставленная с заявкой на покупку.',
      warning: 'Продолжайте только если партия успешно сопоставлена в системе пула.',
      requiresConfirmation: true,
    } : {
      title: 'Mark Batch as Matched',
      message: 'This will mark the batch as matched to a purchase pool request.',
      warning: 'Only proceed if the batch has been successfully matched in the pool system.',
      requiresConfirmation: true,
    };
  }

  // Confirmed → Closed (Admin only)
  if (fromStatus === 'confirmed' && toStatus === 'closed') {
    return lang === 'ru' ? {
      title: 'Закрыть партию',
      message: 'Партия будет закрыта без сопоставления.',
      warning: 'Это действие необратимо.',
      requiresConfirmation: true,
    } : {
      title: 'Close Batch',
      message: 'This will close the batch without matching.',
      warning: 'This action is irreversible.',
      requiresConfirmation: true,
    };
  }

  // Matched → Closed
  if (fromStatus === 'matched' && toStatus === 'closed') {
    return lang === 'ru' ? {
      title: 'Завершить партию',
      message: 'Партия будет закрыта после успешного сопоставления.',
      warning: 'Это действие необратимо.',
      requiresConfirmation: true,
    } : {
      title: 'Complete Batch',
      message: 'This will close the batch after successful matching.',
      warning: 'This action is irreversible.',
      requiresConfirmation: true,
    };
  }

  // Forecast → Soft Committed (optional confirmation)
  if (fromStatus === 'forecast' && toStatus === 'soft_committed') {
    return lang === 'ru' ? {
      title: 'Предварительное подтверждение',
      message: 'Предварительное подтверждение сигнализирует о намерении продать, но не гарантирует включение в пул.',
      warning: 'Вы сможете вносить изменения, но они будут логироваться.',
      requiresConfirmation: false,
    } : {
      title: 'Soft Commitment',
      message: 'Soft Commitment signals intent to sell but does not guarantee pool inclusion.',
      warning: 'You can still make changes, but they will be logged.',
      requiresConfirmation: false,
    };
  }

  // Default: no confirmation required
  return {
    title: lang === 'ru' ? 'Изменить статус' : 'Change Status',
    message: lang === 'ru' ? 'Вы уверены, что хотите изменить статус партии?' : 'Are you sure you want to change the batch status?',
    warning: '',
    requiresConfirmation: false,
  };
}

/**
 * Check if a transition requires confirmation dialog
 */
export function requiresTransitionConfirmation(
  fromStatus: BatchLifecycleStatus,
  toStatus: BatchLifecycleStatus
): boolean {
  return getTransitionConfirmation(fromStatus, toStatus).requiresConfirmation;
}

/**
 * Get localized confirmation dialog button labels
 */
export function getConfirmationDialogLabels(lang: 'en' | 'ru' = 'en'): {
  cancel: string;
  confirm: string;
} {
  return lang === 'ru' 
    ? { cancel: 'Отмена', confirm: 'Подтвердить переход' }
    : { cancel: 'Cancel', confirm: 'Confirm Transition' };
}

/**
 * Get tooltip message for disabled transition button
 */
export function getDisabledTransitionTooltip(
  currentStatus: BatchLifecycleStatus,
  targetStatus: BatchLifecycleStatus,
  role: BatchRole
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
  const rules = TRANSITION_RULES[currentStatus] || [];
  const matchingRule = rules.find(rule => rule.to === targetStatus);

  if (matchingRule && !matchingRule.roles.includes(role as 'farmer' | 'admin')) {
    return 'This action requires Admin privileges.';
  }

  // Transition not defined in FSM
  if (!matchingRule) {
    return 'This transition is not allowed from the current status.';
  }

  return 'This action is not allowed at the current batch status.';
}

export function getDisabledTransitionTooltipRu(
  currentStatus: BatchLifecycleStatus,
  targetStatus: BatchLifecycleStatus,
  role: BatchRole
): string {
  if (role === 'mpk') {
    return 'Пользователи МПК не могут изменять статус партии.';
  }

  const currentIndex = getStatusIndex(currentStatus);
  const targetIndex = getStatusIndex(targetStatus);

  if (targetIndex < currentIndex) {
    return 'Невозможно вернуться к предыдущему статусу. Жизненный цикл партии необратим.';
  }

  const rules = TRANSITION_RULES[currentStatus] || [];
  const matchingRule = rules.find(rule => rule.to === targetStatus);

  if (matchingRule && !matchingRule.roles.includes(role as 'farmer' | 'admin')) {
    return 'Это действие требует прав Администратора.';
  }

  if (!matchingRule) {
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
  role: BatchRole
): { valid: boolean; error?: string } {
  if (fromStatus === toStatus) {
    return { valid: false, error: 'Status is already set to this value.' };
  }

  if (!canRoleTransition(fromStatus, toStatus, role)) {
    return {
      valid: false,
      error: getDisabledTransitionTooltip(fromStatus, toStatus, role)
    };
  }

  return { valid: true };
}

/**
 * @deprecated Use validateTransition() instead. TRANSITION_RULES now enforces all FSM logic.
 * This function is kept for backward compatibility but simply delegates to validateTransition.
 */
export function validateTransitionComplete(
  fromStatus: BatchLifecycleStatus,
  toStatus: BatchLifecycleStatus,
  role: BatchRole
): { valid: boolean; error?: string; errorType?: 'permission' | 'fsm_rule' } {
  const result = validateTransition(fromStatus, toStatus, role);
  return {
    ...result,
    errorType: result.valid ? undefined : 'permission',
  };
}

/**
 * Get a list of all blocked actions with explanations
 * Useful for displaying in the FSM panel
 */
export function getBlockedTransitions(
  currentStatus: BatchLifecycleStatus,
  role: BatchRole
): Array<{
  toStatus: BatchLifecycleStatus;
  reason: string;
  type: 'admin_only' | 'blocked' | 'revert'
}> {
  const blocked: Array<{ toStatus: BatchLifecycleStatus; reason: string; type: 'admin_only' | 'blocked' | 'revert' }> = [];

  for (const status of BATCH_STATUSES) {
    if (status === currentStatus) continue;

    const validation = validateTransition(currentStatus, status, role);
    if (!validation.valid) {
      let type: 'admin_only' | 'blocked' | 'revert' = 'blocked';

      // Determine type
      const statusIndex = getStatusIndex(status);
      const currentIndex = getStatusIndex(currentStatus);

      if (statusIndex < currentIndex) {
        type = 'revert';
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
