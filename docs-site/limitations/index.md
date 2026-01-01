# Limitations & Non-Goals

## Overview

This section explicitly documents what the Turan Standard Pool platform **does NOT do**, what data is **indicative only**, what requires **admin mediation**, and the platform's **explicit non-goals**.

---

## What the Platform Intentionally Does NOT Do

### Price Setting

**The platform does NOT:**
- Set mandatory transaction prices
- Enforce price floors or ceilings
- Fix prices between participants
- Guarantee transaction prices
- Act as price authority

**What it does:**
- Provides **indicative reference prices** (benchmarks only)
- Calculates **indicative settlement prices** (for planning)
- Offers **incentive-based premiums** (rewards, not controls)

### Contract Creation

**The platform does NOT:**
- Create legally binding contracts
- Enforce delivery obligations
- Act as intermediary in transactions
- Guarantee transaction completion

**What it does:**
- Facilitates **coordination** between supply and demand
- Tracks **execution** and compliance
- Provides **mediation** for disputes
- Maintains **audit trail** for transparency

### Market Making

**The platform does NOT:**
- Create artificial demand or supply
- Act as market maker
- Intervene in price discovery
- Manipulate market conditions

**What it does:**
- **Coordinates** existing supply and demand
- Provides **visibility** into market signals
- Facilitates **matching** of willing participants
- Maintains **market neutrality**

### Direct Communication

**The platform does NOT:**
- Enable direct farmer-MPK communication
- Provide messaging between participants
- Facilitate private negotiations
- Allow bypassing the platform

**What it does:**
- **Mediates** all relationships through Admin
- Maintains **identity isolation**
- Ensures **platform coordination**
- Provides **transparency** through aggregation

---

## What is Indicative Only

### Herd Structure

**Status**: Indicative only

**Purpose**: Capacity planning, national overview

**Does NOT:**
- Create batches
- Participate in matching
- Affect pricing
- Create commitments

**Used for:**
- National capacity planning
- Market forecasting
- Supply visibility (admin-only)

### Market Intent

**Status**: Indicative only

**Purpose**: Supply signals, planning visibility

**Does NOT:**
- Create batches
- Enter Batch FSM
- Participate in matching
- Affect pricing

**Used for:**
- Demand/supply planning visibility
- Market signal aggregation
- Early availability indicators

### Reference Price Grid

**Status**: Indicative only

**Purpose**: Market benchmarks for planning

**Does NOT:**
- Set mandatory prices
- Enforce transaction prices
- Create price floors/ceilings
- Guarantee prices

**Used for:**
- Planning and budgeting
- Indicative price calculations
- Market reference points

### Aggregated Data

**Status**: Indicative only

**Purpose**: Market visibility without identity exposure

**Does NOT:**
- Reveal individual identities
- Create binding obligations
- Guarantee availability

**Used for:**
- Market overview
- Supply/demand signals
- Planning visibility

---

## What Requires Admin Mediation

### Matching

**Requires Admin:**
- Pool matching is **admin-mediated**
- Admin facilitates all matching
- Participants cannot directly match

**Reason**: Ensures fair matching, prevents bypassing platform

### Conflict Resolution

**Requires Admin:**
- Delivery disputes
- Status overrides
- Data corrections
- Access restrictions

**Reason**: Maintains platform integrity, ensures fairness

### Status Overrides

**Requires Admin:**
- Batch status changes (after confirmed)
- Request status changes (after submitted)
- Execution status changes
- Access restrictions

**Reason**: Maintains FSM integrity, requires accountability

### Data Verification

**Requires Admin:**
- Herd structure confidence levels
- Market intent verification
- Batch compliance checks
- Execution compliance

**Reason**: Ensures data quality, maintains standards

---

## Explicit Non-Goals

### Price Fixing

**Non-Goal**: The platform explicitly does NOT fix prices.

**Evidence**:
- Reference prices are indicative only
- Final prices determined at delivery
- No mandatory pricing
- Legal disclaimers on all pricing displays

### Market Control

**Non-Goal**: The platform does NOT control the market.

**Evidence**:
- No artificial demand/supply creation
- No market manipulation
- Market neutrality maintained
- Coordination role only

### Contract Enforcement

**Non-Goal**: The platform does NOT enforce contracts.

**Evidence**:
- No legally binding contracts created
- Mediation role only
- Tracking and compliance only
- No legal enforcement

### Direct Trading

**Non-Goal**: The platform does NOT enable direct trading.

**Evidence**:
- All relationships mediated by Admin
- No direct communication
- Identity isolation maintained
- Platform coordination required

---

## Platform Boundaries

### What Platform Handles

✅ Coordination
✅ Matching facilitation
✅ Data aggregation
✅ Compliance tracking
✅ Audit logging
✅ Premium calculation (indicative)
✅ Reference pricing (indicative)

### What Platform Does NOT Handle

❌ Legal contracts
❌ Price enforcement
❌ Delivery enforcement
❌ Payment processing
❌ Dispute resolution (legal)
❌ Market making
❌ Direct communication

---

## Edge Cases and Limitations

### Partial Matching

**Limitation**: Requests may be partially matched.

**Behavior**: Status becomes `partial`, matching continues in next window.

**Admin Action**: Continue matching in subsequent windows.

### Batch Volume Discrepancies

**Limitation**: Batch volumes may not match exactly.

**Behavior**: System matches available volume, tracks discrepancies.

**Admin Action**: Verify and update with note if needed.

### Window Timing

**Limitation**: Matching windows have fixed dates.

**Behavior**: Cannot submit/confirm outside active windows.

**Admin Action**: Create new window if needed.

### Data Immutability

**Limitation**: Some data cannot be edited after submission.

**Behavior**: Herd structure, confirmed batches are immutable.

**Admin Action**: Override with note if correction needed.

---

## Next Steps

- [Business Logic](/docs/en/business-logic/) - Understanding guardrails
- [Glossary](/docs/en/glossary/) - Domain terminology
- [Admin Guide](/docs/en/admin-guide/) - Admin mediation processes

