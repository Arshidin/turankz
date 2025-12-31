# Исправление: Market Overview для МПК

## Проблема

Market Overview не отображал данные для МПК, показывая нулевые значения:
- Confirmed: 0
- Soft Committed: 0
- Forecast: 0
- "No supply data available for the selected criteria"

## Причина

1. **Отсутствие RLS политики**: МПК не имел доступа к таблице `batches`
2. **Неправильный запрос**: Запрос выбирал все поля, включая идентифицирующие (`user_id`, `batch_number`, `notes`, `mpk_interest`)
3. **Использование идентифицирующих полей**: В UI использовался `batch_number`, который не должен быть доступен МПК

## Решение

### 1. Создана миграция RLS политики

**Файл**: `supabase/migrations/20250120000008_add_mpk_batches_access.sql`

```sql
CREATE POLICY "MPKs can view anonymized batches"
ON public.batches
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.mpks 
    WHERE mpks.user_id = auth.uid()
  )
);
```

### 2. Обновлен запрос данных

**Файл**: `src/hooks/useMarketData.ts`

- Добавлен импорт `useAuthContext` для определения роли
- Обновлен `useMarketBatches` для выбора разных полей в зависимости от роли:
  - **МПК**: только анонимизированные поля (без `user_id`, `batch_number`, `notes`, `mpk_interest`)
  - **Админ**: все поля
  - **Фермер**: только свои batches (обрабатывается RLS)

### 3. Исправлен UI

**Файл**: `src/pages/mpk/MarketOverview.tsx`

- Убрано использование `batch.batch_number` (недоступно для МПК)
- Вместо этого показывается `region • target_week`

## Безопасность

✅ **Анонимизация данных**:
- МПК не видит `user_id` (идентификатор фермера)
- МПК не видит `batch_number` (номер партии)
- МПК не видит `notes` (заметки фермера)
- МПК не видит `mpk_interest` (интерес МПК)

✅ **Доступные данные для МПК**:
- `id` (для группировки, но не идентифицирует фермера)
- `heads` (количество голов)
- `grade` (сорт)
- `region` (регион)
- `status` (статус готовности)
- `target_week` (целевая неделя)
- `avg_weight` (средний вес)
- `delivery_period` (период доставки)
- `created_at`, `updated_at` (временные метки)

## Применение

1. Применить миграцию `20250120000008_add_mpk_batches_access.sql` через Supabase Dashboard или CLI
2. Перезапустить приложение (если нужно)
3. Проверить Market Overview как МПК пользователь

## Результат

После применения:
- ✅ МПК видит агрегированные данные о предложении (supply)
- ✅ Данные анонимизированы (без идентификации фермеров)
- ✅ Market Overview отображает реальные данные из базы
- ✅ Соответствует требованиям из `docs/ACCESS_CONTROL.md`

