/**
 * POOL REQUEST LIFECYCLE FSM
 * 
 * Strict state machine for Pool Request (MPK demand) status transitions.
 * Similar to batch lifecycle but for the demand side.
 * 
 * Status Flow:
 * Draft → Submitted → Matching → Partial/Fulfilled → Closed
 * 
 * MATCHING WINDOW INTEGRATION:
 * - Submissions only allowed during Active matching window
 * - After lock_date, no new submissions allowed
 * - Submitted requests auto-transition to Matching after lock_date
 */

import { type MatchingWindow, type MatchingWindowStatus, calculateCountdown } from './matching-window';

// Pool Request lifecycle statuses
export type PoolRequestLifecycleStatus = 
  | 'draft'
  | 'submitted'
  | 'matching'
  | 'partial'
  | 'fulfilled'
  | 'closed'
  | 'cancelled';

// All possible statuses as an array for iteration
export const POOL_REQUEST_STATUSES: PoolRequestLifecycleStatus[] = [
  'draft',
  'submitted', 
  'matching',
  'partial',
  'fulfilled',
  'closed',
  'cancelled',
];

// Role types that can perform transitions
export type PoolRequestRole = 'mpk' | 'admin';

// Allowed transitions per status
const ALLOWED_TRANSITIONS: Record<PoolRequestLifecycleStatus, PoolRequestLifecycleStatus[]> = {
  draft: ['submitted', 'cancelled'],
  submitted: ['matching', 'cancelled'],
  matching: ['partial', 'fulfilled', 'cancelled'],
  partial: ['fulfilled', 'cancelled'],
  fulfilled: ['closed'],
  closed: [],
  cancelled: [],
};

// Role permissions for transitions
const TRANSITION_PERMISSIONS: Record<string, PoolRequestRole[]> = {
  'draft->submitted': ['mpk'],
  'draft->cancelled': ['mpk', 'admin'],
  'submitted->matching': ['admin'],
  'submitted->cancelled': ['mpk', 'admin'],
  'matching->partial': ['admin'],
  'matching->fulfilled': ['admin'],
  'matching->cancelled': ['admin'],
  'partial->fulfilled': ['admin'],
  'partial->cancelled': ['admin'],
  'fulfilled->closed': ['admin'],
};

// Status labels for display
export const POOL_REQUEST_STATUS_LABELS: Record<PoolRequestLifecycleStatus, string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  matching: 'Matching',
  partial: 'Partial',
  fulfilled: 'Fulfilled',
  closed: 'Closed',
  cancelled: 'Cancelled',
};

// Status descriptions
export const POOL_REQUEST_STATUS_DESCRIPTIONS: Record<PoolRequestLifecycleStatus, string> = {
  draft: 'Request is being prepared. Not yet visible to Admin.',
  submitted: 'Request submitted for review. Awaiting Admin action.',
  matching: 'Admin is actively matching supply to this request.',
  partial: 'Some supply matched. Matching continues for remaining volume.',
  fulfilled: 'Request fully matched. Awaiting delivery confirmation.',
  closed: 'Request completed. No further changes allowed.',
  cancelled: 'Request has been cancelled.',
};

// Russian status labels
export const POOL_REQUEST_STATUS_LABELS_RU: Record<PoolRequestLifecycleStatus, string> = {
  draft: 'Черновик',
  submitted: 'Подана',
  matching: 'Сопоставление',
  partial: 'Частично',
  fulfilled: 'Выполнена',
  closed: 'Закрыта',
  cancelled: 'Отменена',
};

/**
 * Check if a transition is allowed by the FSM
 */
export function isTransitionAllowed(
  fromStatus: PoolRequestLifecycleStatus,
  toStatus: PoolRequestLifecycleStatus
): boolean {
  return ALLOWED_TRANSITIONS[fromStatus]?.includes(toStatus) ?? false;
}

/**
 * Check if a role can perform a specific transition
 */
export function canRoleTransition(
  fromStatus: PoolRequestLifecycleStatus,
  toStatus: PoolRequestLifecycleStatus,
  role: PoolRequestRole
): boolean {
  const key = `${fromStatus}->${toStatus}`;
  const allowedRoles = TRANSITION_PERMISSIONS[key];
  return allowedRoles?.includes(role) ?? false;
}

/**
 * Validate a complete transition (FSM + role permission)
 */
