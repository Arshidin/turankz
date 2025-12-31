# Проблема: Валидация возраста и веса при создании Batch и Pool Request

## Проблема

При создании Batch и Pool Request сайт не дает создание если:
- Возраст животных < 12 месяцев
- Вес < 350 кг

## Анализ

### Текущие ограничения в коде

**Файл**: `src/lib/livestock-criteria.ts`

```typescript
export const AGE_RANGE = {
  min: 12,  // 12 месяцев
  max: 48,  // 48 месяцев
} as const;

export const WEIGHT_RANGE = {
  min: 300,  // 300 кг
  max: 700,  // 700 кг
} as const;
```

### Валидация в формах

**Файл**: `src/components/farmer/NewBatchDialog.tsx`
```typescript
age_min: z.coerce.number().min(AGE_RANGE.min).max(AGE_RANGE.max).optional(),
age_max: z.coerce.number().min(AGE_RANGE.min).max(AGE_RANGE.max).optional(),
weight_min: z.coerce.number().min(WEIGHT_RANGE.min).max(WEIGHT_RANGE.max).optional(),
weight_max: z.coerce.number().min(WEIGHT_RANGE.min).max(WEIGHT_RANGE.max).optional(),
```

**Файл**: `src/components/mpk/NewRequestDialog.tsx`
```typescript
age_range_min: z.coerce.number().min(AGE_RANGE.min).max(AGE_RANGE.max).optional(),
age_range_max: z.coerce.number().min(AGE_RANGE.min).max(AGE_RANGE.max).optional(),
weight_range_min: z.coerce.number().min(WEIGHT_RANGE.min).max(WEIGHT_RANGE.max).optional(),
weight_range_max: z.coerce.number().min(WEIGHT_RANGE.min).max(WEIGHT_RANGE.max).optional(),
```

## Вывод

**Текущая логика**:
- ✅ Минимальный возраст: **12 месяцев** (AGE_RANGE.min = 12)
- ✅ Минимальный вес: **300 кг** (WEIGHT_RANGE.min = 300)

**Проблема пользователя**:
- Пользователь говорит, что не дает создать при возрасте <12 и весе <350
- Это может быть:
  1. **Ошибка восприятия**: Пользователь видит предупреждение, но думает что это блокировка
  2. **Дополнительная валидация**: Возможно есть валидация на уровне базы данных
  3. **Логика стандартного статуса**: `standard_status` может требовать другие значения

## Рекомендация

1. **Проверить базу данных** на наличие CHECK constraints
2. **Уточнить бизнес-требования**: Должны ли быть минимальные значения 12 месяцев и 300 кг, или можно меньше?
3. **Если нужно разрешить меньшие значения**: Изменить `AGE_RANGE.min` и `WEIGHT_RANGE.min`

