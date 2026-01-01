# Руководство по применению миграций в Lovable
**Дата:** 2025-01-22  
**Платформа:** Lovable Cloud + Supabase

---

## Обзор

Проект использует **Lovable Cloud** с **Supabase** в качестве backend. Миграции базы данных применяются через Supabase Dashboard или Supabase CLI.

---

## Применение миграций

### Вариант 1: Через Supabase Dashboard (Рекомендуется)

1. **Откройте Supabase Dashboard:**
   - Перейдите в ваш проект на [supabase.com](https://supabase.com)
   - Выберите ваш проект Turan Standard Pool

2. **Откройте SQL Editor:**
   - В левом меню выберите **SQL Editor**
   - Нажмите **New Query**

3. **Примените миграции по порядку:**

   #### Миграция 1: Enhanced FSM Enforcement
   - Скопируйте содержимое файла: `supabase/migrations/20250122000001_enhance_fsm_enforcement.sql`
   - Вставьте в SQL Editor
   - Нажмите **Run** (или `Cmd/Ctrl + Enter`)
   - Убедитесь, что выполнение успешно

   #### Миграция 2: Transaction Support Functions
   - Скопируйте содержимое файла: `supabase/migrations/20250122000002_transaction_support_functions.sql`
   - Вставьте в SQL Editor
   - Нажмите **Run**
   - Убедитесь, что выполнение успешно

   #### Миграция 3: Reconciliation Functions
   - Скопируйте содержимое файла: `supabase/migrations/20250122000003_reconciliation_functions.sql`
   - Вставьте в SQL Editor
   - Нажмите **Run**
   - Убедитесь, что выполнение успешно

4. **Проверка:**
   - В SQL Editor выполните:
   ```sql
   -- Проверка функций
   SELECT routine_name 
   FROM information_schema.routines 
   WHERE routine_schema = 'public' 
   AND routine_name IN (
     'finalize_matching_with_execution',
     'create_matching_with_updates',
     'detect_missing_executions',
     'run_reconciliation_report'
   );
   ```
   - Должно вернуться 4 функции

   ```sql
   -- Проверка триггеров
   SELECT trigger_name, event_object_table
   FROM information_schema.triggers
   WHERE trigger_schema = 'public'
   AND trigger_name IN (
     'execution_status_validation',
     'matching_status_validation'
   );
   ```
   - Должно вернуться 2 триггера

---

### Вариант 2: Через Supabase CLI (Если установлен)

Если у вас установлен Supabase CLI локально:

```bash
# Перейти в директорию проекта
cd /path/to/turankz

# Применить все миграции
supabase db push

# Или применить конкретную миграцию
supabase migration up 20250122000001_enhance_fsm_enforcement
supabase migration up 20250122000002_transaction_support_functions
supabase migration up 20250122000003_reconciliation_functions
```

**Примечание:** Lovable обычно не требует локальной установки Supabase CLI, так как миграции применяются через Dashboard.

---

## Проверка после применения

### 1. Тест FSM Enforcement

```sql
-- Попытка недопустимого перехода (должна быть заблокирована)
UPDATE batches 
SET status = 'confirmed' 
WHERE status = 'draft' 
LIMIT 1;
-- Ожидается: ERROR: Invalid batch status transition
```

### 2. Тест Transaction Function

```sql
-- Тест финализации matching (замените match_id на реальный)
SELECT * FROM finalize_matching_with_execution(
  'your-match-id-here'::UUID,
  450,  -- base_price_per_kg
  10,   -- standard_premium
  5,    -- predictability_premium
  3,    -- volume_consistency_premium
  2,    -- reliability_premium
  20,   -- total_premium
  470,  -- total_price_per_kg
  NULL, -- premium_breakdown (JSONB)
  'Test finalization', -- note
  'Test Admin' -- performed_by
);
-- Ожидается: success = true, execution_id создан
```

### 3. Тест Reconciliation

```sql
-- Запустить reconciliation report
SELECT * FROM run_reconciliation_report();
-- Ожидается: список проблем (если есть) или пустой результат
```

---

## Важные замечания

### Безопасность
- Все функции созданы с `SECURITY DEFINER`
- RLS policies все еще применяются
- Функции могут быть вызваны только авторизованными пользователями

### Производительность
- Transaction functions выполняются атомарно
- Reconciliation functions могут быть медленными на больших объемах данных
- Рекомендуется запускать reconciliation в нерабочее время

### Откат (Rollback)
Если нужно откатить миграции:

```sql
-- Удалить триггеры
DROP TRIGGER IF EXISTS execution_status_validation ON offtake_executions;
DROP TRIGGER IF EXISTS matching_status_validation ON pool_matches;

-- Удалить функции
DROP FUNCTION IF EXISTS validate_execution_status_transition();
DROP FUNCTION IF EXISTS validate_matching_status_transition();
DROP FUNCTION IF EXISTS finalize_matching_with_execution(...);
DROP FUNCTION IF EXISTS create_matching_with_updates(...);
DROP FUNCTION IF EXISTS detect_missing_executions();
DROP FUNCTION IF EXISTS detect_matched_volume_mismatches();
DROP FUNCTION IF EXISTS detect_request_status_mismatches();
DROP FUNCTION IF EXISTS detect_invalid_execution_matches();
DROP FUNCTION IF EXISTS run_reconciliation_report();
DROP FUNCTION IF EXISTS auto_fix_missing_executions();
DROP FUNCTION IF EXISTS auto_fix_matched_volume_mismatches();
```

**⚠️ Внимание:** Откат миграций может привести к потере данных. Делайте это только в случае крайней необходимости.

---

## Интеграция с Lovable

### Application Code
Application code уже обновлен для использования новых функций:
- `useFinalizeMatching` использует `finalize_matching_with_execution()`
- `useCreateMatching` использует `create_matching_with_updates()`

### Проверка работы
После применения миграций:
1. Протестируйте создание matching через UI
2. Протестируйте финализацию matching через UI
3. Убедитесь, что execution records создаются автоматически
4. Проверьте, что статусы обновляются корректно

---

## Troubleshooting

### Ошибка: "function does not exist"
**Причина:** Миграция не применена  
**Решение:** Примените миграцию через Supabase Dashboard

### Ошибка: "permission denied"
**Причина:** Недостаточно прав  
**Решение:** Убедитесь, что вы используете правильный проект и имеете права администратора

### Ошибка: "trigger already exists"
**Причина:** Миграция уже применена  
**Решение:** Это нормально, миграция использует `DROP TRIGGER IF EXISTS`

### Ошибка: "invalid transition"
**Причина:** FSM триггер блокирует недопустимый переход  
**Решение:** Это ожидаемое поведение. Используйте правильные переходы статусов

---

## Поддержка

Если возникли проблемы:
1. Проверьте логи в Supabase Dashboard → Logs
2. Убедитесь, что все миграции применены в правильном порядке
3. Проверьте, что функции существуют через SQL Editor
4. Проверьте права доступа к таблицам

---

## Следующие шаги

После успешного применения миграций:

1. ✅ Протестируйте создание и финализацию matchings
2. ⏳ Настройте scheduled job для reconciliation (опционально)
3. ⏳ Добавьте мониторинг reconciliation reports
4. ⏳ Настройте алерты для critical issues

---

## Файлы миграций

Все миграции находятся в директории `supabase/migrations/`:

1. `20250122000001_enhance_fsm_enforcement.sql` - FSM валидация
2. `20250122000002_transaction_support_functions.sql` - Transaction functions
3. `20250122000003_reconciliation_functions.sql` - Reconciliation functions