export function validatePoolRequestTransition(
  fromStatus: PoolRequestLifecycleStatus,
  toStatus: PoolRequestLifecycleStatus,
  role: PoolRequestRole
): {
  valid: boolean;
  error?: string;
  errorRu?: string;
} {
  // Check if transition is allowed by FSM
  if (!isTransitionAllowed(fromStatus, toStatus)) {
    // Check if it's a reversion attempt
    const fromIndex = Object.keys(ALLOWED_TRANSITIONS).indexOf(fromStatus);
    const toIndex = Object.keys(ALLOWED_TRANSITIONS).indexOf(toStatus);
    
    if (toIndex < fromIndex) {
      return {
        valid: false,
        error: 'Cannot revert to a previous status. Pool Request lifecycle is irreversible.',
        errorRu: 'Невозможно вернуться к предыдущему статусу. Жизненный цикл заявки необратим.',
      };
    }
    
    return {
      valid: false,
      error: `Cannot transition from ${POOL_REQUEST_STATUS_LABELS[fromStatus]} to ${POOL_REQUEST_STATUS_LABELS[toStatus]}. Step cannot be skipped.`,
      errorRu: `Невозможен переход из "${POOL_REQUEST_STATUS_LABELS_RU[fromStatus]}" в "${POOL_REQUEST_STATUS_LABELS_RU[toStatus]}". Шаг нельзя пропустить.`,
    };
  }

  // Check role permission
  if (!canRoleTransition(fromStatus, toStatus, role)) {
    const requiredRole = role === 'mpk' ? 'Admin' : 'MPK';
    return {
      valid: false,
      error: `This action requires ${requiredRole} permissions.`,
      errorRu: `Это действие требует прав ${requiredRole === 'Admin' ? 'Администратора' : 'МПК'}.`,
    };
  }

  return { valid: true };
}

/**
 * Get available transitions for a status and role
 */
export function getAvailableTransitions(
  currentStatus: PoolRequestLifecycleStatus,
  role: PoolRequestRole
): PoolRequestLifecycleStatus[] {
  const possibleTransitions = ALLOWED_TRANSITIONS[currentStatus] || [];
  return possibleTransitions.filter(toStatus => 
    canRoleTransition(currentStatus, toStatus, role)
  );
}

/**
 * Editable fields in Pool Requests
 */
export type PoolRequestEditableField = 
  | 'regions'
  | 'age_range_min'
  | 'age_range_max'
  | 'weight_range_min'
  | 'weight_range_max'
  | 'required_volume'
  | 'target_week';

/**
 * All editable fields list
 */
export const POOL_REQUEST_EDITABLE_FIELDS: PoolRequestEditableField[] = [
  'regions',
  'age_range_min',
  'age_range_max',
  'weight_range_min',
  'weight_range_max',
  'required_volume',
  'target_week',
];

/**
 * Field labels for display
 */
export const POOL_REQUEST_FIELD_LABELS: Record<PoolRequestEditableField, string> = {
  regions: 'Target Regions',
  age_range_min: 'Minimum Age',
  age_range_max: 'Maximum Age',
  weight_range_min: 'Minimum Weight',
  weight_range_max: 'Maximum Weight',
  required_volume: 'Required Volume',
  target_week: 'Delivery Period',
};

/**
 * Field editability by status and role
 * - Draft: All fields editable by MPK
 * - Submitted: Read-only for MPK, Admin override only
 * - Matching and beyond: Fully read-only
 */
export function canEditField(
  field: PoolRequestEditableField,
  status: PoolRequestLifecycleStatus,
  role: PoolRequestRole
): boolean {
  // Closed/cancelled: never editable
  if (status === 'closed' || status === 'cancelled') {
    return false;
  }
  
  // Draft: all fields editable by MPK or Admin
  if (status === 'draft') {
    return role === 'mpk' || role === 'admin';
  }
  
  // Submitted: only Admin can edit (as override)
  if (status === 'submitted') {
    return role === 'admin';
  }
  
  // Matching and beyond: fully read-only for everyone
  return false;
}

/**
 * Get all editable fields for a status and role
 */
export function getEditableFields(
  status: PoolRequestLifecycleStatus,
  role: PoolRequestRole
): PoolRequestEditableField[] {
  return POOL_REQUEST_EDITABLE_FIELDS.filter(field => 
    canEditField(field, status, role)
  );
}

