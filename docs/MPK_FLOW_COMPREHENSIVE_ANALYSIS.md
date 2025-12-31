# MPK Flow Comprehensive Analysis
## TURAN Standard Pool Platform

**Date:** 2025-01-XX  
**Analyst:** Senior Product Architect & Systems Analyst  
**Scope:** End-to-end analysis of MPK (Meat Processing Company) flow

---

## EXECUTIVE SUMMARY

### Production Readiness Assessment

**Status:** ⚠️ **PARTIALLY READY**

The MPK flow demonstrates solid architectural foundations with proper FSM lifecycle management, RLS policies, and role-based access control. However, several critical gaps and inconsistencies prevent full production readiness:

- ✅ **Strong:** Registration flow, data isolation (RLS), lifecycle FSM, execution flow structure
- ⚠️ **Partial:** Matching visibility, execution filtering, status communication
- ❌ **Critical:** MPK cannot see their own matches, execution filtering incomplete, unclear matching confirmation flow

### Critical Issues Summary

1. **MPK cannot view their own pool matches** - `MpkMatchingView` exists but is not integrated into MPK UI
2. **Execution filtering incomplete** - MPK sees all executions, not filtered by their requests
3. **Matching confirmation unclear** - No clear MPK interaction with matching results
4. **Observer status UX gaps** - Limited guidance for pending activation users

---

## 1. MPK REGISTRATION FLOW

### Current Implementation

**Registration Process:**
1. User fills 3-step form (company data → intake profile → review)
2. Auth account created via `signUp()`
3. MPK role assigned via `assignRole(userId, 'mpk')`
4. MPK profile created with `registration_status: 'pending'`, `status: 'inactive'`
5. User redirected to observer dashboard

**Account Status Derivation:**
```typescript
// src/lib/account-status.ts
deriveMpkAccountStatus(mpkStatus, registrationStatus) {
  if (mpkStatus === 'restricted' || mpkStatus === 'inactive') return 'suspended';
  if (registrationStatus !== 'active') return 'observer';
  return 'active';
}
```

**Observer Dashboard:**
- `ObserverMpkDashboard` component shows 3 blocks:
  - Market Overview (read-only)
  - Price Grid (read-only)
  - Activation Status (informational)
- Clear messaging about what's available vs. what requires activation

### Analysis

**✅ Strengths:**
- Clear 3-step registration process
- Proper role assignment
- Observer status correctly derived from `registration_status`
- Observer dashboard provides clear guidance
- Registration data (regions, volume, age/weight ranges) stored for later use

**⚠️ Issues:**

1. **Registration Data Usage Incomplete** (Medium)
   - **Location:** `src/components/mpk/NewRequestDialog.tsx`
   - **Issue:** Registration data (age/weight ranges, regions) is stored but only partially used as defaults
   - **Impact:** MPK must re-enter data that was already provided during registration
   - **Evidence:**
     ```typescript
     // NewRequestDialog accepts defaultCriteria and defaultRegions
     // But these are only used if currentMpkData exists
     // Registration data is stored but not always loaded
     ```
   - **Recommendation:** Ensure `useCurrentMpk()` always loads registration data, and pre-fill forms consistently

2. **No Registration Status Feedback** (Low)
   - **Issue:** After registration, user sees "pending" status but no timeline or next steps
   - **Impact:** User uncertainty about activation timeline
   - **Recommendation:** Add estimated activation timeline or "typically 1-2 business days" messaging

3. **Missing Registration Validation** (Low)
   - **Issue:** No validation that MPK name is unique or that contact person is valid
   - **Impact:** Potential duplicate registrations or invalid data
   - **Recommendation:** Add backend validation for unique MPK names

### Recommendations

**Critical:** None

**Medium:**
1. Ensure registration data is consistently loaded and used as defaults in `NewRequestDialog`
2. Add registration status tracking/feedback mechanism

**Low:**
1. Add estimated activation timeline to observer dashboard
2. Add backend validation for unique MPK names

---

## 2. POOL REQUEST CREATION (MPK)

### Current Implementation

**Lifecycle FSM:**
```
draft → submitted → matching → partial/fulfilled → closed
         ↓            ↓
      cancelled   cancelled
```

**Status Transitions:**
- `draft → submitted`: MPK only
- `draft → cancelled`: MPK or Admin
- `submitted → matching`: Admin only
- `submitted → cancelled`: MPK or Admin
- `matching → partial/fulfilled`: Admin only
- All other transitions: Admin only

