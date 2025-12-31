# Исправление парсинга месяца из target_week в админ-панели

## Проблема

На скриншоте админ-панели отображались некорректные значения месяцев:
- "2025-WO" вместо "January 2025"
- "2026-WO" вместо "January 2026"

## Причина

В коде использовался неправильный способ извлечения месяца из `target_week`:

```typescript
// НЕПРАВИЛЬНО:
const monthKey = batch.target_week?.slice(0, 7) || 'Unknown';
```

Для формата `"2025-W01"` это давало `"2025-W0"`, что отображалось как `"2025-WO"`.

## Решение

Создана функция `getMonthKeyFromTargetWeek()`, которая:
1. Правильно парсит различные форматы `target_week`:
   - `"2025-W01"` (YYYY-WXX)
   - `"W01-2025"` (WXX-YYYY)
2. Вычисляет дату из номера недели
3. Получает начало месяца
4. Форматирует как `"yyyy-MM"` для ключа группировки
5. Отображает как `"MMMM yyyy"` (например, "January 2025")

## Изменения

### 1. Добавлен импорт date-fns
```typescript
import { format, startOfMonth } from 'date-fns';
```

### 2. Создана функция парсинга
```typescript
function getMonthKeyFromTargetWeek(targetWeek: string | null | undefined): string {
  // Парсит target_week и возвращает ключ месяца в формате "yyyy-MM"
  // ...
}
```

### 3. Обновлена логика byMonth
```typescript
// Было:
const monthKey = batch.target_week?.slice(0, 7) || 'Unknown';

// Стало:
const monthKey = getMonthKeyFromTargetWeek(batch.target_week);
```

### 4. Улучшена фильтрация статусов
- Для batches учитываются только активные статусы: `['forecast', 'soft_committed', 'confirmed']`
- Для requests учитываются только активные статусы: `['submitted', 'matching', 'partial']`
- `fulfilled` учитывается для исторической статистики, но не в активном спросе

### 5. Улучшено отображение
```typescript
// Форматирование месяца для отображения
const [year, month] = monthKey.split('-');
const date = new Date(parseInt(year), parseInt(month) - 1, 1);
const monthLabel = format(date, 'MMMM yyyy'); // "January 2025"
```

## Результат

После исправления:
- ✅ Месяцы отображаются правильно: "January 2025", "February 2025" и т.д.
- ✅ Группировка по месяцам работает корректно
- ✅ Учитываются только активные статусы batches и requests
- ✅ Данные соответствуют реальному состоянию системы

