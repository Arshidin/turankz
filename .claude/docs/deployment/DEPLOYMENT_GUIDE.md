# Руководство по деплою
**Версия:** 1.0  
**Дата:** 2025-01-XX

---

## 🎯 ОБЗОР

Этот документ описывает процесс деплоя всех изменений из Фаз 1, 2 и 3 в production окружение.

**Изменения включают:**
- 5 новых миграций БД
- 10+ изменений в frontend коде
- Улучшения безопасности, производительности и UX

---

## ⚠️ ВАЖНО ПЕРЕД НАЧАЛОМ

1. **Обязательно протестируйте на dev окружении** (см. `TESTING_PLAN.md`)
2. **Создайте полный backup БД** перед применением миграций
3. **Выберите окно с низкой нагрузкой** для деплоя
4. **Уведомите команду** о плановом деплое

---

## 📋 ПРЕДВАРИТЕЛЬНЫЕ ШАГИ

### Шаг 1: Backup БД

```bash
# Supabase CLI
supabase db dump -f backup_$(date +%Y%m%d_%H%M%S).sql

# Или через pg_dump
pg_dump -h your-db-host -U your-user -d your-db > backup_$(date +%Y%m%d_%H%M%S).sql
```

**Проверьте:**
- [ ] Backup файл создан
- [ ] Размер файла разумный (не 0 байт)
- [ ] Backup сохранен в безопасном месте

---

### Шаг 2: Проверка окружения

**Убедитесь, что:**
- [ ] Dev окружение протестировано
- [ ] Все тесты пройдены
- [ ] Нет незавершенных миграций
- [ ] Версия кода актуальна

---

## 🚀 ПРОЦЕСС ДЕПЛОЯ

### Этап 1: Деплой миграций БД

**Порядок применения миграций (КРИТИЧНО!):**

1. **RLS политики** (`20250120000001_fix_rls_policies.sql`)
   - ⚠️ Может потребовать downtime (несколько секунд)
   - Применяется быстро

2. **Batch status enum** (`20250120000002_fix_batch_status_enum.sql`)
   - ⚠️ **ТРЕБУЕТ DOWNTIME** (1-5 минут)
   - Создает новый enum, мигрирует данные
   - Нельзя прерывать!

3. **FSM триггеры** (`20250120000003_add_fsm_triggers.sql`)
   - Применяется быстро
   - Не требует downtime

4. **Matching window validation** (`20250120000004_add_matching_window_validation.sql`)
   - Применяется быстро
   - Не требует downtime

5. **Performance индексы** (`20250120000005_add_performance_indexes.sql`)
   - ⚠️ Может занять время (5-15 минут)
   - Можно применять без downtime (CREATE INDEX CONCURRENTLY)
   - Но мы используем обычные индексы для простоты

---

### Этап 2: Применение миграций

#### Вариант A: Supabase CLI (рекомендуется)

```bash
# Перейти в директорию проекта
cd /path/to/turankz

# Проверить подключение
supabase status

# Применить миграции
supabase db push

# Или применить конкретные миграции
supabase migration up
```

#### Вариант B: Ручное применение через psql

```bash
# Подключиться к production БД
psql -h your-production-host -U your-user -d your-db

# Применить миграции по порядку
\i supabase/migrations/20250120000001_fix_rls_policies.sql
\i supabase/migrations/20250120000002_fix_batch_status_enum.sql
\i supabase/migrations/20250120000003_add_fsm_triggers.sql
\i supabase/migrations/20250120000004_add_matching_window_validation.sql
\i supabase/migrations/20250120000005_add_performance_indexes.sql
```

#### Вариант C: Supabase Dashboard

1. Открыть Supabase Dashboard
2. Перейти в Database → Migrations
3. Загрузить каждую миграцию по порядку
4. Применить их последовательно

---

### Этап 3: Проверка миграций

После применения каждой миграции проверьте:

**Миграция 1 (RLS):**
```sql
-- Проверить, что политики созданы
SELECT policyname, tablename 
FROM pg_policies 
WHERE schemaname = 'public' 
AND policyname LIKE '%Admins can%';

-- Проверить, что has_role используется
SELECT pg_get_functiondef(oid) 
FROM pg_proc 
WHERE proname = 'has_role';
```

**Миграция 2 (Enum):**
```sql
-- Проверить enum значения
SELECT unnest(enum_range(NULL::batch_status));

-- Проверить, что нет batches с 'delivered'
SELECT COUNT(*) FROM batches WHERE status::text = 'delivered';
-- Должно быть 0

-- Проверить default
SELECT column_default 
FROM information_schema.columns 
WHERE table_name = 'batches' AND column_name = 'status';
-- Должно быть 'draft'::batch_status
```

**Миграция 3 (FSM триггеры):**
```sql
-- Проверить функции
SELECT proname FROM pg_proc WHERE proname LIKE 'validate_%_status_transition';

-- Проверить триггеры
SELECT tgname, tgrelid::regclass 
FROM pg_trigger 
WHERE tgname LIKE '%_status_validation';
```

