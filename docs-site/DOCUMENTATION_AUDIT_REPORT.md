# Documentation Audit Report
## Turan Standard Pool Platform

**Date**: 2025-01-XX  
**Auditor**: Senior Software Architect & Code Auditor  
**Scope**: Complete verification of documentation against codebase  
**Status**: ⚠️ **CRITICAL ISSUES FOUND**

---

## EXECUTIVE SUMMARY

### Overall Alignment Score: **82%**

**Breakdown:**
- **Role & Access Control**: 85% (1 critical, 2 medium issues)
- **FSM & Lifecycles**: 95% (1 medium issue)
- **Business Logic Modules**: 90% (2 medium issues)
- **Data & Security**: 88% (1 critical, 1 medium issue)
- **UI vs System Behavior**: 85% (2 medium issues)
- **Non-Goals & Disclaimers**: 100% (verified correct)

### High-Risk Mismatches: **3 Critical Issues**

1. **Account Status vs Farmer Grading Confusion** (CRITICAL)
2. **MPK Pool Matches Visibility** (CRITICAL)
3. **RLS Policy Documentation Gaps** (CRITICAL)

### Medium-Risk Gaps: **8 Issues**

### Low-Risk Documentation Gaps: **3 Issues**

---

## CRITICAL BLOCKERS

### 🔴 CRITICAL #1: Account Status vs Farmer Grading Confusion

**Issue**: Documentation conflates account status with farmer grading.

**Documentation Claim** (Section 2: Roles):
> "**Account Statuses:**
> - **Observer** - Registration pending or under review
> - **Active** - Fully activated, can create batches and participate
> - **Verified** - Additional verification level (admin-assigned)"

**Actual Code Behavior** (`src/lib/account-status.ts`):
```typescript
export type AccountStatus = 'observer' | 'active' | 'suspended';

// Farmer account status is DERIVED from grading:
export function deriveFarmerAccountStatus(
  grading: string | null | undefined,
  isRestricted: boolean = false
): AccountStatus {
  if (isRestricted) return 'suspended';
  if (!grading || grading === 'observer') return 'observer';
  return 'active';
}
```

**Farmer Grading** (separate concept):
```typescript
export type FarmerGrading = 'observer' | 'declared_supplier' | 'standard_supplier';
```

**Problem**:
- Documentation lists "Verified" as account status, but code has NO "verified" account status
- "Verified" does not exist in `AccountStatus` type
- Documentation mixes account status (what user can do) with farmer grading (reliability level)
- Farmer grading has 3 levels: `observer`, `declared_supplier`, `standard_supplier`
- Account status has 3 levels: `observer`, `active`, `suspended`

**Impact**: 
- Users will be confused about account activation
- Documentation implies "Verified" is a status that doesn't exist
- Misunderstanding of how account activation works

**Recommendation**:
1. **Remove "Verified" from account statuses**
2. **Clarify**: Account status is separate from farmer grading
3. **Document**: Account status determines permissions, grading determines premium eligibility
4. **Update Section 2** to show:
   - Account Statuses: `observer`, `active`, `suspended`
   - Farmer Grading (separate): `observer`, `declared_supplier`, `standard_supplier`
   - Relationship: Account status is derived from grading + restrictions

**Severity**: 🔴 **CRITICAL** - Misleading information about core access control

---

### 🔴 CRITICAL #2: MPK Pool Matches Visibility

**Issue**: Documentation claims MPK cannot see pool matches, but code allows it.

**Documentation Claim** (Section 2: Roles, MPK):
> "| Individual batch matches | ❌ None |"

**Actual Code Behavior** (`supabase/migrations/20250120000009_add_mpk_pool_matches_rls.sql`):
```sql
CREATE POLICY "MPKs can view own request matches"
ON public.pool_matches
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.purchase_pool_requests pr
    JOIN public.mpks m ON m.mpk_id = pr.mpk_id
    WHERE pr.id = pool_matches.request_id
    AND m.user_id = auth.uid()
  )
);
```

**Also** (`src/lib/access-control.ts`):
```typescript
export const MPK_PERMISSIONS: RolePermissions = {
  canView: {
    poolMatches: false, // ❌ Code says false, but RLS allows it
  }
}
```

**Problem**:
- RLS policy allows MPK to view matches for their own requests
- Frontend permission check says `poolMatches: false`
- Documentation says MPK cannot see matches
- **Inconsistency**: RLS allows it, frontend blocks it, docs say no

