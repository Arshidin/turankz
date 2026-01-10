# Delivery Periods Utility Module

**File:** `src/lib/delivery-periods.ts`
**Created:** Sprint 5 - Module 9.6.1
**Purpose:** Centralized delivery period logic across the platform

---

## Overview

The Delivery Periods module consolidates all delivery period logic that was previously scattered across:
- `matching-validation.ts`
- `batch-lifecycle.ts`
- `pool-request-lifecycle.ts`
- `matching-window.ts`

It provides consistent handling of:
- Delivery period types
- Week ranges for each period
- Formatting and labels
- Period calculations
- Validation logic

---

## Delivery Period Types

TURAN uses three delivery period classifications:

| Period | Week Range | Description | Use Case |
|--------|------------|-------------|----------|
| **short_term** | 0-4 weeks | Immediate delivery, high urgency | Quick turnover, emergency supply |
| **mid_term** | 4-8 weeks | Standard delivery, moderate planning | Regular operations |
| **long_term** | 8+ weeks | Extended delivery, long-term planning | Strategic planning, seasonal supply |

### Type Definition

```typescript
export type DeliveryPeriod = 'short_term' | 'mid_term' | 'long_term';

export const DELIVERY_PERIODS: DeliveryPeriod[] = [
  'short_term',
  'mid_term',
  'long_term'
];
```

---

## Week Ranges

### DELIVERY_PERIOD_RANGES

Week ranges for each delivery period used for validation and filtering.

```typescript
export const DELIVERY_PERIOD_RANGES: Record<
  DeliveryPeriod,
  { min: number; max: number }
> = {
  short_term: { min: 0, max: 4 },
  mid_term: { min: 4, max: 8 },
  long_term: { min: 8, max: Infinity },
};
```

**Note:** `long_term` uses `Infinity` for `max` to represent "8+ weeks".

---

## Labels and Descriptions

### English Labels

```typescript
export const DELIVERY_PERIOD_LABELS: Record<DeliveryPeriod, string> = {
  short_term: 'Short Term',
  mid_term: 'Mid Term',
  long_term: 'Long Term',
};
```

### Russian Labels

```typescript
export const DELIVERY_PERIOD_LABELS_RU: Record<DeliveryPeriod, string> = {
  short_term: 'Краткосрочная',
  mid_term: 'Среднесрочная',
  long_term: 'Долгосрочная',
};
```

### English Descriptions

```typescript
export const DELIVERY_PERIOD_DESCRIPTIONS: Record<DeliveryPeriod, string> = {
  short_term: '0-4 weeks: Immediate delivery, high urgency',
  mid_term: '4-8 weeks: Standard delivery, moderate planning',
  long_term: '8+ weeks: Extended delivery, long-term planning',
};
```

### Russian Descriptions

```typescript
export const DELIVERY_PERIOD_DESCRIPTIONS_RU: Record<DeliveryPeriod, string> = {
  short_term: '0-4 недели: Срочная доставка, высокая приоритетность',
  mid_term: '4-8 недель: Стандартная доставка, умеренное планирование',
  long_term: '8+ недель: Расширенная доставка, долгосрочное планирование',
};
```

---

## Formatting Functions

### formatDeliveryPeriod

Get localized label with week range.

```typescript
function formatDeliveryPeriod(
  period: DeliveryPeriod | null,
  lang: 'en' | 'ru' = 'en'
): string
```

**Examples:**
```typescript
formatDeliveryPeriod('short_term', 'en');
// Returns: "Short Term (0-4 weeks)"

formatDeliveryPeriod('mid_term', 'ru');
// Returns: "Среднесрочная (4-8 недель)"

formatDeliveryPeriod('long_term', 'en');
// Returns: "Long Term (8+ weeks)"

formatDeliveryPeriod(null, 'ru');
// Returns: "Не указан"
```

### getDeliveryPeriodLabel

Get short label without week range.

```typescript
function getDeliveryPeriodLabel(
  period: DeliveryPeriod | null,
  lang: 'en' | 'ru' = 'en'
): string
```

**Examples:**
```typescript
getDeliveryPeriodLabel('short_term', 'en');
// Returns: "Short Term"

getDeliveryPeriodLabel('mid_term', 'ru');
// Returns: "Среднесрочная"

getDeliveryPeriodLabel(null, 'en');
// Returns: "Not specified"
```

### getDeliveryPeriodDescription

Get detailed description.

```typescript
function getDeliveryPeriodDescription(
  period: DeliveryPeriod,
  lang: 'en' | 'ru' = 'en'
): string
```

