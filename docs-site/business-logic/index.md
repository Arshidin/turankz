# Business Logic & Guardrails

## Overview

This section documents the critical business rules and guardrails that ensure the platform maintains market neutrality, prevents price fixing, and clearly distinguishes between indicative and binding data.

---

## Binding vs Non-Binding Data

### Critical Distinction

The platform maintains a strict separation between:
- **Indicative data** - For planning and visibility only
- **Binding data** - Creates actual market commitments

### Indicative Data (Non-Binding)

| Data Type | Purpose | Binding? | Used in Matching? |
|-----------|---------|---------|------------------|
| Herd Structure | Capacity planning, national overview | ❌ No | ❌ No |
| Market Intent | Supply signals, planning visibility | ❌ No | ❌ No |
| Batch (Draft) | Preparation | ❌ No | ❌ No |
| Batch (Forecast) | Early availability signal | ❌ No | ❌ No |
| Pool Request (Draft) | Preparation | ❌ No | ❌ No |

### Binding Data

| Data Type | Purpose | Binding? | Used in Matching? |
|-----------|---------|---------|------------------|
| Batch (Soft Committed) | Preliminary commitment | ⚠️ Partial | ✅ Yes |
| Batch (Confirmed) | Firm commitment | ✅ Yes | ✅ Yes |
| Pool Request (Submitted) | Binding demand request | ✅ Yes | ✅ Yes |
| Match (Finalized) | Binding allocation | ✅ Yes | ✅ Yes |

---

## Why Herd Structure ≠ Supply

### Herd Structure is Indicative Only

**Herd Structure snapshots:**
- Represent **capacity**, not availability
- Are **voluntary** declarations
- Are **time-based** (year/quarter)
- Are **immutable** after submission
- **Never** create batches automatically
- **Never** participate in matching
- **Never** affect pricing

### Guardrails

1. **No Auto-Generation**: Herd Structure never auto-generates batches
2. **No Matching**: Herd Structure data is not queried in matching logic
3. **No Pricing**: Herd Structure does not affect price calculations
4. **Planning Only**: Used for national capacity planning, not market operations

### Example

**Scenario**: Farmer reports 100 cows in Herd Structure, but creates batch for 50 heads.

**System behavior**: ✅ Allowed (no validation)
**Reason**: Herd Structure is capacity data, batch is actual availability

---

## Why Market Intent ≠ Commitment

### Market Intent is Non-Binding

**Market Intent:**
- Are **voluntary** signals
- Are **non-binding** declarations
- Help with **demand/supply planning visibility**
- **Do NOT** create batches
- **Do NOT** enter Batch FSM lifecycle
- **Do NOT** participate in matching
- **Do NOT** affect pricing

### Guardrails

1. **No Batch Creation**: Market Intent never creates batches
2. **No FSM Entry**: Market Intent exists in separate table
3. **No Matching**: Market Intent is not queried in matching logic
4. **Signal Only**: Used for planning visibility, not commitments

### Example

**Scenario**: Farmer creates Market Intent for 100 heads, but never creates a batch.

**System behavior**: ✅ Allowed (no enforcement)
**Reason**: Market Intent is a signal, not a commitment

---

## Anti-Price-Fixing Safeguards

### Reference Price Grid

**Purpose**: Provide indicative market benchmarks

**Characteristics**:
- **Indicative only** - Not binding
- **Reference benchmarks** - Not mandatory prices
- **Market-based** - Reflects market conditions
- **No enforcement** - Final prices determined at delivery

**Terminology**:
- "Reference Price" (not "Base Price")
- "Indicative Settlement Price" (not "Final Price")
- "Reference Benchmark" (not "Mandatory Price")

### Premium System

**Purpose**: Incentivize compliance and predictability

**Characteristics**:
- **Incentive-based** - Rewards, not penalties
- **Voluntary** - Participation is optional
- **Compliance-focused** - Standards, not price controls
- **Not price fixing** - Premiums are additions, not floors/ceilings

### Legal Disclaimers

All pricing displays include:
> "Reference prices are indicative market benchmarks. Final settlement prices are determined at delivery based on market conditions. TURAN does not set, enforce, or guarantee transaction prices. Participation is voluntary."

---

## Role Isolation Logic

### Identity Isolation

**Farmer ↔ MPK Isolation:**
- Farmer identities **never** exposed to MPKs
- MPK identities **never** exposed to Farmers
- All relationships mediated by Admin
- Aggregated data only for visibility

### Data Isolation

**Farmer Data:**
- Own batches only
- Own herd structure only
- Own market intents only
- No access to other farmers' data

**MPK Data:**
- Own pool requests only
- Own executions only
- Aggregated supply only (no individual batches)
- No access to farmer identities

**Admin Data:**
- Full visibility for coordination
- Can see all identities
- Mediates all relationships

---

## Irreversibility Principles

### Batch Lifecycle Irreversibility

**Cannot Revert:**
- `confirmed` → earlier status
- `matched` → earlier status
- `closed` → any status

**Reason**: Data integrity and matching consistency

### Pool Request Irreversibility

**Cannot Revert:**
- `submitted` → `draft` (MPK cannot, Admin can override with note)
- `matching` → earlier status (Admin override only)
- `fulfilled` → earlier status (Admin override only)
- `closed` → any status (terminal)

**Reason**: Binding commitments must be honored

### Matching Irreversibility

**Cannot Revert:**
- Finalized matches cannot be undone (Admin override only with note)
- Premium calculations are locked after finalization
- Execution records are created automatically

**Reason**: Transaction integrity

---

## Explicit Commitments Only

### Batch Creation Requires Explicit Action

**Rule**: A farmer must **explicitly** create a batch via the Batches page.

**Cannot:**
- Auto-create batches from Herd Structure
- Auto-create batches from Market Intent
- System processes cannot create batches

**Reason**: Ensures intentionality and accountability

### Batch FSM is Only Gateway to Matching

**Rule**: Only batches in appropriate FSM states can be matched.

**Path**: Draft → Forecast → Soft Committed → Confirmed → Matched

**Cannot:**
- Skip lifecycle stages
- Match from Herd Structure
- Match from Market Intent
- Bypass FSM progression

**Reason**: Ensures proper commitment progression

---

## Data Quality Guardrails

### Herd Structure Quality

**Validation:**
- Region must be set (NOT NULL)
- Period must be current or past (no future periods)
- No duplicate snapshots for same period/category/breed

**Admin Verification:**
- Can set confidence level
- Can set verification status
- Cannot edit farmer-submitted data

### Market Intent Quality

**Validation:**
- Voluntary submission
- Non-binding by default
- No enforcement

**Admin Verification:**
- Can view aggregated data
- Can assess quality
- Cannot edit farmer-submitted intents

### Batch Quality

**Validation:**
- Must follow FSM lifecycle
- Cannot skip statuses
- Cannot revert statuses

**Admin Verification:**
- Can override with note
- Can verify compliance
- Can update status (with note)

---

## Next Steps

- [Limitations & Non-Goals](/docs/en/limitations/) - What the platform does NOT do
- [Glossary](/docs/en/glossary/) - Domain terminology
- [Status Machines](/docs/en/fsm/) - FSM documentation

