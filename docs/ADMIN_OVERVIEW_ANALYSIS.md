# Анализ логики и корректности данных в админ-панели "Обзор платформы"

## Источники данных

Все данные берутся из реальных таблиц базы данных через хуки:
- `useFarmers()` - таблица `farmers`
- `useMpks()` - таблица `mpks`
- `useBatches()` - таблица `batches`
- `usePoolRequests()` - таблица `purchase_pool_requests`

## Анализ метрик

### 1. Активные фермеры (Active Farmers)

**Код**: `src/pages/Overview.tsx:146`
```typescript
const activeFarmers = farmers.filter(f => f.registration_status === 'active').length;
```

**Логика**: ✅ **КОРРЕКТНО**
- Фильтрует фермеров по `registration_status === 'active'`
- Показывает только верифицированных и активных фермеров

---

### 2. Активные МПК (Active MPKs)

**Код**: `src/pages/Overview.tsx:147`
```typescript
const activeMpks = mpks.filter(m => m.registration_status === 'active').length;
```

**Логика**: ✅ **КОРРЕКТНО**
- Фильтрует МПК по `registration_status === 'active'`
- Показывает только верифицированные и активные МПК

---

### 3. Объявленный объём (Declared Volume)

**Код**: `src/pages/Overview.tsx:148`
```typescript
const totalDeclaredVolume = batches.reduce((sum, b) => sum + b.heads, 0);
```

**Проблема**: ❌ **НЕКОРРЕКТНО**

**Текущая логика**: Считает ВСЕ batches, включая:
- `draft` - еще не объявлено (не должно учитываться)
- `matched` - уже сопоставлено (не должно учитываться в "объявленном")
- `closed` - закрыто (не должно учитываться)

**Правильная логика**: Должны учитываться только активные статусы:
- `forecast` - прогноз
- `soft_committed` - мягкая приверженность
- `confirmed` - подтверждено

**Исправление**:
```typescript
const totalDeclaredVolume = batches
  .filter(b => ['forecast', 'soft_committed', 'confirmed'].includes(b.status))
  .reduce((sum, b) => sum + b.heads, 0);
```

---

### 4. Активные заявки (Active Applications)

**Код**: `src/pages/Overview.tsx:149`
```typescript
const activePoolRequests = poolRequests.filter(r => 
  r.status === 'submitted' || r.status === 'matching' || r.status === 'partial'
).length;
```

**Логика**: ✅ **КОРРЕКТНО**
- Фильтрует только активные статусы заявок
- Не включает `draft` (еще не подана)
- Не включает `fulfilled` (выполнена)
- Не включает `cancelled` (отменена)
- Не включает `closed` (закрыта)

---

## Анализ Supply vs Demand

### Supply Totals

**Код**: `src/pages/Overview.tsx:152-156`
```typescript
const supplyTotals = {
  forecast: batches.filter(b => b.status === 'forecast').reduce((sum, b) => sum + b.heads, 0),
  softCommitted: batches.filter(b => b.status === 'soft_committed').reduce((sum, b) => sum + b.heads, 0),
  confirmed: batches.filter(b => b.status === 'confirmed').reduce((sum, b) => sum + b.heads, 0),
};
```

**Логика**: ✅ **КОРРЕКТНО**
- Учитывает только активные статусы (forecast, soft_committed, confirmed)
- Не включает draft, matched, closed

---

### Demand Totals

**Код**: `src/pages/Overview.tsx:159-163`
```typescript
const demandTotals = {
  submitted: poolRequests.filter(r => r.status === 'submitted' || r.status === 'matching')
    .reduce((sum, r) => sum + r.required_volume, 0),
  partial: poolRequests.filter(r => r.status === 'partial')
    .reduce((sum, r) => sum + r.required_volume, 0),
  fulfilled: poolRequests.filter(r => r.status === 'fulfilled')
    .reduce((sum, r) => sum + r.required_volume, 0),
};
```

**Логика**: ⚠️ **ЧАСТИЧНО КОРРЕКТНО**

**Проблемы**:
1. `submitted` включает и `submitted` и `matching` - это правильно
2. `fulfilled` включает выполненные заявки - это может быть неправильно, так как они уже выполнены и не должны учитываться в "активном спросе"

**Рекомендация**: Для "активного спроса" не учитывать `fulfilled`:
```typescript
const demandTotals = {
  submitted: poolRequests.filter(r => r.status === 'submitted' || r.status === 'matching')
    .reduce((sum, r) => sum + r.required_volume, 0),
  partial: poolRequests.filter(r => r.status === 'partial')
    .reduce((sum, r) => sum + r.required_volume, 0),
  fulfilled: poolRequests.filter(r => r.status === 'fulfilled')
    .reduce((sum, r) => sum + r.required_volume, 0), // Для истории, но не для активного спроса
};
```

---

### By Region

**Код**: `src/pages/Overview.tsx:166-171`
```typescript
const regions = [...new Set([...batches.map(b => b.region), ...poolRequests.flatMap(r => r.regions)])];
const byRegion = regions.map(region => ({
  region,
  supply: batches.filter(b => b.region === region).reduce((sum, b) => sum + b.heads, 0),
  demand: poolRequests.filter(r => r.regions.includes(region)).reduce((sum, r) => sum + r.required_volume, 0),
})).filter(r => r.supply > 0 || r.demand > 0);
```

**Проблема**: ❌ **НЕКОРРЕКТНО**

**Текущая логика**: Считает ВСЕ batches для supply, включая:
- `draft` - еще не объявлено
- `matched` - уже сопоставлено
- `closed` - закрыто

**Правильная логика**: Должны учитываться только активные статусы:
```typescript
const byRegion = regions.map(region => ({
  region,
  supply: batches
    .filter(b => b.region === region && ['forecast', 'soft_committed', 'confirmed'].includes(b.status))
    .reduce((sum, b) => sum + b.heads, 0),
  demand: poolRequests
    .filter(r => r.regions.includes(region) && ['submitted', 'matching', 'partial'].includes(r.status))
    .reduce((sum, r) => sum + r.required_volume, 0),
})).filter(r => r.supply > 0 || r.demand > 0);
```

---

### By Month

**Код**: `src/pages/Overview.tsx:174-217`

**Логика**: ✅ **КОРРЕКТНО**
- Для supply учитывает только `forecast`, `soft_committed`, `confirmed`
- Для demand учитывает правильные статусы

---

## Итоговые проблемы

### Критические проблемы:

1. ❌ **totalDeclaredVolume** - считает все batches, включая draft/matched/closed
2. ❌ **byRegion.supply** - считает все batches, включая draft/matched/closed

### Рекомендации:

1. ✅ Исправить `totalDeclaredVolume` - учитывать только активные статусы
2. ✅ Исправить `byRegion.supply` - учитывать только активные статусы
3. ⚠️ Рассмотреть исключение `fulfilled` из активного спроса (demand)

