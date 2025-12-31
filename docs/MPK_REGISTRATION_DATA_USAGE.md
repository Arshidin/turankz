# Использование данных регистрации МПК в функционале проекта

## Обзор

Данные, введенные при регистрации МПК (форма "Профиль приема", шаг 2 из 3), сохраняются в таблице `mpks` и используются в различных частях системы для автоматизации и валидации.

---

## Данные, собираемые при регистрации

### 1. **Регионы приема** (`intake_regions`)
- **Тип**: `string[]`
- **Пример**: `['Алматы', 'Шымкент', 'Тараз']`
- **Где вводится**: Шаг 2, чекбоксы регионов

### 2. **Типичный месячный объем** (`typical_volume_min`, `typical_volume_max`)
- **Тип**: `number | null`
- **Пример**: `{ min: 100, max: 250 }`
- **Где вводится**: Шаг 2, выпадающий список (До 100, 100-250, 250-500, 500-1000, 1000+)

### 3. **Диапазон возраста** (`default_age_range_min`, `default_age_range_max`)
- **Тип**: `number | null`
- **Пример**: `{ min: 10, max: 18 }` (месяцев)
- **Где вводится**: Шаг 2, поля "Мин. возраст" и "Макс. возраст"

### 4. **Диапазон веса** (`default_weight_range_min`, `default_weight_range_max`)
- **Тип**: `number | null`
- **Пример**: `{ min: 250, max: 400 }` (кг)
- **Где вводится**: Шаг 2, поля "Мин. вес" и "Макс. вес"

### 5. **Основные месяцы приема** (`common_target_weeks`)
- **Тип**: `string[]`
- **Пример**: `['Январь', 'Февраль', ...]`
- **Где вводится**: Шаг 2, чекбоксы месяцев
- **Примечание**: В БД сохраняется как массив названий месяцев

---

## Где и как используются эти данные

### 1. **Предзаполнение формы создания Pool Request**

**Файл**: `src/components/mpk/NewRequestDialog.tsx`

**Использование**:
- При создании нового Pool Request форма автоматически предзаполняется значениями из профиля МПК
- Используются поля: `default_age_range_min/max`, `default_weight_range_min/max`
- **Примечание**: В текущей реализации `defaultCriteria` не передается в `NewRequestDialog`, поэтому предзаполнение не работает автоматически. Это можно улучшить.

**Код**:
```typescript
defaultValues: {
  age_range_min: defaultCriteria?.age_range_min ?? undefined,
  age_range_max: defaultCriteria?.age_range_max ?? undefined,
  weight_range_min: defaultCriteria?.weight_range_min ?? undefined,
  weight_range_max: defaultCriteria?.weight_range_max ?? undefined,
}
```

---

### 2. **Фильтрация доступных батчей в Overview**

**Файл**: `src/pages/Overview.tsx`

**Использование**:
- На странице Overview для МПК показываются только батчи из регионов, указанных в `intake_regions`
- Это помогает МПК видеть только релевантные предложения

**Код**:
```typescript
const availableBatches = batches.filter(b => 
  ['confirmed', 'soft_committed', 'forecast'].includes(b.status) &&
  (!currentMpk?.intake_regions?.length || currentMpk.intake_regions.includes(b.region))
);
```

---

### 3. **Валидация при создании Matching**

**Файл**: `src/lib/matching-validation.ts`

**Использование**:
- При создании matching между batch и pool request проверяется соответствие:
  - **Регион**: batch.region должен быть в request.regions (которые могут быть основаны на intake_regions)
  - **Возраст**: batch.age_min/max должен пересекаться с request.age_range_min/max
  - **Вес**: batch.weight_min/max должен пересекаться с request.weight_range_min/max

**Код**:
```typescript
// Проверка региона
const regionCheck = validateRegionOverlap(batch.region, request.regions);

// Проверка возраста
const ageCheck = validateAgeOverlap(
  batch.age_min, batch.age_max,
  request.age_range_min, request.age_range_max
);

// Проверка веса
const weightCheck = validateWeightOverlap(
  batch.weight_min, batch.weight_max,
  request.weight_range_min, request.weight_range_max
);
```

---

### 4. **Отображение в профиле МПК**

**Файл**: `src/pages/mpk/MpkProfile.tsx`

**Использование**:
- Все данные из регистрации отображаются в профиле МПК
- Пользователь может редактировать некоторые поля (через `ProfileOperationalSection`)

**Отображаемые поля**:
- `intake_regions` → "Регионы приема"
- `typical_volume_min/max` → "Типичный объем"
- `common_target_weeks` → "Основные недели приема"

---

### 5. **Админ-панель управления МПК**

