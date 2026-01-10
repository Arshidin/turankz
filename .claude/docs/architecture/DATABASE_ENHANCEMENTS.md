# Database Enhancements - FSM Enforcement, Transactions, Reconciliation
**Дата:** 2025-01-22  
**Статус:** ✅ Реализовано

---

## Обзор

Созданы три критически важные миграции для обеспечения целостности данных и атомарности операций:

1. **Enhanced FSM Enforcement** - Усиленная валидация переходов статусов на уровне БД
2. **Transaction Support Functions** - Database functions для атомарных multi-step операций
3. **Reconciliation Functions** - Функции для обнаружения и исправления несоответствий

---

## 1. Enhanced FSM Enforcement

### Миграция: `20250122000001_enhance_fsm_enforcement.sql`

### Что добавлено:

#### Execution Status Transition Validation
- Триггер `execution_status_validation` на таблице `offtake_executions`
- Валидирует все переходы статусов execution согласно FSM
- Блокирует недопустимые переходы на уровне БД

**Валидные переходы:**
- `matched → scheduled` (admin)
- `scheduled → delivered` (MPK/admin)
- `scheduled → matched` (admin revert)
- `delivered → confirmed` (admin)
- `delivered → scheduled` (admin revert)
- `confirmed → settled` (admin)
- `confirmed → delivered` (admin revert)
- `settled → closed` (admin)
- `settled → confirmed` (admin revert)

#### Matching Status Transition Validation
- Триггер `matching_status_validation` на таблице `pool_matches`
- Валидирует переходы статусов matching
- `finalized` и `cancelled` являются терминальными состояниями

**Валидные переходы:**
- `active → finalized`
- `active → cancelled`

### Защита:
- ✅ Невозможно обойти FSM правила через прямой SQL
- ✅ Валидация происходит до изменения данных
- ✅ Понятные сообщения об ошибках

---

## 2. Transaction Support Functions

### Миграция: `20250122000002_transaction_support_functions.sql`

### Функции:

#### `finalize_matching_with_execution()`
**Атомарная операция для финализации matching и создания execution:**

**Шаги:**
1. Валидация matching (должен быть в статусе 'active')
2. Обновление matching статуса на 'finalized'
3. Блокировка premiums
4. Создание execution record
5. Логирование активности

**Параметры:**
- `p_match_id` - ID matching
- `p_base_price_per_kg` - Базовая цена
- `p_*_premium` - Различные премии
- `p_total_price_per_kg` - Итоговая цена
- `p_premium_breakdown` - JSON с деталями премий
- `p_note` - Примечание
- `p_performed_by` - Кто выполнил

**Возвращает:**
- `success` - Успех операции
- `matching_id` - ID matching
- `execution_id` - ID созданного execution
- `error_message` - Сообщение об ошибке (если есть)

**Преимущества:**
- ✅ Все операции выполняются атомарно
- ✅ При ошибке все изменения откатываются
- ✅ Невозможно получить частичное состояние

#### `create_matching_with_updates()`
**Атомарная операция для создания matching и обновления связанных статусов:**

**Шаги:**
1. Валидация batch (должен быть 'confirmed' или 'soft_committed')
2. Валидация request (должен быть 'matching' или 'submitted')
3. Создание matching record
4. Обновление batch status на 'matched' (если был 'confirmed')
5. Обновление request `matched_volume`
6. Автоматическое обновление request status (matching → partial/fulfilled)
7. Логирование активности

**Параметры:**
- `p_batch_id` - ID batch
- `p_request_id` - ID request
- `p_heads_matched` - Количество голов
- `p_matching_window_id` - ID matching window (опционально)
- `p_notes` - Примечание
- `p_created_by` - Кто создал

**Возвращает:**
- `success` - Успех операции
- `matching_id` - ID созданного matching
- `error_message` - Сообщение об ошибке (если есть)

**Преимущества:**
- ✅ Matching и все связанные обновления происходят атомарно
- ✅ Автоматическое обновление статусов request
- ✅ Невозможно получить неконсистентное состояние

---

## 3. Reconciliation Functions

### Миграция: `20250122000003_reconciliation_functions.sql`

### Функции обнаружения:

#### `detect_missing_executions()`
**Обнаруживает finalized matchings без execution records**

**Возвращает:**
- `match_id` - ID matching
- `batch_id`, `request_id` - Связанные ID
- `heads_matched` - Количество голов
- `finalized_at` - Дата финализации
- `issue_type` - 'missing_execution'
- `severity` - 'critical'

#### `detect_matched_volume_mismatches()`
**Обнаруживает несоответствия между stored и calculated matched_volume**

**Возвращает:**
- `request_id` - ID request
- `stored_matched_volume` - Хранимое значение
- `calculated_matched_volume` - Рассчитанное значение (сумма matchings)
- `difference` - Разница
- `severity` - 'critical' если разница > 10, иначе 'warning'

#### `detect_request_status_mismatches()`
**Обнаруживает несоответствия между status и matched_volume**

**Возвращает:**
- `request_id` - ID request
- `current_status` - Текущий статус
- `expected_status` - Ожидаемый статус (на основе matched_volume)
- `matched_volume`, `required_volume` - Объемы
- `severity` - 'warning'

#### `detect_invalid_execution_matches()`
**Обнаруживает executions, связанные с cancelled matchings**