**Миграция 4 (Matching window):**
```sql
-- Проверить функцию
SELECT proname FROM pg_proc WHERE proname = 'validate_matching_window';

-- Проверить триггер
SELECT tgname FROM pg_trigger WHERE tgname = 'matching_window_validation';
```

**Миграция 5 (Индексы):**
```sql
-- Проверить индексы
SELECT indexname, tablename 
FROM pg_indexes 
WHERE schemaname = 'public' 
AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;
```

---

### Этап 4: Деплой frontend кода

**Если используете Vercel/Netlify:**
```bash
# Push в main branch автоматически деплоит
git push origin main
```

**Если используете ручной деплой:**
```bash
# Build
npm run build

# Deploy
# (зависит от вашего hosting провайдера)
```

**Проверьте:**
- [ ] Build успешен
- [ ] Нет ошибок компиляции
- [ ] Приложение деплоится корректно

---

## ✅ ПОСТ-ДЕПЛОЙ ПРОВЕРКИ

### Проверка 1: Приложение работает

- [ ] Приложение доступно
- [ ] Нет ошибок 500
- [ ] Страницы загружаются
- [ ] Нет ошибок в консоли браузера

### Проверка 2: Функциональность

**Farmer:**
- [ ] Может войти
- [ ] Видит свои batches
- [ ] Может создать batch (статус = draft)
- [ ] Не видит Herd Structure в навигации
- [ ] Premium UI не показывает total price

**MPK:**
- [ ] Может войти
- [ ] Видит свои requests
- [ ] Может создать request (статус = draft)
- [ ] Может submit draft request
- [ ] Не видит Market Intent в Regional Outlook

**Admin:**
- [ ] Может войти
- [ ] Видит всех farmers, MPKs, requests
- [ ] Может управлять matching windows
- [ ] Может видеть activity logs

**Observer:**
- [ ] Видит "Pending Activation" вместо "Observer"
- [ ] Видит понятные сообщения об активации

### Проверка 3: Производительность

- [ ] Запросы выполняются быстро
- [ ] Нет медленных запросов в логах
- [ ] Индексы используются (проверить EXPLAIN)

---

## 🚨 ОБРАБОТКА ОШИБОК

### Если миграция 2 (enum) падает:

**Проблема:** Enum миграция требует downtime и может упасть

**Решение:**
1. Проверить, нет ли активных транзакций
2. Убедиться, что нет batches с неожиданными статусами
3. Применить миграцию вручную с проверками

**Откат:**
```sql
-- Если миграция началась но не завершилась
-- Восстановить из backup
```

### Если RLS политики блокируют доступ:

**Проблема:** После миграции 1 пользователи не могут войти

**Решение:**
1. Проверить, что функция `has_role()` работает
2. Проверить, что пользователи имеют правильные роли в `user_roles`
3. Временно отключить RLS для диагностики (НЕ в production!)

### Если FSM триггеры блокируют валидные переходы:

**Проблема:** Валидные переходы статусов блокируются

**Решение:**
1. Проверить логи ошибок
2. Убедиться, что переход действительно валиден
3. Проверить триггерную функцию

---

## 📊 МОНИТОРИНГ ПОСЛЕ ДЕПЛОЯ

### Первые 24 часа:

- [ ] Мониторить ошибки в логах
- [ ] Проверять производительность запросов
- [ ] Собирать обратную связь от пользователей
- [ ] Проверять, что все функции работают

### Метрики для отслеживания:

- Количество ошибок 500
- Время выполнения запросов
- Количество активных пользователей
- Количество созданных batches/requests

---

## 🔄 ПЛАН ОТКАТА

Если что-то пошло не так:

### Быстрый откат (если миграции еще не применены):

```bash
# Откатить git изменения
git revert HEAD

# Откатить frontend деплой
# (зависит от провайдера)
```

### Полный откат (если миграции применены):

1. **Остановить приложение**
2. **Восстановить БД из backup:**
   ```bash
   psql -h your-host -U your-user -d your-db < backup_file.sql
   ```
3. **Откатить код:**
   ```bash
   git revert HEAD
   git push origin main
   ```
4. **Перезапустить приложение**

---

## ✅ КРИТЕРИИ УСПЕШНОГО ДЕПЛОЯ

Деплой считается успешным, если:

- ✅ Все миграции применены без ошибок
- ✅ Приложение работает корректно
- ✅ Все функции доступны
- ✅ Нет критических ошибок
- ✅ Производительность в норме
- ✅ Пользователи могут работать

---

## 📞 КОНТАКТЫ

**В случае проблем:**
- Проверить логи: `supabase logs` или dashboard
- Проверить мониторинг: Supabase Dashboard → Database → Logs
- Связаться с командой разработки

---

**Дата создания:** 2025-01-XX  
**Последнее обновление:** 2025-01-XX  
**Статус:** Готов к деплою