**Creation Flow:**
1. MPK opens `NewRequestDialog`
2. Form validates matching window status (`canSubmitPoolRequest()`)
3. Form validates MPK account status (`useCanCreateRequests()`)
4. Request created with `status: 'draft'`
5. MPK must explicitly submit draft → submitted

**Validation:**
- Matching window must be `active` and before `lock_date`
- MPK must have `registration_status: 'active'` and `status: 'active'` and `!is_request_restricted`
- Required fields: volume, grade, regions, target_week, acceptance criteria

**Matching Window Integration:**
- `MatchingWindowStatusBanner` shows current window status
- Submission blocked if window is `locked`, `closed`, or `upcoming`
- Countdown timer shows deadline

### Analysis

**✅ Strengths:**
- Proper FSM lifecycle with role-based transitions
- Matching window integration prevents submissions outside active windows
- Draft → Submit pattern allows MPK to prepare requests before deadline
- Comprehensive validation (frontend + backend via RLS)
- Clear UX with status banners and countdown timers
- Acceptance criteria (breeds, genders, age, weight) properly captured

**⚠️ Issues:**

1. **Draft Requests Not Visible After Creation** (Critical - Fixed in previous work)
   - **Status:** Previously identified and fixed
   - **Evidence:** `PurchasePoolRequests.tsx` now filters by `mpk_id` correctly

2. **Matching Window Status Confusion** (Medium)
   - **Location:** `src/lib/matching-window.ts`, `src/lib/pool-request-lifecycle.ts`
   - **Issue:** Multiple status calculations (`status`, `effective_status`) can be confusing
   - **Impact:** MPK may see conflicting messages about submission availability
   - **Evidence:**
     ```typescript
     // Matching window has both 'status' and calculated 'effective_status'
     // canSubmitPoolRequest() checks both window status and lock_date
     ```
   - **Recommendation:** Consolidate status calculation logic, ensure single source of truth

3. **No Validation of Request Limits** (Medium)
   - **Location:** `src/hooks/useCurrentMpk.ts`, `src/components/mpk/NewRequestDialog.tsx`
   - **Issue:** `mpks.max_active_requests` field exists but is not enforced
   - **Impact:** MPK could create unlimited requests, bypassing governance
   - **Evidence:**
     ```typescript
     // useCanCreateRequests() checks status but not max_active_requests
     // No validation in NewRequestDialog or useCreatePoolRequest()
     ```
   - **Recommendation:** Add validation to prevent exceeding `max_active_requests`

4. **Target Week Validation Missing** (Low)
   - **Issue:** MPK can select any target week, even past dates or far future
   - **Impact:** Invalid requests that will never match
   - **Recommendation:** Validate target week is within reasonable range (e.g., next 12 weeks)

5. **Acceptance Criteria Optional** (Low)
   - **Issue:** All acceptance criteria (breeds, genders, age, weight) are optional
   - **Impact:** MPK could create overly broad requests that match everything
   - **Recommendation:** Require at least one acceptance criteria field to be specified

### Recommendations

**Critical:** None (draft visibility issue was fixed)

**Medium:**
1. Consolidate matching window status calculation logic
2. Enforce `max_active_requests` limit in `useCanCreateRequests()` and `useCreatePoolRequest()`

**Low:**
1. Add target week validation (reasonable date range)
2. Require at least one acceptance criteria field

---

## 3. VISIBILITY & ISOLATION

### Current Implementation

**RLS Policies:**

1. **Pool Requests:**
   ```sql
   -- MPKs can view own requests only
   CREATE POLICY "MPKs can view own requests"
   USING (
     EXISTS (SELECT 1 FROM mpks WHERE mpks.user_id = auth.uid())
     AND EXISTS (SELECT 1 FROM mpks WHERE mpks.mpk_id = purchase_pool_requests.mpk_id AND mpks.user_id = auth.uid())
   );
   ```

2. **Batches (Anonymized for MPK):**
   ```sql
   -- MPKs can view anonymized batches
   CREATE POLICY "MPKs can view anonymized batches"
   USING (
     EXISTS (SELECT 1 FROM mpks WHERE mpks.user_id = auth.uid())
   );
   ```

3. **Pool Matches:**
   - **Issue:** No specific RLS policy for MPK to view their own matches
   - **Current:** Admin-only policies exist, MPK access not explicitly defined

