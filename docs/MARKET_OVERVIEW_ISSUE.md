# Проблема: Market Overview не отображает данные для МПК

## Проблема

Раздел "Market Overview" для МПК показывает нулевые значения:
- Confirmed: 0
- Soft Committed: 0
- Forecast: 0
- "No supply data available for the selected criteria"

## Анализ

### Текущая ситуация

1. **Код запроса** (`src/hooks/useMarketData.ts`):
   ```typescript
   export const useMarketBatches = () => {
     return useQuery({
       queryKey: ['market-batches'],
       queryFn: async () => {
         const { data, error } = await supabase
           .from('batches')
           .select('*')
           .order('target_week', { ascending: true });
         // ...
       },
     });
   };
   ```

2. **RLS политики на таблице `batches`**:
   - ✅ `Farmers can view own batches` - фермеры видят только свои batches
   - ✅ `Admins can view all batches` - админы видят все batches
   - ❌ **НЕТ политики для MPK** - МПК не может видеть batches!

3. **Требования из документации** (`docs/ACCESS_CONTROL.md`):
   - MPK должен видеть: "Aggregated supply (by region, month, readiness, grade) | ✅ Anonymized"
   - MPK НЕ должен видеть: "Individual batch ownership", "Farmer identities"

## Причина

МПК не может получить доступ к таблице `batches` из-за отсутствия RLS политики. Запрос `SELECT * FROM batches` блокируется RLS, потому что:
- МПК не является владельцем batches (не проходит `auth.uid() = user_id`)
- МПК не является админом (не проходит `has_role(auth.uid(), 'admin')`)

## Решение

Нужно создать RLS политику для МПК, которая:
1. ✅ Позволяет МПК видеть batches (анонимизированные)
2. ✅ Скрывает идентифицирующие данные (user_id, batch_number, notes, mpk_interest)
3. ✅ Показывает только агрегированные данные (region, status, grade, heads, target_week)

### Вариант 1: RLS политика с ограниченными полями (рекомендуется)

Создать политику, которая позволяет МПК видеть только определенные поля:
- `id` (для группировки, но не идентифицирует фермера)
- `heads`
- `grade`
- `region`
- `status`
- `target_week`
- `avg_weight` (опционально)
- НЕ показывать: `user_id`, `batch_number`, `notes`, `mpk_interest`, `requires_action`, `action_type`

### Вариант 2: View для анонимизированных данных

Создать view `aggregated_supply` с RLS политикой для МПК.

### Вариант 3: Edge Function

Использовать Supabase Edge Function для агрегации данных.

## Рекомендация

Использовать **Вариант 1** - создать RLS политику с ограниченным SELECT, который скрывает идентифицирующие поля.

