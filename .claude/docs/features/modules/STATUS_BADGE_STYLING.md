# Status Badge Styling System

**File:** `src/hooks/useStatusBadgeStyle.ts`
**Created:** Sprint 5 - Module 9.2.1 & 9.2.2
**Purpose:** Centralized status badge styling across the entire platform

---

## Overview

The Status Badge Styling System provides a unified interface for styling all status badges in TURAN. It consolidates styling logic that was previously scattered across multiple components and CSS classes.

**Before:** 6+ independent status badge implementations
**After:** Single centralized hook managing 26 different status types

---

## Supported Status Types

The system handles 5 main status categories:

| Status Type | Statuses Covered | Use Cases |
|-------------|------------------|-----------|
| **batch** | draft, forecast, soft_committed, confirmed, matched, closed | Batch lifecycle |
| **pool** | draft, submitted, matching, partial, fulfilled, closed, cancelled | Pool request lifecycle |
| **matching** | active, finalized, cancelled | Matching window operations |
| **execution** | matched, scheduled, delivered, confirmed, settled, closed | Order fulfillment |
| **grading** | observer, standard, declared, certified | TURAN grading system |

**Total:** 26 unique status configurations

---

## Core Hook: useStatusBadgeStyle

### Signature

```typescript
function useStatusBadgeStyle(
  type: StatusType,
  status: AnyStatus
): StatusStyle
```

### Parameters

- **type**: The status category ('batch' | 'pool' | 'matching' | 'execution' | 'grading')
- **status**: The specific status value (e.g., 'draft', 'submitted', etc.)

### Returns: StatusStyle

```typescript
interface StatusStyle {
  className: string;      // CSS class name (e.g., 'status-draft')
  color: string;          // Text color (HSL format)
  bgColor: string;        // Background color (HSL format)
  borderColor: string;    // Border color (HSL format)
  icon: LucideIcon;       // Icon component (from lucide-react)
  label: string;          // English label
  labelRu?: string;       // Russian label (optional)
}
```

### Example Usage

```typescript
import { useStatusBadgeStyle } from '@/hooks/useStatusBadgeStyle';

function MyStatusBadge({ status }: { status: BatchStatus }) {
  const style = useStatusBadgeStyle('batch', status);

  return (
    <div
      className={style.className}
      style={{
        color: style.color,
        backgroundColor: style.bgColor,
        borderColor: style.borderColor,
      }}
    >
      <style.icon className="w-4 h-4" />
      <span>{style.label}</span>
    </div>
  );
}
```

---

## Helper Functions

### getStatusBadgeClass

Get only the CSS class name (when full style object is not needed).

```typescript
function getStatusBadgeClass(
  type: StatusType,
  status: AnyStatus
): string

// Example
const className = getStatusBadgeClass('pool', 'submitted');
// Returns: 'pool-submitted'
```

### getStatusIcon

Get only the icon component.

```typescript
function getStatusIcon(
  type: StatusType,
  status: AnyStatus
): LucideIcon

// Example
const Icon = getStatusIcon('batch', 'confirmed');
// Returns: CheckCircle component
```

### getStatusLabel

Get localized label.

```typescript
function getStatusLabel(
  type: StatusType,
  status: AnyStatus,
  lang: 'en' | 'ru' = 'en'
): string

// Example
getStatusLabel('batch', 'draft', 'en'); // "Draft"
getStatusLabel('batch', 'draft', 'ru'); // "Черновик"
```

---

## Status Styling Reference

### Batch Statuses

| Status | Color | Icon | Label (EN) | Label (RU) |
|--------|-------|------|------------|------------|
| `draft` | Gray | FileText | Draft | Черновик |
| `forecast` | Blue | Eye | Forecast | Прогноз |
| `soft_committed` | Amber | AlertCircle | Soft Committed | Предварительно |
| `confirmed` | Purple | CheckCircle | Confirmed | Подтверждено |
| `matched` | Green | Link2 | Matched | Сопоставлено |
| `closed` | Slate | XCircle | Closed | Закрыто |

### Pool Request Statuses

| Status | Color | Icon | Label (EN) | Label (RU) |
|--------|-------|------|------------|------------|
| `draft` | Gray | FileText | Draft | Черновик |
| `submitted` | Blue | Package | Submitted | Подана |
| `matching` | Indigo | Activity | Matching | Сопоставление |
| `partial` | Amber | Clock | Partial | Частично |
| `fulfilled` | Green | CheckCircle | Fulfilled | Выполнена |
| `closed` | Slate | XCircle | Closed | Закрыта |
| `cancelled` | Red | XCircle | Cancelled | Отменена |

### Matching Statuses

| Status | Color | Icon | Label (EN) | Label (RU) |
|--------|-------|------|------------|------------|
| `active` | Green | Link2 | Active | Активно |
| `finalized` | Blue | CheckCircle | Finalized | Завершено |
| `cancelled` | Red | XCircle | Cancelled | Отменено |

### Execution Statuses

| Status | Color | Icon | Label (EN) | Label (RU) |
|--------|-------|------|------------|------------|
| `matched` | Green | Link2 | Matched | Сопоставлено |
| `scheduled` | Blue | Calendar | Scheduled | Запланировано |
| `delivered` | Indigo | Truck | Delivered | Доставлено |
| `confirmed` | Purple | CheckCircle | Confirmed | Подтверждено |
| `settled` | Emerald | DollarSign | Settled | Рассчитано |
| `closed` | Slate | XCircle | Closed | Закрыто |

