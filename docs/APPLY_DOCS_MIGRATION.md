# Применение миграции документации в Supabase

## Способ 1: Через Supabase Dashboard (Рекомендуется)

### Шаги:

1. **Откройте Supabase Dashboard**
   - Перейдите на https://app.supabase.com
   - Выберите ваш проект

2. **Откройте SQL Editor**
   - В левом меню выберите "SQL Editor"
   - Нажмите "New query"

3. **Скопируйте содержимое миграции**
   - Откройте файл: `supabase/migrations/20250121000002_create_docs_schema.sql`
   - Скопируйте весь SQL код

4. **Вставьте и выполните**
   - Вставьте SQL в редактор
   - Нажмите "Run" или `Cmd/Ctrl + Enter`

5. **Проверьте результат**
   - Должны быть созданы таблицы:
     - `docs_pages`
     - `docs_navigation`
   - Проверьте в "Table Editor" → "docs_pages" и "docs_navigation"

---

## Способ 2: Через Supabase CLI (если установлен)

```bash
# Если Supabase CLI установлен
supabase db push

# Или применить конкретную миграцию
supabase migration up
```

---

## Способ 3: Через API (программно)

Если нужно применить через API, можно использовать Supabase Management API.

---

## Проверка после применения

### 1. Проверить таблицы

В Supabase Dashboard → Table Editor должны появиться:
- ✅ `docs_pages`
- ✅ `docs_navigation`

### 2. Проверить RLS политики

В Supabase Dashboard → Authentication → Policies:
- ✅ "Public can read published docs pages"
- ✅ "Admins can read all docs pages"
- ✅ "Admins can insert/update/delete docs pages"
- ✅ "Public can read docs navigation"
- ✅ "Admins can manage docs navigation"

### 3. Проверить данные

Должны быть созданы дефолтные страницы:
- `getting-started` (RU/EN)
- `farmer-guide/overview` (RU/EN)
- `mpk-guide/overview` (RU/EN)

И дефолтная навигация для этих страниц.

---

## Если возникли ошибки

### Ошибка: "relation already exists"
- Таблицы уже существуют
- Миграция использует `CREATE TABLE IF NOT EXISTS`, так что это нормально
- Продолжите выполнение

### Ошибка: "policy already exists"
- Политики уже существуют
- Можно удалить старые политики или пропустить их создание
- Или использовать `DROP POLICY IF EXISTS` перед созданием

### Ошибка: "function already exists"
- Функция `update_docs_pages_updated_at` уже существует
- Миграция использует `CREATE OR REPLACE FUNCTION`, так что это нормально

---

## После успешного применения

1. ✅ Таблицы созданы
2. ✅ RLS политики активны
3. ✅ Дефолтные данные вставлены
4. ✅ Можно начинать создавать контент через `/admin/docs`

---

## Следующие шаги

1. Откройте приложение
2. Войдите как админ
3. Перейдите в `/admin/docs`
4. Создайте дополнительные страницы документации
5. Настройте навигацию

