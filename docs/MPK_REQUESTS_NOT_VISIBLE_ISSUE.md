# Проблема: МПК не видит созданную заявку

## Проблема

После создания Pool Request МПК не видит у себя в ЛК данную заявку.

## Анализ

### Логика фильтрации в PurchasePoolRequests.tsx

**Файл**: `src/pages/mpk/PurchasePoolRequests.tsx`

```typescript
// Filter requests: only show requests belonging to current MPK
const filteredRequests = useMemo(() => {
  if (!currentMpkData?.mpk_id) return [];
  return requests?.filter(r => r.mpk_id === currentMpkData.mpk_id) || [];
}, [requests, currentMpkData?.mpk_id]);

// Filter out cancelled requests from main view
const activeRequests = useMemo(() => 
  filteredRequests.filter(r => r.status !== 'cancelled'),
  [filteredRequests]
);
```

### Возможные причины

1. **Несоответствие `mpk_id`**:
   - `currentMpkData?.mpk_id` может не совпадать с `request.mpk_id`
   - Возможно используется `id` вместо `mpk_id`

2. **RLS политика**:
   - RLS политика может блокировать доступ к заявке
   - Проверить миграцию `20250120000006_fix_mpk_requests_rls.sql`

3. **Статус заявки**:
   - Заявка создается со статусом `'draft'`
   - Фильтр `activeRequests` исключает только `'cancelled'`, поэтому `'draft'` должна отображаться

4. **Проблема с `useCurrentMpk`**:
   - `currentMpkData` может быть `undefined` или `null`
   - `mpk_id` может быть не загружен

## Решение

Нужно проверить:
1. Что `mpk_id` в созданной заявке совпадает с `currentMpkData.mpk_id`
2. Что RLS политика позволяет МПК видеть свои заявки
3. Что `useCurrentMpk` правильно загружает данные

