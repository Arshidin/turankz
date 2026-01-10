# План тестирования перед деплоем
**Дата:** 2025-01-XX

---

## 🎯 ЦЕЛЬ ТЕСТИРОВАНИЯ

Проверить все изменения перед деплоем в production:
- ✅ Миграции применяются без ошибок
- ✅ RLS политики работают корректно
- ✅ FSM триггеры блокируют невалидные переходы
- ✅ UI изменения работают правильно
- ✅ Производительность улучшена

---

## 📋 ПРЕДВАРИТЕЛЬНЫЕ ПРОВЕРКИ

### 1. Проверка миграций (SQL синтаксис)
- [ ] Все миграции имеют правильные имена (порядок важен)
- [ ] SQL синтаксис корректен
- [ ] Нет конфликтов с существующими объектами

**Порядок миграций:**
1. `20250120000001_fix_rls_policies.sql` - RLS политики
2. `20250120000002_fix_batch_status_enum.sql` - Enum исправление
3. `20250120000003_add_fsm_triggers.sql` - FSM триггеры
4. `20250120000004_add_matching_window_validation.sql` - Matching window validation
5. `20250120000005_add_performance_indexes.sql` - Индексы

### 2. Резервное копирование
- [ ] Создать полный backup БД перед применением миграций
- [ ] Сохранить backup в безопасном месте
- [ ] Проверить, что backup можно восстановить

---

## 🧪 ТЕСТИРОВАНИЕ НА DEV ОКРУЖЕНИИ

### Тест 1: Применение миграций

**Шаги:**
1. Подключиться к dev БД
2. Применить миграции по порядку
3. Проверить, что нет ошибок

**Ожидаемый результат:**
- ✅ Все миграции применяются успешно
- ✅ Нет ошибок SQL
- ✅ Все объекты созданы/изменены

**Команды:**
```bash
# Если используете Supabase CLI
supabase db reset  # Сброс dev БД
supabase migration up  # Применить все миграции

# Или вручную через psql
psql -d your_dev_db -f supabase/migrations/20250120000001_fix_rls_policies.sql
psql -d your_dev_db -f supabase/migrations/20250120000002_fix_batch_status_enum.sql
# ... и т.д.
```

---

### Тест 2: RLS политики

**Тест 2.1: Farmer не может видеть других фермеров**
- [ ] Войти как farmer (не admin)
- [ ] Попытаться получить список всех farmers
- [ ] Ожидается: видит только себя

**Тест 2.2: MPK не может видеть всех requests**
- [ ] Войти как MPK
- [ ] Попытаться получить список всех pool requests
- [ ] Ожидается: видит только свои requests

**Тест 2.3: Admin может видеть все**
- [ ] Войти как admin
- [ ] Проверить доступ к:
  - [ ] Все farmers
  - [ ] Все MPKs
  - [ ] Все pool requests
  - [ ] Все pool matches
  - [ ] Все activity logs

**Тест 2.4: Non-admin не может изменять админские данные**
- [ ] Войти как farmer
- [ ] Попытаться изменить farmer grading
- [ ] Ожидается: ошибка доступа

---

### Тест 3: Batch Status Enum

**Тест 3.1: Новые batches создаются как 'draft'**
- [ ] Создать новый batch
- [ ] Проверить статус в БД
- [ ] Ожидается: статус = 'draft'

**Тест 3.2: Старые batches с 'delivered' мигрированы**
- [ ] Проверить, что нет batches со статусом 'delivered'
- [ ] Проверить, что старые 'delivered' стали 'closed'
- [ ] Ожидается: все batches имеют валидные статусы

**Тест 3.3: Enum содержит правильные значения**
- [ ] Проверить enum в БД:
  ```sql
  SELECT unnest(enum_range(NULL::batch_status));
  ```
- [ ] Ожидается: draft, forecast, soft_committed, confirmed, matched, closed

---

### Тест 4: FSM триггеры

**Тест 4.1: Валидные переходы batch status**
- [ ] draft → forecast ✅
- [ ] forecast → soft_committed ✅
- [ ] soft_committed → confirmed ✅
- [ ] confirmed → matched ✅
- [ ] matched → closed ✅
- [ ] confirmed → closed ✅ (admin)

**Тест 4.2: Невалидные переходы batch status**
- [ ] draft → confirmed ❌ (должна быть ошибка)
- [ ] confirmed → draft ❌ (должна быть ошибка)
- [ ] closed → confirmed ❌ (должна быть ошибка)

**Тест 4.3: Валидные переходы pool request status**
- [ ] draft → submitted ✅
- [ ] submitted → matching ✅
- [ ] matching → partial ✅
- [ ] partial → fulfilled ✅
- [ ] fulfilled → closed ✅

**Тест 4.4: Невалидные переходы pool request status**
- [ ] submitted → draft ❌ (должна быть ошибка)
- [ ] fulfilled → matching ❌ (должна быть ошибка)
- [ ] closed → fulfilled ❌ (должна быть ошибка)

**SQL для тестирования:**
```sql
-- Тест невалидного перехода
UPDATE batches SET status = 'confirmed' WHERE status = 'draft' AND id = 'test-id';
-- Ожидается: ERROR: Invalid batch status transition
```

---

### Тест 5: Matching Window Validation

