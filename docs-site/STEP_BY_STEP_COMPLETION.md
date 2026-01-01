# Step-by-Step Completion Instructions

## Overview

This guide provides detailed, actionable steps to complete the Turan Standard Pool documentation system.

---

## Phase 1: Complete English Module Documentation

### Step 1.1: Create Batch Lifecycle Module Doc

**File**: `/docs-site/en/modules/batch-lifecycle.md`

**Content to include:**
- Purpose: Batch lifecycle management
- Data scope: Batch table, status transitions
- Lifecycle FSM: Complete state diagram
- Business rules:
  - All batches start as `draft`
  - Cannot skip statuses
  - Cannot revert
  - Locking rules at `confirmed`
- Role interactions:
  - Farmer: Can transition draft → forecast → soft_committed → confirmed
  - Admin: Can transition confirmed → matched → closed
- Code references: `src/lib/batch-lifecycle.ts`
- Examples: Status transition flows

**Estimated time**: 30 minutes

### Step 1.2: Create Pool Requests Module Doc

**File**: `/docs-site/en/modules/pool-requests.md`

**Content to include:**
- Purpose: Pool request creation and management
- Data scope: `purchase_pool_requests` table
- Lifecycle FSM: Complete state diagram
- Business rules:
  - Matching window integration
  - Submission deadlines
  - Volume matching rules
- Role interactions:
  - MPK: Creates and submits requests
  - Admin: Manages matching
- Code references: `src/lib/pool-request-lifecycle.ts`
- Examples: Request creation flow

**Estimated time**: 30 minutes

### Step 1.3: Create Matching Windows Module Doc

**File**: `/docs-site/en/modules/matching-windows.md`

**Content to include:**
- Purpose: Time-based coordination
- Data scope: `matching_windows` table
- Lifecycle FSM: Status transitions
- Business rules:
  - Date-based status calculation
  - Only one active window at a time
  - Lock date enforcement
- Role interactions:
  - Admin: Creates and manages windows
  - All roles: View window status
- Code references: `src/lib/matching-window.ts`
- Examples: Window lifecycle timeline

**Estimated time**: 25 minutes

### Step 1.4: Create Pool Matching Module Doc

**File**: `/docs-site/en/modules/pool-matching.md`

**Content to include:**
- Purpose: Supply-demand matching process
- Data scope: `pool_matches` table
- Matching process:
  - Request selection
  - Supply filtering
  - Batch selection
  - Match proposal
  - Match finalization
- Business rules:
  - Batch eligibility criteria
  - Volume matching constraints
  - Premium locking
- Role interactions:
  - Admin: Performs all matching
  - Farmer: Receives invitations
  - MPK: Views matching results
- Code references: `src/pages/admin/PoolMatching.tsx`
- Examples: Matching workflow

**Estimated time**: 40 minutes

### Step 1.5: Create Execution Module Doc

**File**: `/docs-site/en/modules/execution.md`

**Content to include:**
- Purpose: Delivery and settlement tracking
- Data scope: `offtake_executions` table
- Lifecycle FSM: Execution states
- Business rules:
  - Automatic creation from finalized matches
  - MPK delivery confirmation
  - Admin compliance verification
  - Settlement calculation
- Role interactions:
  - MPK: Confirms delivery
  - Admin: Verifies compliance, calculates settlement
  - Farmer: Views execution status
- Code references: `src/lib/execution-lifecycle.ts`
- Examples: Execution flow

**Estimated time**: 30 minutes

### Step 1.6: Create Remaining Module Docs

**Files to create:**
- `offtake-registry.md` - Registry structure and tracking
- `premium-system.md` - Premium types and calculation
- `price-grid.md` - Grid structure and versioning
- `herd-structure.md` - Snapshot creation and aggregation
- `market-intent.md` - Intent creation and aggregation
- `national-herd.md` - Aggregated planning view

**Estimated time**: 3 hours total

---

## Phase 2: Create Russian Translations

### Step 2.1: Translation Workflow

**For each English file:**

1. **Copy structure**: Create corresponding file in `/docs-site/ru/`
2. **Translate content**: 
   - Translate all user-facing text
   - Keep technical terms in English where standard (FSM, RLS, RBAC)
   - Maintain code blocks as-is
   - Preserve table structures
3. **Verify consistency**: Use Glossary for terminology
4. **Check links**: Update internal links to `/docs/ru/`

### Step 2.2: Translation Priority Order