/**
 * Check if the request can be edited at all
 */
export function canEditPoolRequest(
  status: PoolRequestLifecycleStatus,
  role: PoolRequestRole
): boolean {
  return getEditableFields(status, role).length > 0;
}

/**
 * Check if the request is read-only for a role
 */
export function isPoolRequestReadOnly(
  status: PoolRequestLifecycleStatus,
  role: PoolRequestRole
): boolean {
  return !canEditPoolRequest(status, role);
}

/**
 * Get tooltip explaining why a field is locked
 */
export function getFieldLockedTooltip(
  field: PoolRequestEditableField,
  status: PoolRequestLifecycleStatus,
  role: PoolRequestRole,
  lang: 'en' | 'ru' = 'en'
): string | null {
  // If field is editable, no tooltip needed
  if (canEditField(field, status, role)) {
    return null;
  }
  
  if (status === 'closed' || status === 'cancelled') {
    return lang === 'ru' 
      ? 'Заявка закрыта. Редактирование невозможно.'
      : 'Request is closed. Editing is not allowed.';
  }
  
  if (status === 'matching' || status === 'partial' || status === 'fulfilled') {
    return lang === 'ru'
      ? 'Заявка заблокирована после начала сопоставления.'
      : 'This request is locked after matching begins.';
  }
  
  if (status === 'submitted' && role === 'mpk') {
    return lang === 'ru'
      ? 'Заявка заблокирована после подачи.'
      : 'This request is locked after submission.';
  }
  
  return null;
}

/**
 * Get tooltip explaining why editing is disabled at the request level
 */
export function getPoolRequestLockedTooltip(
  status: PoolRequestLifecycleStatus,
  role: PoolRequestRole,
  lang: 'en' | 'ru' = 'en'
): string {
  if (status === 'closed' || status === 'cancelled') {
    return lang === 'ru' 
      ? 'Заявка закрыта. Редактирование невозможно.'
      : 'Request is closed. Editing is not allowed.';
  }
  
  if (status === 'matching' || status === 'partial' || status === 'fulfilled') {
    return lang === 'ru'
      ? 'Заявка заблокирована после начала сопоставления.'
      : 'Request is locked once matching begins.';
  }
  
  if (role === 'mpk' && status === 'submitted') {
    return lang === 'ru'
      ? 'После подачи редактирование требует одобрения Администратора.'
      : 'Editing after submission requires Admin override.';
  }
  
  return '';
}

/**
 * Get status badge styling
 */