**Возвращает:**
- `execution_id` - ID execution
- `match_id` - ID matching
- `execution_status`, `match_status` - Статусы
- `severity` - 'critical'

#### `run_reconciliation_report()`
**Комплексный отчет по всем проверкам**

**Возвращает:**
- `issue_type` - Тип проблемы
- `severity` - Критичность
- `count` - Количество проблем
- `details` - JSONB с деталями

### Функции исправления:

#### `auto_fix_missing_executions()`
**Автоматически создает missing execution records**

**Логика:**
- Находит все finalized matchings без executions
- Создает execution records с правильными данными
- Логирует каждое исправление

**Возвращает:**
- `fixed_count` - Количество исправленных
- `errors` - JSONB с ошибками (если были)

#### `auto_fix_matched_volume_mismatches()`
**Автоматически исправляет matched_volume**

**Логика:**
- Находит requests с несоответствиями
- Пересчитывает matched_volume на основе actual matchings
- Обновляет значение
- Логирует каждое исправление

**Возвращает:**
- `fixed_count` - Количество исправленных
- `errors` - JSONB с ошибками (если были)

---

## Использование

### В Application Code:

#### Использование transaction functions:

```typescript
// Finalize matching with execution (atomic)
const { data, error } = await supabase.rpc('finalize_matching_with_execution', {
  p_match_id: matchId,
  p_base_price_per_kg: 450,
  p_total_premium: 50,
  p_total_price_per_kg: 500,
  p_performed_by: 'Admin User'
});

if (data && data[0].success) {
  // Success - matching finalized and execution created
  const executionId = data[0].execution_id;
} else {
  // Error - all changes rolled back
  const errorMessage = data?.[0]?.error_message;
}

// Create matching with updates (atomic)
const { data, error } = await supabase.rpc('create_matching_with_updates', {
  p_batch_id: batchId,
  p_request_id: requestId,
  p_heads_matched: 100,
  p_created_by: 'Admin User'
});
```

#### Использование reconciliation functions:

```typescript
// Run comprehensive reconciliation report
const { data, error } = await supabase.rpc('run_reconciliation_report');

// Detect specific issues
const { data: missingExecutions } = await supabase.rpc('detect_missing_executions');
const { data: volumeMismatches } = await supabase.rpc('detect_matched_volume_mismatches');

// Auto-fix issues (use with caution)
const { data: fixResult } = await supabase.rpc('auto_fix_missing_executions');
const fixedCount = fixResult?.[0]?.fixed_count;
const errors = fixResult?.[0]?.errors;
```

### Background Jobs:

Рекомендуется создать scheduled job (через Supabase Edge Functions или внешний cron):

```sql
-- Пример: Ежедневная reconciliation проверка
SELECT * FROM public.run_reconciliation_report();

-- Автоматическое исправление (опционально, с осторожностью)
SELECT * FROM public.auto_fix_missing_executions();
SELECT * FROM public.auto_fix_matched_volume_mismatches();
```

---

## Безопасность

Все функции созданы с `SECURITY DEFINER`, что означает:
- Функции выполняются с правами создателя (обычно postgres superuser)
- RLS policies все еще применяются к таблицам
- Функции могут быть вызваны только авторизованными пользователями (через RPC)

---

## Тестирование

### После применения миграций:

1. **FSM Enforcement:**
   ```sql
   -- Должно быть заблокировано
   UPDATE batches SET status = 'confirmed' WHERE status = 'draft';
   -- ERROR: Invalid batch status transition
   ```

2. **Transaction Functions:**
   ```sql
   -- Тест финализации
   SELECT * FROM finalize_matching_with_execution(
     'match-id-here',
     450, 10, 5, 3, 2, 20, 470,
     '{"premiums": [...]}'::jsonb,
     'Test note',
     'Test Admin'
   );
   ```

3. **Reconciliation:**
   ```sql
   -- Запустить проверку
   SELECT * FROM run_reconciliation_report();
   
   -- Проверить конкретные проблемы
   SELECT * FROM detect_missing_executions();
   ```

---

## Миграции

1. `20250122000001_enhance_fsm_enforcement.sql` - FSM валидация
2. `20250122000002_transaction_support_functions.sql` - Transaction functions
3. `20250122000003_reconciliation_functions.sql` - Reconciliation functions

**Применить в порядке:**
```bash
# В Supabase Dashboard или через CLI
supabase db push
```

---

## Преимущества

### До внедрения:
- ❌ FSM правила можно обойти через прямой SQL
- ❌ Multi-step операции могут оставить данные в inconsistent state
- ❌ Нет автоматического обнаружения несоответствий
- ❌ Нет способа исправить partial state failures

### После внедрения:
- ✅ FSM правила защищены на уровне БД
- ✅ Multi-step операции атомарны
- ✅ Автоматическое обнаружение несоответствий
- ✅ Автоматическое исправление (опционально)
- ✅ Полная целостность данных
- ✅ Production-ready reliability

---

## Следующие шаги

1. ✅ Применить миграции в production
2. ⏳ Создать scheduled job для reconciliation (Supabase Edge Functions)
3. ⏳ Интегрировать transaction functions в application code
4. ⏳ Добавить мониторинг reconciliation reports
5. ⏳ Настроить алерты для critical issues

