# Core System Modules

## Overview

This section provides detailed documentation for each core system module in the Turan Standard Pool platform.

## Module List

1. [Batch Lifecycle](/docs/en/modules/batch-lifecycle) - Batch FSM and management
2. [Pool Requests](/docs/en/modules/pool-requests) - Pool request creation and lifecycle
3. [Matching Windows](/docs/en/modules/matching-windows) - Time-based coordination
4. [Pool Matching](/docs/en/modules/pool-matching) - Supply-demand matching process
5. [Contracts & Execution](/docs/en/modules/execution) - Delivery and settlement
6. [Offtake Registry](/docs/en/modules/offtake-registry) - Execution tracking
7. [Premium System](/docs/en/modules/premium-system) - Premium calculation
8. [Reference Price Grid](/docs/en/modules/price-grid) - Indicative pricing
9. [Herd Structure](/docs/en/modules/herd-structure) - Capacity planning data
10. [Market Intent](/docs/en/modules/market-intent) - Non-binding signals
11. [National Herd Overview](/docs/en/modules/national-herd) - Aggregated planning

---

## Module Categories

### Market Operations (Binding)

These modules handle actual market commitments:

- **Batch Lifecycle** - Supply declarations
- **Pool Requests** - Demand declarations
- **Matching Windows** - Time coordination
- **Pool Matching** - Allocation process
- **Contracts & Execution** - Delivery tracking
- **Offtake Registry** - Settlement records

### Planning & Intelligence (Indicative)

These modules provide planning data only:

- **Herd Structure** - Capacity snapshots
- **Market Intent** - Availability signals
- **National Herd Overview** - Aggregated planning

### Supporting Systems

These modules support market operations:

- **Premium System** - Incentive calculations
- **Reference Price Grid** - Indicative benchmarks

---

## Module Relationships

```
Herd Structure (Indicative)
    ↓ (no direct link)
Market Intent (Indicative)
    ↓ (no direct link)
Batch Lifecycle (Binding)
    ↓
Matching Windows
    ↓
Pool Requests (Binding)
    ↓
Pool Matching
    ↓
Execution & Offtake Registry
```

**Key**: Herd Structure and Market Intent are **isolated** from binding operations.

---

## Next Steps

- [Batch Lifecycle Module](/docs/en/modules/batch-lifecycle) - Start here for supply-side
- [Pool Requests Module](/docs/en/modules/pool-requests) - Start here for demand-side
- [Matching Windows Module](/docs/en/modules/matching-windows) - Time coordination