export function getPoolRequestStatusStyle(status: PoolRequestLifecycleStatus): {
  className: string;
  variant: 'default' | 'secondary' | 'destructive' | 'outline';
} {
  switch (status) {
    case 'draft':
      return { className: 'bg-muted text-muted-foreground border-border', variant: 'outline' };
    case 'submitted':
      return { className: 'bg-blue-500/10 text-blue-600 border-blue-500/30', variant: 'outline' };
    case 'matching':
      return { className: 'bg-violet-500/10 text-violet-600 border-violet-500/30', variant: 'outline' };
    case 'partial':
      return { className: 'bg-amber-500/10 text-amber-600 border-amber-500/30', variant: 'outline' };
    case 'fulfilled':
      return { className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30', variant: 'outline' };
    case 'closed':
      return { className: 'bg-slate-500/10 text-slate-600 border-slate-500/30', variant: 'outline' };
    case 'cancelled':
      return { className: 'bg-destructive/10 text-destructive border-destructive/30', variant: 'outline' };
    default:
      return { className: '', variant: 'default' };
  }
}

/**
 * Get next logical status for a role
 */
export function getNextPoolRequestStatus(
  currentStatus: PoolRequestLifecycleStatus,
  role: PoolRequestRole
): PoolRequestLifecycleStatus | null {
  const available = getAvailableTransitions(currentStatus, role);
  // Return first non-cancel transition
  return available.find(s => s !== 'cancelled') || null;
}

// ============================================================================
// MATCHING WINDOW INTEGRATION
// ============================================================================

export interface SubmissionValidation {
  canSubmit: boolean;
  reason: string;
  reasonRu: string;
  isLocked: boolean;
  deadline: string | null;
  countdownFormatted: string | null;
}

/**
 * Check if pool request submission is allowed based on matching window status
 */
export function canSubmitPoolRequest(
  matchingWindow: MatchingWindow | null
): SubmissionValidation {
  // No active window
  if (!matchingWindow) {
    return {
      canSubmit: false,
      reason: 'No active matching window. Submissions are currently closed.',
      reasonRu: 'Нет активного окна сопоставления. Подача заявок закрыта.',
      isLocked: true,
      deadline: null,
      countdownFormatted: null,
    };
  }

  const { status, lock_date } = matchingWindow;
  const countdown = calculateCountdown(lock_date);

  // Window must be active for submissions
  if (status === 'upcoming') {
    return {
      canSubmit: false,
      reason: 'Matching window has not started yet. Wait for it to open.',
      reasonRu: 'Окно сопоставления ещё не началось. Дождитесь открытия.',
      isLocked: true,
      deadline: lock_date,
      countdownFormatted: null,
    };
  }

  if (status === 'locked' || status === 'closed') {
    return {
      canSubmit: false,
      reason: 'Matching window is locked. No new submissions allowed.',
      reasonRu: 'Окно сопоставления заблокировано. Новые заявки не принимаются.',
      isLocked: true,
      deadline: lock_date,
      countdownFormatted: countdown.formattedShort,
    };
  }

  // Check if past lock_date even if window is still "active"
  if (countdown.isExpired) {
    return {
      canSubmit: false,
      reason: 'Submission deadline has passed. No new submissions allowed.',
      reasonRu: 'Срок подачи заявок истёк. Новые заявки не принимаются.',
      isLocked: true,
      deadline: lock_date,
      countdownFormatted: countdown.formattedShort,
    };
  }

  // Active and before lock_date - submissions allowed
  return {
    canSubmit: true,
    reason: `Submissions open. Deadline: ${countdown.formattedLong}`,
    reasonRu: `Подача заявок открыта. ${countdown.formattedLong}`,
    isLocked: false,
    deadline: lock_date,
    countdownFormatted: countdown.formattedShort,
  };
}

/**
 * Get window-based submission status message for UI display
 */
export function getSubmissionStatusMessage(
  matchingWindow: MatchingWindow | null,
  lang: 'en' | 'ru' = 'en'
): { 
  title: string; 
  message: string; 
  urgency: 'normal' | 'warning' | 'critical' | 'blocked';
  showCountdown: boolean;
} {
  if (!matchingWindow) {
    return {
      title: lang === 'ru' ? 'Окно закрыто' : 'Window Closed',
      message: lang === 'ru' 
        ? 'Нет активного окна сопоставления. Подача заявок недоступна.' 
        : 'No active matching window. Submissions are not available.',
      urgency: 'blocked',
      showCountdown: false,
    };
  }

  const { status, lock_date, name } = matchingWindow;
  const countdown = calculateCountdown(lock_date, lang);

  if (status === 'upcoming') {
    return {
      title: lang === 'ru' ? 'Предстоящее окно' : 'Upcoming Window',
      message: lang === 'ru'
        ? `Окно "${name}" откроется скоро. Подготовьте ваши заявки.`
        : `Window "${name}" will open soon. Prepare your requests.`,
      urgency: 'normal',
      showCountdown: false,
    };
  }

  if (status === 'locked' || status === 'closed' || countdown.isExpired) {
    return {
      title: lang === 'ru' ? 'Подача заблокирована' : 'Submissions Locked',
      message: lang === 'ru'
        ? 'Срок подачи заявок истёк. Дождитесь следующего окна.'
        : 'Submission deadline has passed. Wait for the next window.',
      urgency: 'blocked',
      showCountdown: false,
    };
  }

  // Active window with countdown
  if (countdown.days === 0 && countdown.hours < 6) {
    return {
      title: lang === 'ru' ? 'Срочно!' : 'Urgent!',
      message: lang === 'ru'
        ? `Осталось ${countdown.formattedShort} для подачи заявок.`
        : `${countdown.formattedShort} left to submit requests.`,
      urgency: 'critical',
      showCountdown: true,
    };
  }

  if (countdown.days === 0) {
    return {
      title: lang === 'ru' ? 'Скоро дедлайн' : 'Deadline Approaching',
      message: lang === 'ru'
        ? `${countdown.formattedLong} для подачи заявок.`
        : `${countdown.formattedLong} to submit requests.`,
      urgency: 'warning',
      showCountdown: true,
    };
  }

  return {
    title: lang === 'ru' ? 'Окно открыто' : 'Window Open',
    message: lang === 'ru'
      ? `${countdown.formattedLong} для подачи заявок.`
      : `${countdown.formattedLong} to submit requests.`,
    urgency: 'normal',
    showCountdown: true,
  };
}

// ============================================================================
// MATCHING PROGRESS TRACKING
// ============================================================================

export interface MatchingProgress {
  requestedVolume: number;
  matchedVolume: number;
  remainingVolume: number;
  fillPercentage: number;
  projectedFillPercentage: number;
  isComplete: boolean;
}

export type MatchingProgressStatus = 
  | 'not-started'
  | 'at-risk'
  | 'partial'
  | 'near-complete'
  | 'fulfilled';

/**
 * Calculate matching progress metrics for a pool request
 */
export function calculateMatchingProgress(
  requestedVolume: number,
  matchedVolume: number,
  selectedHeads: number = 0
): MatchingProgress {
  const remainingVolume = Math.max(0, requestedVolume - matchedVolume);
  const fillPercentage = requestedVolume > 0 
    ? Math.min(100, Math.round((matchedVolume / requestedVolume) * 100))
    : 0;
  const projectedTotal = matchedVolume + selectedHeads;
  const projectedFillPercentage = requestedVolume > 0
    ? Math.min(100, Math.round((projectedTotal / requestedVolume) * 100))
    : 0;

  return {
    requestedVolume,
    matchedVolume,
    remainingVolume,
    fillPercentage,
    projectedFillPercentage,
    isComplete: matchedVolume >= requestedVolume,
  };
}

/**
 * Determine progress status based on fill percentage
 */
export function getMatchingProgressStatus(progress: MatchingProgress): MatchingProgressStatus {
  if (progress.isComplete) return 'fulfilled';
  if (progress.fillPercentage >= 80) return 'near-complete';
  if (progress.fillPercentage >= 50) return 'partial';
  if (progress.fillPercentage > 0) return 'at-risk';
  return 'not-started';
}

/**
 * Get styling for progress status
 */
export function getProgressStatusStyle(status: MatchingProgressStatus): {
  textClass: string;
  barClass: string;
  badgeClass: string;
  progressClass: string;
} {
  switch (status) {
    case 'fulfilled':
      return {
        textClass: 'text-emerald-600',
        barClass: 'bg-emerald-500',
        badgeClass: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30',
        progressClass: '[&>div]:bg-emerald-500',
      };
    case 'near-complete':
      return {
        textClass: 'text-blue-600',
        barClass: 'bg-blue-500',
        badgeClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30',
        progressClass: '[&>div]:bg-blue-500',
      };
    case 'partial':
      return {
        textClass: 'text-amber-600',
        barClass: 'bg-amber-500',
        badgeClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
        progressClass: '[&>div]:bg-amber-500',
      };
    case 'at-risk':
      return {
        textClass: 'text-orange-600',
        barClass: 'bg-orange-500',
        badgeClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30',
        progressClass: '[&>div]:bg-orange-500',
      };
    case 'not-started':
    default:
      return {
        textClass: 'text-muted-foreground',
        barClass: 'bg-muted-foreground',
        badgeClass: 'bg-muted text-muted-foreground border-border',
        progressClass: '[&>div]:bg-muted-foreground',
      };
  }
}

/**
 * Get status label for matching progress
 */
export function getMatchingProgressLabel(
  status: MatchingProgressStatus,
  lang: 'en' | 'ru' = 'en'
): string {
  const labels: Record<MatchingProgressStatus, { en: string; ru: string }> = {
    fulfilled: { en: 'Fulfilled', ru: 'Выполнено' },
    'near-complete': { en: 'Near Complete', ru: 'Почти завершено' },
    partial: { en: 'Partial', ru: 'Частично' },
    'at-risk': { en: 'At Risk', ru: 'Под угрозой' },
    'not-started': { en: 'Not Started', ru: 'Не начато' },
  };
  return lang === 'ru' ? labels[status].ru : labels[status].en;
}

/**
 * Get the appropriate pool request status based on matching progress
 */
export function getStatusFromProgress(progress: MatchingProgress): PoolRequestLifecycleStatus {
  if (progress.isComplete) return 'fulfilled';
  if (progress.matchedVolume > 0) return 'partial';
  return 'matching';
}
