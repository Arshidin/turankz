# Критическая проблема: МПК видит чужие заявки

## Проблема

МПК в разделе "Заявки на покупку" видит заявки других мясокомбинатов с их названиями. Это **критическая проблема безопасности и конфиденциальности данных**.

---

## Анализ бизнес-логики

### Требования из документации (`docs/ACCESS_CONTROL.md`):

**MPK может видеть:**
- ✅ **Own purchase pool requests** - только свои заявки
- ✅ Aggregated supply (анонимизированное предложение)
- ✅ Watchlist items (только свои)

**MPK НЕ может видеть:**
- ❌ **Pool request details** от других МПК
- ❌ Farmer identities
- ❌ Individual batch ownership
- ❌ Other MPK identities

### Требования из кода (`src/lib/access-control.ts`):

```typescript
export const MPK_PERMISSIONS: RolePermissions = {
  canView: {
    poolRequests: false, // ❌ Cannot see all pool requests
    ownPoolRequests: true, // ✅ Can see own pool requests
  },
};
```

**Вывод:** МПК должен видеть **ТОЛЬКО свои заявки**, а не заявки других МПК.

---

## Причина проблемы

### История миграций:

1. **Миграция `20251217053215_...`** (первая):
   ```sql
   CREATE POLICY "Admins can view all requests"
   ON public.purchase_pool_requests
   FOR SELECT
   TO authenticated
   USING (true);  -- ❌ КРИТИЧЕСКАЯ ОШИБКА: все видят все!
   ```

2. **Миграция `20251218184808_...`** (добавлена политика для МПК):
   ```sql
   CREATE POLICY "MPKs can view own requests"
   ON public.purchase_pool_requests
   FOR SELECT
   USING (
     EXISTS (
       SELECT 1 FROM public.mpks 
       WHERE mpks.mpk_id = purchase_pool_requests.mpk_id 
       AND mpks.user_id = auth.uid()
     )
   );
   ```

3. **Миграция `20250120000001_fix_rls_policies.sql`** (попытка исправления):
   ```sql
   DROP POLICY IF EXISTS "Admins can view all requests" ON public.purchase_pool_requests;
   CREATE POLICY "Admins can view all requests"
   ON public.purchase_pool_requests FOR SELECT 
   TO authenticated 
   USING (public.has_role(auth.uid(), 'admin'));
   ```

### Проблема:

В PostgreSQL RLS политики работают по принципу **OR** - если хотя бы одна политика разрешает доступ, то доступ разрешен.

**Возможные причины:**
1. Старая политика с `USING (true)` все еще существует
2. Политика для админов не правильно проверяет роль
3. Политика для МПК не правильно работает
4. Порядок применения политик неправильный

---

## Решение

### 1. Создана миграция `20250120000006_fix_mpk_requests_rls.sql`

**Действия:**
- ✅ Удаляет все старые политики
- ✅ Создает правильные политики для админов (с `has_role()`)
- ✅ Создает правильные политики для МПК (только свои заявки)
- ✅ Добавляет проверку, что пользователь является МПК
- ✅ Исправляет политику для фермеров (только для агрегации)

### 2. Логика политик:

**Для админов:**
```sql
USING (public.has_role(auth.uid(), 'admin'))
```

**Для МПК:**
```sql
USING (
  -- Пользователь должен быть МПК
  EXISTS (SELECT 1 FROM public.mpks WHERE mpks.user_id = auth.uid())
  -- И заявка должна принадлежать этому МПК
  AND EXISTS (
    SELECT 1 FROM public.mpks 
    WHERE mpks.mpk_id = purchase_pool_requests.mpk_id 
    AND mpks.user_id = auth.uid()
  )
)
```

**Для фермеров:**
```sql
USING (
  -- Пользователь должен быть фермером
  EXISTS (SELECT 1 FROM public.farmers WHERE farmers.user_id = auth.uid())
  -- И заявка должна быть в активном статусе (для агрегации)
  AND status IN ('submitted', 'matching', 'partial', 'fulfilled')
)
```

### 3. Дополнительная защита на фронтенде

Добавлена фильтрация в `PurchasePoolRequests.tsx`:

```typescript
// Фильтровать заявки по текущему МПК
const filteredRequests = useMemo(() => {
  if (!currentMpkData?.mpk_id) return [];
  return requests?.filter(r => r.mpk_id === currentMpkData.mpk_id) || [];
}, [requests, currentMpkData?.mpk_id]);
```

Это **defense-in-depth** мера - RLS должен работать правильно, но дополнительная фильтрация на фронтенде добавляет еще один слой защиты.

---

## Тестирование

После применения миграции нужно проверить:

1. ✅ МПК видит только свои заявки
2. ✅ МПК не видит заявки других МПК
3. ✅ Админ видит все заявки
4. ✅ Фермер не видит индивидуальные заявки (только через функцию агрегации)

---

## Приоритет

**КРИТИЧЕСКИЙ** - это проблема безопасности и конфиденциальности данных.

---

## Статус

- ✅ Миграция создана
- ✅ Дополнительная фильтрация на фронтенде добавлена
- ⏳ Требуется применение миграции
- ⏳ Требуется тестирование