**Data Masking:**
- `useMarketBatches()` selects only anonymized fields for MPK:
  ```typescript
   if (role === 'mpk') {
     .select('id, heads, avg_weight, grade, region, status, target_week, ...')
     // Excludes: user_id, batch_number, notes, mpk_interest
   }
   ```

**Frontend Filtering:**
- `PurchasePoolRequests.tsx` filters requests by `mpk_id` (defense-in-depth)
- `MarketOverview.tsx` shows only aggregated supply data

### Analysis

**✅ Strengths:**
- RLS policies correctly isolate MPK pool requests
- Batch data properly anonymized (no `user_id`, `batch_number`, `notes`)
- Frontend filtering provides defense-in-depth
- Market Overview correctly aggregates supply without farmer identities

**❌ Critical Issues:**

1. **MPK Cannot View Their Own Matches** (Critical)
   - **Location:** `src/components/pool/MpkMatchingView.tsx`, `src/pages/mpk/PurchasePoolRequests.tsx`
   - **Issue:** `MpkMatchingView` component exists but is not integrated into MPK UI
   - **Impact:** MPK cannot see which batches were matched to their requests
   - **Evidence:**
     ```typescript
     // MpkMatchingView exists and queries pool_matches correctly
     // But it's not used in PurchasePoolRequests or any MPK page
     // RoleAwareMatchingView exists but is not integrated
     ```
   - **Recommendation:** 
     - Add `MpkMatchingView` to `PurchasePoolRequests.tsx` for each request
     - Or create dedicated "Matches" section in MPK dashboard
     - Ensure RLS policy allows MPK to view matches for their own requests

2. **Pool Matches RLS Policy Missing** (Critical)
   - **Location:** `supabase/migrations/20251217053215_...sql`
   - **Issue:** No RLS policy for MPK to view `pool_matches` for their own requests
   - **Impact:** Even if UI is added, MPK cannot query matches due to RLS blocking
   - **Evidence:**
     ```sql
     -- Only admin policies exist:
     CREATE POLICY "Admins can view matches" ... USING (true);
     -- No MPK-specific policy
     ```
   - **Recommendation:** Add RLS policy:
     ```sql
     CREATE POLICY "MPKs can view own request matches"
     ON pool_matches FOR SELECT
     USING (
       EXISTS (SELECT 1 FROM mpks WHERE mpks.user_id = auth.uid())
       AND EXISTS (
         SELECT 1 FROM purchase_pool_requests pr
         JOIN mpks m ON m.mpk_id = pr.mpk_id
         WHERE pr.id = pool_matches.request_id
         AND m.user_id = auth.uid()
       )
     );
     ```

3. **Execution Filtering Incomplete** (Critical)
   - **Location:** `src/pages/mpk/MpkExecutions.tsx`
   - **Issue:** MPK sees all executions, not filtered by their requests
   - **Impact:** MPK could see executions for other MPKs' requests (if RLS allows)
   - **Evidence:**
     ```typescript
     // MpkExecutions.tsx line 39:
     const mpkExecutions = allExecutions; // No filtering!
     // Comment says "in production would filter by their requests"
     ```
   - **Recommendation:** Filter executions by MPK's requests:
     ```typescript
     const { data: currentMpk } = useCurrentMpk();
     const mpkExecutions = allExecutions.filter(e => 
       e.request?.mpk_id === currentMpk?.mpk_id
     );
     ```

**⚠️ Medium Issues:**

1. **Batch Number Leakage Risk** (Medium)
   - **Location:** `src/pages/mpk/MpkExecutions.tsx` line 141
   - **Issue:** Execution shows `batch.batch_number` which could identify farmers
   - **Impact:** If batch numbers are sequential or contain farmer info, anonymity is compromised
   - **Evidence:**
     ```typescript
     <p className="font-medium">#{execution.batch?.batch_number || 'N/A'}</p>
     ```
   - **Recommendation:** Remove batch number from MPK execution view, show only region/grade/target_week

2. **Market Overview Shows Individual Batches** (Medium)
   - **Location:** `src/pages/mpk/MarketOverview.tsx`
   - **Issue:** "Upcoming Batches" section shows individual batch details
   - **Impact:** If batch counts are small, MPK could identify farmers
   - **Evidence:** Shows individual batches with region, grade, heads, criteria
   - **Recommendation:** Aggregate batches further, or show only region-level summaries

