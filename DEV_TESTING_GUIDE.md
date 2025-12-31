# Руководство по тестированию на dev окружении
**Дата:** 2025-01-XX

---

## 🎯 ЦЕЛЬ

Протестировать все миграции и изменения на dev окружении перед деплоем в production.

---

## 📋 ПРЕДВАРИТЕЛЬНЫЕ ШАГИ

### 1. Подключение к dev БД

**Вариант A: Supabase Dashboard (рекомендуется)**
1. Откройте Supabase Dashboard
2. Выберите ваш проект
3. Перейдите в **SQL Editor**

**Вариант B: psql**
```bash
# Если у вас есть доступ через psql
psql -h your-supabase-host -U postgres -d postgres
```

**Вариант C: Supabase CLI** (если установлен)
```bash
supabase link --project-ref your-project-ref
supabase db reset  # Сброс dev БД (опционально)
```

---

## 🚀 ПРИМЕНЕНИЕ МИГРАЦИЙ

### Шаг 1: Backup (опционально, но рекомендуется)

```sql
-- В Supabase Dashboard → SQL Editor
-- Создать backup основных таблиц
COPY (SELECT * FROM batches) TO STDOUT WITH CSV HEADER;
-- Сохранить результат в файл
```

### Шаг 2: Применить миграции по порядку

**В Supabase Dashboard → SQL Editor:**

1. **Миграция 1: RLS политики**
   - Откройте файл: `supabase/migrations/20250120000001_fix_rls_policies.sql`
   - Скопируйте содержимое
   - Вставьте в SQL Editor
   - Нажмите **Run**
   - ✅ Проверьте: нет ошибок

2. **Миграция 2: Batch status enum** ⚠️
   - Откройте файл: `supabase/migrations/20250120000002_fix_batch_status_enum.sql`
   - Скопируйте содержимое
   - Вставьте в SQL Editor
   - Нажмите **Run**
   - ✅ Проверьте: нет ошибок
   - ⚠️ Эта миграция может занять 1-5 минут

3. **Миграция 3: FSM триггеры**
   - Откройте файл: `supabase/migrations/20250120000003_add_fsm_triggers.sql`
   - Скопируйте содержимое
   - Вставьте в SQL Editor
   - Нажмите **Run**
   - ✅ Проверьте: нет ошибок

4. **Миграция 4: Matching window validation**
   - Откройте файл: `supabase/migrations/20250120000004_add_matching_window_validation.sql`
   - Скопируйте содержимое
   - Вставьте в SQL Editor
   - Нажмите **Run**
   - ✅ Проверьте: нет ошибок

5. **Миграция 5: Performance индексы**
   - Откройте файл: `supabase/migrations/20250120000005_add_performance_indexes.sql`
   - Скопируйте содержимое
   - Вставьте в SQL Editor
   - Нажмите **Run**
   - ✅ Проверьте: нет ошибок
   - ⚠️ Эта миграция может занять 5-15 минут

---

## ✅ ПРОВЕРКА РЕЗУЛЬТАТОВ

### Шаг 1: Запустить скрипт проверки

**В Supabase Dashboard → SQL Editor:**

1. Откройте файл: `test_migrations.sql`
2. Скопируйте содержимое
3. Вставьте в SQL Editor
4. Нажмите **Run**
5. Просмотрите результаты

**Ожидаемые результаты:**
- ✅ Все проверки должны показать "✅"
- ❌ Если есть "❌", проверьте ошибки

### Шаг 2: Тестирование FSM триггеров

**В Supabase Dashboard → SQL Editor:**

1. Откройте файл: `test_fsm_triggers.sql`
2. Скопируйте содержимое
3. Вставьте в SQL Editor
4. Нажмите **Run**
5. Просмотрите результаты в NOTICE сообщениях

**Ожидаемые результаты:**
- ✅ Все валидные переходы должны пройти
- ✅ Все невалидные переходы должны быть заблокированы

---

## 🧪 РУЧНОЕ ТЕСТИРОВАНИЕ

### Тест 1: Создание batch (должен быть draft)

```sql
-- Создать тестовый batch
INSERT INTO batches (
    batch_number, farmer_id, heads, avg_weight, grade, region, 
    status, target_week
) VALUES (
    'TEST-001',
    (SELECT id FROM farmers LIMIT 1),
    10,
    300,
    'A',
    'Almaty',
    DEFAULT,  -- Должен автоматически стать 'draft'
    'Week 1, 2025'
) RETURNING id, status;

-- Проверить статус
-- Ожидается: status = 'draft'
```

