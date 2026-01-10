# FSM Validator Utility

**File:** `src/lib/fsm-validator.ts`
**Created:** Sprint 5 - Module 9.1.3
**Purpose:** Generic FSM validation utility to eliminate duplication across all Finite State Machines

---

## Overview

The FSM Validator provides a unified interface for validating state transitions across all FSMs in the TURAN platform:
- Batch Lifecycle FSM
- Pool Request Lifecycle FSM
- Matching Lifecycle FSM

This consolidates common validation patterns and error messages into a single reusable module.

---

## Core Types

### FSMValidationResult

```typescript
export interface FSMValidationResult {
  valid: boolean;
  error?: string;
  errorRu?: string;
}
```

### TransitionValidator

```typescript
export type TransitionValidator<TStatus, TRole> = (
  fromStatus: TStatus,
  toStatus: TStatus,
  role: TRole
) => FSMValidationResult;
```

---

## Main Function: validateFSMTransition

Generic function for validating FSM transitions with role-based access control.

### Signature

```typescript
function validateFSMTransition<TStatus extends string, TRole extends string>(
  fromStatus: TStatus,
  toStatus: TStatus,
  role: TRole,
  config: {
    transitionRules: Record<TStatus, Array<{ to: TStatus; roles: TRole[] }>>;
    fsmName: string;
    roleLabels?: Record<TRole, string>;
  }
): FSMValidationResult
```

### Parameters

- **fromStatus**: Current state
- **toStatus**: Target state
- **role**: User role attempting the transition
- **config**: Configuration object with:
  - `transitionRules`: FSM transition rules map
  - `fsmName`: Human-readable FSM name (for error messages)
  - `roleLabels`: Optional custom role labels

### Validation Checks

1. **Same Status Check**: Prevents no-op transitions
2. **FSM Rules Check**: Verifies transition is allowed by FSM structure
3. **Role Permission Check**: Ensures role has permission for this transition

### Example Usage

```typescript
import { validateFSMTransition } from '@/lib/fsm-validator';
import { TRANSITION_RULES, BatchRole } from '@/lib/batch-lifecycle';

const result = validateFSMTransition<BatchLifecycleStatus, BatchRole>(
  'draft',
  'forecast',
  'farmer',
  {
    transitionRules: TRANSITION_RULES,
    fsmName: 'Batch',
    roleLabels: { farmer: 'Farmer', admin: 'Administrator', mpk: 'MPK' }
  }
);

if (!result.valid) {
  console.error(result.error); // English error
  console.error(result.errorRu); // Russian error
}
```

---

## Helper Functions

### isTransitionAllowedByFSM

Check if a transition is allowed by FSM rules (regardless of role).

```typescript
function isTransitionAllowedByFSM<TStatus extends string>(
  fromStatus: TStatus,
  toStatus: TStatus,
  transitionRules: Record<TStatus, Array<{ to: TStatus; roles: unknown[] }>>
): boolean
```

### canRolePerformTransition

Check if a specific role can perform a transition.

```typescript
function canRolePerformTransition<TStatus extends string, TRole extends string>(
  fromStatus: TStatus,
  toStatus: TStatus,
  role: TRole,
  transitionRules: Record<TStatus, Array<{ to: TStatus; roles: TRole[] }>>
): boolean
```

### getAllowedTransitionsForRole

Get all allowed transitions for a given status and role.

```typescript
function getAllowedTransitionsForRole<TStatus extends string, TRole extends string>(
  currentStatus: TStatus,
  role: TRole,
  transitionRules: Record<TStatus, Array<{ to: TStatus; roles: TRole[] }>>
): TStatus[]
```

**Example:**
```typescript
const allowedTransitions = getAllowedTransitionsForRole(
  'draft',
  'farmer',
  TRANSITION_RULES
);
// Returns: ['forecast']
```

### getBlockedTransitionsForRole

Get blocked transitions with reasons (useful for UI display).

```typescript
function getBlockedTransitionsForRole<TStatus extends string, TRole extends string>(
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
}>
```

**Example:**
```typescript
const blocked = getBlockedTransitionsForRole(
  'confirmed',
  'farmer',
  ALL_BATCH_STATUSES,
  TRANSITION_RULES,
  {
    fsmName: 'Batch',
    getStatusIndex: (status) => STATUS_ORDER.indexOf(status)
  }
);
// Returns blocked transitions with explanations
```

---

## Error Message Formatting

### formatTransitionError

Unified error message formatting for FSM transitions.

```typescript
function formatTransitionError(
  fromStatus: string,
  toStatus: string,
  reason: 'not_allowed' | 'no_permission' | 'same_status'
): { message: string; messageRu: string }
```

**Returns:**
- `same_status`: "Status is already {toStatus}"
- `not_allowed`: "Cannot transition from '{fromStatus}' to '{toStatus}'"
- `no_permission`: "You don't have permission to transition..."

---

## Integration with Existing FSMs

### Batch Lifecycle

```typescript
import { validateFSMTransition } from '@/lib/fsm-validator';

export function validateTransition(
  fromStatus: BatchLifecycleStatus,
  toStatus: BatchLifecycleStatus,
  role: BatchRole
): FSMValidationResult {
  return validateFSMTransition(fromStatus, toStatus, role, {
    transitionRules: TRANSITION_RULES,
    fsmName: 'Batch',
  });
}
```

### Pool Request Lifecycle

```typescript
import { canRolePerformTransition } from '@/lib/fsm-validator';

export function canRoleTransition(
  fromStatus: PoolRequestStatus,
  toStatus: PoolRequestStatus,
  role: PoolRequestRole
): boolean {
  return canRolePerformTransition(fromStatus, toStatus, role, TRANSITION_RULES);
}
```

---

## Benefits

1. **Eliminates Duplication**: Single source of truth for FSM validation logic
2. **Consistent Error Messages**: Unified EN/RU error messages across all FSMs
3. **Type Safety**: Generic implementation ensures type correctness
4. **Maintainability**: Changes to validation logic only need to be made once
5. **Testability**: Easier to write comprehensive unit tests for FSM behavior

---

## Testing

Example test case:

```typescript
import { validateFSMTransition } from '@/lib/fsm-validator';

describe('FSM Validator', () => {
  it('should reject same status transition', () => {
    const result = validateFSMTransition('draft', 'draft', 'farmer', {
      transitionRules: MOCK_RULES,
      fsmName: 'Test',
    });

    expect(result.valid).toBe(false);
    expect(result.error).toContain('already draft');
  });

  it('should reject unauthorized role', () => {
    const result = validateFSMTransition('draft', 'forecast', 'mpk', {
      transitionRules: MOCK_RULES,
      fsmName: 'Test',
    });

    expect(result.valid).toBe(false);
    expect(result.error).toContain('requires role');
  });
});
```

---

## Related Documentation

- [Batch Lifecycle FSM](../fsm/BATCH_LIFECYCLE.md)
- [Pool Request Lifecycle FSM](../fsm/POOL_REQUEST_LIFECYCLE.md)
- [Matching Lifecycle FSM](../fsm/MATCHING_LIFECYCLE.md)
- [Access Control](../ACCESS_CONTROL.md)

---

**Last Updated:** 2026-01-09 (Sprint 5 - Module 9)
