# Status Machines (FSM)

## Overview

All critical operations on the Turan Standard Pool platform follow strict Finite State Machines (FSM). This ensures data integrity, prevents invalid transitions, and maintains system consistency.

---

## Batch FSM

### States

| State | Description | Editable | Binding |
|-------|-------------|----------|---------|
| `draft` | Initial entry, not visible to pool | ✅ Yes | ❌ No |
| `forecast` | Signaled availability, visible in market overview | ✅ Yes | ❌ No |
| `soft_committed` | Preliminary commitment to sell | ⚠️ With confirmation | ⚠️ Partial |
| `confirmed` | Firm commitment, ready for pool matching | ❌ No | ✅ Yes |
| `matched` | Matched to a purchase pool request | ❌ No | ✅ Yes |
| `closed` | Transaction completed or batch removed | ❌ No | ✅ Yes |

### Allowed Transitions

```
draft → forecast → soft_committed → confirmed → matched → closed
                                                      ↓
                                                   closed
```

**Farmer transitions:**
- `draft` → `forecast`
- `forecast` → `soft_committed`
- `soft_committed` → `confirmed`

**Admin transitions:**
- `confirmed` → `matched`
- `matched` → `closed`
- `confirmed` → `closed` (edge cases)

### Transition Rules

**Cannot:**
- Skip statuses (e.g., `draft` → `confirmed`)
- Revert to previous status
- Edit after `confirmed`

**Blocked Transitions:**
- `draft` → `confirmed` (must go through forecast and soft_committed)
- `forecast` → `confirmed` (must soft commit first)
- Any status → `draft` (no reverting)
- `confirmed`/`matched`/`closed` → earlier status (no reverting)

### Who Can Trigger Transitions

| Transition | Farmer | Admin |
|------------|--------|-------|
| draft → forecast | ✅ | ✅ |
| forecast → soft_committed | ✅ | ✅ |
| soft_committed → confirmed | ✅ | ✅ |
| confirmed → matched | ❌ | ✅ |
| matched → closed | ❌ | ✅ |
| confirmed → closed | ❌ | ✅ |

### What Becomes Locked

**At `confirmed` status:**
- All batch fields become read-only
- No edits allowed
- Data is final for matching

**At `matched` status:**
- Batch is allocated
- Execution record created
- Premium calculation locked

---

## Pool Request FSM

### States

| State | Description | Editable (MPK) | Binding |
|-------|-------------|-----------------|---------|
| `draft` | Request being prepared | ✅ Yes | ❌ No |
| `submitted` | Request submitted for review | ❌ No | ✅ Yes |
| `matching` | Admin actively matching supply | ❌ No | ✅ Yes |
| `partial` | Some supply matched | ❌ No | ✅ Yes |
| `fulfilled` | Request fully matched | ❌ No | ✅ Yes |
| `closed` | Request completed | ❌ No | ✅ Yes |
| `cancelled` | Request cancelled | ❌ No | ❌ No |

### Allowed Transitions

```
draft → submitted → matching → partial/fulfilled → closed
         ↓            ↓
      cancelled   cancelled
```

**MPK transitions:**
- `draft` → `submitted` (if matching window is active)
- `draft` → `cancelled`
- `submitted` → `cancelled` (before matching begins)

**Admin transitions:**
- `submitted` → `matching`
- `matching` → `partial`/`fulfilled`
- `partial` → `fulfilled`
- `fulfilled` → `closed`
- Any status → `cancelled` (with note)

### Transition Rules

**Cannot:**
- Skip statuses
- Revert to previous status
- Edit after `submitted` (MPK cannot, Admin can override)

**Matching Window Integration:**
- `draft` → `submitted` only allowed during active matching window
- After `lock_date`, no new submissions
- `submitted` requests auto-transition to `matching` after `lock_date`

### Who Can Trigger Transitions

| Transition | MPK | Admin |
|------------|-----|-------|
| draft → submitted | ✅ | ❌ |
| draft → cancelled | ✅ | ✅ |
| submitted → matching | ❌ | ✅ |
| submitted → cancelled | ✅ | ✅ |
| matching → partial/fulfilled | ❌ | ✅ |
| partial → fulfilled | ❌ | ✅ |
| fulfilled → closed | ❌ | ✅ |
| Any → cancelled | ❌ | ✅ |

### What Becomes Locked

**At `submitted` status:**
- MPK cannot edit (Admin can override)
- Request is binding

**At `matching` status:**
- Request is fully locked
- Matching in progress

---

## Matching Window FSM

### States