**Examples:**
```typescript
getDeliveryPeriodDescription('short_term', 'en');
// Returns: "0-4 weeks: Immediate delivery, high urgency"

getDeliveryPeriodDescription('mid_term', 'ru');
// Returns: "4-8 недель: Стандартная доставка, умеренное планирование"
```

---

## Calculation Functions

### getDeliveryPeriodFromWeeks

Determine delivery period from number of weeks.

```typescript
function getDeliveryPeriodFromWeeks(weeks: number): DeliveryPeriod
```

**Examples:**
```typescript
getDeliveryPeriodFromWeeks(2);  // Returns: 'short_term'
getDeliveryPeriodFromWeeks(6);  // Returns: 'mid_term'
getDeliveryPeriodFromWeeks(10); // Returns: 'long_term'
getDeliveryPeriodFromWeeks(4);  // Returns: 'mid_term' (boundary inclusive)
```

**Throws:** Error if weeks < 0

### isWeeksInPeriod

Check if a number of weeks falls within a delivery period range.

```typescript
function isWeeksInPeriod(
  weeks: number,
  period: DeliveryPeriod
): boolean
```

**Examples:**
```typescript
isWeeksInPeriod(3, 'short_term');  // Returns: true
isWeeksInPeriod(5, 'short_term');  // Returns: false
isWeeksInPeriod(5, 'mid_term');    // Returns: true
isWeeksInPeriod(10, 'long_term');  // Returns: true
```

### getWeekRangeString

Get formatted week range string.

```typescript
function getWeekRangeString(
  period: DeliveryPeriod,
  lang: 'en' | 'ru' = 'en'
): string
```

**Examples:**
```typescript
getWeekRangeString('short_term', 'en');
// Returns: "0-4 weeks"

getWeekRangeString('long_term', 'ru');
// Returns: "8+ недель"
```

---

## Validation Functions

### arePeriodsCompatible

Check if two delivery periods are compatible (overlap or adjacent).

```typescript
function arePeriodsCompatible(
  period1: DeliveryPeriod | null,
  period2: DeliveryPeriod | null
): boolean
```

**Rules:**
- If either period is `null`, they are compatible (no restriction)
- Same period is always compatible
- Periods are compatible if their ranges overlap

**Examples:**
```typescript
arePeriodsCompatible('short_term', 'short_term');
// Returns: true (same period)

arePeriodsCompatible('short_term', 'mid_term');
// Returns: true (ranges touch at week 4)

arePeriodsCompatible('short_term', 'long_term');
// Returns: false (no overlap)

arePeriodsCompatible(null, 'mid_term');
// Returns: true (null = no restriction)
```

### validateDeliveryPeriodOverlap

Validate delivery period compatibility between batch and pool request.

```typescript
function validateDeliveryPeriodOverlap(
  batchPeriod: DeliveryPeriod | null,
  requestPeriod: DeliveryPeriod | null
): {
  compatible: boolean;
  reason: string;
  reasonRu: string;
}
```

**Examples:**
```typescript
validateDeliveryPeriodOverlap('short_term', 'short_term');
// Returns: {
//   compatible: true,
//   reason: "Delivery periods compatible: Short Term matches Short Term",
//   reasonRu: "Периоды доставки совместимы: Краткосрочная соответствует Краткосрочная"
// }

validateDeliveryPeriodOverlap('short_term', 'long_term');
// Returns: {
//   compatible: false,
//   reason: "Delivery period mismatch: Batch is Short Term (0-4 weeks), Request requires Long Term (8+ weeks)",
//   reasonRu: "Несоответствие периода доставки: Партия - Краткосрочная (0-4 недель), Запрос требует Долгосрочная (8+ недель)"
// }

validateDeliveryPeriodOverlap(null, 'mid_term');
// Returns: {
//   compatible: true,
//   reason: "No delivery period restriction",
//   reasonRu: "Нет ограничения по периоду доставки"
// }
```

### isValidDeliveryPeriod

Type guard to check if a string is a valid delivery period.

```typescript
function isValidDeliveryPeriod(period: string): period is DeliveryPeriod
```

**Example:**
```typescript
isValidDeliveryPeriod('short_term');  // Returns: true
isValidDeliveryPeriod('ultra_long');  // Returns: false
```

---

## Usage Examples

### Example 1: Batch Creation Form

```typescript
import {
  DELIVERY_PERIODS,
  formatDeliveryPeriod,
  getDeliveryPeriodDescription
} from '@/lib/delivery-periods';

function BatchForm() {
  return (
    <Select>
      {DELIVERY_PERIODS.map((period) => (
        <SelectItem key={period} value={period}>
          <div>
            <div className="font-medium">
              {formatDeliveryPeriod(period, 'ru')}
            </div>
            <div className="text-xs text-muted-foreground">
              {getDeliveryPeriodDescription(period, 'ru')}
            </div>
          </div>
        </SelectItem>
      ))}
    </Select>
  );
}
```

