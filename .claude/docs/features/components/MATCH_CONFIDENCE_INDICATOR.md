# Match Confidence Indicator Component

**File:** `src/components/matching/MatchConfidenceIndicator.tsx`
**Created:** Sprint 5 - Module 9.5.1
**Purpose:** Reusable component for displaying match confidence scores

---

## Overview

The Match Confidence Indicator provides a consistent way to display match confidence scores between batches and pool requests across the platform. It follows the same multi-variant pattern as `FillRateIndicator` for consistency.

**Key Features:**
- 4 display variants (badge, score, card, inline)
- Color-coded confidence levels (perfect, good, acceptable, poor)
- Contextual messages (EN + RU)
- Bonus: Detailed breakdown component

---

## Match Confidence System

TURAN uses a weighted scoring system (0-100 points) to evaluate batch-pool request compatibility:

| Criteria | Max Points | Weight |
|----------|------------|--------|
| **Delivery Period** | 30 | 30% |
| **Region** | 25 | 25% |
| **Grade** | 25 | 25% |
| **Weight Range** | 10 | 10% |
| **Age Range** | 10 | 10% |
| **Total** | **100** | **100%** |

### Confidence Levels

| Score Range | Level | Color | Label | Description |
|-------------|-------|-------|-------|-------------|
| 90-100 | `perfect` | Emerald | Perfect Match | All criteria match perfectly |
| 70-89 | `good` | Blue | Good Match | Strong match with minor variations |
| 50-69 | `acceptable` | Amber | Acceptable | Acceptable match, review carefully |
| 0-49 | `poor` | Red | Poor Match | Significant mismatches, admin override required |

---

## Component Props

### MatchConfidenceIndicatorProps

```typescript
interface MatchConfidenceIndicatorProps {
  /** Match confidence object from calculateMatchConfidence() */
  confidence: MatchConfidence | null;

  /** Display variant */
  variant?: 'badge' | 'score' | 'card' | 'inline';

  /** Show detailed breakdown (only for 'card' variant) */
  showDetails?: boolean;

  /** Additional CSS classes */
  className?: string;
}
```

### MatchConfidence Type

```typescript
interface MatchConfidence {
  score: number;              // 0-100
  level: 'perfect' | 'good' | 'acceptable' | 'poor';
  color: 'emerald' | 'blue' | 'amber' | 'red';
  label: string;              // "Perfect Match", "Good Match", etc.
  breakdown?: {               // Optional detailed scores
    deliveryPeriod: number;   // 0-30
    region: number;           // 0-25
    grade: number;            // 0-25
    weight: number;           // 0-10
    age: number;              // 0-10
  };
}
```

---

## Variants

### 1. Badge Variant (Compact)

**Use Case:** Tables, lists, space-constrained areas

**Example:**
```tsx
<MatchConfidenceIndicator
  confidence={confidence}
  variant="badge"
/>
```

**Output:** `[85%]` (with tooltip showing details)

**Features:**
- Minimal space footprint
- Color-coded badge
- Tooltip with full details on hover

---

### 2. Score Variant (Medium)

**Use Case:** Dashboard cards, summary views

**Example:**
```tsx
<MatchConfidenceIndicator
  confidence={confidence}
  variant="score"
/>
```

**Output:** `✓ 85% [Good Match]`

**Features:**
- Icon + score + badge label
- Horizontal layout
- No tooltip needed

---

### 3. Card Variant (Full)

**Use Case:** Detail pages, decision-making interfaces

**Example:**
```tsx
<MatchConfidenceIndicator
  confidence={confidence}
  variant="card"
  showDetails={true}
/>
```

**Output:**
```
┌─────────────────────────────────────┐
│ ✓ Match Confidence        85% [Good]│
├─────────────────────────────────────┤
│ Strong match with minor variations. │
│ Хорошее совпадение с незначительными│
│ отклонениями. Рекомендуется.        │
└─────────────────────────────────────┘
```

**Features:**
- Full card with border
- Score + label + icon
- Contextual message (EN + RU)
- Optional detailed breakdown

---

### 4. Inline Variant (Text)

**Use Case:** Inline text, notifications, status messages

**Example:**
```tsx
<MatchConfidenceIndicator
  confidence={confidence}
  variant="inline"
/>
```

**Output:** `✓ 85% Good Match`

**Features:**
- Inline text with icon
- No background/border
- Compact horizontal layout

---

## Usage Examples

### Example 1: Admin Matching Workspace

