# Исправления логики админ-панели "Обзор платформы"

## Выявленные проблемы

### 1. ❌ Объявленный объём (totalDeclaredVolume)

**Проблема**: Считал ВСЕ batches, включая:
- `draft` - еще не объявлено
- `matched` - уже сопоставлено
- `closed` - закрыто

**Исправление**: ✅
```typescript
// Было:
const totalDeclaredVolume = batches.reduce((sum, b) => sum + b.heads, 0);

// Стало:
const totalDeclaredVolume = batches
  .filter(b => ['forecast', 'soft_committed', 'confirmed'].includes(b.status))
  .reduce((sum, b) => sum + b.heads, 0);
```

**Логика**: Учитываются только активные статусы batches, которые реально объявлены и доступны для сопоставления.

---

### 2. ❌ By Region - Supply

**Проблема**: Считал ВСЕ batches для supply, включая draft/matched/closed

**Исправление**: ✅
```typescript
// Было:
supply: batches.filter(b => b.region === region).reduce((sum, b) => sum + b.heads, 0),

// Стало:
supply: batches
  .filter(b => b.region === region && ['forecast', 'soft_committed', 'confirmed'].includes(b.status))
  .reduce((sum, b) => sum + b.heads, 0),
```

---

### 3. ⚠️ By Region - Demand

**Проблема**: Считал ВСЕ requests, включая fulfilled (выполненные)

**Исправление**: ✅
```typescript
// Было:
demand: poolRequests.filter(r => r.regions.includes(region))
  .reduce((sum, r) => sum + r.required_volume, 0),

// Стало:
demand: poolRequests
  .filter(r => r.regions.includes(region) && ['submitted', 'matching', 'partial'].includes(r.status))
  .reduce((sum, r) => sum + r.required_volume, 0),
```

**Логика**: Учитываются только активные заявки, которые еще не выполнены полностью.

---

## Корректные метрики (не требовали исправления)

### ✅ Активные фермеры
- Фильтрует по `registration_status === 'active'`
- Корректно

### ✅ Активные МПК
- Фильтрует по `registration_status === 'active'`
- Корректно

### ✅ Активные заявки
- Фильтрует по `['submitted', 'matching', 'partial']`
- Корректно

### ✅ Supply Totals
- Учитывает только `['forecast', 'soft_committed', 'confirmed']`
- Корректно

### ✅ By Month
- Правильно фильтрует статусы для supply и demand
- Корректно

---

## Результат исправлений

После исправлений:
- ✅ **Объявленный объём** показывает только реально объявленные batches
- ✅ **By Region - Supply** показывает только активное предложение
- ✅ **By Region - Demand** показывает только активный спрос
- ✅ **Supply Coverage** рассчитывается корректно (активное предложение / активный спрос)

---

## Источники данных

Все данные берутся из реальных таблиц:
- `farmers` - через `useFarmers()`
- `mpks` - через `useMpks()`
- `batches` - через `useBatches()`
- `purchase_pool_requests` - через `usePoolRequests()`

Данные обновляются в реальном времени через Supabase Realtime subscriptions.