### Example 2: Matching Validation

```typescript
import {
  validateDeliveryPeriodOverlap,
  getDeliveryPeriodFromWeeks
} from '@/lib/delivery-periods';

function validateBatchRequestMatch(batch, request) {
  // Calculate delivery period from target week
  const batchPeriod = getDeliveryPeriodFromWeeks(batch.target_week);

  // Validate overlap
  const validation = validateDeliveryPeriodOverlap(
    batchPeriod,
    request.target_delivery_period
  );

  if (!validation.compatible) {
    return {
      valid: false,
      error: validation.reason,
      errorRu: validation.reasonRu
    };
  }

  return { valid: true };
}
```

### Example 3: Display Badge

```typescript
import {
  getDeliveryPeriodLabel,
  getWeekRangeString
} from '@/lib/delivery-periods';

function DeliveryPeriodBadge({ period, lang = 'en' }) {
  if (!period) return <Badge>Not specified</Badge>;

  return (
    <Badge>
      {getDeliveryPeriodLabel(period, lang)}
      <span className="text-xs ml-1">
        ({getWeekRangeString(period, lang)})
      </span>
    </Badge>
  );
}
```

---

## Migration Guide

If you have existing delivery period logic to migrate:

### Step 1: Replace hardcoded constants

**Before:**
```typescript
const SHORT_TERM_MAX = 4;
const MID_TERM_MAX = 8;
```

**After:**
```typescript
import { DELIVERY_PERIOD_RANGES } from '@/lib/delivery-periods';

const shortTermMax = DELIVERY_PERIOD_RANGES.short_term.max;
const midTermMax = DELIVERY_PERIOD_RANGES.mid_term.max;
```

### Step 2: Replace inline formatting

**Before:**
```typescript
const label = period === 'short_term' ? 'Short Term (0-4 weeks)' : '...';
```

**After:**
```typescript
import { formatDeliveryPeriod } from '@/lib/delivery-periods';

const label = formatDeliveryPeriod(period, 'en');
```

### Step 3: Replace validation logic

**Before:**
```typescript
function isCompatible(period1, period2) {
  if (period1 === 'short_term' && period2 === 'long_term') {
    return false;
  }
  // ... complex logic
}
```

**After:**
```typescript
import { arePeriodsCompatible } from '@/lib/delivery-periods';

const compatible = arePeriodsCompatible(period1, period2);
```

---

## Testing

Example test cases:

```typescript
import {
  getDeliveryPeriodFromWeeks,
  isWeeksInPeriod,
  arePeriodsCompatible,
  validateDeliveryPeriodOverlap
} from '@/lib/delivery-periods';

describe('Delivery Periods', () => {
  describe('getDeliveryPeriodFromWeeks', () => {
    it('should categorize weeks correctly', () => {
      expect(getDeliveryPeriodFromWeeks(2)).toBe('short_term');
      expect(getDeliveryPeriodFromWeeks(6)).toBe('mid_term');
      expect(getDeliveryPeriodFromWeeks(10)).toBe('long_term');
    });

    it('should handle boundary cases', () => {
      expect(getDeliveryPeriodFromWeeks(4)).toBe('mid_term');
      expect(getDeliveryPeriodFromWeeks(8)).toBe('long_term');
    });

    it('should throw on negative weeks', () => {
      expect(() => getDeliveryPeriodFromWeeks(-1)).toThrow();
    });
  });

  describe('arePeriodsCompatible', () => {
    it('should allow same periods', () => {
      expect(arePeriodsCompatible('short_term', 'short_term')).toBe(true);
    });

    it('should allow adjacent periods', () => {
      expect(arePeriodsCompatible('short_term', 'mid_term')).toBe(true);
    });

    it('should reject non-overlapping periods', () => {
      expect(arePeriodsCompatible('short_term', 'long_term')).toBe(false);
    });

    it('should allow null periods', () => {
      expect(arePeriodsCompatible(null, 'mid_term')).toBe(true);
    });
  });
});
```

---

## Related Documentation

- [Matching Validation](./MATCHING_VALIDATION.md)
- [Batch Lifecycle FSM](../fsm/BATCH_LIFECYCLE.md)
- [Pool Request Lifecycle FSM](../fsm/POOL_REQUEST_LIFECYCLE.md)
- [Matching Window](../fsm/MATCHING_WINDOW.md)

---

**Last Updated:** 2026-01-09 (Sprint 5 - Module 9)