### Тест 2: Создание pool request (должен быть draft)

```sql
-- Создать тестовый pool request
INSERT INTO purchase_pool_requests (
    request_number, mpk_id, mpk_name, required_volume, required_grade,
    regions, target_week, status
) VALUES (
    'TEST-REQ-001',
    (SELECT mpk_id FROM mpks LIMIT 1),
    'Test MPK',
    100,
    'A',
    ARRAY['Almaty'],
    'Week 1, 2025',
    'draft'  -- Явно указать draft
) RETURNING id, status;

-- Проверить статус
-- Ожидается: status = 'draft'
```

### Тест 3: Невалидный переход статуса

```sql
-- Попытаться сделать невалидный переход
-- (например, draft → confirmed напрямую)
UPDATE batches 
SET status = 'confirmed' 
WHERE status = 'draft' 
AND id = (SELECT id FROM batches WHERE status = 'draft' LIMIT 1);

-- Ожидается: ОШИБКА
-- "Invalid batch status transition: draft → confirmed"
```

---

## 🌐 ТЕСТИРОВАНИЕ UI

### После применения миграций:

1. **Запустите приложение локально:**
   ```bash
   npm run dev
   ```

2. **Проверьте следующие функции:**

   **Farmer:**
   - [ ] Может войти
   - [ ] Видит свои batches
   - [ ] Может создать batch (проверить статус = draft)
   - [ ] Не видит "Herd Structure" в навигации
   - [ ] Premium UI не показывает total price

   **MPK:**
   - [ ] Может войти
   - [ ] Видит свои requests
   - [ ] Может создать request (проверить статус = draft)
   - [ ] Может submit draft request
   - [ ] Не видит "Market Intent" в Regional Outlook

   **Admin:**
   - [ ] Может войти
   - [ ] Видит всех farmers, MPKs, requests
   - [ ] Может управлять matching windows

   **Observer:**
   - [ ] Видит "Pending Activation" вместо "Observer"
   - [ ] Видит понятные сообщения

---

## 📊 ПРОВЕРКА ПРОИЗВОДИТЕЛЬНОСТИ

### Проверить использование индексов:

```sql
-- Проверить, что запросы используют индексы
EXPLAIN ANALYZE 
SELECT * FROM batches 
WHERE status = 'confirmed';

-- Должно показать: Index Scan using idx_batches_status
```

```sql
EXPLAIN ANALYZE 
SELECT * FROM purchase_pool_requests 
WHERE status = 'submitted';

-- Должно показать: Index Scan using idx_pool_requests_status
```

---

## 🚨 ОБРАБОТКА ОШИБОК

### Если миграция падает:

1. **Проверьте ошибку в SQL Editor**
2. **Проверьте логи в Supabase Dashboard → Logs**
3. **Убедитесь, что предыдущие миграции применены**
4. **Проверьте, нет ли конфликтов с существующими объектами**

### Если FSM триггер блокирует валидный переход:

1. **Проверьте логи ошибки**
2. **Убедитесь, что переход действительно валиден**
3. **Проверьте триггерную функцию**

---

## ✅ КРИТЕРИИ УСПЕХА

Тестирование считается успешным, если:

- ✅ Все 5 миграций применены без ошибок
- ✅ Все проверки в `test_migrations.sql` показывают ✅
- ✅ Все FSM тесты в `test_fsm_triggers.sql` проходят
- ✅ Приложение работает корректно
- ✅ Все UI функции работают
- ✅ Индексы используются в запросах

---

## 📝 ОТЧЕТ О ТЕСТИРОВАНИИ

После тестирования заполните:

- [ ] Все миграции применены: ✅ / ❌
- [ ] Все проверки пройдены: ✅ / ❌
- [ ] FSM триггеры работают: ✅ / ❌
- [ ] UI работает корректно: ✅ / ❌
- [ ] Производительность улучшена: ✅ / ❌
- [ ] **Готово к деплою в production:** ✅ / ❌

**Примечания:**
_________________________________________________
_________________________________________________
_________________________________________________

---

**Дата:** 2025-01-XX  
**Статус:** Готов к тестированию

