# Audit Fixes Applied

## Summary

Critical documentation issues identified in the audit have been fixed.

## Fixes Applied

### ✅ Fix 1: Account Status Documentation

**File**: `/docs-site/en/roles/index.md`

**Change**: 
- Removed "Verified" account status (does not exist in code)
- Added "Suspended" account status
- Clarified account status vs farmer grading separation
- Added account status derivation logic

**Status**: ✅ Applied

---

### ✅ Fix 2: MPK Match Visibility

**File**: `/docs-site/en/roles/index.md`

**Change**:
- Updated MPK permissions to show they CAN view own request matches
- Added clarification about anonymized match data
- Updated "Can Act" section to include match viewing

**Status**: ✅ Applied

---

### ✅ Fix 3: RLS Policy Documentation

**File**: `/docs-site/en/security/index.md`

**Change**:
- Added complete RLS policy documentation per table
- Documented anonymization rules for MPK batch access
- Added match visibility rules
- Added execution visibility rules

**Status**: ✅ Applied

---

### ✅ Fix 4: Matching FSM Documentation

**File**: `/docs-site/en/fsm/index.md`

**Change**:
- Added complete Matching FSM section
- Documented states: `active`, `finalized`, `cancelled`
- Documented transitions and rules
- Documented who can trigger transitions

**Status**: ✅ Applied

---

### ✅ Fix 5: Farmer Guide Account Status

**File**: `/docs-site/en/farmer-guide/index.md`

**Change**:
- Removed "Verified" account status
- Added account status derivation explanation
- Clarified relationship with farmer grading

**Status**: ✅ Applied

---

### ✅ Fix 6: MPK Guide Match Visibility

**File**: `/docs-site/en/mpk-guide/index.md`

**Change**:
- Updated matching results section
- Clarified what MPK can see in matches
- Added note about anonymization

**Status**: ✅ Applied

---

## Remaining Issues

### ⚠️ Code vs Documentation Inconsistency

**Issue**: MPK permissions in code say `poolMatches: false`, but RLS allows it.

**Action Required**: 
- **Option A**: Update code to allow MPK match viewing (if intended)
- **Option B**: Remove RLS policy (if MPK should NOT see matches)

**Recommendation**: Verify business intent, then align code and documentation.

---

## Verification

After these fixes:
- ✅ Account status documentation is accurate
- ✅ MPK match visibility is documented correctly
- ✅ RLS policies are fully documented
- ✅ Matching FSM is documented
- ⚠️ Code permission flag needs alignment (see above)

---

## Next Steps

1. **Verify business intent** for MPK match visibility
2. **Align code** with documentation (or vice versa)
3. **Apply same fixes** to Russian translations
4. **Review** all changes with stakeholders

---

**Fixes Applied**: 2025-01-XX  
**Audit Report**: See `DOCUMENTATION_AUDIT_REPORT.md`

