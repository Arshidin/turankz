# Admin Guide

## Overview

This guide provides complete instructions for Admins (TURAN/ZENGI coordinators) on the Turan Standard Pool platform.

**Critical**: Admin acts as **coordinator**, not market maker. The platform maintains market neutrality.

---

## Role of Admin as Coordinator

### Coordinator vs Market Maker

**Admin DOES:**
- Facilitate matching between supply and demand
- Manage matching windows
- Verify data quality
- Resolve conflicts
- Track compliance

**Admin DOES NOT:**
- Set mandatory prices
- Create artificial demand/supply
- Force transactions
- Fix prices
- Act as market maker

### Market Neutrality

All Admin actions must maintain market neutrality:
- Reference prices are **indicative only**
- Premiums are **incentive-based**, not price controls
- Final prices determined at delivery
- No price fixing or manipulation

---

## Matching Windows Management

### Creating Matching Windows

1. Navigate to "Matching Windows"
2. Click "New Window"
3. Fill in:
   - Name
   - Start date
   - Lock date (deadline for submissions)
   - Close date
   - Target week
   - Eligible delivery periods
   - Notes

### Window Statuses

#### Upcoming
- Scheduled but not yet open
- No commitments allowed
- No matching allowed

#### Active
- Open for batch confirmations
- Open for pool request submissions
- Matching can begin
- **Only one window can be Active at a time**

#### Locked
- No new confirmations
- No new submissions
- Matching in progress
- Existing confirmed batches available

#### Closed
- Window completed
- All matching finalized
- No further changes

### Window Lifecycle

```
Upcoming → Active → Locked → Closed
```

**Transitions:**
- Upcoming → Active: Admin opens window
- Active → Locked: After lock_date passes (automatic) or manual
- Locked → Closed: After all matching finalized

### Automatic Status Calculation

Window status is **computed from dates**:
- Before `start_date`: `upcoming`
- Between `start_date` and `lock_date`: `active`
- Between `lock_date` and `close_date`: `locked`
- After `close_date`: `closed`

---

## Pool Matching Process

### Overview

Pool Matching is the process of matching confirmed batches to pool requests.

### Matching Workspace

1. **Select Pool Request**
   - Choose request from left panel
   - View request details: volume, grade, regions, criteria

2. **View Available Supply**
   - System filters batches by:
     - Grade match
     - Region match
     - Acceptance criteria (age, weight, breed)
     - Status (confirmed only)

3. **Select Batches**
   - Select batches from available supply
   - System calculates:
     - Total matched volume
     - Remaining volume
     - Fill percentage

4. **Propose Match**
   - Creates match records
   - Updates request status:
     - `matching` → `partial` (if not fully matched)
     - `matching` → `fulfilled` (if fully matched)

### Matching Rules

**Batch Eligibility:**
- Status must be `confirmed`
- Grade must match (or request accepts "Any")
- Region must match (or request accepts "Any")
- Must meet acceptance criteria (age, weight, breed)

**Volume Matching:**
- Can match partial volumes
- Cannot exceed batch `available_heads`
- Cannot exceed request `remaining_volume`

### Match Finalization

After proposing matches:
1. **Verify matches** are correct
2. **Finalize matches**:
   - Locks premium calculation
   - Creates execution records
   - Updates batch status to `matched`
   - Updates request status

**Important**: Once finalized, matches cannot be undone (Admin override only with note).

---

## Conflict Resolution

### Common Conflicts

1. **Batch Volume Discrepancy**
   - Farmer reports different volume than matched
   - **Resolution**: Admin verifies and updates with note

2. **Delivery Disputes**
   - MPK reports non-compliance
   - **Resolution**: Admin reviews and updates execution status

3. **Status Overrides**
   - Need to revert batch or request status
   - **Resolution**: Admin override with mandatory note

### Admin Override Process

**When to Override:**
- Data errors
- System issues
- Edge cases

**Required:**
- **Mandatory note** explaining reason
- Audit log entry
- Justification for override

**Override Actions:**
- Batch status changes
- Request status changes
- Access restrictions
- Grading updates

---

## Price Grid & Premium Rules

### Price Grid Management

1. **Create Price Grid Version**
   - Define cells by: age_category, sex, weight_min, weight_max, breed_group
   - Set base_price (₸/kg) for each cell

2. **Activate Version**
   - Only one version can be active
   - Previous version automatically deactivated
   - Effective date recorded

**Important**: Price grid is **indicative only**, not binding.

### Premium Settings

**Premium Types:**
1. **Standard Compliance** - Based on standard_status
2. **Reliability** - Based on farmer grading
3. **Predictability** - Based on confirmation timing
4. **Volume Consistency** - Based on delivery history

**Managing Premiums:**
- Create/update premium levels
- Set premium values (₸/kg)
- Define criteria for each level
- Activate/deactivate premiums

**Premium Calculation:**
- Calculated at match finalization
- Based on batch context at that time
- Locked after finalization

---

## Data Verification and Audit Responsibilities

### Herd Structure Verification

**Admin can:**
- View all herd structure snapshots
- Set `data_confidence_level` (low, medium, high)
- Set `verification_status` (unverified, verified, flagged)
- View aggregated national herd structure

**Cannot:**
- Edit farmer-submitted snapshot data
- Create snapshots on behalf of farmers
- Delete snapshots (farmer data is immutable)

### Market Intent Verification

**Admin can:**
- View all market intents
- View aggregated market intent
- Assess data quality

**Cannot:**
- Edit farmer-submitted intents
- Create intents on behalf of farmers

### Batch Verification

**Admin can:**
- View all batches
- Update batch status (with note)
- Override batch data (with note)
- Verify batch compliance

### Audit Logging

**All Admin actions are logged:**
- Timestamp
- Admin identity
- Action type
- Target entity
- Notes (if required)
- Metadata

**Audit Log Access:**
- Admin can view all audit logs
- Filter by date, action type, user
- Export for compliance

---

## Farmer Grading Management

### Grading Levels

- **Observer** - New or unverified
- **Declared Supplier** - Has declared batches
- **Standard Supplier** - Meets reliability criteria

### Updating Grading

1. Navigate to farmer profile
2. Click "Update Grading"
3. Select new grading level
4. **Mandatory note** required explaining reason
5. Save

**Impact:**
- Affects reliability premium eligibility
- Visible in farmer profile
- Logged in audit trail

---

## MPK Status Management

### MPK Statuses

- **Observer** - Registration pending
- **Active** - Fully activated
- **Restricted** - Access limited (admin override)

### Updating MPK Status

1. Navigate to MPK profile
2. Click "Update Status"
3. Select new status
4. **Mandatory note** required
5. Save

**Impact:**
- Affects ability to create pool requests
- Visible in MPK profile
- Logged in audit trail

---

## Access Restrictions

### Applying Restrictions

**To Farmer:**
- Set `is_batch_restricted` flag
- Prevents batch creation
- Requires mandatory note

**To MPK:**
- Set `is_request_restricted` flag
- Prevents pool request creation
- Requires mandatory note

### Removing Restrictions

- Navigate to user profile
- Remove restriction flag
- **Mandatory note** required
- Save

---

## Next Steps

- [Matching Windows Module](/docs/en/modules/matching-windows) - Detailed window management
- [Pool Matching Module](/docs/en/modules/pool-matching) - Detailed matching process
- [Premium System](/docs/en/modules/premium-system) - Premium calculation details

