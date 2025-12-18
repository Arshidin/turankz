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
 * Get the next allowed status for a given role
 */
export function getNextAllowedStatus(
  currentStatus: BatchLifecycleStatus,
  role: 'farmer' | 'admin' | 'mpk'
): BatchLifecycleStatus | null {
  if (role === 'mpk') return null;
  
  const allowedTransitions = ALLOWED_TRANSITIONS.filter(
    t => t.from === currentStatus && t.allowedRoles.includes(role as 'farmer' | 'admin')
  );
  
  if (allowedTransitions.length === 0) return null;
  
  // Return the first (most common) next status
  return allowedTransitions[0].to;
}

/**
 * Get all possible next statuses for a given role
 */
export function getAllNextStatuses(
  currentStatus: BatchLifecycleStatus,
  role: 'farmer' | 'admin' | 'mpk'
): BatchLifecycleStatus[] {
  if (role === 'mpk') return [];
  
  return ALLOWED_TRANSITIONS
    .filter(t => t.from === currentStatus && t.allowedRoles.includes(role as 'farmer' | 'admin'))
    .map(t => t.to);
}

/**
 * Check if status can be edited (batch data changes)
 * Only draft and forecast batches can have their data edited
 */
export function canEditBatchData(status: BatchLifecycleStatus): boolean {
  return status === 'draft' || status === 'forecast';
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
  
  // Trying to skip steps
  if (targetIndex > currentIndex + 1) {
    return 'Cannot skip lifecycle steps. Progress to the next status first.';
  }
  
  // Admin-only transition
  const transition = ALLOWED_TRANSITIONS.find(
    t => t.from === currentStatus && t.to === targetStatus
  );
  
  if (transition && !transition.allowedRoles.includes(role as 'farmer' | 'admin')) {
    return 'This action requires Admin privileges.';
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
  
  if (targetIndex > currentIndex + 1) {
    return 'Невозможно пропустить этапы. Сначала перейдите к следующему статусу.';
  }
  
  const transition = ALLOWED_TRANSITIONS.find(
    t => t.from === currentStatus && t.to === targetStatus
  );
  
  if (transition && !transition.allowedRoles.includes(role as 'farmer' | 'admin')) {
    return 'Это действие требует прав Администратора.';
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