**Файл**: `src/pages/admin/MpkManagement.tsx`

**Использование**:
- Админ видит все данные регистрации при просмотре профиля МПК
- Используется для фильтрации по регионам (`intake_regions`)
- Отображается типичный объем для оценки масштаба операций МПК

**Код**:
```typescript
// Фильтрация по регионам
const matchesRegion = filterRegion === 'all' || m.intake_regions.includes(filterRegion);

// Отображение типичного объема
{selectedMpk.typical_volume_min && selectedMpk.typical_volume_max 
  ? `${selectedMpk.typical_volume_min}–${selectedMpk.typical_volume_max} heads`
  : 'Not specified'}
```

---

### 6. **Создание Pool Request**

**Файл**: `src/hooks/usePoolRequests.ts`

**Использование**:
- При создании Pool Request данные из формы (которые могут быть предзаполнены из профиля) сохраняются в таблицу `purchase_pool_requests`
- Эти данные затем используются для matching с батчами

**Структура данных**:
```typescript
{
  regions: string[],              // Может быть основано на intake_regions
  age_range_min: number | null,   // Из default_age_range_min
  age_range_max: number | null,   // Из default_age_range_max
  weight_range_min: number | null, // Из default_weight_range_min
  weight_range_max: number | null, // Из default_weight_range_max
}
```

---

## Поток данных

```
Регистрация МПК (Шаг 2)
    ↓
Сохранение в таблицу `mpks`
    ↓
┌─────────────────────────────────────┐
│  Использование данных:               │
├─────────────────────────────────────┤
│ 1. Предзаполнение формы Request     │
│ 2. Фильтрация батчей в Overview     │
│ 3. Валидация при Matching           │
│ 4. Отображение в профиле            │
│ 5. Админ-панель управления           │
└─────────────────────────────────────┘
```

---

## Рекомендации по улучшению

### 1. **Автоматическое предзаполнение формы Request**

**Проблема**: В `PurchasePoolRequests.tsx` не передается `defaultCriteria` в `NewRequestDialog`.

**Решение**: Добавить логику для получения данных из профиля МПК и передачи их как `defaultCriteria`:

```typescript
// В PurchasePoolRequests.tsx
const { data: currentMpk } = useCurrentMpk();

const defaultCriteria = currentMpk ? {
  age_range_min: currentMpk.default_age_range_min,
  age_range_max: currentMpk.default_age_range_max,
  weight_range_min: currentMpk.default_weight_range_min,
  weight_range_max: currentMpk.default_weight_range_max,
  accepted_breeds: [], // Можно добавить в профиль
  accepted_genders: [], // Можно добавить в профиль
} : undefined;

<NewRequestDialog 
  defaultCriteria={defaultCriteria}
  // ...
/>
```

### 2. **Предзаполнение регионов из профиля**

**Проблема**: Регионы не предзаполняются из `intake_regions`.

**Решение**: Добавить предзаполнение регионов при создании Request:

```typescript
defaultValues: {
  regions: defaultRegions || currentMpk?.intake_regions || [],
  // ...
}
```

### 3. **Использование common_target_weeks**

**Проблема**: `common_target_weeks` (месяцы приема) не используются в функционале.

**Решение**: Можно использовать для:
- Автоматического предложения target_week при создании Request
- Фильтрации или приоритизации Request в определенные периоды
- Аналитики и прогнозирования спроса

---

## Схема базы данных

```sql
-- Таблица mpks
CREATE TABLE mpks (
  id UUID PRIMARY KEY,
  user_id UUID,
  mpk_id TEXT,
  name TEXT,
  intake_regions TEXT[],                    -- Регионы приема
  typical_volume_min INTEGER,                -- Мин. типичный объем
  typical_volume_max INTEGER,                -- Макс. типичный объем
  default_age_range_min INTEGER,             -- Мин. возраст по умолчанию
  default_age_range_max INTEGER,             -- Макс. возраст по умолчанию
  default_weight_range_min INTEGER,          -- Мин. вес по умолчанию
  default_weight_range_max INTEGER,          -- Макс. вес по умолчанию
  common_target_weeks TEXT[],                -- Основные месяцы приема
  -- ...
);
```

---

## Заключение

Данные из формы регистрации МПК используются в нескольких ключевых местах:
1. ✅ **Фильтрация батчей** по регионам (работает)
2. ✅ **Валидация matching** по возрасту и весу (работает)
3. ✅ **Отображение в профиле** (работает)
4. ⚠️ **Предзаполнение формы Request** (частично работает, можно улучшить)
5. ❌ **Использование common_target_weeks** (не используется)

Основная логика работает корректно, но есть возможности для улучшения автоматизации и удобства использования.