```tsx
import { MatchConfidenceIndicator } from '@/components/matching/MatchConfidenceIndicator';
import { calculateMatchConfidence } from '@/lib/matching-validation';

function BatchCard({ batch, poolRequest }) {
  const confidence = calculateMatchConfidence(batch, poolRequest);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Batch #{batch.id}</CardTitle>
        <MatchConfidenceIndicator
          confidence={confidence}
          variant="score"
        />
      </CardHeader>
      <CardContent>
        {/* Batch details */}
      </CardContent>
    </Card>
  );
}
```

### Example 2: Matching Dialog

```tsx
function CreateMatchingDialog({ batch, poolRequest }) {
  const confidence = calculateMatchConfidence(batch, poolRequest);

  return (
    <Dialog>
      <DialogHeader>
        <DialogTitle>Create Matching</DialogTitle>
      </DialogHeader>
      <DialogContent>
        <MatchConfidenceIndicator
          confidence={confidence}
          variant="card"
          showDetails={true}
        />

        {confidence.level === 'poor' && (
          <Alert variant="destructive">
            <AlertTitle>Low Confidence Match</AlertTitle>
            <AlertDescription>
              This match has a low confidence score. Admin override required.
            </AlertDescription>
          </Alert>
        )}
      </DialogContent>
    </Dialog>
  );
}
```

### Example 3: Batch List Table

```tsx
function BatchTable({ batches, poolRequest }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Batch ID</TableHead>
          <TableHead>Farmer</TableHead>
          <TableHead>Match Score</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {batches.map((batch) => {
          const confidence = calculateMatchConfidence(batch, poolRequest);

          return (
            <TableRow key={batch.id}>
              <TableCell>{batch.id}</TableCell>
              <TableCell>{batch.farmer_name}</TableCell>
              <TableCell>
                <MatchConfidenceIndicator
                  confidence={confidence}
                  variant="badge"
                />
              </TableCell>
              <TableCell>
                <Button>Match</Button>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
```

---

## MatchConfidenceBreakdown Component

**Bonus component** for showing detailed scoring breakdown.

### Props

```typescript
interface MatchConfidenceBreakdownProps {
  /** Breakdown of scores by criteria */
  breakdown: {
    deliveryPeriod: number; // 0-30 points
    region: number;         // 0-25 points
    grade: number;          // 0-25 points
    weight: number;         // 0-10 points
    age: number;            // 0-10 points
  };

  /** Additional CSS classes */
  className?: string;
}
```

### Usage

```tsx
<MatchConfidenceBreakdown
  breakdown={confidence.breakdown}
/>
```

### Output

```
┌──────────────────────────────────┐
│ Scoring Breakdown    Total: 85/100│
├──────────────────────────────────┤
│ Delivery Period / Период доставки │
│ 30/30 ████████████████████░░░░░░ │
│                                   │
│ Region / Регион                   │
│ 25/25 ████████████████████░░░░░░ │
│                                   │
│ Grade / Грейд                     │
│ 20/25 ████████████████░░░░░░░░░░ │
│                                   │
│ Weight Range / Диапазон веса      │
│ 8/10  ████████████████░░░░░░░░░░ │
│                                   │
│ Age Range / Диапазон возраста     │
│ 2/10  ████░░░░░░░░░░░░░░░░░░░░░░ │
├──────────────────────────────────┤
│ Higher scores = better match      │
└──────────────────────────────────┘
```

**Features:**
- Progress bars for each criterion
- Bilingual labels (EN / RU)
- Color-coded bars (emerald for full, blue/amber for partial)
- Total score display

---

## Color Coding Reference

### Emerald (Perfect: 90-100)

```typescript
{
  border: 'border-emerald-500/30',
  bg: 'bg-emerald-500/5',
  text: 'text-emerald-600',
  badge: 'bg-emerald-500/15 text-emerald-700 border-emerald-500/30',
}
```

### Blue (Good: 70-89)

```typescript
{
  border: 'border-blue-500/30',
  bg: 'bg-blue-500/5',
  text: 'text-blue-600',
  badge: 'bg-blue-500/15 text-blue-700 border-blue-500/30',
}
```

### Amber (Acceptable: 50-69)

```typescript
{
  border: 'border-amber-500/30',
  bg: 'bg-amber-500/5',
  text: 'text-amber-600',
  badge: 'bg-amber-500/15 text-amber-700 border-amber-500/30',
}
```

### Red (Poor: 0-49)

```typescript
{
  border: 'border-red-500/30',
  bg: 'bg-red-500/5',
  text: 'text-red-600',
  badge: 'bg-red-500/15 text-red-700 border-red-500/30',
}
```

