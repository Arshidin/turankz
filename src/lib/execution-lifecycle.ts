/**
 * Execution Lifecycle FSM
 * Manages the state machine for offtake execution records
 *
 * Lifecycle: Matched → Scheduled → Delivered → Confirmed → Settled → Closed
 *
 * SPRINT 7-8 UPDATE: Removed all reversions - execution flow is now irreversible
 * This ensures audit trail integrity and prevents accidental status changes
 */

export type ExecutionStatus =
  | 'matched'     // Initial state after matching
  | 'scheduled'   // Delivery scheduled
  | 'delivered'   // MPK confirmed delivery
  | 'confirmed'   // Admin confirmed compliance
  | 'settled'     // Settlement calculated
  | 'closed';     // Fully closed

export type ExecutionRole = 'farmer' | 'mpk' | 'admin';

// Sprint 7-8: Unified transition rules (no reversions)
interface TransitionRule {
  to: ExecutionStatus;
  roles: ExecutionRole[];
}

const TRANSITION_RULES: Record<ExecutionStatus, TransitionRule[]> = {
  matched: [
    { to: 'scheduled', roles: ['admin'] },
  ],
  scheduled: [
    { to: 'delivered', roles: ['mpk', 'admin'] },
  ],
  delivered: [
    { to: 'confirmed', roles: ['admin'] },
  ],
  confirmed: [
    { to: 'settled', roles: ['admin'] },
  ],
  settled: [
    { to: 'closed', roles: ['admin'] },
  ],
  closed: [],
};

// Happy path order for timeline visualization
export const EXECUTION_STATUS_ORDER: ExecutionStatus[] = [
  'matched',
  'scheduled',
  'delivered',
  'confirmed',
  'settled',
  'closed',
];

export const EXECUTION_STATUS_LABELS: Record<ExecutionStatus, string> = {
  matched: 'Matched',
  scheduled: 'Scheduled',
  delivered: 'Delivered',
  confirmed: 'Confirmed',
  settled: 'Settled',
  closed: 'Closed',
};

export const EXECUTION_STATUS_LABELS_RU: Record<ExecutionStatus, string> = {
  matched: 'Сопоставлено',
  scheduled: 'Запланировано',
  delivered: 'Доставлено',
  confirmed: 'Подтверждено',
  settled: 'Рассчитано',
  closed: 'Закрыто',
};

export const EXECUTION_STATUS_DESCRIPTIONS: Record<ExecutionStatus, string> = {
  matched: 'Match created, awaiting delivery scheduling',
  scheduled: 'Delivery scheduled, awaiting MPK confirmation',
  delivered: 'MPK confirmed delivery, awaiting admin compliance check',
  confirmed: 'Admin confirmed compliance, awaiting settlement calculation',
  settled: 'Settlement calculated, awaiting closure',
  closed: 'Execution fully completed',
};

export const EXECUTION_STATUS_DESCRIPTIONS_RU: Record<ExecutionStatus, string> = {
  matched: 'Сопоставление создано. Ожидает планирования доставки.',
  scheduled: 'Доставка запланирована. Ожидает подтверждения МПК.',
  delivered: 'МПК подтвердил доставку. Ожидает проверки соответствия.',
  confirmed: 'Соответствие подтверждено. Ожидает расчёта.',
  settled: 'Расчёт выполнен. Ожидает закрытия.',
  closed: 'Исполнение завершено.',
};

export const EXECUTION_STATUS_COLORS: Record<ExecutionStatus, { bg: string; text: string; border: string }> = {
  matched: { bg: 'bg-blue-500/10', text: 'text-blue-600', border: 'border-blue-500/30' },
  scheduled: { bg: 'bg-amber-500/10', text: 'text-amber-600', border: 'border-amber-500/30' },
  delivered: { bg: 'bg-purple-500/10', text: 'text-purple-600', border: 'border-purple-500/30' },
  confirmed: { bg: 'bg-emerald-500/10', text: 'text-emerald-600', border: 'border-emerald-500/30' },
  settled: { bg: 'bg-teal-500/10', text: 'text-teal-600', border: 'border-teal-500/30' },
  closed: { bg: 'bg-slate-500/10', text: 'text-slate-600', border: 'border-slate-500/30' },
};

// Who performs action at each status (for timeline)
export const EXECUTION_STATUS_ACTORS: Record<ExecutionStatus, { role: ExecutionRole; action: string; actionRu: string }> = {
  matched: { role: 'admin', action: 'Schedule delivery', actionRu: 'Запланировать доставку' },
  scheduled: { role: 'mpk', action: 'Confirm delivery', actionRu: 'Подтвердить доставку' },
  delivered: { role: 'admin', action: 'Verify compliance', actionRu: 'Проверить соответствие' },
  confirmed: { role: 'admin', action: 'Calculate settlement', actionRu: 'Рассчитать оплату' },
  settled: { role: 'admin', action: 'Close execution', actionRu: 'Закрыть исполнение' },
  closed: { role: 'admin', action: 'Completed', actionRu: 'Завершено' },
};

/**
 * Check if a transition is allowed by the FSM (regardless of role)
 */
export function isTransitionAllowed(
  fromStatus: ExecutionStatus,
  toStatus: ExecutionStatus
): boolean {
  const rules = TRANSITION_RULES[fromStatus] || [];
  return rules.some(rule => rule.to === toStatus);
}

/**
 * Check if a role can perform a specific transition
 */
export function canRoleTransition(
  fromStatus: ExecutionStatus,
  toStatus: ExecutionStatus,
  role: ExecutionRole
): boolean {
  const rules = TRANSITION_RULES[fromStatus] || [];
  const matchingRule = rules.find(rule => rule.to === toStatus);
  return matchingRule?.roles.includes(role) ?? false;
}

