# План доработок TURAN Standard Pool
**Дата создания:** 2025-01-XX  
**Приоритет:** Критические блокеры → Средние риски → Полировка

---

## ФАЗА 1: КРИТИЧЕСКИЕ БЛОКЕРЫ (P0) - 2-3 недели

### ✅ Шаг 1.1: Исправление RLS политик (День 1-2)
**Цель:** Закрыть уязвимости доступа к данным

**Задачи:**
- [ ] Найти все RLS политики с `USING (true)` для админских операций
- [ ] Заменить на `USING (public.has_role(auth.uid(), 'admin'))`
- [ ] Протестировать доступ для каждой роли
- [ ] Создать миграцию для исправления

**Файлы:**
- `supabase/migrations/` - найти и исправить политики
- Таблицы: `farmers`, `mpks`, `purchase_pool_requests`, `pool_matches`

---

### ✅ Шаг 1.2: Исправление enum типов (День 2-3)
**Цель:** Привести статусы в БД в соответствие с приложением

**Задачи:**
- [ ] Создать новую миграцию для обновления `batch_status` enum
- [ ] Добавить недостающие статусы: `draft`, `matched`, `closed`
- [ ] Удалить устаревший `delivered`
- [ ] Мигрировать существующие данные
- [ ] Обновить все ссылки на enum

**Файлы:**
- Новая миграция: `supabase/migrations/YYYYMMDD_fix_batch_status_enum.sql`

---

### ✅ Шаг 1.3: Database-level FSM enforcement (День 3-5)
**Цель:** Добавить триггеры для валидации переходов статусов

**Задачи:**
- [ ] Создать функцию `validate_batch_status_transition()`
- [ ] Создать триггер для таблицы `batches`
- [ ] Создать функцию `validate_pool_request_status_transition()`
- [ ] Создать триггер для таблицы `purchase_pool_requests`
- [ ] Протестировать все валидные и невалидные переходы

**Файлы:**
- Новая миграция: `supabase/migrations/YYYYMMDD_add_fsm_triggers.sql`

---

### ✅ Шаг 1.4: Matching Window validation (День 5-6)
**Цель:** Запретить создание matchings вне разрешенных окон

**Задачи:**
- [ ] Создать функцию `validate_matching_window()`
- [ ] Создать триггер для таблицы `pool_matches`
- [ ] Проверить, что matching создается только после `lock_date`
- [ ] Проверить, что window status = `locked` или `closed`

**Файлы:**
- Новая миграция: `supabase/migrations/YYYYMMDD_add_matching_window_validation.sql`

---

### ✅ Шаг 1.5: Pool Request creation fix (День 6-7)
**Цель:** Всегда создавать requests со статусом `draft`

**Задачи:**
- [ ] Изменить `useCreatePoolRequest()` - использовать `draft` вместо `submitted`
- [ ] Обновить UI для показа статуса `draft`
- [ ] Добавить кнопку "Submit" для перехода `draft → submitted`
- [ ] Протестировать создание и отправку requests

**Файлы:**
- `src/hooks/usePoolRequests.ts`
- Компоненты создания pool request

---

## ФАЗА 2: УПРОЩЕНИЕ И УДАЛЕНИЕ (P1) - 1 неделя

### ✅ Шаг 2.1: Удаление Herd Structure из UI (День 8-9)
**Цель:** Убрать из пользовательского интерфейса, оставить только для админа

**Задачи:**
- [ ] Удалить ссылки на Herd Structure из навигации фермера
- [ ] Удалить страницу `/farmer/herd` из роутинга
- [ ] Оставить доступ только для админа (`/admin/herd-structure`)
- [ ] Обновить документацию

**Файлы:**
- `src/App.tsx` - удалить роут
- `src/components/layout/` - удалить из навигации
- Компоненты herd structure - оставить только админские

---

### ✅ Шаг 2.2: Скрытие Market Intent от MPK (День 9-10)
**Цель:** Убрать Market Intent из MPK view, оставить только для админа

**Задачи:**
- [ ] Удалить Market Intent из MPK Market Overview
- [ ] Удалить из MPK навигации
- [ ] Оставить только админский доступ
- [ ] Обновить RLS политики (если нужно)

**Файлы:**
- `src/pages/mpk/MarketOverview.tsx`
- `src/hooks/useMarketIntent.ts` - проверить доступ
- Компоненты market intent

---

