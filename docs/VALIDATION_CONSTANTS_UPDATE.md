# Обновление констант валидации возраста и веса

## Изменения

Обновлены минимальные значения валидации в `src/lib/livestock-criteria.ts`:

### До изменений:
- **Минимальный возраст**: 12 месяцев
- **Минимальный вес**: 300 кг

### После изменений:
- **Минимальный возраст**: 6 месяцев ✅
- **Минимальный вес**: 150 кг ✅

## Файл изменений

**`src/lib/livestock-criteria.ts`**:
```typescript
export const AGE_RANGE = {
  min: 6,  // 6 months (было: 12)
  max: 48,  // 48 months
} as const;

export const WEIGHT_RANGE = {
  min: 150,  // 150 kg (было: 300)
  max: 700,  // 700 kg
} as const;
```

## Где применяется

Эти константы используются в валидации форм:

1. **Создание Batch** (`src/components/farmer/NewBatchDialog.tsx`):
   - `age_min: z.coerce.number().min(AGE_RANGE.min)`
   - `weight_min: z.coerce.number().min(WEIGHT_RANGE.min)`

2. **Создание Pool Request** (`src/components/mpk/NewRequestDialog.tsx`):
   - `age_range_min: z.coerce.number().min(AGE_RANGE.min)`
   - `weight_range_min: z.coerce.number().min(WEIGHT_RANGE.min)`

3. **Редактирование Pool Request** (`src/components/mpk/EditRequestDialog.tsx`):
   - Аналогичная валидация

4. **Формы критериев** (`src/components/livestock/`):
   - BatchCriteriaForm
   - AcceptanceCriteriaForm

## Результат

Теперь пользователи могут создавать:
- ✅ Batch с возрастом от **6 месяцев** (вместо 12)
- ✅ Batch с весом от **150 кг** (вместо 300)
- ✅ Pool Request с критериями возраста от **6 месяцев**
- ✅ Pool Request с критериями веса от **150 кг**

## Примечание

Изменения применяются автоматически ко всем формам, которые используют эти константы через импорт из `src/lib/livestock-criteria.ts`.

