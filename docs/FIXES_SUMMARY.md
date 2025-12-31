# Исправления: Валидация возраста/веса и отображение заявок МПК

## Проблема 1: Валидация возраста и веса

### Текущая ситуация

**Минимальные значения**:
- Возраст: **12 месяцев** (`AGE_RANGE.min = 12`)
- Вес: **300 кг** (`WEIGHT_RANGE.min = 300`)

**Где используется**:
- `src/lib/livestock-criteria.ts` - определения констант
- `src/components/farmer/NewBatchDialog.tsx` - валидация формы создания Batch
- `src/components/mpk/NewRequestDialog.tsx` - валидация формы создания Pool Request

### Логика

Валидация происходит на уровне формы через Zod schema:
```typescript
age_min: z.coerce.number().min(AGE_RANGE.min).max(AGE_RANGE.max).optional(),
weight_min: z.coerce.number().min(WEIGHT_RANGE.min).max(WEIGHT_RANGE.max).optional(),
```

**Если пользователь видит блокировку при возрасте <12 и весе <350**:
- Это правильное поведение для возраста (минимум 12 месяцев)
- Для веса минимум 300 кг, но пользователь говорит о 350 кг - возможно путаница или дополнительная валидация

### Рекомендация

Если нужно разрешить меньшие значения, изменить константы в `src/lib/livestock-criteria.ts`:
```typescript
export const AGE_RANGE = {
  min: 6,  // Разрешить от 6 месяцев (если нужно)
  max: 48,
} as const;

export const WEIGHT_RANGE = {
  min: 200,  // Разрешить от 200 кг (если нужно)
  max: 700,
} as const;
```

---

## Проблема 2: МПК не видит созданную заявку

### Причина

**Ошибка в `PurchasePoolRequests.tsx`**:
```typescript
mpkId={currentMpk.id}  // ❌ НЕПРАВИЛЬНО: используется UUID (id)
```

**Правильно должно быть**:
```typescript
mpkId={currentMpk.mpk_id}  // ✅ ПРАВИЛЬНО: используется TEXT (mpk_id)
```

### Объяснение

- В таблице `purchase_pool_requests` поле `mpk_id` имеет тип `TEXT` (например, 'MPK-001')
- В таблице `mpks` есть два поля:
  - `id` (UUID) - внутренний идентификатор
  - `mpk_id` (TEXT) - текстовый идентификатор (например, 'MPK-001')
- При создании заявки используется `mpk_id` (TEXT), а не `id` (UUID)
- При фильтрации сравнивается `request.mpk_id === currentMpkData.mpk_id`
- Но в `NewRequestDialog` передавался `currentMpk.id` (UUID) вместо `currentMpk.mpk_id` (TEXT)

### Исправление

**Файл**: `src/pages/mpk/PurchasePoolRequests.tsx`

Изменить:
```typescript
mpkId={currentMpk.id}  // ❌
```

На:
```typescript
mpkId={currentMpk.mpk_id}  // ✅
```

### Результат

После исправления:
- ✅ Заявка создается с правильным `mpk_id` (TEXT)
- ✅ Фильтрация работает корректно (`request.mpk_id === currentMpkData.mpk_id`)
- ✅ МПК видит свои созданные заявки