1. **Introduction** (`/docs-site/ru/introduction/index.md`)
   - Foundation document
   - Sets platform context
   - **Time**: 45 minutes

2. **Role Model** (`/docs-site/ru/roles/index.md`)
   - Critical for understanding permissions
   - **Time**: 1 hour

3. **Farmer Guide** (`/docs-site/ru/farmer-guide/index.md`)
   - User-facing guide
   - **Time**: 1.5 hours

4. **MPK Guide** (`/docs-site/ru/mpk-guide/index.md`)
   - User-facing guide
   - **Time**: 1.5 hours

5. **Admin Guide** (`/docs-site/ru/admin-guide/index.md`)
   - Coordinator documentation
   - **Time**: 1.5 hours

6. **Business Logic** (`/docs-site/ru/business-logic/index.md`)
   - Critical guardrails
   - **Time**: 1 hour

7. **FSM** (`/docs-site/ru/fsm/index.md`)
   - Technical documentation
   - **Time**: 1 hour

8. **Security** (`/docs-site/ru/security/index.md`)
   - Technical documentation
   - **Time**: 45 minutes

9. **Limitations** (`/docs-site/ru/limitations/index.md`)
   - Important constraints
   - **Time**: 45 minutes

10. **Glossary** (`/docs-site/ru/glossary/index.md`)
    - Terminology reference
    - **Time**: 30 minutes

11. **Modules** (all module files)
    - Detailed technical docs
    - **Time**: 4 hours total

### Step 2.3: Translation Quality Checks

**For each translated file:**

- [ ] All user-facing text translated
- [ ] Technical terms consistent with Glossary
- [ ] Code blocks preserved (not translated)
- [ ] Table structures maintained
- [ ] Links updated to `/docs/ru/`
- [ ] Markdown formatting preserved
- [ ] No broken references

---

## Phase 3: Create Module Documentation

### Step 3.1: Template for Module Docs

Use this template for each module:

```markdown
# [Module Name]

## Purpose

[What this module does]

## Data Scope

[Database tables, data structures]

## Lifecycle / FSM

[State machine diagram and transitions]

## Business Rules

[Critical rules and constraints]

## Role Interactions

[Who can do what]

## Code References

[Key files and functions]

## Examples

[Workflow examples]

## Edge Cases

[Known edge cases and handling]
```

### Step 3.2: Module Documentation Checklist

For each module, ensure:

- [ ] Purpose clearly stated
- [ ] Data scope documented
- [ ] FSM diagram included
- [ ] Business rules explicit
- [ ] Role permissions clear
- [ ] Code references provided
- [ ] Examples included
- [ ] Edge cases covered

---

## Phase 4: Final Polish

### Step 4.1: Cross-Reference Check

- [ ] All internal links work
- [ ] Navigation structure consistent
- [ ] Cross-references accurate
- [ ] No broken links

### Step 4.2: Consistency Check

- [ ] Terminology consistent across all docs
- [ ] Status names match codebase
- [ ] Role names consistent
- [ ] Examples match implementation

### Step 4.3: Completeness Check

- [ ] All 11 sections present (EN)
- [ ] All 11 sections present (RU)
- [ ] All modules documented
- [ ] Glossary complete
- [ ] Navigation complete

---

## Estimated Timeline

| Phase | Tasks | Estimated Time |
|-------|-------|----------------|
| Phase 1 | English module docs | 3-4 hours |
| Phase 2 | Russian translations | 4-6 hours |
| Phase 3 | Module documentation | 3-4 hours |
| Phase 4 | Final polish | 1-2 hours |
| **Total** | | **11-16 hours** |

---

## Quick Start Commands

### Create Module Doc Template

```bash
cd docs-site/en/modules
touch batch-lifecycle.md pool-requests.md matching-windows.md pool-matching.md execution.md
```

### Create Russian Translation Structure

```bash
cd docs-site/ru
mkdir -p introduction roles farmer-guide mpk-guide admin-guide modules business-logic fsm security limitations glossary
```

### Verify File Structure

```bash
find docs-site -name "*.md" | wc -l  # Count markdown files
tree docs-site -I node_modules  # View structure (if tree installed)
```

---

## Next Steps

1. Start with Phase 1 (English modules)
2. Then Phase 2 (Russian translations)
3. Finally Phase 4 (Polish and QA)

See `HOSTING_SETUP.md` for deployment instructions.

