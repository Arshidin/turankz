# TURAN Standard Pool - Development Documentation Index

**Project:** TURAN Standard Pool Platform
**Type:** B2B Agricultural Marketplace (Livestock Trading)
**Status:** Production-Ready | Active Development (Sprint 6)
**Last Updated:** 2026-01-09

---

## 📋 Quick Navigation

### Core Documentation
- **[Project Architecture](./ARCHITECTURE.md)** - Complete system architecture, tech stack, and design patterns
- **[Development Roadmap](./ROADMAP.md)** - Sprint-based development plan with current progress
- **[File Structure](./FILE_STRUCTURE.md)** - Detailed project structure and critical files reference

### Business Logic Documentation
- **[FSM Overview](../docs/fsm/)** - Finite State Machines documentation
  - [Batch Lifecycle FSM](../docs/fsm/BATCH_LIFECYCLE.md)
  - [Pool Request Lifecycle FSM](../docs/fsm/POOL_REQUEST_LIFECYCLE.md)
  - [Matching Lifecycle FSM](../docs/fsm/MATCHING_LIFECYCLE.md)
- **[Access Control](../docs/ACCESS_CONTROL.md)** - Role-Based Access Control (RBAC) specification
- **[Matching Validation](../docs/modules/MATCHING_VALIDATION.md)** - Matching algorithms and validation

### Module Documentation (Sprint 5 - New)
- **[FSM Validator](../docs/modules/FSM_VALIDATOR.md)** - Centralized FSM validation utility
- **[Status Badge Styling](../docs/modules/STATUS_BADGE_STYLING.md)** - Unified status badge system
- **[Delivery Periods](../docs/modules/DELIVERY_PERIODS.md)** - Centralized delivery period logic
- **[Match Confidence Indicator](../docs/components/MATCH_CONFIDENCE_INDICATOR.md)** - Match confidence display component

### Feature Documentation
- **[Premium & Grading](../docs/PREMIUM_SYSTEM.md)** - TURAN grading and premium calculation
- **[Execution Management](../docs/EXECUTION_MANAGEMENT_ANALYSIS.md)** - Order fulfillment tracking
- **[Market Signals](../docs/MARKET_SIGNALS.md)** - Market intent and herd structure

### Production Readiness
- **[Production Readiness Report](../docs/PRODUCTION_READINESS_REPORT.md)** - Comprehensive production assessment (18K+ lines)
- **[System Audit](../docs/COMPREHENSIVE_SYSTEM_AUDIT.md)** - Security and architecture audit (15K lines)
- **[Platform Validation](../docs/PLATFORM_VALIDATION.md)** - End-to-end system validation

### User Guides
- **[Admin Guide](../docs-site/admin-guide/)** - Admin operations and workflows
- **[Farmer Guide](../docs-site/farmer-guide/)** - Farmer workflows and features
- **[MPK Guide](../docs-site/mpk-guide/)** - MPK (Meat Processing Plant) workflows

---

## 🎯 Current Sprint Status

### Sprint 6: High Priority (ACTIVE)

**Completed Tasks:**
- ✅ Task 9.5.2: Integrate MatchConfidenceIndicator in admin matching views
- ✅ Task 9.6.2: Update imports to use delivery-periods module
- ✅ Documentation created: FSM Validator, Status Badge Styling, Delivery Periods, Match Confidence Indicator

**In Progress:**
- 🔄 Task 9.4.1-9.4.3: Create explainer components
- 🔄 Task 9.3.1-9.3.2: Progress API unification

**Next Up:**
- ⏳ Task 9.7.1: ValidationMessageFormatter utility
- ⏳ Task 9.8.1: Add RU labels in pool-request-lifecycle

---

## 📁 Project Structure Overview

```
turankz/
├── src/
│   ├── components/          # React components (22+ feature folders)
│   │   ├── ui/              # shadcn-ui base (58 components)
│   │   ├── admin/           # Admin panel (28+ files)
│   │   ├── farmer/          # Farmer-specific UI
│   │   ├── mpk/             # MPK-specific UI
│   │   ├── pool/            # Pool matching visualization
│   │   ├── batches/         # Batch lifecycle management
│   │   ├── matching/        # Match confidence display (NEW - Sprint 6)
│   │   └── ... (19 more folders)
│   │
│   ├── pages/               # 39+ page components
│   │   ├── farmer/          # 9 farmer pages
│   │   ├── mpk/             # 6 MPK pages
│   │   ├── admin/           # 14+ admin pages
│   │   └── auth/            # 4 auth pages
│   │
│   ├── hooks/               # 38+ custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useStatusBadgeStyle.ts  # NEW - Sprint 5
│   │   └── ... (36 more hooks)
│   │
│   ├── lib/                 # 28+ business logic files
│   │   ├── batch-lifecycle.ts           # Batch FSM (refactored Sprint 5)
│   │   ├── pool-request-lifecycle.ts    # Pool request FSM (refactored Sprint 5)
│   │   ├── matching-lifecycle.ts        # Matching FSM (refactored Sprint 5)
│   │   ├── matching-validation.ts       # Matching algorithms (updated Sprint 6)
│   │   ├── fsm-validator.ts             # NEW - Sprint 5
│   │   ├── delivery-periods.ts          # NEW - Sprint 5
│   │   └── ... (22 more files)
│   │
│   ├── integrations/supabase/
│   │   ├── client.ts
│   │   └── types.ts         # 58K+ lines of generated types
│   │
│   └── i18n/                # Multi-language support (EN/RU/KK)
│
├── docs/                    # 65+ developer markdown files
├── docs-site/               # VitePress documentation site
├── supabase/migrations/     # 45+ SQL migrations
└── .claude/                 # Development documentation (THIS FOLDER)
```