### Recommendations

**Critical:**
1. Add RLS policy for MPK to view their own pool matches
2. Integrate `MpkMatchingView` into MPK UI (PurchasePoolRequests or dedicated page)
3. Filter executions by MPK's requests in `MpkExecutions.tsx`

**Medium:**
1. Remove `batch_number` from MPK execution view
2. Further aggregate batch data in Market Overview to prevent deanonymization

---

## 4. MATCHING & CONFIRMATION

### Current Implementation

**Matching Process:**
1. Admin creates matches in `PoolMatching` admin panel
2. Matches stored in `pool_matches` table with status `'active'` or `'finalized'`
3. `matched_volume` updated on `purchase_pool_requests`
4. Request status transitions: `matching → partial → fulfilled`

**MPK Visibility:**
- `MpkMatchingView` component exists but queries `pool_matches` directly
- Shows: heads matched, region, grade, target week, pricing (aggregated)
- Does NOT show: farmer identity, batch number, farmer-specific premiums

**Matching Status:**
- `pool_matches.status`: `'active'`, `'finalized'`, `'cancelled'`
- MPK can see matches with status `'active'` or `'finalized'`

### Analysis

**✅ Strengths:**
- Proper data masking (no farmer identity in MPK view)
- Aggregated pricing (hides farmer-specific premiums)
- Clear separation of matching data from execution data

**❌ Critical Issues:**

1. **MPK Cannot See Matches** (Critical)
   - **Location:** `src/components/pool/MpkMatchingView.tsx`, `src/pages/mpk/PurchasePoolRequests.tsx`
   - **Issue:** Component exists but is not used in MPK UI
   - **Impact:** MPK has no visibility into matching results
   - **Evidence:** No integration of `MpkMatchingView` or `RoleAwareMatchingView` in MPK pages
   - **Recommendation:** Add matching view to `PurchasePoolRequests.tsx` for each request showing matches

2. **No MPK Confirmation/Interaction** (Medium)
   - **Issue:** MPK cannot confirm, reject, or interact with matches
   - **Impact:** MPK is passive recipient of matches, no feedback mechanism
   - **Question:** Is this by design (admin-only matching) or missing feature?
   - **Recommendation:** Clarify business logic - if MPK should confirm matches, add confirmation flow

3. **Matching Status Updates Not Real-time** (Low)
   - **Issue:** MPK must refresh to see new matches
   - **Impact:** Delayed visibility of matching progress
   - **Recommendation:** Add real-time subscription to `pool_matches` changes

### Recommendations

**Critical:**
1. Integrate `MpkMatchingView` into MPK UI
2. Add RLS policy for MPK to view their own matches (see Section 3)

**Medium:**
1. Clarify business logic: Should MPK confirm matches? If yes, add confirmation flow
2. Add real-time updates for matching status

---

## 5. EXECUTION & DELIVERY FLOW

### Current Implementation

**Execution Lifecycle:**
```
matched → scheduled → delivered → confirmed → settled → closed
```

**Status Transitions:**
- `matched → scheduled`: Admin only
- `scheduled → delivered`: MPK or Admin
- `delivered → confirmed`: Admin only
- `confirmed → settled`: Admin only
- `settled → closed`: Admin only

**MPK Responsibilities:**
- Confirm delivery when status is `scheduled`
- Provide: `actual_delivery_date`, `delivered_volume`, `delivery_condition`, `mpk_delivery_notes`
- Transition: `scheduled → delivered`

**Execution Data:**
- MPK can see: request number, batch region/grade, volume, delivery period, expected delivery dates
- MPK cannot see: farmer identity, batch number (should be hidden but currently shown)

### Analysis

**✅ Strengths:**
- Clear FSM lifecycle with role-based transitions
- MPK has specific responsibility (confirm delivery)
- Proper audit logging via `execution_activity_log`
- Execution creation from finalized matches is automated

**❌ Critical Issues:**

1. **Execution Filtering Missing** (Critical)
   - **Location:** `src/pages/mpk/MpkExecutions.tsx` line 39
   - **Issue:** MPK sees all executions, not filtered by their requests
   - **Impact:** Data leakage, confusion, potential security issue
   - **Evidence:**
     ```typescript
     const mpkExecutions = allExecutions; // No filtering!
     ```
   - **Recommendation:** Filter by MPK's requests (see Section 3)

