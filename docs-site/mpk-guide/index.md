# MPK Guide

## Overview

This guide provides complete instructions for MPKs (Meat Processing Plants, demand-side participants) on the Turan Standard Pool platform.

---

## Registration & Activation

### Registration Process

1. **Initial Registration**
   - Provide MPK information
   - Submit for review

2. **Account Status: Observer**
   - Registration is pending admin review
   - Limited read-only access
   - Cannot create pool requests

3. **Account Status: Active**
   - Admin approves registration
   - Full MPK permissions enabled
   - Can create pool requests and participate

### Observer State

**What is visible:**
- Aggregated supply data (anonymized)
- Reference price grid (read-only)
- Platform information

**What is NOT visible:**
- Individual farmer batches
- Farmer identities
- Detailed batch information

**Why Observer state exists:**
- Admin verification of MPK registration
- Data quality assurance
- Platform onboarding

---

## Pool Request Creation

### Overview

Pool Requests are **binding demand declarations**. They represent MPK's need for livestock supply.

### Creating a Pool Request

1. **Check Matching Window Status**
   - Window must be `active`
   - Must be before `lock_date`
   - Check countdown timer

2. **Navigate to "Purchase Pool Requests"**
3. **Click "New Request"**
4. **Fill in request details:**
   - Required volume (heads)
   - Required grade (A/B, B/C, Any)
   - Target regions (array)
   - Target week
   - Acceptance criteria:
     - Age range (min/max)
     - Weight range (min/max)
     - Breed preferences
   - Notes (optional)

5. **Save as Draft**

### Request Statuses

#### Draft
- **Visibility**: Not visible to Admin
- **Editable**: ✅ All fields editable
- **Purpose**: Preparation before submission

#### Submitted
- **Visibility**: Visible to Admin for matching
- **Editable**: ❌ Read-only for MPK (Admin can override)
- **Purpose**: Binding demand request
- **Binding**: ✅ Ready for matching

#### Matching
- **Visibility**: Admin actively matching supply
- **Editable**: ❌ Read-only
- **Purpose**: Matching in progress

#### Partial
- **Visibility**: Some supply matched
- **Editable**: ❌ Read-only
- **Purpose**: Matching continues for remaining volume

#### Fulfilled
- **Visibility**: Request fully matched
- **Editable**: ❌ Read-only
- **Purpose**: Awaiting delivery confirmation

#### Closed
- **Visibility**: Request completed
- **Editable**: ❌ Read-only
- **Purpose**: Final state

#### Cancelled
- **Visibility**: Request cancelled
- **Editable**: ❌ Read-only
- **Purpose**: Cancelled state

### Status Transitions

**MPK can transition:**
- Draft → Submitted (if matching window is active)
- Draft → Cancelled
- Submitted → Cancelled (before matching begins)

**Admin can transition:**
- Submitted → Matching
- Matching → Partial/Fulfilled
- Any status → Cancelled (with note)
- Fulfilled → Closed

**Cannot:**
- Skip statuses
- Revert to previous status
- Edit after Submitted (MPK cannot, Admin can override)

---

## Status Lifecycle of Pool Requests

### Lifecycle Flow

```
Draft → Submitted → Matching → Partial/Fulfilled → Closed
         ↓            ↓
      Cancelled   Cancelled
```

### Matching Window Integration

**Critical**: Pool requests can only be **submitted** during active matching windows:

- **Upcoming**: Cannot submit (wait for window to open)
- **Active**: ✅ Can submit (before lock_date)
- **Locked**: ❌ Cannot submit (deadline passed)
- **Closed**: ❌ Cannot submit (window completed)

### Automatic Transitions

After matching window `lock_date`:
- Submitted requests → **automatically transition to Matching**
- Admin begins matching process

---

## What MPK Sees vs Does Not See

### Can See

| Data Type | Visibility |
|-----------|------------|
| Aggregated supply by region | ✅ Anonymized totals |
| Aggregated supply by grade | ✅ Anonymized totals |
| Aggregated supply by readiness | ✅ Forecast/Soft/Confirmed counts |
| Aggregated market intent | ✅ Anonymized signals |
| Own pool requests | ✅ Full details |
| Own request matching progress | ✅ Fill rate, matched volume |
| Own execution records | ✅ Delivery tracking |
| Reference price grid | ✅ Read-only |

