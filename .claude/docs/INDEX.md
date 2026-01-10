# TURAN Standard Pool - Documentation Index

Quick reference for Claude Code to navigate project documentation.

## Project Overview

**TURAN Standard Pool (TSP)** - B2B координационная инфраструктура для рынка живого скота Казахстана.

**Stack:** React + TypeScript + Vite + Tailwind + shadcn/ui + Supabase

**Key principle:** TSP is INFRASTRUCTURE, not a marketplace. Does not set prices, guarantee transactions, or act as a party.

---

## Quick Links

### Architecture
- [ACCESS_CONTROL.md](architecture/ACCESS_CONTROL.md) - Role-based permissions (Farmer, MPK, Admin)
- [PLATFORM_VALIDATION.md](architecture/PLATFORM_VALIDATION.md) - Market neutrality validation
- [DATABASE_ENHANCEMENTS.md](architecture/DATABASE_ENHANCEMENTS.md) - Supabase schema, RLS policies
- [COMPREHENSIVE_SYSTEM_AUDIT.md](architecture/COMPREHENSIVE_SYSTEM_AUDIT.md) - Full system audit

### Features
- [POOL_MATCHING_ANALYSIS.md](features/POOL_MATCHING_ANALYSIS.md) - Pool matching algorithm
- [MPK_FLOW_COMPREHENSIVE_ANALYSIS.md](features/MPK_FLOW_COMPREHENSIVE_ANALYSIS.md) - MPK workflow
- [FARMER_FLOW_UX_ANALYSIS.md](features/FARMER_FLOW_UX_ANALYSIS.md) - Farmer UX flow
- [EXECUTION_MANAGEMENT_ANALYSIS.md](features/EXECUTION_MANAGEMENT_ANALYSIS.md) - Execution lifecycle
- [PREMIUM_MANAGEMENT_ANALYSIS.md](features/PREMIUM_MANAGEMENT_ANALYSIS.md) - Premium/incentive system
- [PRICE_GRID_ANALYSIS.md](features/PRICE_GRID_ANALYSIS.md) - Reference price grid
- [NATIONAL_HERD_STRUCTURE_ANALYSIS.md](features/NATIONAL_HERD_STRUCTURE_ANALYSIS.md) - Herd structure

### Feature Modules
- [features/modules/FSM_VALIDATOR.md](features/modules/FSM_VALIDATOR.md) - Batch status FSM
- [features/modules/DELIVERY_PERIODS.md](features/modules/DELIVERY_PERIODS.md) - Delivery period handling
- [features/modules/STATUS_BADGE_STYLING.md](features/modules/STATUS_BADGE_STYLING.md) - Status badge design
- [features/components/MATCH_CONFIDENCE_INDICATOR.md](features/components/MATCH_CONFIDENCE_INDICATOR.md) - Match confidence UI

### Guides
- [ADMIN_HANDBOOK.md](ADMIN_HANDBOOK.md) - Admin user guide
- [MATCHING_WINDOW_BEST_PRACTICES.md](MATCHING_WINDOW_BEST_PRACTICES.md) - Matching window management
- [guides/EXECUTION_DEBUG_GUIDE.md](guides/EXECUTION_DEBUG_GUIDE.md) - Debugging executions
- [guides/LOVABLE_MIGRATION_GUIDE.md](guides/LOVABLE_MIGRATION_GUIDE.md) - Lovable platform integration

### Deployment
- [deployment/DEPLOYMENT_GUIDE.md](deployment/DEPLOYMENT_GUIDE.md) - Full deployment guide
- [deployment/DEPLOYMENT_CHECKLIST.md](deployment/DEPLOYMENT_CHECKLIST.md) - Pre-deploy checklist

### Testing
- [testing/TESTING_PLAN.md](testing/TESTING_PLAN.md) - Testing strategy
- [testing/FULL_SYSTEM_TESTING_PLAN.md](testing/FULL_SYSTEM_TESTING_PLAN.md) - Full test plan
- [testing/FULL_SYSTEM_TESTING_REPORT.md](testing/FULL_SYSTEM_TESTING_REPORT.md) - Test results
- [testing/E2E_TESTING_AND_OPTIMIZATION_REPORT.md](testing/E2E_TESTING_AND_OPTIMIZATION_REPORT.md) - E2E report

---

## Key Directories

```
turankz/
├── src/
│   ├── components/     # UI components (shadcn/ui based)
│   │   └── landing/    # Landing page components
│   ├── pages/          # Route pages
│   ├── hooks/          # React hooks
│   ├── lib/            # Utilities, Supabase client
│   ├── i18n/           # Translations (ru, en, kk)
│   └── types/          # TypeScript types
├── supabase/
│   └── migrations/     # Database migrations
└── .claude/
    └── docs/           # This documentation
```

---

## Roles & Access

| Role | Access Level |
|------|-------------|
| **Farmer** | Batches, calendar, price grid (read), profile |
| **MPK** | Pool requests, watchlist, market overview, executions |
| **Admin** | Full platform access, matching, user management |

---

## Batch Lifecycle

```
Draft → Forecast → SoftCommitted → Confirmed → Matched → Closed
```

---

## i18n Keys Structure

Landing page translations: `landing.*`
- `landing.hero.*` - Hero section
- `landing.systemDefinition.*` - What TSP Is
- `landing.boundaries.*` - What TSP Does NOT Do
- `landing.process.*` - How It Works
- `landing.participants.*` - Participant pathways
- `landing.governance.*` - Governance section
- `landing.footer.*` - Footer

---

## Development Commands

```bash
npm run dev      # Start dev server
npm run build    # Production build
npx tsc --noEmit # TypeScript check
```