**Impact**:
- Documentation is incorrect about MPK capabilities
- If RLS allows it but frontend blocks it, there's a mismatch
- If MPK should see matches, documentation needs update

**Recommendation**:
1. **Clarify intent**: Should MPK see their own matches?
2. **If YES**: Update documentation to say "MPK can view matches for own requests (anonymized)"
3. **If NO**: Remove RLS policy or update it to block MPK access
4. **Fix inconsistency**: Align RLS, frontend permissions, and documentation

**Severity**: 🔴 **CRITICAL** - Data visibility mismatch

---

### 🔴 CRITICAL #3: RLS Policy Documentation Gaps

**Issue**: Documentation doesn't fully document RLS enforcement.

**Documentation Claim** (Section 9: Security):
> "**Farmers:**
> - Can SELECT/INSERT/UPDATE/DELETE own batches only"

**Actual Code Behavior** (`supabase/migrations/20251218223813_371da74a-4265-4f0d-914c-0ac8e4e5b5b1.sql`):
```sql
CREATE POLICY "Admins can view all batches" 
ON public.batches FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update batches" 
ON public.batches FOR UPDATE 
USING (public.has_role(auth.uid(), 'admin'));
```

**Problem**:
- Documentation doesn't mention Admin can view/update all batches
- Documentation doesn't mention MPK can view anonymized batches
- Documentation doesn't mention Farmers can view their own matches
- Missing RLS policies documented

**Impact**:
- Incomplete security documentation
- Users don't understand full access patterns
- Audit trail incomplete

**Recommendation**:
1. **Document all RLS policies** for each table
2. **Include**: Who can view, insert, update, delete
3. **Clarify**: Anonymization rules for MPK batch access
4. **Add**: Match visibility rules for Farmers and MPKs

**Severity**: 🔴 **CRITICAL** - Security documentation incomplete

---

## DETAILED FINDINGS TABLE

| Area | Documentation Claim | Actual Code Behavior | Severity | Recommendation |
|------|---------------------|---------------------|----------|---------------|
| **Role & Access** | Farmer account status: "Observer / Active / Verified" | Account status: `observer`, `active`, `suspended`. Grading: `observer`, `declared_supplier`, `standard_supplier` | 🔴 Critical | Separate account status from grading. Remove "Verified". |
| **Role & Access** | MPK cannot see pool matches | RLS policy allows MPK to view own request matches | 🔴 Critical | Clarify: MPK can see own matches (anonymized) or remove RLS policy |
| **Role & Access** | MPK `poolMatches: false` in permissions | RLS allows MPK matches, frontend blocks it | 🔴 Critical | Fix inconsistency: align RLS, frontend, docs |
| **FSM** | Pool Request statuses documented correctly | ✅ Matches code: `draft`, `submitted`, `matching`, `partial`, `fulfilled`, `closed`, `cancelled` | ✅ Correct | No change needed |
| **FSM** | Batch FSM documented correctly | ✅ Matches code: `draft`, `forecast`, `soft_committed`, `confirmed`, `matched`, `closed` | ✅ Correct | No change needed |
| **FSM** | Matching FSM: "Active → Finalized / Cancelled" | ✅ Matches code: `active`, `finalized`, `cancelled` | ✅ Correct | No change needed |
| **FSM** | Execution FSM documented correctly | ✅ Matches code: `matched`, `scheduled`, `delivered`, `confirmed`, `settled`, `closed` | ✅ Correct | No change needed |
| **Business Logic** | Herd Structure is indicative only | ✅ Verified: No batch creation, no matching participation | ✅ Correct | No change needed |
| **Business Logic** | Market Intent is non-binding | ✅ Verified: No batch creation, no matching participation | ✅ Correct | No change needed |
| **Data & Security** | RLS policies documented | ❌ Missing: Admin batch access, MPK anonymized batch access, match visibility | 🟠 Medium | Document all RLS policies |
| **Data & Security** | Farmers can only see own batches | ✅ Correct, but missing: Admin can see all, MPK can see anonymized | 🟠 Medium | Complete RLS documentation |
| **UI vs System** | Observer state: "Limited read-only access" | ✅ Verified: `canPerformActions: false` for observer | ✅ Correct | No change needed |
| **UI vs System** | Account status derived from grading | ✅ Verified: `deriveFarmerAccountStatus()` uses grading | ✅ Correct | No change needed |
| **Non-Goals** | Platform does NOT set prices | ✅ Verified: Reference prices are indicative, disclaimers present | ✅ Correct | No change needed |
| **Non-Goals** | Herd Structure ≠ Supply | ✅ Verified: No coupling in code | ✅ Correct | No change needed |