| State | Description | Commitments Allowed | Matching Allowed |
|-------|-------------|---------------------|------------------|
| `upcoming` | Scheduled but not yet open | ❌ No | ❌ No |
| `active` | Open for commitments and matching | ✅ Yes | ✅ Yes |
| `locked` | No new commitments, matching in progress | ❌ No | ✅ Yes |
| `closed` | Window completed, all matching finalized | ❌ No | ❌ No |

### Allowed Transitions

```
upcoming → active → locked → closed
```

**Admin transitions only:**
- `upcoming` → `active` (manual or automatic based on start_date)
- `active` → `locked` (automatic after lock_date or manual)
- `locked` → `closed` (after all matching finalized)

### Transition Rules

**Automatic Transitions:**
- Status is **computed from dates**:
  - Before `start_date`: `upcoming`
  - Between `start_date` and `lock_date`: `active`
  - Between `lock_date` and `close_date`: `locked`
  - After `close_date`: `closed`

**Manual Overrides:**
- Admin can manually transition (with note)
- Used for edge cases or corrections

### Who Can Trigger Transitions

| Transition | Admin |
|------------|-------|
| upcoming → active | ✅ |
| active → locked | ✅ |
| locked → closed | ✅ |

### What Becomes Locked

**At `locked` status:**
- No new batch confirmations
- No new pool request submissions
- Existing confirmed batches remain available

**At `closed` status:**
- Window is complete
- No further changes allowed

---

## Execution FSM

### States

| State | Description | Who Can Transition |
|-------|-------------|-------------------|
| `matched` | Match created, awaiting delivery scheduling | Admin |
| `scheduled` | Delivery scheduled, awaiting MPK confirmation | MPK, Admin |
| `delivered` | MPK confirmed delivery, awaiting admin compliance check | Admin |
| `confirmed` | Admin confirmed compliance, awaiting settlement calculation | Admin |
| `settled` | Settlement calculated, awaiting closure | Admin |
| `closed` | Execution fully completed | Admin |

### Allowed Transitions

```
matched → scheduled → delivered → confirmed → settled → closed
```

### Transition Rules

**Cannot:**
- Skip statuses
- Revert from `closed` (terminal state)

**Can Revert:**
- Admin can revert from most states (except `matched` and `closed`)
- Requires note

### Who Can Trigger Transitions

| Transition | Farmer | MPK | Admin |
|------------|--------|-----|-------|
| matched → scheduled | ❌ | ❌ | ✅ |
| scheduled → delivered | ❌ | ✅ | ✅ |
| delivered → confirmed | ❌ | ❌ | ✅ |
| confirmed → settled | ❌ | ❌ | ✅ |
| settled → closed | ❌ | ❌ | ✅ |
| Revert (most states) | ❌ | ❌ | ✅ |

### What Becomes Locked

**At `confirmed` status:**
- Compliance verified
- Ready for settlement

**At `settled` status:**
- Settlement calculated
- Ready for closure

**At `closed` status:**
- Execution complete
- Terminal state (no further changes)

---

## Matching FSM

### States

| State | Description | Who Can Transition |
|-------|-------------|-------------------|
| `active` | Match created, binding | Admin (creates) |
| `finalized` | Match finalized, execution record created | Admin |
| `cancelled` | Match cancelled | Admin |

### Allowed Transitions

```
active → finalized
active → cancelled
```

### Transition Rules

- Matches can only be created after matching window `lock_date`
- Finalization creates execution records automatically
- Premium calculation is locked at finalization
- Cannot revert from `finalized` or `cancelled`

### Who Can Trigger Transitions

| Transition | Admin |
|------------|-------|
| Create match (→ active) | ✅ |
| Finalize (→ finalized) | ✅ |
| Cancel (→ cancelled) | ✅ |

### What Becomes Locked

**At `finalized` status:**
- Premium calculation locked
- Execution record created automatically
- Batch status updated to `matched`
- Request status updated (partial/fulfilled)

---

## FSM Validation

### Frontend Validation

All transitions are validated before execution:
- Check if transition is allowed by FSM
- Check if role has permission
- Check if prerequisites are met
- Show error if invalid

### Backend Validation

Database triggers enforce FSM rules:
- Prevent invalid transitions
- Log all transitions
- Maintain data integrity

### Audit Trail

All FSM transitions are logged:
- Timestamp
- From status
- To status
- Triggered by (user/role)
- Notes (if required)

---

## Next Steps

- [Batch Lifecycle Module](/docs/en/modules/batch-lifecycle) - Detailed batch FSM
- [Pool Request Module](/docs/en/modules/pool-requests) - Detailed request FSM
- [Execution Module](/docs/en/modules/execution) - Detailed execution FSM