### Cannot See

| Data Type | Visibility |
|-----------|------------|
| Individual farmer batches | ❌ Hidden |
| Farmer identities | ❌ Never exposed |
| Batch numbers | ❌ Hidden |
| Farmer contact information | ❌ Hidden |
| Other MPKs' requests | ❌ Hidden |
| Farmer reliability scores | ❌ Hidden |
| National herd structure | ❌ Admin-only |
| Admin matching workspace | ❌ Admin-only |

### Aggregated Supply Data

**Example of what MPK sees:**
```
Northern Region:
- Confirmed: 450 heads (Grade A)
- Soft Committed: 200 heads (Grade A)
- Forecast: 150 heads (Grade A)

Target Week: 2024-W15
```

**What is hidden:**
- Which farmers own which batches
- Farmer contact information
- Individual batch numbers
- Batch-specific details

---

## Matching Results

### Viewing Matching Results

1. Navigate to "Purchase Pool Requests"
2. Select a request with status `matching`, `partial`, or `fulfilled`
3. View matching details:
   - Matched volume
   - Remaining volume
   - Fill percentage
   - Matched batches (aggregated view)

### Matching Information Available

**MPK can see:**
- Total matched volume
- Remaining volume needed
- Fill percentage
- Grade of matched supply
- Region of matched supply
- Match status (active, finalized, cancelled)
- **No farmer identities**

**MPK cannot see:**
- Individual batch details
- Farmer names or contacts
- Batch numbers
- Individual batch volumes (only totals)
- Farmer contact information

---

## Execution and Delivery Tracking

### Execution Lifecycle

After matching is finalized:
- Execution record is created automatically
- Status: `matched` → `scheduled` → `delivered` → `confirmed` → `settled` → `closed`

### MPK Responsibilities

**At `scheduled` status:**
- MPK must confirm delivery
- Provide:
  - Actual delivery date
  - Delivered volume
  - Delivery condition
  - MPK delivery notes
- Transition: `scheduled` → `delivered`

### What MPK Sees in Execution

**Can see:**
- Request number
- Batch region and grade
- Matched volume
- Delivery period
- Expected delivery dates
- Execution status

**Cannot see:**
- Farmer identity
- Batch number (should be hidden)
- Farmer contact information

---

## Limitations and Safeguards

### Request Creation Limits

**Matching Window Required:**
- Cannot create requests outside active windows
- Must submit before `lock_date`
- Draft requests can be prepared anytime

**Account Status Required:**
- Must be `active` status
- Cannot be `observer` or `restricted`

### Data Visibility Limits

**Aggregated Only:**
- All supply data is aggregated
- No individual farmer information
- No batch-level details

**No Cross-Exposure:**
- Farmer identities never exposed
- MPK identities never exposed to farmers
- Admin mediates all relationships

### Matching Limitations

**Admin-Mediated:**
- MPK cannot directly match batches
- Admin facilitates all matching
- MPK can only create requests and confirm deliveries

**No Direct Communication:**
- No direct farmer-MPK communication
- All coordination through Admin
- Platform maintains neutrality

---

## Common Edge Cases

### Request Exceeds Available Supply

**Scenario**: Request 1000 heads, but only 500 available

**System behavior**: 
- Request can be created
- Matching will be partial
- Status: `partial` (not `fulfilled`)

**MPK action**: Wait for next matching window or adjust request

### Matching Window Closes Before Submission

**Scenario**: Start creating request, but window locks before submission

**System behavior**: ❌ Cannot submit
**Solution**: Save as draft, wait for next window

### Request Cancellation After Matching Begins

**Scenario**: Need to cancel request after status is `matching`

**System behavior**: ❌ MPK cannot cancel
**Solution**: Contact Admin (Admin can cancel with note)

---

## Next Steps

- [Pool Request Lifecycle](/docs/en/modules/pool-requests) - Deep dive into request FSM
- [Matching Process](/docs/en/modules/pool-matching) - How Admin matches supply to demand
- [Execution Lifecycle](/docs/en/modules/execution) - Complete execution process

