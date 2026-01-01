# Модель данных и безопасности

## Обзор

Этот раздел документирует архитектуру безопасности, паттерны доступа к данным и механизмы аудита платформы Turan Standard Pool.

---

## Row Level Security (RLS)

### Политики RLS

#### Таблица Pool Matches

**Фермеры:**
- SELECT: Сопоставления только для собственных партий (анонимизированные - без идентификатора МПК)
  - Политика: `"Farmers can view own batch matchings"`
  - Может видеть: объем сопоставления, дата сопоставления, целевая неделя, требуемый сорт
  - Не может видеть: идентификатор МПК, детали заявки, сопоставления других фермеров

**МПК:**
- SELECT: Сопоставления для собственных заявок (анонимизированные - без идентификатора фермера)
  - Политика: `"MPKs can view own request matches"`

**Администраторы:**
- SELECT/INSERT/UPDATE/DELETE: Все сопоставления (`has_role(auth.uid(), 'admin')`)

#### Таблица Batches

**Фермеры:**
- SELECT: Только собственные партии (`auth.uid() = user_id`)
- INSERT: Только собственные партии
- UPDATE: Только собственные партии
- DELETE: Только собственные партии

**МПК:**
- SELECT: Все партии (анонимизированные - уровень приложения фильтрует поля)
  - Политика: `"MPKs can view anonymized batches"`
  - Приложение должно исключать: `user_id`, `batch_number`, `notes`, `mpk_interest`
  - Приложение включает: `id`, `heads`, `grade`, `region`, `status`, `target_week`, `avg_weight`

**Администраторы:**
- SELECT: Все партии (`has_role(auth.uid(), 'admin')`)
- UPDATE: Все партии (`has_role(auth.uid(), 'admin')`)
- INSERT/DELETE: Все партии

#### Таблица Pool Requests

**МПК:**
- SELECT: Только собственные заявки (через `mpk_id`, соответствующий `user_id`)
- INSERT: Только собственные заявки
- UPDATE: Только черновики собственных заявок (status = 'draft')

**Администраторы:**
- SELECT/INSERT/UPDATE/DELETE: Все заявки (`has_role(auth.uid(), 'admin')`)

#### Таблица Execution

**Фермеры:**
- SELECT: Выполнения для собственных партий
  - Политика: `"Farmers can view own batch executions"`

**МПК:**
- SELECT: Выполнения для собственных заявок
  - Политика: `"MPKs can view own request executions"`
- UPDATE: Выполнения собственных заявок (для подтверждения поставки)
  - Политика: `"MPKs can update own request executions for delivery confirmation"`

**Администраторы:**
- SELECT/INSERT/UPDATE: Все выполнения (`has_role(auth.uid(), 'admin')`)

---

**Примечание**: Полная документация будет добавлена. Эта секция содержит критические исправления RLS политик, добавленные в английскую версию.

