# Исправления средних проблем в разделе "Сопоставление пулов"

## ✅ Исправленные средние проблемы

### 1. Фильтрация по `delivery_period` и `target_week`

**Проблема**: Не учитывались `delivery_period` и `target_week` при фильтрации supply.

**Исправление**:
- Добавлена фильтрация по `delivery_period` с использованием `validateDeliveryPeriodOverlap`
- Добавлено отображение `delivery_period` и `target_week` в UI
- Добавлены поля `target_week` и `delivery_period` в интерфейс `SupplyBlock`

**Код**:
```typescript
// Delivery period matching
const deliveryPeriodCheck = validateDeliveryPeriodOverlap(
  s.delivery_period,
  activeRequest.target_delivery_period
);
const deliveryPeriodMatch = deliveryPeriodCheck.compatible;
```

**UI изменения**:
- В фильтре заявки отображается `delivery_period` и `target_week`
- В списке batches отображается `delivery_period` и `target_week`

---

### 2. Улучшена логика проверки критериев (overlap для age/weight)

**Проблема**: Логика проверки age/weight была слишком строгой (требовала полного вхождения).

**Исправление**:
- Изменена логика `checkBatchMatch` для использования overlap вместо строгого вхождения
- Теперь проверяется пересечение диапазонов (overlap), а не полное вхождение
- Full match: batch полностью входит в criteria
- Partial match: batch пересекается с criteria, но не полностью входит

**Код**:
```typescript
// Age check - use overlap logic (not strict containment)
const batchMin = batch.age_min ?? 0;
const batchMax = batch.age_max ?? Infinity;
const criteriaMin = criteria.age_range_min ?? 0;
const criteriaMax = criteria.age_range_max ?? Infinity;

// Check for overlap: ranges overlap if batchMin <= criteriaMax && batchMax >= criteriaMin
const ageOverlap = batchMin <= criteriaMax && batchMax >= criteriaMin;

// Full match: batch is fully contained within criteria
const ageFullMatch = batch.age_min !== null && batch.age_max !== null &&
  batch.age_min >= criteriaMin && batch.age_max <= criteriaMax;
```

---

### 3. Добавлена фильтрация по readiness

**Проблема**: Нельзя было отфильтровать только confirmed batches.

**Исправление**:
- Добавлен фильтр по readiness (all, confirmed, soft_committed, forecast)
- Фильтр отображается в заголовке "Available Supply Pool"
- Фильтрация применяется к `filteredSupply`

**UI**:
```typescript
<Button
  variant={readinessFilter === 'confirmed' ? 'default' : 'ghost'}
  size="sm"
  onClick={() => setReadinessFilter('confirmed')}
>
  Confirmed
</Button>
```

---

### 4. Скрытие draft заявок

**Проблема**: Статус "draft" отображался в списке заявок, хотя draft заявки не должны участвовать в матчинге.

**Исправление**:
- Добавлена фильтрация: `requests?.filter(request => request.status !== 'draft')`
- Draft заявки не отображаются в списке для сопоставления

---

## Результат

После исправлений:
- ✅ Фильтрация по `delivery_period` работает корректно
- ✅ Отображение `target_week` и `delivery_period` в UI
- ✅ Улучшена логика проверки критериев (overlap вместо строгого вхождения)
- ✅ Добавлена фильтрация по readiness
- ✅ Draft заявки скрыты из списка сопоставления

---

## Примечания

**Оставшиеся средние проблемы** (не критичные, можно улучшить позже):
- Дублирование функционала между "Matching Workspace" и "Pool Overview" - намеренное разделение для разных сценариев использования
- Нет группировки batches по match level - можно добавить позже для улучшения UX
- Target week matching пока не строгий (показывает все batches) - можно добавить строгую проверку позже