2. **Batch Number Visible** (Critical)
   - **Location:** `src/pages/mpk/MpkExecutions.tsx` line 141
   - **Issue:** Shows `execution.batch?.batch_number` which could identify farmers
   - **Impact:** Anonymity compromised
   - **Recommendation:** Remove batch number, show only region/grade/target_week

**⚠️ Medium Issues:**

1. **No Execution RLS Policy** (Medium)
   - **Location:** `supabase/migrations/20251218204624_...sql`
   - **Issue:** No explicit RLS policy for MPK to view their own executions
   - **Impact:** Relies on frontend filtering, which is insufficient
   - **Recommendation:** Add RLS policy:
     ```sql
     CREATE POLICY "MPKs can view own executions"
     ON offtake_executions FOR SELECT
     USING (
       EXISTS (SELECT 1 FROM mpks WHERE mpks.user_id = auth.uid())
       AND EXISTS (
         SELECT 1 FROM purchase_pool_requests pr
         JOIN mpks m ON m.mpk_id = pr.mpk_id
         WHERE pr.id = offtake_executions.request_id
         AND m.user_id = auth.uid()
       )
     );
     ```

2. **Delivery Confirmation UX** (Low)
   - **Issue:** `DeliveryConfirmationDialog` exists but could be clearer
   - **Impact:** MPK might be confused about what to confirm
   - **Recommendation:** Add tooltips/help text explaining delivery confirmation process

### Recommendations

**Critical:**
1. Filter executions by MPK's requests in `MpkExecutions.tsx`
2. Remove `batch_number` from MPK execution view
3. Add RLS policy for MPK to view their own executions

**Medium:**
1. Improve delivery confirmation UX with clear instructions

---

## 6. CONFLICT ANALYSIS

### Conflicts Identified

1. **MPK Flow vs. Admin Authority**
   - **Issue:** MPK cannot see matches, but admin expects MPK to confirm deliveries
   - **Impact:** MPK lacks context to make informed delivery confirmations
   - **Resolution:** Add matching visibility to MPK (see Section 4)

2. **Market Intent vs. Pool Requests**
   - **Status:** No conflict identified - these serve different purposes
   - **Market Intent:** Informational, non-binding signals
   - **Pool Requests:** Binding demand declarations

3. **Farmer Flow vs. MPK Flow**
   - **Status:** No direct conflicts
   - **Both flows properly isolated via RLS and data masking**

4. **Execution Flow vs. Matching Flow**
   - **Issue:** Executions created from matches, but MPK cannot see matches
   - **Impact:** MPK sees executions without context of how they were matched
   - **Resolution:** Add matching visibility (see Section 4)

### Logical Contradictions

1. **MPK Can Create Requests But Cannot See Matches**
   - **Contradiction:** MPK creates demand but has no visibility into supply matching
   - **Impact:** MPK cannot track progress or understand why requests are/aren't fulfilled
   - **Resolution:** Add matching visibility

2. **Execution Shows Batch Number But Should Be Anonymous**
   - **Contradiction:** Data masking policy says no batch numbers, but execution view shows them
   - **Impact:** Anonymity compromised
   - **Resolution:** Remove batch number from MPK view

### Overlapping Responsibilities

- **None identified** - Clear separation of concerns:
  - MPK: Create requests, confirm deliveries
  - Admin: Match supply to demand, schedule deliveries, confirm compliance
  - Farmer: Declare supply, confirm deliveries

---

## 7. RELIABILITY & SAFETY

### Idempotency

**✅ Safe Operations:**
- Creating pool requests: Idempotent (unique `request_number` prevents duplicates)
- Status transitions: Validated by FSM, cannot repeat invalid transitions
- Delivery confirmation: Can only confirm once (status changes from `scheduled` to `delivered`)

**⚠️ Potential Issues:**

1. **Multiple Submissions of Same Request** (Low)
   - **Issue:** MPK could submit same draft request multiple times
   - **Impact:** Duplicate submissions
   - **Recommendation:** Add validation to prevent submitting same request twice

2. **Concurrent Status Updates** (Low)
   - **Issue:** No optimistic locking on status transitions
   - **Impact:** Race conditions if MPK and Admin update simultaneously
   - **Recommendation:** Add version/timestamp checking for status updates

### Error Handling