---

## Icon Mapping

| Level | Icon | Component |
|-------|------|-----------|
| perfect | ✓ | CheckCircle2 |
| good | ⓘ | Info |
| acceptable | ⚠ | AlertCircle |
| poor | ⚠ | AlertTriangle |

Icons from `lucide-react`.

---

## Contextual Messages

### English Messages

```typescript
const getMessage = (level: ConfidenceLevel): string => {
  switch (level) {
    case 'perfect':
      return 'All criteria match perfectly. Ideal matching.';
    case 'good':
      return 'Strong match with minor variations. Recommended.';
    case 'acceptable':
      return 'Acceptable match with some mismatches. Review carefully.';
    case 'poor':
      return 'Poor match with significant mismatches. Admin override required.';
  }
};
```

### Russian Messages

```typescript
const getMessageRu = (level: ConfidenceLevel): string => {
  switch (level) {
    case 'perfect':
      return 'Все критерии полностью совпадают. Идеальное соответствие.';
    case 'good':
      return 'Хорошее совпадение с незначительными отклонениями. Рекомендуется.';
    case 'acceptable':
      return 'Приемлемое соответствие с некоторыми несовпадениями. Проверьте внимательно.';
    case 'poor':
      return 'Плохое соответствие со значительными несовпадениями. Требуется подтверждение администратора.';
  }
};
```

---

## Integration with calculateMatchConfidence

The component is designed to work seamlessly with `calculateMatchConfidence()` from `matching-validation.ts`:

```typescript
import { calculateMatchConfidence } from '@/lib/matching-validation';
import { MatchConfidenceIndicator } from '@/components/matching/MatchConfidenceIndicator';

const confidence = calculateMatchConfidence(batch, poolRequest);

<MatchConfidenceIndicator confidence={confidence} variant="card" />
```

---

## Accessibility

- All variants support keyboard navigation
- Tooltips (badge variant) are screen reader accessible
- Color is not the only indicator (icons + text labels)
- Proper ARIA labels on interactive elements

---

## Storybook Stories

(To be created - Task from recommendations)

```tsx
// MatchConfidenceIndicator.stories.tsx
export default {
  title: 'Components/Matching/MatchConfidenceIndicator',
  component: MatchConfidenceIndicator,
};

export const PerfectMatch = {
  args: {
    confidence: {
      score: 95,
      level: 'perfect',
      color: 'emerald',
      label: 'Perfect Match',
    },
    variant: 'card',
    showDetails: true,
  },
};

export const GoodMatch = {
  args: {
    confidence: {
      score: 85,
      level: 'good',
      color: 'blue',
      label: 'Good Match',
    },
    variant: 'score',
  },
};

// ... more stories
```

---

## Testing

Example test cases:

```typescript
import { render, screen } from '@testing-library/react';
import { MatchConfidenceIndicator } from './MatchConfidenceIndicator';

describe('MatchConfidenceIndicator', () => {
  it('renders null when confidence is null', () => {
    const { container } = render(
      <MatchConfidenceIndicator confidence={null} variant="card" />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders badge variant correctly', () => {
    render(
      <MatchConfidenceIndicator
        confidence={{ score: 85, level: 'good', color: 'blue', label: 'Good Match' }}
        variant="badge"
      />
    );
    expect(screen.getByText('85%')).toBeInTheDocument();
  });

  it('shows contextual message in card variant with showDetails', () => {
    render(
      <MatchConfidenceIndicator
        confidence={{ score: 95, level: 'perfect', color: 'emerald', label: 'Perfect Match' }}
        variant="card"
        showDetails={true}
      />
    );
    expect(screen.getByText(/All criteria match perfectly/)).toBeInTheDocument();
  });

  it('applies correct color classes for poor match', () => {
    const { container } = render(
      <MatchConfidenceIndicator
        confidence={{ score: 45, level: 'poor', color: 'red', label: 'Poor Match' }}
        variant="card"
      />
    );
    expect(container.querySelector('.border-red-500\\/30')).toBeInTheDocument();
  });
});
```

---

## Related Documentation

- [Matching Validation Module](../modules/MATCHING_VALIDATION.md)
- [Fill Rate Indicator Component](./FILL_RATE_INDICATOR.md) (similar pattern)
- [Pool Matching Admin Guide](../admin/POOL_MATCHING.md)
- [Batch Lifecycle FSM](../fsm/BATCH_LIFECYCLE.md)

---

**Last Updated:** 2026-01-09 (Sprint 5 - Module 9)
