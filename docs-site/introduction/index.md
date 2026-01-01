# Introduction

## What is Turan Standard Pool

**Turan Standard Pool** is a governed livestock market coordination platform designed to ensure predictability, standards, and year-round supply for Kazakhstan's meat industry.

### Platform Type

The platform is **not** an exchange or marketplace. It is a **coordination tool** that ensures:
- Transparency
- Quality standards
- Efficient matching of supply and demand
- **Market neutrality** (no price fixing)

### Core Purpose

All participants operate within clearly defined rules, standards, and processes that ensure:
- Fairness
- Transparency
- Predictability for all parties

---

## Platform Purpose & Scope

### Primary Objectives

1. **Year-round supply planning** with clear matching windows and target weeks
2. **Quality standards system** with premiums for compliance and supply predictability
3. **Transparency** through aggregated supply and demand signals while maintaining participant confidentiality

### What the Platform Does

- Coordinates supply declarations (Farmers) with demand requests (MPKs)
- Provides matching windows for time-based coordination
- Manages batch lifecycle from declaration to delivery
- Tracks execution and compliance
- Calculates premiums based on standards compliance and predictability
- Maintains reference price grids (indicative, not binding)

### What the Platform Does NOT Do

- Set mandatory prices (reference prices are indicative only)
- Create binding contracts (coordination only)
- Enforce delivery (mediation and tracking only)
- Act as a market maker (coordination role only)
- Fix prices or create price floors/ceilings

---

## Core Principles

### 1. Market Neutrality

The platform maintains strict market neutrality:
- **No price fixing** - Reference prices are indicative benchmarks only
- **No mandatory pricing** - Final prices determined at delivery based on market conditions
- **No market manipulation** - Platform coordinates, does not control

### 2. Explicit Commitments Only

Only explicit, confirmed actions create binding obligations:
- **Batches** must progress through lifecycle (Draft → Forecast → Soft Committed → Confirmed)
- **Pool Requests** must be submitted and approved
- **Matches** must be finalized by Admin
- **Herd Structure** and **Market Intent** are **indicative only** and never create commitments

### 3. No Price Fixing

The platform explicitly avoids price fixing:
- Reference Price Grid is **indicative** only
- Premiums are **incentive-based**, not price controls
- Final settlement prices determined at delivery
- TURAN does not set, enforce, or guarantee transaction prices
- Participation is voluntary

### 4. Governance-First Coordination

Admin (TURAN/ZENGI) acts as coordinator, not market maker:
- Manages matching windows
- Facilitates pool matching
- Resolves conflicts
- Verifies data quality
- Does NOT set prices or create artificial demand/supply

---

## Platform Architecture

### Three-Party Model

1. **Farmers** (Supply-side)
   - Declare livestock batches
   - Respond to pool invitations
   - Manage delivery commitments

2. **MPKs** (Demand-side)
   - Create purchase pool requests
   - Express interest in supply
   - Confirm deliveries

3. **Admin** (TURAN/ZENGI) (Coordinator)
   - Manages matching windows
   - Facilitates pool matching
   - Verifies compliance
   - Resolves conflicts

### Data Isolation

- **Farmer identities** are never exposed to MPKs
- **MPK identities** are never exposed to Farmers
- **Aggregated data only** for market visibility
- **Admin** has full visibility for coordination

---

## Key Concepts

### Indicative vs Binding Data

| Data Type | Binding? | Purpose |
|-----------|----------|---------|
| Herd Structure | ❌ No | Capacity planning, national overview |
| Market Intent | ❌ No | Supply signals, planning visibility |
| Batch (Draft/Forecast) | ❌ No | Early availability signals |
| Batch (Soft Committed) | ⚠️ Partial | Preliminary commitment |
| Batch (Confirmed) | ✅ Yes | Firm commitment for matching |
| Pool Request (Draft) | ❌ No | Preparation only |
| Pool Request (Submitted) | ✅ Yes | Binding demand request |
| Match (Finalized) | ✅ Yes | Binding allocation |

### Lifecycle Discipline

All market operations follow strict finite state machines (FSM):
- **Batch Lifecycle** - From draft to closed
- **Pool Request Lifecycle** - From draft to closed
- **Matching Window Lifecycle** - From upcoming to closed
- **Execution Lifecycle** - From matched to closed

### Time-Based Coordination

**Matching Windows** provide time-based discipline:
- **Upcoming** - Scheduled but not yet open
- **Active** - Open for commitments and matching
- **Locked** - No new commitments, matching in progress
- **Closed** - Window completed, all matching finalized

---

## Next Steps

- [Role Model & Access Control](/docs/en/roles/) - Understand roles and permissions
- [Farmer Guide](/docs/en/farmer-guide/) - If you're a Farmer
- [MPK Guide](/docs/en/mpk-guide/) - If you're an MPK
- [Admin Guide](/docs/en/admin-guide/) - If you're an Admin