**✅ Good Practices:**
- FSM validation prevents invalid transitions
- RLS policies prevent unauthorized access
- Toast notifications for user feedback
- Error boundaries in React components

**⚠️ Gaps:**

1. **Network Error Recovery** (Medium)
   - **Issue:** No retry logic for failed requests
   - **Impact:** User must manually retry on network failures
   - **Recommendation:** Add retry logic with exponential backoff

2. **Partial State Failures** (Medium)
   - **Issue:** If execution creation fails after match finalization, state is inconsistent
   - **Impact:** Matches exist but no execution record
   - **Recommendation:** Add transaction/rollback logic or reconciliation job

### Partial State Failures

**Scenarios:**

1. **Match Created But Execution Not Created**
   - **Current:** Match exists, but no execution record
   - **Impact:** MPK cannot see delivery schedule
   - **Mitigation:** Admin can manually create execution, but no automatic recovery

2. **Request Status Updated But Match Volume Not Updated**
   - **Current:** Status shows `fulfilled` but `matched_volume` is incorrect
   - **Impact:** Progress tracking is inaccurate
   - **Mitigation:** No automatic reconciliation

**Recommendations:**
1. Add database triggers to maintain consistency (e.g., update `matched_volume` when matches are created)
2. Add reconciliation job to detect and fix inconsistencies
3. Add transaction support for multi-step operations

---

## SUMMARY OF RECOMMENDATIONS

### Critical (Must Fix Before Production)

1. **Add RLS Policy for MPK Pool Matches**
   - Allow MPK to view `pool_matches` for their own requests
   - File: New migration

2. **Integrate Matching View into MPK UI**
   - Add `MpkMatchingView` to `PurchasePoolRequests.tsx` or create dedicated page
   - File: `src/pages/mpk/PurchasePoolRequests.tsx`

3. **Filter Executions by MPK Requests**
   - Filter `allExecutions` by current MPK's requests
   - File: `src/pages/mpk/MpkExecutions.tsx`

4. **Remove Batch Number from MPK Execution View**
   - Hide `batch_number` to maintain anonymity
   - File: `src/pages/mpk/MpkExecutions.tsx`

5. **Add RLS Policy for MPK Executions**
   - Allow MPK to view `offtake_executions` for their own requests only
   - File: New migration

### Medium Priority

1. Enforce `max_active_requests` limit
2. Consolidate matching window status calculation
3. Add batch aggregation in Market Overview to prevent deanonymization
4. Add network error retry logic
5. Add transaction support for multi-step operations

### Low Priority

1. Add target week validation
2. Require at least one acceptance criteria field
3. Add estimated activation timeline to observer dashboard
4. Improve delivery confirmation UX
5. Add real-time updates for matching status

---

## FINAL VERDICT

### Production Readiness: ⚠️ **PARTIALLY READY**

**Can Launch With:**
- Critical fixes applied (RLS policies, matching visibility, execution filtering)
- Clear documentation of limitations
- Admin support for edge cases

**Cannot Launch Without:**
- MPK matching visibility
- Execution filtering
- Proper RLS policies for matches and executions

**Estimated Fix Time:**
- Critical fixes: 4-6 hours
- Medium priority: 8-12 hours
- Low priority: 4-6 hours
- **Total: 16-24 hours of development work**

---

## APPENDIX: Code References

### Key Files

- `src/pages/auth/MpkRegistration.tsx` - Registration flow
- `src/components/mpk/ObserverMpkDashboard.tsx` - Observer status UI
- `src/components/mpk/NewRequestDialog.tsx` - Pool request creation
- `src/pages/mpk/PurchasePoolRequests.tsx` - Request management
- `src/pages/mpk/MarketOverview.tsx` - Supply visibility
- `src/pages/mpk/MpkExecutions.tsx` - Execution management
- `src/components/pool/MpkMatchingView.tsx` - Matching view (not integrated)
- `src/lib/pool-request-lifecycle.ts` - FSM lifecycle
- `src/lib/execution-lifecycle.ts` - Execution FSM
- `src/lib/access-control.ts` - Permission definitions
- `supabase/migrations/20250120000006_fix_mpk_requests_rls.sql` - RLS policies

### Database Tables

- `mpks` - MPK profiles
- `purchase_pool_requests` - Pool requests
- `pool_matches` - Matching results
- `offtake_executions` - Execution records
- `batches` - Supply data (anonymized for MPK)

---

**End of Report**