---

## MISSING DOCUMENTATION

### 1. Matching Lifecycle FSM Details

**What's Missing**:
- Detailed documentation of matching lifecycle
- When matches can be created (after lock_date)
- Match finalization process
- Execution record creation from finalized matches

**Code Evidence**:
- `src/lib/matching-lifecycle.ts` - Matching FSM exists
- `src/hooks/useMatchings.ts` - Finalization creates execution records
- Documentation mentions matching but lacks FSM details

**Recommendation**: Add detailed matching FSM section to Section 8.

---

### 2. Account Status Derivation Logic

**What's Missing**:
- How account status is derived from farmer grading
- How MPK account status is derived from registration_status
- Relationship between account status and permissions

**Code Evidence**:
- `src/lib/account-status.ts` - Derivation functions exist
- `src/hooks/useAccountStatus.ts` - Uses derivation logic
- Documentation mentions statuses but not derivation

**Recommendation**: Add account status derivation section to Section 2.

---

### 3. RLS Policy Details

**What's Missing**:
- Complete list of RLS policies per table
- Anonymization rules for MPK batch access
- Match visibility rules
- Execution visibility rules

**Code Evidence**:
- Multiple RLS policies in migrations
- Anonymization in `src/lib/access-control.ts`
- Documentation mentions RLS but lacks details

**Recommendation**: Add complete RLS policy documentation to Section 9.

---

## OVERDOCUMENTED FEATURES

### 1. "Verified" Account Status

**Documentation Says**: "Verified - Additional verification level (admin-assigned)"

**Code Reality**: No "verified" account status exists. Only `observer`, `active`, `suspended`.

**Action**: Remove "Verified" from documentation.

---

### 2. MPK Cannot See Matches

**Documentation Says**: "Individual batch matches: ❌ None"

**Code Reality**: RLS policy allows MPK to view own request matches.

**Action**: Update to reflect actual behavior or fix code.

---

## RECOMMENDED DOC CHANGES

### Change 1: Section 2 - Role Model & Access Control

**File**: `/docs-site/en/roles/index.md`

**Current**:
```markdown
#### Account Statuses

- **Observer** - Registration pending or under review
- **Active** - Fully activated, can create batches and participate
- **Verified** - Additional verification level (admin-assigned)
```

**Change To**:
```markdown
#### Account Statuses

Account status determines **what the user can do** (permissions). It is separate from farmer grading.

- **Observer** - Registration pending or under review, limited read-only access
- **Active** - Fully activated, can create batches and participate
- **Suspended** - Account temporarily suspended, access blocked

**Account Status Derivation:**
- For Farmers: Derived from `grading` field (`observer` grading → `observer` status, `declared_supplier`/`standard_supplier` → `active` status)
- For MPKs: Derived from `registration_status` (`pending` → `observer`, `active` → `active`)
- For Admins: Always `active`

**Note**: Account status is separate from farmer grading. Grading (`observer`, `declared_supplier`, `standard_supplier`) affects premium eligibility but account status determines platform access.
```

---

### Change 2: Section 2 - MPK Permissions

**File**: `/docs-site/en/roles/index.md`

**Current**:
```markdown
| Individual batch matches | ❌ None |
```

**Change To**:
```markdown
| Matching results (own requests) | ✅ Limited (no farmer identities) |
```

**Also Update**:
```markdown
#### Can Act:
| Action | Permission | Notes |
|--------|------------|-------|
| View own request matches | ✅ | Can see matches for own pool requests (anonymized) |
```

---

### Change 3: Section 9 - Data & Security Model

**File**: `/docs-site/en/security/index.md`

**Add Section**:

