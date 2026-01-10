# TURAN Standard Pool - File Structure & Critical Files

**Document Version:** 1.0
**Last Updated:** 2026-01-09
**Total Files:** 263 TypeScript/TSX files
**Total Lines:** 60,319+

---

## Table of Contents

1. [Directory Overview](#directory-overview)
2. [Critical Files Reference](#critical-files-reference)
3. [Module-by-Module Breakdown](#module-by-module-breakdown)
4. [Naming Conventions](#naming-conventions)
5. [File Organization Patterns](#file-organization-patterns)

---

## Directory Overview

```
turankz/
├── .claude/                      # Development documentation (NEW - Sprint 6)
│   ├── INDEX.md                  # Master index with quick navigation
│   ├── ARCHITECTURE.md           # System architecture deep dive
│   ├── ROADMAP.md               # Sprint-based development plan
│   └── FILE_STRUCTURE.md        # This file
│
├── src/                         # Source code (263 TS/TSX files)
│   ├── components/              # React components (22 feature folders)
│   ├── pages/                   # Page components (39 pages)
│   ├── hooks/                   # Custom React hooks (38+)
│   ├── lib/                     # Business logic (28 modules)
│   ├── contexts/                # React Context providers
│   ├── integrations/            # External integrations (Supabase)
│   ├── i18n/                    # Internationalization
│   ├── App.tsx                  # Main application router
│   ├── main.tsx                 # React entry point
│   └── index.css                # Global styles
│
├── docs/                        # Developer documentation (65+ MD files)
│   ├── fsm/                     # FSM documentation
│   ├── modules/                 # Module documentation (NEW - Sprint 5)
│   ├── components/              # Component documentation
│   ├── admin/                   # Admin guides
│   └── ... (60+ more files)
│
├── docs-site/                   # VitePress documentation site
│   ├── .vitepress/              # VitePress config
│   ├── en/                      # English documentation
│   ├── ru/                      # Russian documentation
│   ├── admin-guide/             # Admin operations
│   ├── farmer-guide/            # Farmer workflows
│   ├── mpk-guide/               # MPK workflows
│   └── ... (more guides)
│
├── supabase/                    # Database & backend
│   ├── config.toml              # Supabase configuration
│   └── migrations/              # SQL migrations (45+)
│
├── public/                      # Static assets
├── scripts/                     # Build & deployment scripts
├── vite.config.ts               # Vite build configuration
├── tailwind.config.ts           # Tailwind CSS configuration
├── tsconfig.json                # TypeScript configuration
├── package.json                 # NPM dependencies
├── vercel.json                  # Vercel deployment config
└── netlify.toml                 # Netlify deployment config
```

---

## Critical Files Reference

### Entry Points & Configuration

| File | Lines | Purpose | Importance |
|------|-------|---------|------------|
| **src/main.tsx** | 35 | React app initialization, providers setup | 🔴 CRITICAL |
| **src/App.tsx** | 255 | Main router with 39+ routes, protected routes | 🔴 CRITICAL |
| **src/index.css** | ~300 | Global styles, Tailwind base, custom CSS variables | 🟡 HIGH |
| **vite.config.ts** | 45 | Build configuration, plugins, aliases | 🟡 HIGH |
| **tailwind.config.ts** | 125 | Theme configuration, design tokens | 🟡 HIGH |
| **tsconfig.json** | 45 | TypeScript compiler options | 🟡 HIGH |

---

### Core Business Logic (src/lib/)

#### Finite State Machines

| File | Lines | Purpose | Sprint Updated |
|------|-------|---------|----------------|
| **batch-lifecycle.ts** | 450 | Batch FSM (6 states), transition rules, validation | Sprint 5 (refactored from 627) |
| **pool-request-lifecycle.ts** | 380 | Pool request FSM, fill rate calculation | Sprint 5 (refactored) |
| **matching-lifecycle.ts** | 180 | Matching window FSM, temporal constraints | Sprint 5 (refactored) |
| **execution-lifecycle.ts** | 220 | Execution FSM (6 states), delivery tracking | Original |

**Key Changes (Sprint 5):**
- ✅ Unified TRANSITION_RULES pattern across all FSMs
- ✅ Role-based permissions embedded in rules
- ✅ ~177 lines of duplicate code eliminated

---

#### Matching & Validation

| File | Lines | Purpose | Sprint Updated |
|------|-------|---------|----------------|
| **matching-validation.ts** | 550 | Match confidence scoring, delivery period validation | Sprint 6 (uses delivery-periods) |
| **livestock-criteria.ts** | 420 | Livestock criteria matching, breed/grade validation | Original |
| **batch-window-eligibility.ts** | 280 | Batch eligibility for matching windows | Original |

**Key Functions:**
- `calculateMatchConfidence()` - Weighted scoring (0-100)
- `validateDeliveryPeriodOverlap()` - Period compatibility check
- `checkBatchMatch()` - Legacy match level (full/partial/none)

---

#### Access Control & Security

| File | Lines | Purpose | Importance |
|------|-------|---------|------------|
| **access-control.ts** | 380 | RBAC logic, role permissions, action validation | 🔴 CRITICAL |
| **automatic-status-transitions.ts** | 220 | Auto-status updates based on conditions | 🟡 HIGH |
| **system-guardrails.ts** | 180 | Safety constraints, validation rules | 🟡 HIGH |

---

#### Centralized Utilities (NEW - Sprint 5)

| File | Lines | Purpose | Sprint Created |
|------|-------|---------|----------------|
| **fsm-validator.ts** | 229 | Generic FSM validation, eliminates duplication | Sprint 5 ✨ |
| **delivery-periods.ts** | 309 | Centralized delivery period logic | Sprint 5 ✨ |
| **matching-window.ts** | 380 | Matching window logic, temporal constraints | Original (updated Sprint 6) |

**Impact:**
- ✅ Single source of truth for FSM validation
- ✅ Consistent delivery period handling
- ✅ Eliminated ~50+ lines of duplicate code

---

#### Premium & Settlement

| File | Lines | Purpose | Sprint Status |
|------|-------|---------|---------------|
| **premium-eligibility.ts** | 420 | Premium calculation, eligibility evaluation | ⏳ To be refactored (Sprint 9-10) |
| **standard-status.ts** | 350 | TURAN grading system, status determination | Original |
| **settlement-export.ts** | 180 | Settlement calculations, export formatting | Original |
| **offtake-export.ts** | 140 | Offtake registry export for compliance | Original |

---

### Custom React Hooks (src/hooks/)

#### Data Fetching Hooks

| File | Lines | Purpose | Key Features |
|------|-------|---------|--------------|
| **useBatches.ts** | 280 | Batch CRUD operations | Query + mutations |
| **usePoolRequests.ts** | 320 | Pool request operations | Fill rate tracking |
| **useMatchings.ts** | 250 | Pool matches operations | Real-time updates (polling) |
| **useExecutions.ts** | 220 | Execution tracking | Delivery status updates |
| **useConfirmedBatches.ts** | 180 | Confirmed batches query | Calculated fields (available_heads) |

---

#### Business Logic Hooks (NEW - Sprint 5)

| File | Lines | Purpose | Sprint Created |
|------|-------|---------|----------------|
| **useStatusBadgeStyle.ts** | 367 | Centralized status badge styling (26 statuses) | Sprint 5 ✨ |
| **usePremiumEligibility.ts** | 180 | Premium eligibility hook | Original |
| **useMatchingWindows.ts** | 220 | Matching window management | Original |

---

#### Admin Hooks

| File | Lines | Purpose |
|------|-------|---------|
| **useAdminBatches.ts** | 320 | Batch approval, bulk updates, standard status |
| **useAdminUsers.ts** | 280 | User approval, role management |
| **useActivityLog.ts** | 150 | Activity log queries, filtering |

---

### React Components

#### UI Components (src/components/ui/)

**58 shadcn-ui components** (Radix UI + Tailwind)

**Most Used:**
- Button, Badge, Card, Dialog, Select, Table
- Form components (Input, Textarea, Checkbox, Radio)
- Feedback (Alert, Toast, Tooltip)
- Navigation (Tabs, Accordion)

**Custom Enhancements:**
- **StatusBadge.tsx** (210 lines) - Unified status display (Sprint 5 refactored)
- **PageHeader.tsx** - Consistent page headers with breadcrumbs
- **LoadingSpinner.tsx** - Loading states

---

#### Feature Components

##### Admin Components (src/components/admin/)

**28+ components, 4,500+ lines**

**Key Files:**

| File | Lines | Purpose | Sprint Status |
|------|-------|---------|---------------|
| **PoolMatching.tsx** (page) | 400 | Main matching workspace (refactored Sprint 3-4) | ✅ Improved |
| **CreateMatchingDialog.tsx** | 380 | Batch-to-request matching dialog | ✅ Enhanced Sprint 6 |
| **FarmersManagement.tsx** | 320 | Farmer approval, management | Original |
| **ExecutionManagement.tsx** | 350 | Execution tracking, settlement | Original |

**Pool Matching Sub-components** (src/components/admin/pool-matching/)
- **SupplyBlockList.tsx** (200 lines) - Batch list with match confidence (✅ Sprint 6)
- **PoolRequestsList.tsx** (180 lines) - Pool request cards
- **MatchingSummaryPanel.tsx** (150 lines) - Match summary
- **SupplyFilterControls.tsx** (120 lines) - Filtering UI

---

##### Farmer Components (src/components/farmer/)

**12 components, 2,800+ lines**

**Key Files:**
- **NewBatchDialog.tsx** (450 lines) - Batch creation form (✅ Sprint 1-2 enhanced)
- **BatchCard.tsx** (180 lines) - Batch display card
- **MarketIntentForm.tsx** (220 lines) - Market availability signals
- **HerdStructureForm.tsx** (250 lines) - Herd inventory form

---

##### MPK Components (src/components/mpk/)

**10 components, 2,200+ lines**

**Key Files:**
- **NewRequestDialog.tsx** (420 lines) - Pool request creation (✅ Sprint 3-4 enhanced)
- **MatchingWindowStatusBanner.tsx** (180 lines) - Window countdown
- **FillRateIndicator.tsx** (150 lines) - Multi-variant fill rate display (✅ Sprint 3-4)

---

##### Matching Components (src/components/matching/) - NEW Sprint 6

| File | Lines | Purpose | Sprint Created |
|------|-------|---------|----------------|
| **MatchConfidenceIndicator.tsx** | 235 | Match confidence display (4 variants) | Sprint 6 ✨ |
| **MatchConfidenceBreakdown.tsx** | (included above) | Detailed scoring breakdown | Sprint 6 ✨ |

**Variants:**
1. **badge** - Compact table display (tooltip with details)
2. **score** - Dashboard summary (icon + score + label)
3. **card** - Full card with explanation (EN + RU)
4. **inline** - Inline text with icon

---

##### Shared Components (src/components/shared/)

| File | Lines | Purpose | Notes |
|------|-------|---------|-------|
| **DeliveryPeriodSelect.tsx** | 165 | Delivery period picker | Uses MONTHS (not weeks) |
| **LivestockCriteriaForm.tsx** | 280 | Livestock criteria input | Reusable form |
| **BreedSelect.tsx** | 120 | Breed dropdown | Hardcoded breeds |
| **GenderSelect.tsx** | 80 | Gender dropdown | Male/Female/Mixed |

---

### Pages (src/pages/)

#### Farmer Pages (9 pages)

| File | Lines | Route | Purpose |
|------|-------|-------|---------|
| **FarmerProfile.tsx** | 320 | /farmer/profile | Profile management |
| **LivestockBatches.tsx** | 380 | /farmer/batches | Batch list (✅ Sprint 1-2) |
| **BatchDetail.tsx** | 420 | /farmer/batches/:id | Batch detail view |
| **MarketIntent.tsx** | 280 | /farmer/market-intent | Market signals |
| **HerdStructure.tsx** | 250 | /farmer/herd-structure | Inventory tracking |
| **SalesCalendar.tsx** | 220 | /farmer/calendar | Delivery planning |
| **Watchlist.tsx** | 180 | /farmer/watchlist | Pool request watchlist |
| **Deliveries.tsx** | 280 | /farmer/deliveries | Execution tracking |
| **FarmerOverview.tsx** | 320 | /farmer/overview | Dashboard |

**Total:** ~2,650 lines

---

#### MPK Pages (6 pages)

| File | Lines | Route | Purpose |
|------|-------|-------|---------|
| **MarketOverview.tsx** | 350 | /mpk/market | Aggregated market data |
| **PurchasePoolRequests.tsx** | 420 | /mpk/requests | Pool request list (✅ Sprint 3-4) |
| **PoolRequestDetail.tsx** | 380 | /mpk/requests/:id | Request detail |
| **MpkWatchlist.tsx** | 180 | /mpk/watchlist | Batch watchlist |
| **MpkDeliveries.tsx** | 280 | /mpk/deliveries | Incoming deliveries |
| **MpkProfile.tsx** | 320 | /mpk/profile | Profile management |

**Total:** ~1,930 lines

---

#### Admin Pages (14+ pages)

| File | Lines | Route | Purpose | Sprint Status |
|------|-------|-------|---------|---------------|
| **PoolMatching.tsx** | 400 | /admin/pool-matching | Matching workspace | ✅ Refactored Sprint 3-4 |
| **FarmersManagement.tsx** | 380 | /admin/farmers | Farmer approval | Original |
| **MpkManagement.tsx** | 350 | /admin/mpks | MPK approval | Original |
| **ExecutionManagement.tsx** | 420 | /admin/executions | Execution tracking | Original |
| **SettlementManagement.tsx** | 320 | /admin/settlements | Financial settlements | Original |
| **ActivityAuditLog.tsx** | 280 | /admin/activity-log | Full audit trail | Original |
| **MatchingWindows.tsx** | 350 | /admin/matching-windows | Window management | Original |
| **PriceGridManagement.tsx** | 320 | /admin/price-grid | Price reference | Original |
| **GradingStatus.tsx** | 280 | /admin/grading | TURAN standard oversight | Original |
| **OfftakeRegistry.tsx** | 220 | /admin/offtake | Compliance export | Original |
| **NationalHerdOverview.tsx** | 280 | /admin/national-herd | Aggregated herd data | Original |
| **MarketIntentOverview.tsx** | 250 | /admin/market-intent | Aggregated intent signals | Original |
| **AdminDashboard.tsx** | 380 | /admin/dashboard | Admin overview | Original |
| **AdminProfile.tsx** | 220 | /admin/profile | Admin account | Original |

**Total:** ~4,650 lines

---

#### Auth Pages (4 pages)

| File | Lines | Route | Purpose |
|------|-------|-------|---------|
| **Login.tsx** | 220 | /auth/login | Login form |
| **Registration.tsx** | 320 | /auth/register | User registration (role selection) |
| **ForgotPassword.tsx** | 180 | /auth/forgot-password | Password reset |
| **VerifyEmail.tsx** | 150 | /auth/verify | Email verification |

---

### Database & Backend

#### Supabase Integration

| File | Lines | Purpose |
|------|-------|---------|
| **src/integrations/supabase/client.ts** | 45 | Supabase client initialization |
| **src/integrations/supabase/types.ts** | 58,000+ | Auto-generated types from database schema |

**Note:** The types.ts file is MASSIVE due to comprehensive type generation from all database tables, views, functions, and enums.

---

#### Database Migrations (supabase/migrations/)

**45+ migration files** managing:
- Table creation (batches, pool_requests, matchings, executions, etc.)
- Enum types (batch_lifecycle_status, pool_request_status, etc.)
- Row-Level Security policies
- Database functions and triggers
- Indexes for performance
- Audit logging setup

**Key Migrations:**
- `001_initial_schema.sql` - Core tables
- `015_batch_lifecycle_fsm.sql` - FSM enums and constraints
- `028_pool_matching_tables.sql` - Matching infrastructure
- `042_audit_logging.sql` - Activity log setup

---

### Documentation

#### Developer Docs (docs/)

**65+ markdown files, ~150K+ lines**

**Key Categories:**

| Category | Files | Purpose |
|----------|-------|---------|
| **fsm/** | 5 | FSM documentation (Batch, Pool, Matching, Execution) |
| **modules/** | 8 | Module documentation (NEW - Sprint 5: FSM Validator, Status Badges, Delivery Periods, Match Confidence) |
| **components/** | 12 | Component usage guides |
| **admin/** | 8 | Admin operation guides |
| **security/** | 5 | Security best practices, RLS policies |
| **Root docs** | 27+ | Architecture, access control, production readiness |

**Most Important Docs:**
- **ACCESS_CONTROL.md** (6.6K lines) - Complete RBAC specification
- **PRODUCTION_READINESS_REPORT.md** (18K lines) - Production assessment
- **COMPREHENSIVE_SYSTEM_AUDIT.md** (15K lines) - Security audit
- **PLATFORM_VALIDATION.md** - E2E validation

---

#### VitePress Documentation Site (docs-site/)

**Multi-language documentation site** (EN/RU)

**Structure:**
```
docs-site/
├── en/                  # English documentation
│   ├── guide/           # Getting started
│   ├── api/             # API reference
│   └── examples/        # Code examples
├── ru/                  # Russian documentation
│   ├── guide/
│   ├── api/
│   └── examples/
├── admin-guide/         # Admin operations (bilingual)
├── farmer-guide/        # Farmer workflows (bilingual)
└── mpk-guide/           # MPK workflows (bilingual)
```

---

## Module-by-Module Breakdown

### Module 1: Batch Management

**Core Files:**
- `src/lib/batch-lifecycle.ts` (450 lines) - FSM logic
- `src/hooks/useBatches.ts` (280 lines) - Data operations
- `src/components/farmer/NewBatchDialog.tsx` (450 lines) - Creation form
- `src/pages/farmer/LivestockBatches.tsx` (380 lines) - List view
- `src/pages/farmer/BatchDetail.tsx` (420 lines) - Detail view

**Total:** ~1,980 lines

**Sprint Status:** ✅ Enhanced (Sprint 1-2)

---

### Module 2: Pool Requests & Matching

**Core Files:**
- `src/lib/pool-request-lifecycle.ts` (380 lines) - FSM logic
- `src/lib/matching-validation.ts` (550 lines) - Matching algorithms
- `src/hooks/usePoolRequests.ts` (320 lines) - Data operations
- `src/components/mpk/NewRequestDialog.tsx` (420 lines) - Creation form
- `src/pages/admin/PoolMatching.tsx` (400 lines) - Admin workspace
- `src/components/admin/pool-matching/` (650+ lines) - Sub-components

**Total:** ~2,720 lines

**Sprint Status:** ✅ Enhanced (Sprint 3-4), ✅ Match confidence added (Sprint 6)

---

### Module 3: Matching Windows

**Core Files:**
- `src/lib/matching-window.ts` (380 lines) - Window logic
- `src/lib/matching-lifecycle.ts` (180 lines) - FSM
- `src/hooks/useMatchingWindows.ts` (220 lines) - Data operations
- `src/pages/admin/MatchingWindows.tsx` (350 lines) - Admin management

**Total:** ~1,130 lines

**Sprint Status:** ⏳ To be enhanced (Sprint 7-8)

---

### Module 4: Execution & Settlement

**Core Files:**
- `src/lib/execution-lifecycle.ts` (220 lines) - FSM
- `src/lib/settlement-export.ts` (180 lines) - Calculations
- `src/hooks/useExecutions.ts` (220 lines) - Data operations
- `src/pages/admin/ExecutionManagement.tsx` (420 lines) - Admin view
- `src/pages/farmer/Deliveries.tsx` (280 lines) - Farmer view

**Total:** ~1,320 lines

**Sprint Status:** ⏳ To be enhanced (Sprint 7-8)

---

### Module 5: Premium & Grading

**Core Files:**
- `src/lib/premium-eligibility.ts` (420 lines) - Evaluation logic
- `src/lib/standard-status.ts` (350 lines) - TURAN grading
- `src/hooks/usePremiumEligibility.ts` (180 lines) - Hook
- `src/components/premium/PremiumBadge.tsx` (120 lines) - Display

**Total:** ~1,070 lines

**Sprint Status:** ⏳ To be refactored (Sprint 9-10)

---

### Module 6: Access Control & Security

**Core Files:**
- `src/lib/access-control.ts` (380 lines) - RBAC logic
- `src/contexts/AuthContext.tsx` (220 lines) - Auth state
- `src/hooks/useAuth.ts` (180 lines) - Auth hook
- `supabase/migrations/*_rls_policies.sql` - RLS policies

**Total:** ~780 lines (app code) + SQL policies

**Sprint Status:** ✅ Production-ready

---

### Module 9: Platform Consistency (NEW - Sprint 5)

**Core Files:**
- `src/lib/fsm-validator.ts` (229 lines) - Generic FSM validation
- `src/lib/delivery-periods.ts` (309 lines) - Delivery period logic
- `src/hooks/useStatusBadgeStyle.ts` (367 lines) - Status badge styling
- `src/components/matching/MatchConfidenceIndicator.tsx` (235 lines) - Match confidence display

**Total:** ~1,140 lines

**Sprint Status:** ✅ Completed (Sprint 5-6)

---

## Naming Conventions

### Files

**Components:**
- PascalCase with descriptive names
- Example: `NewBatchDialog.tsx`, `MatchConfidenceIndicator.tsx`

**Hooks:**
- camelCase starting with "use"
- Example: `useBatches.ts`, `useStatusBadgeStyle.ts`

**Utilities/Libraries:**
- kebab-case descriptive names
- Example: `batch-lifecycle.ts`, `delivery-periods.ts`

**Pages:**
- PascalCase, often noun or noun phrase
- Example: `LivestockBatches.tsx`, `PoolMatching.tsx`

---

### Variables & Functions

**React Components:**
```typescript
export function ComponentName() { }  // PascalCase
```

**Hooks:**
```typescript
export function useHookName() { }  // camelCase with "use" prefix
```

**Utility Functions:**
```typescript
export function functionName() { }  // camelCase
```

**Constants:**
```typescript
export const CONSTANT_NAME = ...;  // UPPER_SNAKE_CASE
```

**Types/Interfaces:**
```typescript
export interface TypeName { }  // PascalCase
export type TypeName = ...;     // PascalCase
```

---

### Database Tables

**Naming:** snake_case, plural nouns
- `batches`, `pool_matches`, `purchase_pool_requests`
- `activity_log`, `admin_overrides`, `change_tracking`

**Foreign Keys:** `{table}_id`
- `farmer_id`, `batch_id`, `mpk_id`

**Enum Types:** snake_case with `_type` or `_status` suffix
- `batch_lifecycle_status`, `delivery_period_type`

---

## File Organization Patterns

### Component Organization

**Pattern 1: Feature-based (Admin, Farmer, MPK)**
```
src/components/
├── admin/          # Admin-only components
├── farmer/         # Farmer-only components
├── mpk/            # MPK-only components
├── shared/         # Cross-role components
└── ui/             # Base UI components (shadcn-ui)
```

**Pattern 2: Functional (Matching, Execution, Premium)**
```
src/components/
├── matching/       # Match-related components
├── execution/      # Execution-related components
├── premium/        # Premium-related components
└── pool/           # Pool-related components
```

---

### Hook Organization

**Pattern: By data entity or feature**
```
src/hooks/
├── useBatches.ts           # Batch CRUD
├── usePoolRequests.ts      # Pool request CRUD
├── useMatchings.ts         # Matching CRUD
├── useAuth.ts              # Authentication
├── useStatusBadgeStyle.ts  # UI utility hook
└── ...
```

---

### Library Organization

**Pattern: By business domain**
```
src/lib/
├── batch-lifecycle.ts      # Batch FSM
├── pool-request-lifecycle.ts  # Pool FSM
├── matching-validation.ts  # Matching logic
├── premium-eligibility.ts  # Premium calculations
├── fsm-validator.ts        # Generic FSM utility
└── ...
```

---

## File Size Guidelines

### Current File Sizes

**Largest Files:**
1. `src/integrations/supabase/types.ts` - 58,000+ lines (auto-generated)
2. `src/pages/admin/PoolMatching.tsx` - 400 lines (refactored from 1244)
3. `src/lib/batch-lifecycle.ts` - 450 lines (refactored from 627)
4. `src/lib/matching-validation.ts` - 550 lines
5. `src/components/farmer/NewBatchDialog.tsx` - 450 lines

**Target Sizes:**
- Components: <400 lines (break into sub-components if larger)
- Hooks: <300 lines (split by concern if larger)
- Utilities: <500 lines (modularize if larger)
- Pages: <400 lines (extract components if larger)

**Refactoring Candidates:**
- Any file >600 lines should be reviewed for splitting

---

## Quick File Lookup

### "I need to modify..."

**Batch creation flow:**
- Form: `src/components/farmer/NewBatchDialog.tsx`
- FSM: `src/lib/batch-lifecycle.ts`
- Data: `src/hooks/useBatches.ts`

**Pool request matching:**
- Workspace: `src/pages/admin/PoolMatching.tsx`
- Algorithm: `src/lib/matching-validation.ts`
- Confidence: `src/components/matching/MatchConfidenceIndicator.tsx`

**Status badge styling:**
- Hook: `src/hooks/useStatusBadgeStyle.ts`
- Component: `src/components/ui/StatusBadge.tsx`

**Delivery period logic:**
- Utility: `src/lib/delivery-periods.ts`
- Validation: `src/lib/matching-validation.ts` (uses utility)

**FSM validation:**
- Generic: `src/lib/fsm-validator.ts`
- Batch: `src/lib/batch-lifecycle.ts`
- Pool: `src/lib/pool-request-lifecycle.ts`

---

## Conclusion

The TURAN Standard Pool file structure demonstrates **mature software engineering practices**:

✅ **Clear separation of concerns** - Components, hooks, utilities well-organized
✅ **Modular design** - Easy to locate and modify specific functionality
✅ **Consistent naming** - Predictable file and variable names
✅ **Comprehensive documentation** - 65+ MD files alongside code
✅ **Sprint 5-6 improvements** - New centralized utilities, reduced duplication

**Navigation Tips:**
1. Start with [INDEX.md](.claude/INDEX.md) for quick links
2. Check [ARCHITECTURE.md](.claude/ARCHITECTURE.md) for system design
3. Review [ROADMAP.md](.claude/ROADMAP.md) for development plan
4. Use this file for locating specific files and understanding structure

---

**Document Maintained By:** Development Team
**Last Updated:** 2026-01-09
**Next Review:** After major refactoring (Sprint 7-8)
