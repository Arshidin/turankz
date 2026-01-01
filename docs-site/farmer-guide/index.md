# Farmer Guide

## Overview

This guide provides complete instructions for Farmers (supply-side participants) on the Turan Standard Pool platform.

---

## Registration & Activation

### Registration Process

1. **Initial Registration**
   - Provide farm information
   - Select region
   - Submit for review

2. **Account Status: Observer**
   - Registration is pending admin review
   - Limited read-only access
   - Cannot create batches or participate in matching
   - Derived from: `grading = 'observer'` or `grading` is null

3. **Account Status: Active**
   - Admin approves registration
   - Full Farmer permissions enabled
   - Can create batches and participate
   - Derived from: `grading = 'declared_supplier'` or `'standard_supplier'`

**Note**: Account status is separate from farmer grading. Grading affects premium eligibility, but account status determines platform access permissions.

### Observer State

**What is visible:**
- Reference price grid (read-only)
- Aggregated demand signals (anonymized)
- Platform information and guides

**What is NOT visible:**
- Cannot see other farmers' data
- Cannot create batches
- Cannot participate in matching

**Why Observer state exists:**
- Admin verification of farm registration
- Data quality assurance
- Platform onboarding

---

## Herd Structure (Indicative Only)

### Purpose

Herd Structure snapshots are **voluntary, indicative capacity data**. They do NOT:
- Create batches automatically
- Participate in matching
- Create supply commitments
- Affect pricing

### Creating Herd Structure Snapshots

1. Navigate to "Herd Structure" section
2. Click "New Snapshot"
3. Fill in:
   - Reporting period (year/quarter)
   - Breed
   - Category (breeding_cows, replacement_heifers, bulls, calves)
   - Count
4. Submit snapshot

### Important Notes

- **Immutability**: Once submitted, snapshots cannot be edited (admin can set confidence level)
- **Time-based**: Snapshots are tied to specific reporting periods
- **No validation**: Herd structure does NOT validate against batch volumes
- **Planning only**: Used for national capacity planning, not market operations

---

## Market Intent (Non-Binding)

### Purpose

Market Intent is **voluntary, non-binding availability signals**. They do NOT:
- Create batches
- Enter Batch FSM lifecycle
- Participate in matching
- Affect pricing

### Creating Market Intent

1. Navigate to "Market Intent" section
2. Click "New Intent"
3. Fill in:
   - Target week
   - Estimated heads
   - Grade
   - Region
   - Confidence level
4. Submit intent

### Important Notes

- **Non-binding**: Intents are signals only, not commitments
- **No batch creation**: Must explicitly create batch to participate
- **MPK visibility**: MPKs see aggregated intents (anonymized)
- **Planning tool**: Helps with demand/supply visibility

---

## Batch Lifecycle

### Overview

Batches are the **only path to market participation**. All batches follow a strict lifecycle:

```
Draft → Forecast → Soft Committed → Confirmed → Matched → Closed
```

### Creating a Batch

1. Navigate to "Livestock Batches"
2. Click "New Batch"
3. Fill in batch details:
   - Heads (volume)
   - Target week
   - Breed
   - Gender
   - Age range (min/max)
   - Weight range (min/max)
   - Grade
4. Save as Draft

**Important**: All batches start as `draft` status. This is the only entry point.

### Batch Statuses

#### Draft
- **Visibility**: Not visible to pool
- **Editable**: ✅ All fields editable
- **Purpose**: Preparation before publishing

#### Forecast
- **Visibility**: Visible in market overview (aggregated)
- **Editable**: ✅ All fields editable
- **Purpose**: Early availability signal
- **Binding**: ❌ No commitment

#### Soft Committed
- **Visibility**: Visible in matching
- **Editable**: ⚠️ Editable with confirmation
- **Purpose**: Preliminary commitment
- **Binding**: ⚠️ Partial commitment

#### Confirmed
- **Visibility**: Fully visible for matching
- **Editable**: ❌ Read-only (locked)
- **Purpose**: Firm commitment
- **Binding**: ✅ Ready for pool matching