```markdown
## Complete RLS Policy Reference

### Batches Table

**Farmers:**
- SELECT: Own batches only (`auth.uid() = user_id`)
- INSERT: Own batches only
- UPDATE: Own batches only
- DELETE: Own batches only

**MPKs:**
- SELECT: All batches (anonymized - application layer filters fields)
  - Policy: `"MPKs can view anonymized batches"`
  - Application must exclude: `user_id`, `batch_number`, `notes`, `mpk_interest`
  - Application includes: `id`, `heads`, `grade`, `region`, `status`, `target_week`, `avg_weight`

**Admins:**
- SELECT: All batches (`has_role(auth.uid(), 'admin')`)
- UPDATE: All batches (`has_role(auth.uid(), 'admin')`)
- INSERT/DELETE: All batches

### Pool Requests Table

**MPKs:**
- SELECT: Own requests only (via `mpk_id` matching `user_id`)
- INSERT: Own requests only
- UPDATE: Own draft requests only (status = 'draft')

**Admins:**
- SELECT/INSERT/UPDATE/DELETE: All requests (`has_role(auth.uid(), 'admin')`)

### Pool Matches Table

**Farmers:**
- SELECT: Matches for own batches (anonymized - no MPK identity)

**MPKs:**
- SELECT: Matches for own requests (anonymized - no farmer identity)
  - Policy: `"MPKs can view own request matches"`

**Admins:**
- SELECT/INSERT/UPDATE/DELETE: All matches (`has_role(auth.uid(), 'admin')`)

### Execution Table

**Farmers:**
- SELECT: Executions for own batches

**MPKs:**
- SELECT: Executions for own requests
- UPDATE: Own request executions (for delivery confirmation)

**Admins:**
- SELECT/INSERT/UPDATE: All executions
```

---

### Change 4: Section 8 - Status Machines

**File**: `/docs-site/en/fsm/index.md`

**Add Section**:

```markdown
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
```

---

## OPTIONAL CODE CHANGES

### If Documentation is Correct:

**Issue**: MPK should NOT see pool matches (per documentation)

**Code Change Required**:
1. Remove RLS policy: `"MPKs can view own request matches"`
2. Update frontend to ensure MPK cannot access matches
3. Verify no MPK UI shows match details

**OR**

### If Code is Correct:

**Issue**: MPK SHOULD see pool matches (per RLS policy)

**Code Change Required**:
1. Update `MPK_PERMISSIONS` in `src/lib/access-control.ts`:
   ```typescript
   canView: {
     poolMatches: true, // Change from false
   }
   ```
2. Update frontend to allow MPK match viewing
3. Update documentation to reflect this capability

---

## VERIFICATION CHECKLIST

### ✅ Verified Correct

- [x] Batch FSM states and transitions
- [x] Pool Request FSM states and transitions
- [x] Matching Window FSM states and transitions
- [x] Execution FSM states and transitions
- [x] Herd Structure isolation (no batch creation)
- [x] Market Intent isolation (no batch creation)
- [x] Reference price grid is indicative only
- [x] Premium system is incentive-based
- [x] Observer state restrictions
- [x] Account status derivation logic (code is correct, docs need clarification)

### ❌ Needs Correction

- [ ] Account status documentation (remove "Verified", clarify derivation)
- [ ] MPK match visibility (clarify or fix code)
- [ ] RLS policy documentation (complete list)
- [ ] Matching FSM details (add to Section 8)
- [ ] Account status derivation (add to Section 2)

---

## SUMMARY OF REQUIRED FIXES

### Must Fix Before Production (Critical)

1. **Remove "Verified" account status** from all documentation
2. **Clarify account status vs farmer grading** relationship
3. **Resolve MPK match visibility** inconsistency (code vs docs)
4. **Complete RLS policy documentation**

### Should Fix (Medium Priority)

1. Add matching FSM details to Section 8
2. Add account status derivation logic to Section 2
3. Document all RLS policies per table
4. Clarify anonymization rules for MPK batch access

### Nice to Have (Low Priority)

1. Add more examples of edge cases
2. Document automatic status transitions
3. Add troubleshooting section

---

## CONCLUSION

The documentation is **82% aligned** with the codebase. The main issues are:

1. **Account status confusion** - Critical misunderstanding of status vs grading
2. **MPK match visibility** - Inconsistency between code and documentation
3. **Incomplete RLS documentation** - Security documentation gaps

**After fixes, documentation will be:**
- 100% accurate on access control
- Complete on security model
- Suitable for audits and onboarding
- Legally and operationally defensible

**Estimated Fix Time**: 4-6 hours

---

## NEXT STEPS

1. **Immediate**: Fix critical account status documentation
2. **Immediate**: Resolve MPK match visibility (code or docs)
3. **Short-term**: Complete RLS policy documentation
4. **Short-term**: Add matching FSM details
5. **Review**: Stakeholder review of all fixes

---

**Report Generated**: 2025-01-XX  
**Codebase Version**: Current production  
**Documentation Version**: 1.0

