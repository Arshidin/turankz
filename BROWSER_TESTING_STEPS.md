# 🚀 Шаги тестирования в браузере

## 📍 Текущий статус

✅ Браузер открыт на странице Supabase Dashboard  
⚠️ Требуется вход в систему

---

## 🔐 ШАГ 1: Вход в Supabase

1. **Войдите в систему:**
   - Введите ваш email и пароль
   - Или используйте "Continue with GitHub"
   - Нажмите "Sign in"

2. **После входа вы будете перенаправлены в проект:**
   - Project ID: `pyznqeopylcqdjsusyzj`

---

## 📝 ШАГ 2: Открыть SQL Editor

После входа:

1. **В левом меню найдите "SQL Editor"**
   - Или перейдите по прямой ссылке: `https://supabase.com/dashboard/project/pyznqeopylcqdjsusyzj/sql/new`

2. **SQL Editor готов к использованию**

---

## 🗄️ ШАГ 3: Применить миграции

### Миграция 1: RLS политики
1. Откройте файл: `supabase/migrations/20250120000001_fix_rls_policies.sql`
2. Скопируйте весь SQL код
3. Вставьте в SQL Editor
4. Нажмите **Run** (или Ctrl+Enter)
5. ✅ Проверьте: нет ошибок

### Миграция 2: Batch status enum ⚠️
1. Откройте файл: `supabase/migrations/20250120000002_fix_batch_status_enum.sql`
2. Скопируйте весь SQL код
3. Вставьте в SQL Editor
4. Нажмите **Run**
5. ⚠️ Может занять 1-5 минут
6. ✅ Проверьте: нет ошибок

### Миграция 3: FSM триггеры
1. Откройте файл: `supabase/migrations/20250120000003_add_fsm_triggers.sql`
2. Скопируйте весь SQL код
3. Вставьте в SQL Editor
4. Нажмите **Run**
5. ✅ Проверьте: нет ошибок

### Миграция 4: Matching window validation
1. Откройте файл: `supabase/migrations/20250120000004_add_matching_window_validation.sql`
2. Скопируйте весь SQL код
3. Вставьте в SQL Editor
4. Нажмите **Run**
5. ✅ Проверьте: нет ошибок

### Миграция 5: Performance индексы ⚠️
1. Откройте файл: `supabase/migrations/20250120000005_add_performance_indexes.sql`
2. Скопируйте весь SQL код
3. Вставьте в SQL Editor
4. Нажмите **Run**
5. ⚠️ Может занять 5-15 минут
6. ✅ Проверьте: нет ошибок

---

## ✅ ШАГ 4: Проверить результаты

1. **Откройте файл:** `test_migrations.sql`
2. **Скопируйте весь SQL код**
3. **Вставьте в SQL Editor**
4. **Нажмите Run**
5. **Просмотрите результаты:**
   - ✅ Все проверки должны показать "✅ Использует has_role()" или "✅ Функция существует"
   - ❌ Если есть "❌", проверьте ошибки

---

## 🧪 ШАГ 5: Тестировать FSM триггеры

1. **Откройте файл:** `test_fsm_triggers.sql`
2. **Скопируйте весь SQL код**
3. **Вставьте в SQL Editor**
4. **Нажмите Run**
5. **Проверьте NOTICE сообщения:**
   - Должны быть сообщения типа "✅ ТЕСТ X.X ПРОЙДЕН"
   - Не должно быть "❌ ТЕСТ X.X ПРОВАЛЕН"

---

## 📊 ШАГ 6: Проверить индексы

Выполните в SQL Editor:

```sql
-- Проверить количество индексов
SELECT COUNT(*) as index_count
FROM pg_indexes 
WHERE schemaname = 'public' 
AND indexname LIKE 'idx_%';

-- Должно быть ~30 индексов
```

```sql
-- Проверить конкретные индексы
SELECT indexname, tablename
FROM pg_indexes 
WHERE schemaname = 'public' 
AND indexname IN (
    'idx_batches_status',
    'idx_pool_requests_status',
    'idx_matching_windows_start_date'
)
ORDER BY tablename, indexname;
```

---

## ✅ КРИТЕРИИ УСПЕХА

Тестирование успешно, если:

- ✅ Все 5 миграций применены без ошибок
- ✅ Все проверки в `test_migrations.sql` показывают ✅
- ✅ Все FSM тесты проходят
- ✅ Индексы созданы (около 30)

---

## 🚨 ЕСЛИ ЧТО-ТО НЕ ТАК

### Ошибка при применении миграции:
1. Проверьте текст ошибки
2. Убедитесь, что предыдущие миграции применены
3. Проверьте логи в Supabase Dashboard → Logs

### FSM триггер блокирует валидный переход:
1. Проверьте логи ошибки
2. Убедитесь, что переход действительно валиден
3. Проверьте триггерную функцию

---

**Готово! После успешного тестирования можно деплоить в production.**

