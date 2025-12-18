/**
 * POOL REQUEST LIFECYCLE FSM
 * 
 * Strict state machine for Pool Request (MPK demand) status transitions.
 * Similar to batch lifecycle but for the demand side.
 * 
 * Status Flow:
 * Draft → Submitted → Matching → Partial/Fulfilled → Closed
 */

// Pool Request lifecycle statuses
export type PoolRequestLifecycleStatus = 
  | 'draft'
  | 'submitted'
  | 'matching'
  | 'partial'
  | 'fulfilled'
  | 'closed'
  | 'cancelled';

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
 * Check if the request can be edited
 */
export function canEditPoolRequest(
  status: PoolRequestLifecycleStatus,
  role: PoolRequestRole
): boolean {
  // Draft can always be edited by MPK
  if (status === 'draft' && role === 'mpk') {
    return true;
  }
  
  // Admin can edit in any status except closed/cancelled
  if (role === 'admin' && status !== 'closed' && status !== 'cancelled') {
    return true;
  }
  
  // Once submitted, MPK cannot edit without admin override
  return false;
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
 * Get tooltip explaining why editing is disabled
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
  
  if (role === 'mpk' && status !== 'draft') {
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