---

## 🔑 Key Technologies

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| **Frontend** | React | 18.3.1 | UI framework |
| **Language** | TypeScript | 5.x | Type safety |
| **Build** | Vite | 5.4.19 | Build tool |
| **Styling** | Tailwind CSS | 3.4.17 | Utility-first CSS |
| **UI Library** | shadcn-ui | - | Component library (Radix UI) |
| **State** | React Query | 5.83.0 | Server state management |
| **Forms** | React Hook Form | 7.61.1 | Form management |
| **Validation** | Zod | 3.25.76 | Schema validation |
| **Backend** | Supabase | - | PostgreSQL BaaS |
| **Auth** | Supabase Auth | - | Authentication |
| **i18n** | i18next | 25.7.3 | Internationalization |

---

## 🚀 Quick Start Commands

```bash
# Development
npm run dev              # Start dev server (localhost:8080)
npm run build            # Production build
npm run preview          # Preview production build

# Documentation
npm run docs:dev         # VitePress dev server
npm run docs:build       # Build documentation
npm run docs:preview     # Preview docs build

# Code Quality
npm run lint             # Run ESLint
npm run test             # Run tests (when implemented)
```

---

## 👥 User Roles

| Role | Capabilities | Key Pages |
|------|--------------|-----------|
| **Farmer** | Create batches, track sales, market signals | 9 pages |
| **MPK** | Create pool requests, manage matching | 6 pages |
| **Admin** | Approve users, manage matching, oversight | 14+ pages |

---

## 📊 Project Metrics

| Metric | Value |
|--------|-------|
| Total TypeScript/TSX Files | 263 |
| Total Lines of Code | 60,319+ |
| Component Directories | 22 |
| Page Components | 39 |
| Custom Hooks | 38+ |
| Utility/Library Files | 28 |
| Database Migrations | 45+ |
| Documentation Files | 65+ (dev docs) + VitePress site |

---

## 🔗 Important Links

### External Resources
- **GitHub Repository:** (Add URL)
- **Staging Environment:** (Add URL)
- **Production Environment:** (Add URL)
- **Documentation Site:** (Add URL)
- **Supabase Dashboard:** https://supabase.com/dashboard

### Internal References
- **Sprint 5 Completion Summary:** See [ROADMAP.md](./ROADMAP.md#sprint-5-module-9-platform-consistency-✅-completed)
- **Sprint 6 Progress:** See [ROADMAP.md](./ROADMAP.md#sprint-6-high-priority-🔄-in-progress)
- **Improvement Plan:** See `/Users/arshidintokhtamov/.claude/plans/foamy-sprouting-octopus.md`

---

## 📝 Recent Changes (Sprint 5-6)

### Sprint 5 Deliverables (Completed 2026-01-09)
- ✅ Unified FSM transition patterns across all FSMs
- ✅ Centralized status badge styling (26 status types)
- ✅ Created FSM validator utility
- ✅ Created delivery periods utility module
- ✅ Created match confidence indicator component
- ✅ Documentation: 4 new comprehensive guides

### Sprint 6 Progress (In Progress)
- ✅ Integrated match confidence indicator in admin matching views
- ✅ Updated imports to use centralized delivery-periods module
- ✅ Color-coded batch display by confidence level
- ✅ Sorting by confidence score

---

## 🎓 Learning Resources

### For New Developers
1. Start with [ARCHITECTURE.md](./ARCHITECTURE.md) - Understand the system
2. Read [Access Control](../docs/ACCESS_CONTROL.md) - Understand RBAC
3. Study [Batch Lifecycle FSM](../docs/fsm/BATCH_LIFECYCLE.md) - Core business logic
4. Review [File Structure](./FILE_STRUCTURE.md) - Navigate the codebase

### For Feature Development
1. Check [ROADMAP.md](./ROADMAP.md) - Find current sprint tasks
2. Read relevant module documentation in `docs/modules/`
3. Follow patterns from existing components
4. Test with all three roles (Farmer, MPK, Admin)

---

## ⚠️ Important Constraints

### FSM Rules
- All state transitions are **irreversible** (no backward transitions)
- Admin overrides must be **logged with reasons**
- Time locks must be **enforced** before commitment

### Role Isolation
- Farmers and MPKs **never see each other's identities**
- Data anonymization at **database level** (RLS policies)
- Permission enforcement at **both UI and database layers**

### Data Integrity
- All sensitive operations must be **logged to activity_log**
- Immutable snapshots must be **preserved**
- Change tracking with **timestamps and reasons**

---

## 🐛 Known Issues & Limitations

1. **Testing Coverage** - Minimal test files, comprehensive suite needed
2. **Database Enforcement** - FSM constraints planned but not fully implemented
3. **Real-time Updates** - Using polling instead of Supabase subscriptions
4. **Performance** - Large type file (58K+ lines) may impact IDE

See [ROADMAP.md](./ROADMAP.md#known-limitations--constraints) for full list.

---

## 📞 Support & Contact

- **Technical Questions:** Review documentation first
- **Bug Reports:** Check existing issues in docs/
- **Feature Requests:** Consult roadmap before proposing

---

**Document Version:** 1.0
**Created:** 2026-01-09
**Maintained By:** Development Team
**Next Review:** After Sprint 6 completion
