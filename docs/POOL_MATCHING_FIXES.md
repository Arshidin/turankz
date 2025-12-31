# Исправления критических проблем в разделе "Сопоставление пулов"

## Исправленные проблемы

### 1. ✅ Использование `available_heads` вместо `heads`

**Проблема**: Использовался полный `heads` из batch, что могло создать матчинг с объемом больше доступного.

**Исправление**:
- Заменен `useAvailableBatchesForMatching` на `useConfirmedBatches`, который правильно рассчитывает `available_heads`
- Обновлен интерфейс `SupplyBlock` для включения `available_heads` и `matched_heads`
- В `handleProposeMatch` используется `available_heads` вместо `heads`

**Код**:
```typescript
// Используем useConfirmedBatches который рассчитывает available_heads
const { data: confirmedBatches, isLoading: batchesLoading } = useConfirmedBatches();

// В handleProposeMatch используем available_heads
const headsToMatch = Math.min(
  s.available_heads,
  requestRemainingVolume - totalMatched
);
```

---

### 2. ✅ Учет `remaining_volume` заявки

**Проблема**: Не проверялось, можно ли добавить выбранный объем к заявке.

**Исправление**:
- Добавлена проверка `remaining_volume` перед созданием матчинга
- Автоматическое ограничение объема матчинга до `remaining_volume`
- Расчет `selectedHeads` учитывает `remaining_volume`

**Код**:
```typescript
// Calculate actual selected heads respecting remaining_volume
const selectedHeads = useMemo(() => {
  if (!activeRequest) return 0;
  const remainingVolume = activeRequest.required_volume - activeRequest.matched_volume;
  // Don't exceed remaining volume
  return Math.min(selectedHeadsMax, remainingVolume);
}, [selectedHeadsMax, activeRequest]);
```

---

### 3. ✅ Валидация критериев перед созданием

**Проблема**: Можно было создать матчинг с `matchLevel === 'none'`.

**Исправление**:
- Добавлена валидация перед созданием матчинга
- Проверка на batches с `matchLevel === 'none'` (если есть критерии)
- Проверка на batches с `available_heads <= 0`
- Кнопка "Propose Match" блокируется при наличии проблем валидации
- Отображение предупреждений в UI

**Код**:
```typescript
const validationIssues = useMemo(() => {
  if (!activeRequest || selectedSupply.length === 0) return [];
  const issues: string[] = [];
  
  // Check for batches with no match (only if criteria exist)
  if (hasCriteria) {
    const noMatchBatches = selectedSupply.filter(s => s.matchLevel === 'none');
    if (noMatchBatches.length > 0) {
      issues.push(`${noMatchBatches.length} batch(es) have no match with acceptance criteria`);
    }
  }
  
  // Check for batches with no available volume
  const noAvailableBatches = selectedSupply.filter(s => s.available_heads <= 0);
  if (noAvailableBatches.length > 0) {
    issues.push(`${noAvailableBatches.length} batch(es) have no available volume`);
  }
  
  return issues;
}, [selectedSupply, activeRequest, hasCriteria]);
```

---

### 4. ✅ Улучшенное отображение информации

**Добавлено**:
- Отображение `available_heads` в списке batches (например, "150 / 200 avail.")
- Отображение `matched_heads` для batches с существующими матчингами
- Предупреждения о проблемах валидации перед созданием матчинга
- Блокировка кнопки "Propose Match" при наличии проблем

**UI изменения**:
```typescript
// Отображение available_heads
{block.available_heads < block.heads ? (
  <span className="font-medium text-foreground">
    {block.available_heads} / {block.heads} avail.
  </span>
) : (
  <span className="font-medium text-foreground">{block.heads} heads</span>
)}
{block.matched_heads > 0 && (
  <>
    <span>·</span>
    <span className="text-muted-foreground">{block.matched_heads} matched</span>
  </>
)}
```

---

## Логика создания матчинга

### Новый алгоритм:

1. **Валидация**: Проверка на проблемы перед созданием
2. **Расчет объема**: Использование `available_heads` для каждого batch
3. **Ограничение**: Автоматическое ограничение до `remaining_volume` заявки
4. **Создание**: Создание матчингов только для валидных batches с доступным объемом

```typescript
const handleProposeMatch = async () => {
  // ... validation checks ...
  
  // Create matches, respecting both available_heads and remaining_volume
  const matches: Array<{ request_id: string; batch_id: string; heads_matched: number }> = [];
  let totalMatched = 0;
  
  for (const s of selectedSupply) {
    if (totalMatched >= requestRemainingVolume) break;
    
    // Use available_heads, but don't exceed remaining volume
    const headsToMatch = Math.min(
      s.available_heads,
      requestRemainingVolume - totalMatched
    );
    
    if (headsToMatch > 0) {
      matches.push({
        request_id: activeRequest.id,
        batch_id: s.id,
        heads_matched: headsToMatch,
      });
      totalMatched += headsToMatch;
    }
  }
  
  // ... create matches and update request ...
};
```

---

## Результат

После исправлений:
- ✅ Используется `available_heads` вместо `heads`
- ✅ Учитывается `remaining_volume` заявки
- ✅ Валидация критериев перед созданием
- ✅ Предупреждения для пользователя
- ✅ Правильное отображение доступного объема
- ✅ Блокировка создания невалидных матчингов

---

## Тестирование

Для проверки исправлений:
1. Выберите заявку с критериями принятия
2. Выберите batches с разными match levels
3. Проверьте, что отображаются предупреждения для batches с `matchLevel === 'none'`
4. Проверьте, что отображается `available_heads` для batches с существующими матчингами
5. Попробуйте создать матчинг - кнопка должна быть заблокирована при наличии проблем
6. Убедитесь, что объем матчинга не превышает `remaining_volume` заявки

