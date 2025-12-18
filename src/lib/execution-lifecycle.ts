/**
 * Execution Lifecycle FSM
 * Manages the state machine for offtake execution records
 * 
 * Lifecycle: Matched → Scheduled → Delivered → Confirmed → Settled → Closed
 */

export type ExecutionStatus = 
  | 'matched'     // Initial state after matching
  | 'scheduled'   // Delivery scheduled
  | 'delivered'   // MPK confirmed delivery
  | 'confirmed'   // Admin confirmed compliance
  | 'settled'     // Settlement calculated
  | 'closed';     // Fully closed

export type ExecutionRole = 'farmer' | 'mpk' | 'admin';

// Define valid transitions per role
const EXECUTION_TRANSITIONS: Record<ExecutionStatus, Partial<Record<ExecutionRole, ExecutionStatus[]>>> = {
  matched: {
    admin: ['scheduled'],
  },
  scheduled: {
    mpk: ['delivered'],
    admin: ['delivered', 'matched'], // Admin can also mark delivered or revert
  },
  delivered: {
    admin: ['confirmed', 'scheduled'], // Admin confirms or reverts
  },
  confirmed: {
    admin: ['settled', 'delivered'], // Admin settles or reverts
  },
  settled: {
    admin: ['closed', 'confirmed'], // Admin closes or reverts
  },
  closed: {
    // Terminal state - no further transitions
  },
};

export const EXECUTION_STATUS_LABELS: Record<ExecutionStatus, string> = {
  matched: 'Matched',
  scheduled: 'Scheduled',
  delivered: 'Delivered',
  confirmed: 'Confirmed',
  settled: 'Settled',
  closed: 'Closed',
};

export const EXECUTION_STATUS_DESCRIPTIONS: Record<ExecutionStatus, string> = {
  matched: 'Match created, awaiting delivery scheduling',
  scheduled: 'Delivery scheduled, awaiting MPK confirmation',
  delivered: 'MPK confirmed delivery, awaiting admin compliance check',
  confirmed: 'Admin confirmed compliance, awaiting settlement calculation',
  settled: 'Settlement calculated, awaiting closure',
  closed: 'Execution fully completed',
};

export const EXECUTION_STATUS_COLORS: Record<ExecutionStatus, { bg: string; text: string; border: string }> = {
  matched: { bg: 'bg-blue-500/10', text: 'text-blue-600', border: 'border-blue-500/30' },
  scheduled: { bg: 'bg-amber-500/10', text: 'text-amber-600', border: 'border-amber-500/30' },
  delivered: { bg: 'bg-purple-500/10', text: 'text-purple-600', border: 'border-purple-500/30' },
  confirmed: { bg: 'bg-emerald-500/10', text: 'text-emerald-600', border: 'border-emerald-500/30' },
  settled: { bg: 'bg-teal-500/10', text: 'text-teal-600', border: 'border-teal-500/30' },
  closed: { bg: 'bg-slate-500/10', text: 'text-slate-600', border: 'border-slate-500/30' },
};

export function canTransition(
  from: ExecutionStatus,
  to: ExecutionStatus,
  role: ExecutionRole
): boolean {
  const allowedTransitions = EXECUTION_TRANSITIONS[from]?.[role] || [];
  return allowedTransitions.includes(to);
}

export function getAvailableTransitions(
  currentStatus: ExecutionStatus,
  role: ExecutionRole
): ExecutionStatus[] {
  return EXECUTION_TRANSITIONS[currentStatus]?.[role] || [];
}

export function validateExecutionTransition(
  from: ExecutionStatus,
  to: ExecutionStatus,
  role: ExecutionRole
): { valid: boolean; error?: string } {
  if (from === to) {
    return { valid: false, error: 'Cannot transition to the same status' };
  }

  if (!canTransition(from, to, role)) {
    const allowedTransitions = getAvailableTransitions(from, role);
    if (allowedTransitions.length === 0) {
      return { 
        valid: false, 
        error: `${role} cannot make transitions from ${EXECUTION_STATUS_LABELS[from]} status` 
      };
    }
    return { 
      valid: false, 
      error: `Cannot transition from ${EXECUTION_STATUS_LABELS[from]} to ${EXECUTION_STATUS_LABELS[to]}. Allowed: ${allowedTransitions.map(s => EXECUTION_STATUS_LABELS[s]).join(', ')}` 
    };
  }

  return { valid: true };
}

// Get the next expected status in the happy path
export function getNextExpectedStatus(current: ExecutionStatus): ExecutionStatus | null {
  const order: ExecutionStatus[] = ['matched', 'scheduled', 'delivered', 'confirmed', 'settled', 'closed'];
  const currentIndex = order.indexOf(current);
  if (currentIndex === -1 || currentIndex === order.length - 1) return null;
  return order[currentIndex + 1];
}

// Check if execution is in a terminal state
export function isTerminalStatus(status: ExecutionStatus): boolean {
  return status === 'closed';
}

// Check if execution can be edited (before it's closed)
export function canEditExecution(status: ExecutionStatus): boolean {
  return status !== 'closed';
}

// Get role-specific permissions for an execution
export function getExecutionPermissions(status: ExecutionStatus, role: ExecutionRole) {
  return {
    canView: true, // All roles can view their executions
    canSchedule: role === 'admin' && status === 'matched',
    canConfirmDelivery: (role === 'mpk' || role === 'admin') && status === 'scheduled',
    canConfirmCompliance: role === 'admin' && status === 'delivered',
    canCalculateSettlement: role === 'admin' && status === 'confirmed',
    canClose: role === 'admin' && status === 'settled',
    canRevert: role === 'admin' && !['matched', 'closed'].includes(status),
  };
}

// Format execution status for display
export function formatExecutionStatus(status: ExecutionStatus): {
  label: string;
  description: string;
  colors: { bg: string; text: string; border: string };
} {
  return {
    label: EXECUTION_STATUS_LABELS[status],
    description: EXECUTION_STATUS_DESCRIPTIONS[status],
    colors: EXECUTION_STATUS_COLORS[status],
  };
}
