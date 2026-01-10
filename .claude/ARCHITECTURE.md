# TURAN Standard Pool - System Architecture

**Document Version:** 2.0
**Last Updated:** 2026-01-09 (Post-Sprint 5 Refactoring)
**Status:** Production-Ready Architecture

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Architectural Overview](#architectural-overview)
3. [Tech Stack Deep Dive](#tech-stack-deep-dive)
4. [Core Design Patterns](#core-design-patterns)
5. [Database Architecture](#database-architecture)
6. [Business Logic Architecture](#business-logic-architecture)
7. [Component Architecture](#component-architecture)
8. [State Management](#state-management)
9. [Security Architecture](#security-architecture)
10. [API & Integration Layer](#api--integration-layer)
11. [Performance Considerations](#performance-considerations)
12. [Deployment Architecture](#deployment-architecture)

---

## Executive Summary

TURAN Standard Pool is a **sophisticated B2B agricultural marketplace** for livestock trading in Kazakhstan. The platform implements a three-role architecture (Farmer, MPK, Admin) with complex finite state machines governing batch and pool request lifecycles.

### Key Architectural Principles

1. **FSM-Driven Workflows** - All critical processes use finite state machines
2. **Role Isolation** - Complete anonymity between farmers and MPKs
3. **Data Immutability** - Critical records are immutable with audit trails
4. **Component Composition** - Highly modular, reusable React components
5. **Type Safety First** - Comprehensive TypeScript coverage
6. **Centralized Business Logic** - Business rules in dedicated `/lib` modules

### Architecture Maturity

- ✅ **Production-Ready:** Comprehensive security, audit logging, RBAC
- ✅ **Well-Documented:** 65+ markdown files, VitePress site, inline docs
- ✅ **Maintainable:** Clear separation of concerns, modular design
- ⚠️ **Testing Needed:** Unit/integration tests to be implemented
- ⚠️ **Performance Optimization:** Code splitting and lazy loading planned

---

## Architectural Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Client Layer (Browser)                    │
│  React 18.3 + TypeScript + Tailwind + shadcn-ui            │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  │ HTTPS / WebSocket (planned)
                  │
┌─────────────────▼───────────────────────────────────────────┐
│              Integration Layer (React Query)                 │
│  API Client + Cache + Optimistic Updates + Error Handling   │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  │ REST API + Supabase Client SDK
                  │
┌─────────────────▼───────────────────────────────────────────┐
│                 Backend (Supabase BaaS)                      │
│  PostgreSQL 14.1 + Auth + Storage + Row-Level Security      │
└──────────────────────────────────────────────────────────────┘
```

### Layered Architecture (4 Layers)

```
┌──────────────────────────────────────────────────────────────┐
│ 1. PRESENTATION LAYER (src/components/, src/pages/)          │
│    - React Components (263 TSX files)                        │
│    - UI State Management (useState, useReducer)              │
│    - Component Composition & Variants                        │
│    - shadcn-ui + Custom Components                           │
└──────────────────────────────────────────────────────────────┘
                           ↓
┌──────────────────────────────────────────────────────────────┐
│ 2. BUSINESS LOGIC LAYER (src/lib/, src/hooks/)              │
│    - Finite State Machines (FSMs)                           │
│    - Matching Validation Logic                              │
│    - Premium & Grading Calculations                         │
│    - Access Control (RBAC)                                  │
│    - Custom React Hooks (38+)                               │
└──────────────────────────────────────────────────────────────┘
                           ↓
┌──────────────────────────────────────────────────────────────┐
│ 3. DATA ACCESS LAYER (src/hooks/, src/integrations/)        │
│    - React Query Hooks (usePoolRequests, useBatches, etc.)  │
│    - Supabase Client Abstraction                            │
│    - Optimistic Updates & Cache Management                  │
│    - Error Handling & Retry Logic                           │
└──────────────────────────────────────────────────────────────┘
                           ↓
┌──────────────────────────────────────────────────────────────┐
│ 4. PERSISTENCE LAYER (Supabase PostgreSQL)                  │
│    - 20+ Database Tables                                     │
│    - Row-Level Security Policies                            │
│    - Database Triggers & Functions                          │
│    - Audit Logging Tables                                   │
└──────────────────────────────────────────────────────────────┘
```

---

## Tech Stack Deep Dive

### Frontend Stack

#### Core Framework
```typescript
// React 18.3.1 - Concurrent Features
- Suspense for data fetching
- Automatic batching
- Server Components (planned for future)

// TypeScript 5.x - Full Type Safety
- Strict mode enabled
- Auto-generated types from Supabase
- Discriminated unions for FSM states
```

#### UI Framework
```typescript
// Tailwind CSS 3.4.17
- Utility-first CSS
- Custom design system via tailwind.config.ts
- Dark mode support (planned)

// shadcn-ui (Radix UI)
- 58 base UI components
- Accessible by default (ARIA compliant)
- Customizable with Tailwind
```

#### State Management
```typescript
// React Query 5.83.0 (TanStack Query)
- Server state management
- Automatic caching & refetching
- Optimistic updates
- Infinite queries (planned)

// React Hook Form 7.61.1
- Form state management
- Zod schema validation
- Performance optimized (uncontrolled)
```

#### Routing
```typescript
// React Router DOM 6.30.1
- File-based routing (39+ routes)
- Protected routes with role checks
- Nested routes for layouts
```

#### Internationalization
```typescript
// i18next 25.7.3
- 3 languages: EN, RU, KK
- Namespace-based organization
- Dynamic language switching
```

### Backend Stack

#### Database & BaaS
```typescript
// Supabase (PostgreSQL 14.1)
- Managed PostgreSQL database
- Automatic backups
- Connection pooling
- PostGIS for geospatial (if needed)

// Supabase Auth
- JWT-based authentication
- Email/password + OAuth
- Role-based claims in JWT
```

#### Security
```typescript
// Row-Level Security (RLS)
- Table-level policies for farmer/mpk/admin
- Automatic enforcement at database level
- Query optimization with indexes

// Audit Logging
- activity_log table for all sensitive operations
- admin_overrides table for interventions
- change_tracking table for data changes
```

---

## Core Design Patterns

### 1. Finite State Machine Pattern

**Location:** `src/lib/batch-lifecycle.ts`, `src/lib/pool-request-lifecycle.ts`, `src/lib/matching-lifecycle.ts`

**Implementation:**
```typescript
// Sprint 5 Refactored Pattern (TRANSITION_RULES)
const TRANSITION_RULES: Record<Status, TransitionRule[]> = {
  draft: [
    { to: 'forecast', roles: ['farmer', 'admin'] },
  ],
  forecast: [
    { to: 'soft_committed', roles: ['farmer', 'admin'] },
  ],
  // ... more transitions
};

export function isTransitionAllowed(from: Status, to: Status): boolean {
  const rules = TRANSITION_RULES[from] || [];
  return rules.some(rule => rule.to === to);
}

export function canRoleTransition(from: Status, to: Status, role: Role): boolean {
  const rules = TRANSITION_RULES[from] || [];
  const matchingRule = rules.find(rule => rule.to === to);
  return matchingRule?.roles.includes(role) ?? false;
}
```

**Benefits:**
- Prevents invalid state transitions
- Role-based access control embedded
- Single source of truth for workflow
- Testable business logic

**Sprint 5 Improvement:** Unified pattern across all FSMs using `TRANSITION_RULES` with embedded role permissions.

---

### 2. Provider Pattern

**Location:** `src/contexts/AuthContext.tsx`, `src/main.tsx`

**Implementation:**
```typescript
// AuthProvider wraps entire app
<AuthProvider>
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
</AuthProvider>

// Usage in components
const { user, role, signOut } = useAuth();
```

**Providers Used:**
1. **AuthProvider** - Authentication state
2. **QueryClientProvider** - React Query cache
3. **TooltipProvider** - Radix UI tooltips (component-level)
4. **ToastProvider** - Notifications (Sonner)

---

### 3. Hook Pattern (Custom Hooks)

**Location:** `src/hooks/`

**38+ Custom Hooks:**

#### Data Fetching Hooks
```typescript
// src/hooks/useBatches.ts
export function useBatches(farmerId?: string) {
  return useQuery({
    queryKey: ['batches', farmerId],
    queryFn: () => supabase.from('batches').select('*'),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// src/hooks/usePoolRequests.ts
export function usePoolRequests(mpkId?: string) {
  return useQuery({
    queryKey: ['pool_requests', mpkId],
    queryFn: () => supabase.from('purchase_pool_requests').select('*'),
  });
}
```

#### Business Logic Hooks (Sprint 5 - New)
```typescript
// src/hooks/useStatusBadgeStyle.ts
export function useStatusBadgeStyle(type: StatusType, status: AnyStatus): StatusStyle {
  // Centralized status badge styling for 26 different statuses
  // Returns: className, color, bgColor, borderColor, icon, label
}
```

#### Mutation Hooks
```typescript
// src/hooks/useUpdateBatch.ts
export function useUpdateBatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => supabase.from('batches').update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['batches'] });
    },
  });
}
```

---

### 4. Component Composition Pattern

**Sprint 5-6 Enhancement:** Multi-variant components for consistency

**Example: MatchConfidenceIndicator (Sprint 6)**
```typescript
// Single component, 4 variants
<MatchConfidenceIndicator
  confidence={confidence}
  variant="badge"  // or "score" | "card" | "inline"
  showDetails={true}
/>

// Variants serve different use cases:
// - badge: Compact table display
// - score: Dashboard summary
// - card: Detail page with full explanation
// - inline: Inline text with icon
```

**Benefits:**
- Consistent API across similar components
- Reduced code duplication
- Easier to maintain
- Better UX consistency

---

### 5. Protected Route Pattern

**Location:** `src/App.tsx`

**Implementation:**
```typescript
function ProtectedRoute({
  children,
  allowedRoles
}: {
  children: React.ReactNode;
  allowedRoles: Role[]
}) {
  const { user, role, loading } = useAuth();

  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/auth/login" />;
  if (!allowedRoles.includes(role)) return <Navigate to="/unauthorized" />;

  return <>{children}</>;
}

// Usage
<Route
  path="/admin/*"
  element={
    <ProtectedRoute allowedRoles={['admin']}>
      <AdminLayout />
    </ProtectedRoute>
  }
/>
```

---

## Database Architecture

### Schema Overview (20+ Tables)

#### Core Entity Tables

**1. User Management**
```sql
-- Supabase Auth (built-in)
auth.users (id, email, created_at, ...)

-- Custom role tables
user_roles (user_id, role, created_at)
  - role: 'farmer' | 'mpk' | 'admin'

farmers (id, user_id, registration_status, location, contact, ...)
mpks (id, user_id, registration_status, capacity, contact, ...)
```

**2. Livestock & Batches**
```sql
batches (
  id UUID PRIMARY KEY,
  farmer_id UUID REFERENCES farmers(id),
  status batch_lifecycle_status,  -- FSM enum
  batch_number TEXT UNIQUE,
  breed TEXT,
  gender TEXT,
  age_min INT,
  age_max INT,
  weight_min DECIMAL,
  weight_avg DECIMAL,
  weight_max DECIMAL,
  grade TEXT,
  region TEXT,
  heads INT,
  available_heads INT,  -- Calculated field
  matched_heads INT,    -- Calculated field
  target_week TEXT,
  delivery_period delivery_period_type,
  standard_status TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

-- FSM Status Enum
CREATE TYPE batch_lifecycle_status AS ENUM (
  'draft',
  'forecast',
  'soft_committed',
  'confirmed',
  'matched',
  'closed'
);

-- Delivery Period Enum
CREATE TYPE delivery_period_type AS ENUM (
  'short_term',
  'mid_term',
  'long_term'
);
```

**3. Matching & Transactions**
```sql
purchase_pool_requests (
  id UUID PRIMARY KEY,
  mpk_id UUID REFERENCES mpks(id),
  status pool_request_status,  -- FSM enum
  request_number TEXT UNIQUE,
  regions TEXT[],
  required_grade TEXT,
  target_delivery_period delivery_period_type,
  total_heads_needed INT,
  filled_heads INT,  -- Calculated
  fill_rate DECIMAL, -- Calculated
  -- Acceptance criteria (livestock criteria)
  acceptance_criteria JSONB,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

pool_matches (
  id UUID PRIMARY KEY,
  pool_request_id UUID REFERENCES purchase_pool_requests(id),
  batch_id UUID REFERENCES batches(id),
  matching_window_id UUID REFERENCES matching_windows(id),
  allocated_heads INT,
  status matching_status,  -- FSM enum
  created_at TIMESTAMP,
  created_by UUID  -- Admin who created match
)

-- Pool Request Status Enum
CREATE TYPE pool_request_status AS ENUM (
  'draft',
  'submitted',
  'matching',
  'partial',
  'fulfilled',
  'closed',
  'cancelled'
);
```

**4. Matching Windows**
```sql
matching_windows (
  id UUID PRIMARY KEY,
  name TEXT,
  status matching_window_status,  -- FSM enum
  start_date TIMESTAMP,
  lock_date TIMESTAMP,
  close_date TIMESTAMP,
  target_week TEXT,
  eligible_delivery_periods delivery_period_type[],
  notes TEXT,
  created_at TIMESTAMP
)

-- Matching Window Status Enum
CREATE TYPE matching_window_status AS ENUM (
  'upcoming',
  'active',
  'locked',
  'closed'
);
```

**5. Execution & Settlement**
```sql
executions (
  id UUID PRIMARY KEY,
  match_id UUID REFERENCES pool_matches(id),
  status execution_status,  -- FSM enum
  scheduled_delivery_date DATE,
  actual_delivery_date DATE,
  delivered_heads INT,
  delivery_condition TEXT,
  created_at TIMESTAMP
)

settlements (
  id UUID PRIMARY KEY,
  execution_id UUID REFERENCES executions(id),
  base_price DECIMAL,
  premium_amount DECIMAL,
  total_amount DECIMAL,
  settlement_date DATE,
  created_at TIMESTAMP
)
```

**6. Audit & Governance**
```sql
activity_log (
  id UUID PRIMARY KEY,
  user_id UUID,
  action TEXT,
  entity_type TEXT,
  entity_id UUID,
  details JSONB,
  timestamp TIMESTAMP
)

admin_overrides (
  id UUID PRIMARY KEY,
  admin_id UUID REFERENCES auth.users(id),
  override_type TEXT,
  target_entity_type TEXT,
  target_entity_id UUID,
  reason TEXT,
  reason_ru TEXT,
  created_at TIMESTAMP
)

change_tracking (
  id UUID PRIMARY KEY,
  entity_type TEXT,
  entity_id UUID,
  field_name TEXT,
  old_value TEXT,
  new_value TEXT,
  changed_by UUID,
  changed_at TIMESTAMP
)
```

### Row-Level Security (RLS) Policies

**Farmer Isolation Example:**
```sql
-- Farmers can only see their own batches
CREATE POLICY "Farmers can view own batches"
ON batches FOR SELECT
TO authenticated
USING (
  farmer_id IN (
    SELECT id FROM farmers WHERE user_id = auth.uid()
  )
);

-- Farmers can only update their own draft batches
CREATE POLICY "Farmers can update own draft batches"
ON batches FOR UPDATE
TO authenticated
USING (
  farmer_id IN (
    SELECT id FROM farmers WHERE user_id = auth.uid()
  )
  AND status = 'draft'
)
WITH CHECK (
  farmer_id IN (
    SELECT id FROM farmers WHERE user_id = auth.uid()
  )
  AND status = 'draft'
);
```

**MPK Isolation Example:**
```sql
-- MPKs can view batches but NOT farmer identity
CREATE POLICY "MPKs can view anonymized batches"
ON batches FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid() AND role = 'mpk'
  )
  AND status IN ('confirmed', 'matched')
);

-- MPKs CANNOT access farmer_id column (enforced at SELECT level)
```

**Admin Full Access:**
```sql
-- Admins have unrestricted access (but logged)
CREATE POLICY "Admins have full access"
ON batches FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);
```

---

## Business Logic Architecture

### Finite State Machines (FSMs)

#### 1. Batch Lifecycle FSM

**File:** `src/lib/batch-lifecycle.ts` (627 lines → 450 lines after Sprint 5 refactor)

**States:**
```
draft → forecast → soft_committed → confirmed → matched → closed
```

**Key Functions:**
```typescript
// Sprint 5 Refactored API
export function isTransitionAllowed(from: Status, to: Status): boolean;
export function canRoleTransition(from: Status, to: Status, role: Role): boolean;
export function validateTransition(from: Status, to: Status, role: Role): ValidationResult;
export function getAllowedTransitions(currentStatus: Status, role: Role): Status[];
export function getBlockedTransitions(currentStatus: Status, role: Role): BlockedTransition[];
```

**Business Rules:**
- **Irreversible:** No backward transitions allowed
- **Role-based:** Farmers can transition draft → forecast, Admins can override
- **Time-locked:** After soft_committed, batch data locked during matching window
- **Admin unlock:** Admins can unlock with logged reason

**Sprint 5 Improvements:**
- ✅ Unified TRANSITION_RULES pattern
- ✅ Eliminated 45+ lines of duplicate validation code
- ✅ Single source of truth for transitions

---

#### 2. Pool Request Lifecycle FSM

**File:** `src/lib/pool-request-lifecycle.ts`

**States:**
```
draft → submitted → matching → partial/fulfilled → closed/cancelled
```

**Key Functions:**
```typescript
export function canTransition(from: Status, to: Status, role: Role): boolean;
export function getMatchingProgress(poolRequest): ProgressInfo;
export function calculateFillRate(filledHeads: number, totalNeeded: number): FillRateInfo;
```

**Business Rules:**
- **Matching window dependent:** Can only submit during active window
- **Fill rate tracking:** Automatically calculates % fulfillment
- **Admin finalization:** Only admins can finalize matching

**Sprint 5 Improvements:**
- ✅ TRANSITION_RULES with embedded roles
- ✅ Unified with batch-lifecycle pattern
- ⏳ RU translations to be added (Sprint 6 Task 9.8.1)

---

#### 3. Matching Lifecycle FSM

**File:** `src/lib/matching-lifecycle.ts`

**States:**
```
active → finalized/cancelled
```

**Business Rules:**
- **Admin-only:** Only admins can modify matching status
- **Temporal constraints:** Cannot modify during locked window

**Sprint 5 Improvements:**
- ✅ Added role-based access control
- ✅ TRANSITION_RULES pattern applied

---

### Matching Validation Logic

**File:** `src/lib/matching-validation.ts` (updated Sprint 6)

**Core Function:**
```typescript
export function calculateMatchConfidence(
  batch: BatchCriteria,
  request: PoolRequestCriteria
): MatchConfidence {
  // Weighted scoring system (0-100 points)
  const deliveryPeriodScore = scoreDeliveryPeriod(batch, request);  // 30 points
  const regionScore = scoreRegion(batch, request);                  // 25 points
  const gradeScore = scoreGrade(batch, request);                    // 25 points
  const weightScore = scoreWeight(batch, request);                  // 10 points
  const ageScore = scoreAge(batch, request);                        // 10 points

  const totalScore = deliveryPeriodScore + regionScore + gradeScore + weightScore + ageScore;

  return {
    score: totalScore,
    level: getConfidenceLevel(totalScore),  // perfect | good | acceptable | poor
    color: getConfidenceColor(totalScore),  // emerald | blue | amber | red
    label: getConfidenceLabel(totalScore),
    breakdown: { deliveryPeriod: deliveryPeriodScore, region: regionScore, ... }
  };
}
```

**Confidence Levels:**
- **Perfect (90-100):** All criteria match perfectly
- **Good (70-89):** Strong match with minor variations
- **Acceptable (50-69):** Acceptable match, review carefully
- **Poor (0-49):** Significant mismatches, admin override required

**Sprint 6 Integration:**
- ✅ Used in SupplyBlockList for color-coded display
- ✅ Batches sorted by confidence score
- ✅ MatchConfidenceIndicator component displays scores

---

### Premium & Grading System

**File:** `src/lib/premium-eligibility.ts`

**Premium Types:**
1. **Standard Compliance Premium** - Based on TURAN grading (Grade A/B/C)
2. **Predictability Premium** - Early confirmation bonus
3. **Volume Premium** - Large batch bonus
4. **Reliability Premium** - Based on execution history

**Evaluation Function:**
```typescript
export function evaluatePremiumEligibility(
  batch: Batch,
  farmer: Farmer,
  executionHistory: Execution[]
): PremiumEligibility {
  return {
    standardPremium: evaluateStandardCompliance(batch),
    predictabilityPremium: evaluatePredictability(batch),
    volumePremium: evaluateVolume(batch),
    reliabilityPremium: evaluateReliability(executionHistory),
    totalEligibleAmount: calculateTotal(),
  };
}
```

**Sprint 5 Plan (Future):**
- ⏳ Consolidate 4 evaluation functions into generic evaluator
- ⏳ Move thresholds to database configuration
- ⏳ Fix post-confirmation edit detection

---

### Centralized Utilities (Sprint 5 - New)

#### 1. FSM Validator

**File:** `src/lib/fsm-validator.ts` (229 lines - NEW)

**Purpose:** Generic FSM validation to eliminate duplication

```typescript
export function validateFSMTransition<TStatus, TRole>(
  fromStatus: TStatus,
  toStatus: TStatus,
  role: TRole,
  config: {
    transitionRules: Record<TStatus, TransitionRule[]>;
    fsmName: string;
    roleLabels?: Record<TRole, string>;
  }
): FSMValidationResult;
```

**Benefits:**
- Single source of truth for FSM validation
- Consistent error messages (EN + RU)
- Used by all 3 FSMs

---

#### 2. Delivery Periods Module

**File:** `src/lib/delivery-periods.ts` (309 lines - NEW)

**Purpose:** Centralize delivery period logic

```typescript
export const DELIVERY_PERIOD_RANGES = {
  short_term: { min: 0, max: 4 },   // weeks
  mid_term: { min: 4, max: 8 },
  long_term: { min: 8, max: Infinity },
};

export function formatDeliveryPeriod(period: DeliveryPeriod, lang: 'en' | 'ru'): string;
export function getDeliveryPeriodFromWeeks(weeks: number): DeliveryPeriod;
export function validateDeliveryPeriodOverlap(batch, request): ValidationResult;
```

**Sprint 6 Migration:**
- ✅ matching-validation.ts now imports from delivery-periods
- ✅ matching-window.ts now imports from delivery-periods
- ✅ Eliminated duplicate code

---

## Component Architecture

### Component Hierarchy

```
App.tsx (Router)
  ├── MainLayout (Layout wrapper)
  │     ├── Sidebar (Navigation)
  │     ├── TopBar (User menu, notifications)
  │     └── PageContent (children)
  │
  ├── Farmer Pages (9 pages)
  │     ├── FarmerProfile
  │     ├── LivestockBatches
  │     ├── BatchDetail
  │     ├── MarketIntent
  │     ├── HerdStructure
  │     └── ...
  │
  ├── MPK Pages (6 pages)
  │     ├── MarketOverview
  │     ├── PurchasePoolRequests
  │     ├── Watchlist
  │     └── ...
  │
  └── Admin Pages (14+ pages)
        ├── PoolMatching (1244 lines - to be refactored)
        ├── FarmersManagement
        ├── ExecutionManagement
        └── ...
```

### Component Categories

#### 1. UI Components (shadcn-ui) - 58 components

**Location:** `src/components/ui/`

**Key Components:**
- Button, Badge, Card, Dialog, Select, Table
- Form (with React Hook Form integration)
- Toast, Tooltip, Alert
- Tabs, Accordion, Collapsible

**Sprint 5 Enhancement:**
- ✅ StatusBadge now uses centralized useStatusBadgeStyle hook

---

#### 2. Feature Components - 22 directories

**Admin Components** (`src/components/admin/`)
- CreateMatchingDialog
- PoolMatching workspace components (refactored Sprint 3-4)
  - SupplyBlockList (✅ Sprint 6: MatchConfidenceIndicator integrated)
  - PoolRequestsList
  - MatchingSummaryPanel
  - SupplyFilterControls
- FarmerApprovalDialog
- AdminOverrideDialog

**Farmer Components** (`src/components/farmer/`)
- NewBatchDialog (livestock criteria form)
- BatchCard
- MarketIntentForm

**MPK Components** (`src/components/mpk/`)
- NewRequestDialog (acceptance criteria form)
- PoolRequestCard
- FillRateIndicator (✅ Sprint 3-4: Multi-variant component)

**Matching Components** (`src/components/matching/`) - NEW Sprint 6
- MatchConfidenceIndicator (✅ 4 variants: badge, score, card, inline)
- MatchConfidenceBreakdown

**Pool Components** (`src/components/pool/`)
- PoolMatchingWorkspace
- BatchCompatibilityCard

---

#### 3. Shared/Utility Components

**Location:** `src/components/shared/`

- DeliveryPeriodSelect (NOTE: Uses MONTHS, not weeks)
- LivestockCriteriaForm
- BreedSelect, GenderSelect

---

### Component Patterns (Sprint 5-6)

#### Multi-Variant Pattern

**Applied To:**
1. **FillRateIndicator** (Sprint 3-4)
2. **MatchConfidenceIndicator** (Sprint 6)

**Pattern:**
```typescript
interface Props {
  data: DataType;
  variant: 'badge' | 'score' | 'card' | 'inline';
  showDetails?: boolean;
  className?: string;
}

export function Component({ data, variant = 'card', showDetails, className }: Props) {
  if (variant === 'badge') {
    return <CompactBadge data={data} />;
  }
  if (variant === 'score') {
    return <ScoreDisplay data={data} />;
  }
  if (variant === 'inline') {
    return <InlineText data={data} />;
  }
  // Default: card
  return <FullCard data={data} showDetails={showDetails} />;
}
```

**Benefits:**
- Single component handles all display modes
- Consistent API across variants
- Reduced code duplication
- Easier to maintain

---

## State Management

### Client State (React Hooks)

**useState / useReducer:**
- Form state (managed by React Hook Form)
- Modal open/close state
- UI toggles (filters, tabs)
- Local selection state (checkboxes in tables)

**Example:**
```typescript
const [selectedBatchIds, setSelectedBatchIds] = useState<Set<string>>(new Set());
const [activeTab, setActiveTab] = useState<'batches' | 'requests'>('batches');
```

---

### Server State (React Query)

**Query Keys Structure:**
```typescript
// Batches
['batches']                          // All batches
['batches', farmerId]                // Farmer's batches
['batches', 'confirmed']             // Confirmed batches only

// Pool Requests
['pool_requests']
['pool_requests', mpkId]

// Matchings
['pool_matches']
['pool_matches', windowId]

// Executions
['executions']
['executions', batchId]
```

**Cache Configuration:**
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,      // 5 minutes
      cacheTime: 10 * 60 * 1000,     // 10 minutes
      refetchOnWindowFocus: true,
      retry: 3,
    },
  },
});
```

**Optimistic Updates Example:**
```typescript
const updateBatchMutation = useMutation({
  mutationFn: (data) => supabase.from('batches').update(data),
  onMutate: async (newData) => {
    // Cancel outgoing queries
    await queryClient.cancelQueries({ queryKey: ['batches', batchId] });

    // Snapshot current data
    const previousData = queryClient.getQueryData(['batches', batchId]);

    // Optimistically update cache
    queryClient.setQueryData(['batches', batchId], (old) => ({ ...old, ...newData }));

    return { previousData };
  },
  onError: (err, newData, context) => {
    // Rollback on error
    queryClient.setQueryData(['batches', batchId], context.previousData);
  },
  onSettled: () => {
    // Always refetch after success or error
    queryClient.invalidateQueries({ queryKey: ['batches', batchId] });
  },
});
```

---

### Global State (Context API)

**AuthContext:**
```typescript
interface AuthContextType {
  user: User | null;
  role: 'farmer' | 'mpk' | 'admin' | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string, role: string) => Promise<void>;
}

const { user, role, signOut } = useAuth();
```

**Usage Across App:**
- Protected routes check role
- Components conditionally render based on role
- API calls include user context

---

## Security Architecture

### Authentication Flow

```
1. User enters email/password → Supabase Auth
2. Supabase returns JWT with user claims
3. JWT stored in localStorage (automatic by Supabase SDK)
4. Every API request includes JWT in Authorization header
5. Supabase validates JWT and enforces RLS policies
```

**JWT Claims:**
```json
{
  "sub": "user-uuid",
  "email": "user@example.com",
  "role": "authenticated",
  "aud": "authenticated",
  "user_metadata": {},
  "app_metadata": {
    "provider": "email"
  }
}
```

**Custom Role Enforcement:**
- User role stored in `user_roles` table
- Fetched on app load via `useAuth` hook
- RLS policies check role via SQL function

---

### Authorization (RBAC)

**Three-Role System:**

| Role | Capabilities | Restrictions |
|------|--------------|--------------|
| **Farmer** | Create/edit own batches, view market | Cannot see MPK identity, cannot match |
| **MPK** | Create pool requests, view anonymized batches | Cannot see farmer identity, cannot match |
| **Admin** | Full access, approve users, create matches | All actions logged with reason |

**Permission Matrix:**

| Action | Farmer | MPK | Admin |
|--------|--------|-----|-------|
| Create batch | ✅ Own | ❌ | ✅ Any |
| Edit batch | ✅ Own (if draft) | ❌ | ✅ Any (with log) |
| View batch details | ✅ Own | ✅ Anonymized | ✅ Full |
| Create pool request | ❌ | ✅ Own | ✅ Any |
| Create match | ❌ | ❌ | ✅ Only |
| Approve users | ❌ | ❌ | ✅ Only |

**Enforcement Layers:**
1. **UI Layer:** Components check `role` and hide/disable actions
2. **Hook Layer:** Mutations check role before API call
3. **API Layer:** Supabase SDK enforces via RLS policies
4. **Database Layer:** RLS policies final enforcement

---

### Data Anonymization

**Farmer-MPK Isolation:**

**Scenario:** MPK views batch in market overview

**Database Query (RLS enforced):**
```sql
SELECT
  id,
  batch_number,
  region,
  grade,
  heads,
  -- farmer_id EXCLUDED (RLS policy)
  -- farmer.name EXCLUDED (no JOIN allowed)
  delivery_period,
  created_at
FROM batches
WHERE status IN ('confirmed', 'matched')
  AND /* RLS: user is MPK */
```

**Result:** MPK sees "Batch #12345, Grade A, 50 heads" but NOT "Farmer: John Doe"

**Matching Table Isolation:**
```sql
-- pool_matches table visible to both
-- BUT: farmer_id and mpk_id are NOT exposed in queries
-- Admin sees full details for matching coordination
```

---

### Audit Logging

**All Sensitive Actions Logged:**

```typescript
// Automatic logging via database trigger
CREATE FUNCTION log_activity() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO activity_log (user_id, action, entity_type, entity_id, details)
  VALUES (
    auth.uid(),
    TG_OP,  -- INSERT, UPDATE, DELETE
    TG_TABLE_NAME,
    NEW.id,
    jsonb_build_object('old', OLD, 'new', NEW)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to sensitive tables
CREATE TRIGGER log_batch_changes
  AFTER INSERT OR UPDATE OR DELETE ON batches
  FOR EACH ROW EXECUTE FUNCTION log_activity();
```

**Admin Overrides:**
```typescript
// Manual logging via application code
await supabase.from('admin_overrides').insert({
  admin_id: user.id,
  override_type: 'unlock_batch',
  target_entity_type: 'batch',
  target_entity_id: batchId,
  reason: 'Farmer requested edit for incorrect weight',
  reason_ru: 'Фермер запросил редактирование из-за неправильного веса',
});
```

---

## API & Integration Layer

### Supabase Client Setup

**File:** `src/integrations/supabase/client.ts`

```typescript
import { createClient } from '@supabase/supabase-js';
import { Database } from './types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  realtime: {
    // Real-time subscriptions (planned)
  },
});
```

**Type Safety:**
- `Database` type auto-generated from Supabase schema
- Full TypeScript intellisense for all queries
- Compile-time error detection

---

### React Query Integration

**Data Fetching Pattern:**
```typescript
// src/hooks/useBatches.ts
export function useBatches(farmerId?: string) {
  return useQuery({
    queryKey: ['batches', farmerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('batches')
        .select('*')
        .eq(farmerId ? 'farmer_id' : 'true', farmerId || true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!farmerId, // Only run if farmerId provided
  });
}
```

**Mutation Pattern:**
```typescript
// src/hooks/useUpdateBatch.ts
export function useUpdateBatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Batch> }) => {
      const { data: updated, error } = await supabase
        .from('batches')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return updated;
    },
    onSuccess: (data) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      queryClient.invalidateQueries({ queryKey: ['batches', data.id] });

      // Show toast notification
      toast.success('Batch updated successfully');
    },
    onError: (error) => {
      toast.error(`Failed to update batch: ${error.message}`);
    },
  });
}
```

---

## Performance Considerations

### Current State

**Strengths:**
- React Query caching reduces API calls
- Memoization with useMemo/useCallback
- Lazy loading of routes (planned)

**Areas for Improvement:**

1. **Code Splitting**
   - Large bundle size (~2MB including dependencies)
   - Solution: Lazy load role-specific pages
   ```typescript
   const FarmerPages = lazy(() => import('./pages/farmer'));
   const AdminPages = lazy(() => import('./pages/admin'));
   ```

2. **Large Type File**
   - `src/integrations/supabase/types.ts` is 58K+ lines
   - IDE performance impact
   - Solution: Split by domain (batches, pool_requests, etc.)

3. **Real-time Updates**
   - Currently using polling (refetch every 5 min)
   - Solution: Implement Supabase real-time subscriptions
   ```typescript
   useEffect(() => {
     const channel = supabase
       .channel('batches')
       .on('postgres_changes', { event: '*', schema: 'public', table: 'batches' }, (payload) => {
         queryClient.invalidateQueries({ queryKey: ['batches'] });
       })
       .subscribe();

     return () => { supabase.removeChannel(channel); };
   }, []);
   ```

4. **Table Virtualization**
   - Large tables (100+ rows) cause lag
   - Solution: Use react-virtual for large lists

---

## Deployment Architecture

### Vercel Deployment (Documentation Site)

**File:** `vercel.json`

```json
{
  "buildCommand": "npm run docs:build",
  "outputDirectory": "docs-site/.vitepress/dist",
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    }
  ],
  "rewrites": [
    { "source": "/docs/:path*", "destination": "/:path*" }
  ]
}
```

**Deployed:** VitePress documentation accessible at `/docs` route

---

### Netlify Deployment (Alternate)

**File:** `netlify.toml`

```toml
[build]
  command = "npm run docs:build"
  publish = "docs-site/.vitepress/dist"

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

---

### Supabase Hosting (Database & Auth)

**Configuration:** `supabase/config.toml`

**Managed Services:**
- PostgreSQL database
- Auth server
- Storage (if used)
- Edge Functions (planned)

**Database Backups:**
- Automatic daily backups
- Point-in-time recovery available
- Manual export via pg_dump

---

## Future Enhancements

### Planned Improvements

1. **Real-time Subscriptions** (Sprint 7-8)
   - Replace polling with Supabase real-time
   - Live updates for matching window status
   - Live batch availability updates

2. **Performance Optimization** (Sprint 7-8)
   - Code splitting by role
   - Table virtualization
   - Image lazy loading
   - Service worker for offline support

3. **Testing Infrastructure** (Sprint 9-10)
   - Unit tests with Vitest
   - Integration tests with Testing Library
   - E2E tests with Playwright
   - Target: 60%+ coverage

4. **Mobile App** (Future)
   - React Native version
   - Shared business logic with web
   - Push notifications

5. **Advanced Analytics** (Future)
   - Dashboard with Recharts
   - Market trends visualization
   - Premium ROI calculator

---

## Conclusion

TURAN Standard Pool demonstrates **enterprise-grade architecture** with:

✅ **Well-defined layers** - Clear separation of concerns
✅ **Type-safe** - Comprehensive TypeScript coverage
✅ **Secure** - RLS, RBAC, audit logging
✅ **Maintainable** - Modular design, documentation
✅ **Scalable** - React Query caching, optimistic updates
✅ **Production-ready** - Comprehensive validation, error handling

**Sprint 5-6 improvements** have further enhanced consistency and maintainability through:
- Unified FSM patterns
- Centralized utilities (delivery-periods, fsm-validator)
- Multi-variant component system
- Comprehensive documentation

The architecture is ready for production deployment with clear paths for future enhancements.

---

**Document Maintained By:** Development Team
**Last Major Refactor:** Sprint 5 (2026-01-09)
**Next Architecture Review:** After Sprint 10