export function canTransition(
  from: ExecutionStatus,
  to: ExecutionStatus,
  role: ExecutionRole
): boolean {
  return canRoleTransition(from, to, role);
}

export function getAvailableTransitions(
  currentStatus: ExecutionStatus,
  role: ExecutionRole
): ExecutionStatus[] {
  const rules = TRANSITION_RULES[currentStatus] || [];
  return rules
    .filter(rule => rule.roles.includes(role))
    .map(rule => rule.to);
}

export function validateExecutionTransition(
  from: ExecutionStatus,
  to: ExecutionStatus,
  role: ExecutionRole
): { valid: boolean; error?: string; errorRu?: string } {
  if (from === to) {
    return {
      valid: false,
      error: 'Cannot transition to the same status',
      errorRu: 'Невозможно перейти в тот же статус',
    };
  }

  // Check if transition is allowed by FSM
  if (!isTransitionAllowed(from, to)) {
    const fromIndex = EXECUTION_STATUS_ORDER.indexOf(from);
    const toIndex = EXECUTION_STATUS_ORDER.indexOf(to);

    if (toIndex < fromIndex) {
      return {
        valid: false,
        error: 'Cannot revert to a previous status. Execution lifecycle is irreversible.',
        errorRu: 'Невозможно вернуться к предыдущему статусу. Жизненный цикл исполнения необратим.',
      };
    }

    return {
      valid: false,
      error: `Cannot transition from ${EXECUTION_STATUS_LABELS[from]} to ${EXECUTION_STATUS_LABELS[to]}. Step cannot be skipped.`,
      errorRu: `Невозможен переход из "${EXECUTION_STATUS_LABELS_RU[from]}" в "${EXECUTION_STATUS_LABELS_RU[to]}". Шаг нельзя пропустить.`,
    };
  }

  // Check role permission
  if (!canRoleTransition(from, to, role)) {
    const allowedTransitions = getAvailableTransitions(from, role);
    if (allowedTransitions.length === 0) {
      return {
        valid: false,
        error: `${role} cannot make transitions from ${EXECUTION_STATUS_LABELS[from]} status`,
        errorRu: `${role === 'farmer' ? 'Фермер' : role === 'mpk' ? 'МПК' : 'Администратор'} не может выполнять переходы из статуса "${EXECUTION_STATUS_LABELS_RU[from]}"`,
      };
    }
    return {
      valid: false,
      error: `Cannot transition from ${EXECUTION_STATUS_LABELS[from]} to ${EXECUTION_STATUS_LABELS[to]}. Allowed: ${allowedTransitions.map(s => EXECUTION_STATUS_LABELS[s]).join(', ')}`,
      errorRu: `Невозможен переход из "${EXECUTION_STATUS_LABELS_RU[from]}" в "${EXECUTION_STATUS_LABELS_RU[to]}". Доступно: ${allowedTransitions.map(s => EXECUTION_STATUS_LABELS_RU[s]).join(', ')}`,
    };
  }

  return { valid: true };
}

// Get the next expected status in the happy path
export function getNextExpectedStatus(current: ExecutionStatus): ExecutionStatus | null {
  const currentIndex = EXECUTION_STATUS_ORDER.indexOf(current);
  if (currentIndex === -1 || currentIndex === EXECUTION_STATUS_ORDER.length - 1) return null;
  return EXECUTION_STATUS_ORDER[currentIndex + 1];
}

// Check if execution is in a terminal state
export function isTerminalStatus(status: ExecutionStatus): boolean {
  return status === 'closed';
}

// Check if execution can be edited (before it's closed)
export function canEditExecution(status: ExecutionStatus): boolean {
  return status !== 'closed';
}

// Get role-specific permissions for an execution (SPRINT 7-8: no revert permission)
export function getExecutionPermissions(status: ExecutionStatus, role: ExecutionRole) {
  return {
    canView: true, // All roles can view their executions
    canSchedule: role === 'admin' && status === 'matched',
    canConfirmDelivery: (role === 'mpk' || role === 'admin') && status === 'scheduled',
    canConfirmCompliance: role === 'admin' && status === 'delivered',
    canCalculateSettlement: role === 'admin' && status === 'confirmed',
    canClose: role === 'admin' && status === 'settled',
    // Sprint 7-8: Removed canRevert - execution flow is now irreversible
    canRevert: false,
  };
}

// Format execution status for display
export function formatExecutionStatus(status: ExecutionStatus, lang: 'en' | 'ru' = 'en'): {
  label: string;
  description: string;
  colors: { bg: string; text: string; border: string };
} {
  return {
    label: lang === 'ru' ? EXECUTION_STATUS_LABELS_RU[status] : EXECUTION_STATUS_LABELS[status],
    description: lang === 'ru' ? EXECUTION_STATUS_DESCRIPTIONS_RU[status] : EXECUTION_STATUS_DESCRIPTIONS[status],
    colors: EXECUTION_STATUS_COLORS[status],
  };
}

// Get status index for progress calculation
export function getStatusIndex(status: ExecutionStatus): number {
  return EXECUTION_STATUS_ORDER.indexOf(status);
}

// Calculate progress percentage
export function getExecutionProgress(status: ExecutionStatus): number {
  const index = getStatusIndex(status);
  const total = EXECUTION_STATUS_ORDER.length - 1; // -1 because we count transitions
  return Math.round((index / total) * 100);
}

// Get who needs to act next
export function getNextActor(status: ExecutionStatus): { role: ExecutionRole; action: string; actionRu: string } | null {
  if (status === 'closed') return null;
  const nextStatus = getNextExpectedStatus(status);
  if (!nextStatus) return null;
  return EXECUTION_STATUS_ACTORS[status];
}