**Тест 5.1: Matching нельзя создать в 'upcoming' окне**
- [ ] Создать matching window со статусом 'upcoming'
- [ ] Попытаться создать matching для этого окна
- [ ] Ожидается: ошибка валидации

**Тест 5.2: Matching нельзя создать в 'active' окне**
- [ ] Создать matching window со статусом 'active'
- [ ] Попытаться создать matching для этого окна
- [ ] Ожидается: ошибка валидации

**Тест 5.3: Matching можно создать в 'locked' окне**
- [ ] Создать matching window со статусом 'locked'
- [ ] Установить lock_date <= CURRENT_DATE
- [ ] Попытаться создать matching
- [ ] Ожидается: успех

**Тест 5.4: Matching нельзя создать до lock_date**
- [ ] Создать matching window с lock_date в будущем
- [ ] Попытаться создать matching
- [ ] Ожидается: ошибка валидации

---

### Тест 6: Pool Request Creation

**Тест 6.1: Новые requests создаются как 'draft'**
- [ ] Создать новый pool request через UI
- [ ] Проверить статус в БД
- [ ] Ожидается: статус = 'draft'

**Тест 6.2: Submit draft request**
- [ ] Создать draft request
- [ ] Нажать "Submit Request"
- [ ] Проверить статус
- [ ] Ожидается: статус = 'submitted'

**Тест 6.3: UI показывает правильные кнопки**
- [ ] Draft request показывает "Edit" и "Submit"
- [ ] Submitted request не показывает "Edit"
- [ ] Ожидается: правильные действия доступны

---

### Тест 7: UI изменения

**Тест 7.1: Herd Structure удален из farmer UI**
- [ ] Войти как farmer
- [ ] Проверить навигацию
- [ ] Ожидается: нет пункта "Herd Structure"

**Тест 7.2: Market Intent скрыт от MPK**
- [ ] Войти как MPK
- [ ] Открыть Regional Outlook
- [ ] Ожидается: нет вкладки "Market Intent"

**Тест 7.3: Premium UI не показывает total price**
- [ ] Открыть batch detail с premium breakdown
- [ ] Проверить отображение
- [ ] Ожидается: нет строки "Indicative Price" / "Total Price"
- [ ] Ожидается: есть дисклеймер о reference pricing

**Тест 7.4: Observer messaging улучшен**
- [ ] Войти как observer (pending activation)
- [ ] Проверить все сообщения
- [ ] Ожидается: "Pending Activation" вместо "Observer"
- [ ] Ожидается: понятные сообщения об активации

---

### Тест 8: Производительность

**Тест 8.1: Индексы созданы**
- [ ] Проверить индексы в БД:
  ```sql
  SELECT indexname, tablename 
  FROM pg_indexes 
  WHERE schemaname = 'public' 
  AND indexname LIKE 'idx_%';
  ```
- [ ] Ожидается: все индексы из миграции созданы

**Тест 8.2: Запросы используют индексы**
- [ ] Выполнить EXPLAIN ANALYZE для частых запросов
- [ ] Проверить, что используются индексы
- [ ] Ожидается: Index Scan вместо Seq Scan

**Примеры запросов для тестирования:**
```sql
-- Должен использовать idx_batches_status
EXPLAIN ANALYZE SELECT * FROM batches WHERE status = 'confirmed';

-- Должен использовать idx_pool_requests_status
EXPLAIN ANALYZE SELECT * FROM purchase_pool_requests WHERE status = 'submitted';

-- Должен использовать idx_matching_windows_start_date
EXPLAIN ANALYZE SELECT * FROM matching_windows WHERE start_date >= CURRENT_DATE;
```

---

## 🚨 КРИТИЧЕСКИЕ ПРОВЕРКИ

### Проверка 1: Нет потери данных
- [ ] Все существующие batches сохранены
- [ ] Все существующие pool requests сохранены
- [ ] Все существующие matches сохранены
- [ ] Статусы мигрированы корректно (delivered → closed)

### Проверка 2: Приложение работает
- [ ] Приложение запускается без ошибок
- [ ] Все страницы загружаются
- [ ] Нет ошибок в консоли браузера
- [ ] Нет ошибок в логах сервера

### Проверка 3: Все роли работают
- [ ] Farmer может работать со своими batches
- [ ] MPK может работать со своими requests
- [ ] Admin может управлять системой
- [ ] Observer видит правильные сообщения

---

## 📝 ЧЕКЛИСТ ПЕРЕД ДЕПЛОЕМ

- [ ] Все миграции протестированы на dev
- [ ] Все тесты пройдены успешно
- [ ] Backup БД создан
- [ ] План отката подготовлен
- [ ] Команда уведомлена о деплое
- [ ] Окно для деплоя выбрано (низкая нагрузка)

---

## 🔄 ПЛАН ОТКАТА

Если что-то пойдет не так:

1. **Немедленно остановить деплой**
2. **Восстановить backup БД**
3. **Откатить изменения в коде (git revert)**
4. **Проанализировать ошибки**
5. **Исправить проблемы**
6. **Повторить тестирование**

---

## ✅ КРИТЕРИИ УСПЕХА

Деплой считается успешным, если:
- ✅ Все миграции применены без ошибок
- ✅ Приложение работает корректно
- ✅ Все тесты пройдены
- ✅ Производительность улучшена
- ✅ Нет ошибок в логах

---

**Дата создания:** 2025-01-XX  
**Статус:** Готов к тестированию

