# Резюме исправлений критических проблем в "Сопоставление пулов"

## ✅ Исправленные критические проблемы

### 1. Использование `available_heads` вместо `heads`

**Было**: Использовался полный `heads` из batch, что могло создать матчинг с объемом больше доступного.

**Стало**: 
- Заменен `useAvailableBatchesForMatching` на `useConfirmedBatches`
- Используется `available_heads` (batch heads - уже сопоставленные heads)
- В UI отображается "150 / 200 avail." для batches с частичным сопоставлением

**Файлы**:
- `src/pages/admin/PoolMatching.tsx` - обновлена логика использования batches

---

### 2. Учет `remaining_volume` заявки

**Было**: Не проверялось, можно ли добавить выбранный объем к заявке.

**Стало**:
- Автоматическое ограничение объема матчинга до `remaining_volume`
- Расчет `selectedHeads` учитывает `remaining_volume`
- В `handleProposeMatch` объем матчинга не превышает `remaining_volume`

**Код**:
```typescript
const selectedHeads = useMemo(() => {
  if (!activeRequest) return 0;
  const remainingVolume = activeRequest.required_volume - activeRequest.matched_volume;
  return Math.min(selectedHeadsMax, remainingVolume);
}, [selectedHeadsMax, activeRequest]);
```

---

### 3. Валидация критериев перед созданием

**Было**: Можно было создать матчинг с `matchLevel === 'none'`.

**Стало**:
- Проверка на batches с `matchLevel === 'none'` (если есть критерии)
- Проверка на batches с `available_heads <= 0`
- Кнопка "Propose Match" блокируется при наличии проблем
- Отображение предупреждений в UI

**UI**:
- Блок предупреждений с перечислением проблем
- Кнопка заблокирована при наличии проблем
- Текст "(Issues must be fixed)" на кнопке

---

### 4. Улучшенное отображение информации

**Добавлено**:
- Отображение `available_heads` в списке batches
- Отображение `matched_heads` для batches с существующими матчингами
- Предупреждения о проблемах валидации
- Блокировка кнопки при наличии проблем

---

## Логика создания матчинга

### Новый алгоритм:

1. **Валидация**: Проверка на проблемы перед созданием
2. **Расчет объема**: Использование `available_heads` для каждого batch
3. **Ограничение**: Автоматическое ограничение до `remaining_volume` заявки
4. **Создание**: Создание матчингов только для валидных batches с доступным объемом

```typescript
// Создание матчингов с учетом available_heads и remaining_volume
for (const s of selectedSupply) {
  if (totalMatched >= requestRemainingVolume) break;
  
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

## Примечание

**Ограничение**: `useConfirmedBatches` возвращает только batches со статусом `confirmed`. Для поддержки `soft_committed` и `forecast` batches потребуется расширение хука или создание нового. Это средняя проблема, не критическая, так как confirmed batches - основной источник для матчинга.

