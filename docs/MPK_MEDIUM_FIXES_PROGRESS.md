# MPK Medium Priority Fixes - Progress Report

**Date:** 2025-01-XX  
**Status:** ✅ 2/5 Completed

---

## Completed Tasks

### ✅ 1. Enforce max_active_requests limit

**Files Modified:**
- `src/hooks/useCurrentMpk.ts` - Updated `useCanCreateRequests()` to return detailed result with validation
- `src/components/mpk/NewRequestDialog.tsx` - Updated to use new `CanCreateRequestsResult` interface
- `src/hooks/usePoolRequests.ts` - Added validation in `useTransitionPoolRequestStatus()` for draft → submitted transition

**Changes:**
- `useCanCreateRequests()` now checks `max_active_requests` limit
- Returns detailed result with reason, active count, and max limit
- Validation added when transitioning from draft to submitted
- UI shows clear error messages when limit is reached

**Result:** MPK cannot exceed `max_active_requests` limit when creating or submitting requests.

---

### ✅ 2. Consolidate matching window status calculation

**Files Modified:**
- `src/lib/pool-request-lifecycle.ts` - Updated `canSubmitPoolRequest()` to use `getEffectiveWindowStatus()`

**Changes:**
- `canSubmitPoolRequest()` now uses `getEffectiveWindowStatus()` as single source of truth
- Removed reliance on raw `status` field which may be out of sync
- Status is computed from dates (`start_date`, `lock_date`, `close_date`)

**Result:** Matching window status calculation is now consistent across the application.

---

## Pending Tasks

### ⏳ 3. Add batch aggregation in Market Overview

**Goal:** Prevent deanonymization by aggregating batches instead of showing individual batches.

**Status:** Pending

---

### ⏳ 4. Add network error retry logic

**Goal:** Improve error handling with automatic retry for failed network requests.

**Status:** Pending

---

### ⏳ 5. Add transaction support for multi-step operations

**Goal:** Prevent partial state failures in multi-step operations (e.g., match creation + execution).

**Status:** Pending

---

## Next Steps

1. Continue with batch aggregation in Market Overview
2. Implement network error retry logic
3. Add transaction support for critical operations

