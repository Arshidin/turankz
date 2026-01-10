# Руководство по отладке проблемы с отображением Executions

## Проблема
Executions не отображаются в разделе "Contracts & Execution", хотя должны быть данные.

## Логика создания Executions

### Когда создаются Executions?
Executions создаются **автоматически** при finalization matching в функции `useFinalizeMatching()`:
- Вызывается после того, как matching переведен в статус `finalized`
- Создается запись в таблице `offtake_executions` со статусом `matched`
- Связывается с `match_id`, `batch_id`, `request_id`

### Условия для отображения Executions:
1. ✅ Execution должен существовать в таблице `offtake_executions`
2. ✅ Matching должен быть `finalized` (executions создаются только для finalized matchings)
3. ✅ RLS политики должны разрешать доступ админу
4. ✅ Join с `pool_matches` должен работать корректно

## Шаги отладки

### 1. Проверьте консоль браузера
Откройте DevTools (F12) → Console и проверьте логи:
- `Raw executions data:` - показывает сырые данные из БД
- `Number of executions:` - количество записей
- `Mapped execution:` - детали каждой execution
- `Final filtered executions count:` - итоговое количество после фильтрации

### 2. Проверьте данные в БД
Выполните SQL запрос в Supabase Dashboard:

```sql
-- Проверьте, есть ли executions
SELECT 
  e.id,
  e.status,
  e.match_id,
  e.created_at,
  pm.status as matching_status
FROM offtake_executions e
LEFT JOIN pool_matches pm ON pm.id = e.match_id
ORDER BY e.created_at DESC
LIMIT 10;
```

### 3. Проверьте, есть ли finalized matchings
```sql
-- Проверьте finalized matchings
SELECT 
  id,
  status,
  finalized_at,
  batch_id,
  request_id
FROM pool_matches
WHERE status = 'finalized'
ORDER BY finalized_at DESC
LIMIT 10;
```

### 4. Проверьте RLS политики
Убедитесь, что админ имеет доступ:
```sql
-- Проверьте RLS политики для offtake_executions
SELECT * FROM pg_policies 
WHERE tablename = 'offtake_executions';
```

### 5. Проверьте, создаются ли executions при finalization
- Откройте раздел "Pool Matching"
- Finalize matching
- Проверьте консоль на ошибки создания execution
- Проверьте БД - появилась ли запись в `offtake_executions`

## Возможные проблемы

### Проблема 1: Executions не создаются
**Причина**: Ошибка при создании execution в `useFinalizeMatching()`
**Решение**: Проверьте консоль на ошибки, проверьте RLS политики для INSERT

### Проблема 2: Join не работает
**Причина**: `pool_matches` не загружается из-за RLS или неправильного синтаксиса
**Решение**: Проверьте, что join синтаксис правильный: `pool_matches:match_id (...)`

### Проблема 3: Фильтрация слишком строгая
**Причина**: Фильтрация скрывает valid executions
**Решение**: Уже исправлено - показываются все executions, кроме cancelled

### Проблема 4: Matchings не finalized
**Причина**: Matchings созданы, но не finalized
**Решение**: Finalize matchings в разделе "Pool Matching"

## Текущая логика фильтрации

```typescript
// Показываются все executions, кроме:
// - Executions где matching.status === 'cancelled'
// - Executions без match данных показываются (с предупреждением)
```

## Следующие шаги

1. Откройте консоль браузера и проверьте логи
2. Проверьте БД - есть ли executions
3. Если executions есть, но не отображаются - проверьте фильтрацию
4. Если executions нет - проверьте, создаются ли они при finalization