#### Matched
- **Visibility**: Matched to pool request
- **Editable**: ❌ Read-only
- **Purpose**: Allocated to buyer
- **Binding**: ✅ Binding allocation

#### Closed
- **Visibility**: Transaction completed
- **Editable**: ❌ Read-only
- **Purpose**: Final state

### Status Transitions

**Farmer can transition:**
- Draft → Forecast
- Forecast → Soft Committed
- Soft Committed → Confirmed

**Admin can transition:**
- Confirmed → Matched
- Matched → Closed
- Confirmed → Closed (edge cases)

**Cannot:**
- Skip statuses (e.g., Draft → Confirmed)
- Revert to previous status
- Edit after Confirmed

---

## Locking Rules

### When Batches Become Locked

Batches become **read-only** when they reach `confirmed` status:

- **No field edits** allowed
- **No status reversion** allowed
- **Data is final** for matching

### Matching Window Locking

During matching window `locked` status:
- **No new confirmations** allowed
- **Existing confirmed batches** remain available for matching
- **Draft/Forecast/Soft batches** can still be edited (but won't be matched)

### Premium Locking

After matching is finalized:
- **Premium calculation** is locked
- **Base price** is locked (from active price grid at finalization)
- **Total price** is calculated and locked

---

## Premium Eligibility

### Premium Types

1. **Standard Compliance Premium**
   - Based on `standard_status` field
   - Levels: non_standard, standard, high_standard

2. **Reliability Premium**
   - Based on farmer grading (admin-assigned)
   - Levels: observer, declared_supplier, standard_supplier

3. **Predictability Premium**
   - Based on confirmation timing relative to matching window lock date
   - Early confirmation = higher premium

4. **Volume Consistency Premium**
   - Based on delivery rate and months active
   - Consistent delivery = higher premium

### Premium Calculation

Premiums are calculated at **matching finalization**:
- Base price from active price grid
- Premiums added based on eligibility
- Total price = base + premiums

**Important**: Premiums are **locked** after finalization. No retroactive changes.

---

## Common Edge Cases

### Batch Exceeds Herd Structure

**Scenario**: Batch volume (50 heads) exceeds reported herd structure (30 heads)

**System behavior**: ✅ Allowed (no validation)
**Reason**: Herd structure is indicative only, not a constraint

### Market Intent vs Batch

**Scenario**: Market Intent says 100 heads, but batch created for 50 heads

**System behavior**: ✅ Allowed (no validation)
**Reason**: Market Intent is non-binding, batch is explicit commitment

### Confirmed Batch Cannot Be Edited

**Scenario**: Need to change batch details after confirmation

**System behavior**: ❌ Not allowed
**Reason**: Confirmed batches are locked for matching integrity

**Solution**: Contact Admin for status override (requires admin note)

### Multiple Batches for Same Week

**Scenario**: Create multiple batches targeting same week

**System behavior**: ✅ Allowed
**Reason**: No constraint on multiple batches per farmer per week

---

## Pool Invitations

### Receiving Invitations

When Admin matches your batch to a pool request:
- You receive a pool invitation
- Invitation shows: volume, grade, target week
- **MPK identity is hidden**

### Responding to Invitations

**Confirm**:
- Accepts the match
- Batch status → Matched
- Proceeds to execution

**Decline**:
- Rejects the match
- Batch remains Confirmed
- Available for other matches

### Viewing Matches

You can view matches for your own batches:
- **Visible**: Matched volume, matching date, target week, required grade
- **Hidden**: MPK identity, request details, other farmers' matches
- **Access**: View matches from your batch detail page

**Note**: Matches are anonymized - you cannot see which MPK your batch was matched to.

---

## Next Steps

- [Batch Lifecycle Details](/docs/en/modules/batch-lifecycle) - Deep dive into batch FSM
- [Premium System](/docs/en/modules/premium-system) - Detailed premium calculation
- [Business Logic](/docs/en/business-logic/) - Understanding binding vs non-binding

