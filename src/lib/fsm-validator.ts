/**
 * FSM VALIDATOR UTILITY
 *
 * Provides a unified interface for validating transitions across all FSMs:
 * - Batch Lifecycle FSM
 * - Pool Request Lifecycle FSM
 * - Matching Lifecycle FSM
 *
 * This consolidates common validation patterns and error messages.
 */

// Generic FSM validation result
export interface FSMValidationResult {
  valid: boolean;
  error?: string;
  errorRu?: string;
}

// Generic transition validation function signature
export type TransitionValidator<TStatus, TRole> = (
  fromStatus: TStatus,
  toStatus: TStatus,
  role: TRole
) => FSMValidationResult;

/**
 * Generic FSM transition validation
 *
 * @template TStatus - The status type for the FSM
 * @template TRole - The role type that can perform transitions
 */
export function validateFSMTransition<TStatus extends string, TRole extends string>(
  fromStatus: TStatus,
  toStatus: TStatus,
  role: TRole,
  config: {
    transitionRules: Record<TStatus, Array<{ to: TStatus; roles: TRole[] }>>;
    fsmName: string; // e.g., "Batch", "Pool Request", "Matching"
    roleLabels?: Record<TRole, string>; // Optional custom role labels
  }
): FSMValidationResult {
  const { transitionRules, fsmName, roleLabels } = config;

  // Same status check
  if (fromStatus === toStatus) {
    return {
      valid: false,
      error: `Status is already ${toStatus}`,
      errorRu: `Статус уже установлен: ${toStatus}`,
    };
  }

  // Get transition rules for current status
  const rules = transitionRules[fromStatus] || [];
  const matchingRule = rules.find((rule) => rule.to === toStatus);

  // Transition not allowed by FSM
  if (!matchingRule) {
    const allowedStatuses = rules.map((r) => r.to).join(', ') || 'none';
    return {
      valid: false,
      error: `Cannot transition from '${fromStatus}' to '${toStatus}'. Allowed transitions: ${allowedStatuses}`,
      errorRu: `Невозможно перейти из '${fromStatus}' в '${toStatus}'. Разрешенные переходы: ${allowedStatuses}`,
    };
  }

  // Role permission check
  if (!matchingRule.roles.includes(role)) {
    const requiredRoles = matchingRule.roles.join(', ');
    const roleLabel = roleLabels?.[role] || role;
    return {
      valid: false,
      error: `${fsmName} transition from '${fromStatus}' to '${toStatus}' requires role: ${requiredRoles}. Current role: ${roleLabel}`,
      errorRu: `Переход ${fsmName} из '${fromStatus}' в '${toStatus}' требует роль: ${requiredRoles}. Текущая роль: ${roleLabel}`,
    };
  }

  return { valid: true };
}

/**
 * Check if a transition is allowed by FSM rules (regardless of role)
 */
export function isTransitionAllowedByFSM<TStatus extends string>(
  fromStatus: TStatus,
  toStatus: TStatus,
  transitionRules: Record<TStatus, Array<{ to: TStatus; roles: unknown[] }>>
): boolean {
  const rules = transitionRules[fromStatus] || [];
  return rules.some((rule) => rule.to === toStatus);
}

/**
 * Check if a role can perform a specific transition
 */
export function canRolePerformTransition<TStatus extends string, TRole extends string>(
  fromStatus: TStatus,
  toStatus: TStatus,
  role: TRole,
  transitionRules: Record<TStatus, Array<{ to: TStatus; roles: TRole[] }>>
): boolean {
  const rules = transitionRules[fromStatus] || [];
  const matchingRule = rules.find((rule) => rule.to === toStatus);
  return matchingRule?.roles.includes(role) ?? false;
}

/**
 * Get all allowed transitions for a given status and role
 */
export function getAllowedTransitionsForRole<TStatus extends string, TRole extends string>(
  currentStatus: TStatus,
  role: TRole,
  transitionRules: Record<TStatus, Array<{ to: TStatus; roles: TRole[] }>>
): TStatus[] {
  const rules = transitionRules[currentStatus] || [];
  return rules
    .filter((rule) => rule.roles.includes(role))
    .map((rule) => rule.to);
}

/**
 * Unified error message formatting for FSM transitions
 */
export function formatTransitionError(
  fromStatus: string,
  toStatus: string,
  reason: 'not_allowed' | 'no_permission' | 'same_status'
): { message: string; messageRu: string } {
  switch (reason) {
    case 'same_status':
      return {
        message: `Status is already ${toStatus}`,
        messageRu: `Статус уже установлен: ${toStatus}`,
      };
    case 'not_allowed':
      return {
        message: `Cannot transition from '${fromStatus}' to '${toStatus}'. This transition is not allowed.`,
        messageRu: `Невозможно перейти из '${fromStatus}' в '${toStatus}'. Этот переход не разрешен.`,
      };
    case 'no_permission':
      return {
        message: `You don't have permission to transition from '${fromStatus}' to '${toStatus}'.`,
        messageRu: `У вас нет прав для перехода из '${fromStatus}' в '${toStatus}'.`,
      };
  }
}

/**
 * Get blocked transitions with reasons (useful for UI display)
 */
export function getBlockedTransitionsForRole<TStatus extends string, TRole extends string>(
  currentStatus: TStatus,
  role: TRole,
  allStatuses: TStatus[],
  transitionRules: Record<TStatus, Array<{ to: TStatus; roles: TRole[] }>>,
  config: {
    getStatusIndex?: (status: TStatus) => number;
    fsmName: string;
  }
): Array<{
  toStatus: TStatus;
  reason: string;
  type: 'not_allowed' | 'no_permission' | 'revert';
}> {
  const blocked: Array<{
    toStatus: TStatus;
    reason: string;
    type: 'not_allowed' | 'no_permission' | 'revert';
  }> = [];

  for (const status of allStatuses) {
    if (status === currentStatus) continue;

    const rules = transitionRules[currentStatus] || [];
    const matchingRule = rules.find((rule) => rule.to === status);

    if (!matchingRule) {
      // Check if it's a reversion attempt
      let type: 'not_allowed' | 'revert' = 'not_allowed';
      if (config.getStatusIndex) {
        const currentIndex = config.getStatusIndex(currentStatus);
        const targetIndex = config.getStatusIndex(status);
        if (targetIndex < currentIndex) {
          type = 'revert';
        }
      }

      blocked.push({
        toStatus: status,
        reason: `${config.fsmName} lifecycle does not allow transition from '${currentStatus}' to '${status}'`,
        type,
      });
    } else if (!matchingRule.roles.includes(role)) {
      blocked.push({
        toStatus: status,
        reason: `This transition requires ${matchingRule.roles.join(' or ')} role`,
        type: 'no_permission',
      });
    }
  }

  return blocked;
}