### ✅ Шаг 2.3: Упрощение Premium calculation (День 10-11)
**Цель:** Убрать расчет "Total Price", показывать только компоненты

**Задачи:**
- [ ] Удалить `totalPricePerKg` из UI компонентов
- [ ] Показывать только: Base Price + Premiums (список)
- [ ] Добавить дисклеймер о reference pricing
- [ ] Обновить `RoleAwarePremiumBreakdown` компонент

**Файлы:**
- `src/components/premium/RoleAwarePremiumBreakdown.tsx`
- `src/lib/premium-eligibility.ts` - можно оставить расчет, но не показывать в UI

---

### ✅ Шаг 2.4: Упрощение Execution lifecycle (День 11-12)
**Цель:** Упростить до базового flow: matched → delivered → closed

**Задачи:**
- [ ] Обновить `execution-lifecycle.ts` - оставить только 3 статуса
- [ ] Обновить enum в БД (новая миграция)
- [ ] Упростить UI компоненты execution
- [ ] Обновить триггеры и валидацию

**Файлы:**
- `src/lib/execution-lifecycle.ts`
- Новая миграция для enum
- Компоненты execution

---

## ФАЗА 3: УЛУЧШЕНИЯ И ПОЛИРОВКА (P2-P3) - 1 неделя

### ✅ Шаг 3.1: Улучшение Observer role messaging (День 13-14)
**Задачи:**
- [ ] Переименовать "Observer" в "Pending Activation" в UI
- [ ] Улучшить сообщения на экране ожидания
- [ ] Добавить четкие инструкции "Что дальше?"

**Файлы:**
- `src/components/farmer/ObserverDashboard.tsx`
- `src/pages/Overview.tsx`
- Локализация

---

### ✅ Шаг 3.2: Matching Window status simplification (День 14-15)
**Задачи:**
- [ ] Использовать только computed status (удалить manual status)
- [ ] Обновить логику везде, где используется window status
- [ ] Удалить возможность ручного изменения status

**Файлы:**
- `src/lib/matching-window.ts`
- `src/hooks/useMatchingWindows.ts`
- Компоненты matching window

---

### ✅ Шаг 3.3: Добавление индексов (День 15)
**Задачи:**
- [ ] Добавить индекс на `batches.status`
- [ ] Добавить индекс на `pool_matches.matching_window_id`
- [ ] Добавить индекс на `offtake_executions.match_id`
- [ ] Проверить другие часто используемые колонки

**Файлы:**
- Новая миграция: `supabase/migrations/YYYYMMDD_add_performance_indexes.sql`

---

### ✅ Шаг 3.4: Улучшение audit logging (День 16-17)
**Задачи:**
- [ ] Проверить, что все статус-переходы логируются
- [ ] Добавить логирование изменений данных (не только статусов)
- [ ] Создать админский интерфейс для просмотра логов
- [ ] Добавить экспорт логов

**Файлы:**
- `src/pages/admin/ActivityLog.tsx` - улучшить
- Проверить все места, где происходят изменения

---

## ПРИОРИТЕТЫ ВЫПОЛНЕНИЯ

### Неделя 1: Критические блокеры
- День 1-2: RLS политики
- День 2-3: Enum типы
- День 3-5: FSM триггеры
- День 5-6: Matching window validation
- День 6-7: Pool request fix

### Неделя 2: Упрощение
- День 8-9: Herd Structure removal
- День 9-10: Market Intent hiding
- День 10-11: Premium simplification
- День 11-12: Execution simplification

### Неделя 3: Полировка
- День 13-14: Observer messaging
- День 14-15: Window status
- День 15: Индексы
- День 16-17: Audit logging

---

## КРИТЕРИИ ПРИЕМКИ

### Фаза 1 (Критические блокеры)
- [ ] Все RLS политики используют `has_role()` проверку
- [ ] Enum типы соответствуют приложению
- [ ] Триггеры блокируют невалидные переходы
- [ ] Matching нельзя создать вне окна
- [ ] Pool requests создаются как `draft`

### Фаза 2 (Упрощение)
- [ ] Herd Structure не виден фермерам
- [ ] Market Intent не виден MPK
- [ ] Premium UI не показывает total price
- [ ] Execution lifecycle упрощен

### Фаза 3 (Полировка)
- [ ] Observer role переименован
- [ ] Window status только computed
- [ ] Индексы добавлены
- [ ] Audit logging улучшен

---

## НАЧИНАЕМ ВНЕДРЕНИЕ