### Grading Statuses

| Status | Color | Icon | Label (EN) | Label (RU) |
|--------|-------|------|------------|------------|
| `observer` | Gray | Eye | Observer | Наблюдатель |
| `standard` | Blue | Star | Standard | Стандарт |
| `declared` | Purple | Award | Declared | Заявленный |
| `certified` | Green | CheckCircle | Certified | Сертифицирован |

---

## Integration with StatusBadge Component

The `StatusBadge` component in `src/components/ui/StatusBadge.tsx` has been updated to use this hook:

### Before (Inconsistent)

```typescript
// Different implementations for each status type
export function StatusBadge({ status }) {
  const statusClass = {
    draft: 'status-draft',
    forecast: 'status-forecast',
    // ... hardcoded classes
  }[status];

  return <span className={statusClass}>{status}</span>;
}

export function PoolStatusBadge({ status }) {
  const statusClass = {
    draft: 'pool-draft',
    submitted: 'pool-submitted',
    // ... different hardcoded classes
  }[status];

  return <span className={statusClass}>{status}</span>;
}
```

### After (Unified)

```typescript
export function StatusBadge({ status, className, size = 'md' }: StatusBadgeProps) {
  const normalizedStatus = normalizeStatus(status);
  const style = useStatusBadgeStyle('batch', normalizedStatus);
  const lang = getCurrentLanguage();
  const label = getStatusLabel('batch', normalizedStatus, lang);

  return (
    <span className={cn('status-badge', style.className, className)}>
      {label}
    </span>
  );
}

export function PoolStatusBadge({ status, className, size = 'md' }: PoolStatusBadgeProps) {
  const style = useStatusBadgeStyle('pool', status);
  const lang = getCurrentLanguage();
  const label = getStatusLabel('pool', status, lang);

  return (
    <span className={cn('pool-badge', style.className, className)}>
      {label}
    </span>
  );
}
```

---

## CSS Variable Support

The system uses CSS variables for theme consistency:

```css
/* Batch statuses */
--status-draft: hsl(215 15% 50%);
--status-draft-bg: hsl(215 15% 95%);

/* Pool statuses */
--pool-draft: hsl(215 15% 50%);
--pool-draft-bg: hsl(215 15% 95%);
--pool-submitted: hsl(200 65% 50%);
--pool-submitted-bg: hsl(200 65% 95%);

/* Execution statuses */
--exec-matched: hsl(150 50% 40%);
--exec-matched-bg: hsl(150 50% 95%);
```

These variables are defined in `src/index.css` and can be customized for theming.

---

## Adding New Status Types

To add a new status type:

1. **Define the status type:**
   ```typescript
   export type MyNewStatus = 'status1' | 'status2' | 'status3';
   ```

2. **Add to StatusType union:**
   ```typescript
   export type StatusType = 'batch' | 'pool' | 'matching' | 'execution' | 'grading' | 'mynew';
   ```

3. **Create style definitions:**
   ```typescript
   const MY_NEW_STATUS_STYLES: Record<MyNewStatus, Omit<StatusStyle, 'className'>> = {
     status1: {
       color: 'hsl(200 65% 50%)',
       bgColor: 'hsl(200 65% 95%)',
       borderColor: 'hsl(200 65% 50% / 0.25)',
       icon: MyIcon,
       label: 'Status 1',
       labelRu: 'Статус 1',
     },
     // ... other statuses
   };
   ```

4. **Add to switch statement in useStatusBadgeStyle:**
   ```typescript
   case 'mynew':
     baseStyle = MY_NEW_STATUS_STYLES[status as MyNewStatus];
     className = `mynew-${status}`;
     break;
   ```

---

## Benefits

1. **Consistency**: All status badges use the same styling system
2. **Maintainability**: Single source of truth for all status styles
3. **Localization**: Built-in support for EN/RU labels
4. **Type Safety**: Full TypeScript support with discriminated unions
5. **Theming**: Easy to customize with CSS variables
6. **Reusability**: Can be used in any component that needs status display

---

## Migration Guide

If you have existing status badge implementations:

### Step 1: Identify status type

Determine which status type your component uses:
- Batch lifecycle? → `'batch'`
- Pool request? → `'pool'`
- Matching? → `'matching'`
- Execution? → `'execution'`
- Grading? → `'grading'`

### Step 2: Replace hardcoded styling

**Before:**
```typescript
const statusClass = status === 'draft' ? 'status-draft' : 'status-forecast';
```

**After:**
```typescript
const style = useStatusBadgeStyle('batch', status);
```

### Step 3: Update render logic

**Before:**
```typescript
<span className={statusClass}>{status}</span>
```

**After:**
```typescript
<span className={style.className}>{style.label}</span>
```

---

## Related Documentation

- [StatusBadge Component](../components/STATUS_BADGE.md)
- [Batch Lifecycle FSM](../fsm/BATCH_LIFECYCLE.md)
- [Pool Request Lifecycle FSM](../fsm/POOL_REQUEST_LIFECYCLE.md)
- [Theming Guide](../THEMING.md)

---

**Last Updated:** 2026-01-09 (Sprint 5 - Module 9)
