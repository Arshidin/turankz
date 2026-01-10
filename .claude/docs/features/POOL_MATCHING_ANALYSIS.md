# Анализ раздела "Сопоставление пулов" (Pool Matching) в админ-панели

## Обзор функционала

Раздел "Сопоставление пулов" предназначен для координации предложения (supply) и спроса (demand) для формирования сопоставленных пулов. Состоит из трех вкладок:
1. **Pool Requests** - список заявок на покупку
2. **Matching Workspace** - рабочее пространство для сопоставления
3. **Pool Overview** - обзор пулов (основной интерфейс сопоставления)

---

## 1. Бизнес-логика

### 1.1. Основной интерфейс (Pool Overview)

**Структура:**
- **Левая панель**: Список заявок на покупку (Purchase Requests)
- **Центральная панель**: Доступное предложение (Available Supply Pool)
- **Правая панель**: Сводка сопоставления (Matching Summary)

**Логика работы:**
1. Админ выбирает заявку из левой панели
2. Система фильтрует batches по критериям заявки:
   - Grade (A/B, B/C, Any)
   - Region (список регионов или 'Any')
   - Acceptance Criteria (если указаны)
3. Админ выбирает batches из центральной панели
4. Система показывает предварительный расчет в правой панели
5. Админ создает матчинг через кнопку "Propose Match"

### 1.2. Фильтрация Supply

**Код**: `src/pages/admin/PoolMatching.tsx:222-247`

```typescript
const filteredSupply = useMemo(() => {
  if (!activeRequest) return [];
  let filtered = supplyBlocks.filter(s => {
    // Grade matching
    const gradeMatch = activeRequest.required_grade === 'A/B' 
      ? ['A', 'B'].includes(s.grade)
      : activeRequest.required_grade === 'B/C'
      ? ['B', 'C'].includes(s.grade)
      : activeRequest.required_grade === 'Any'
      ? true
      : s.grade === activeRequest.required_grade;
    
    // Region matching
    const regionMatch = activeRequest.regions.includes('Any') || 
                       activeRequest.regions.includes(s.region);
    
    return gradeMatch && regionMatch;
  });

  // Optional: Filter by acceptance criteria match level
  if (showOnlyMatching && hasCriteria) {
    filtered = filtered.filter(s => s.matchLevel === 'full' || s.matchLevel === 'partial');
  }

  // Sort by match level (full first, then partial, then none)
  return filtered.sort((a, b) => {
    const order = { full: 0, partial: 1, none: 2 };
    return (order[a.matchLevel || 'none'] || 2) - (order[b.matchLevel || 'none'] || 2);
  });
}, [activeRequest, supplyBlocks, showOnlyMatching, hasCriteria]);
```

**Проблемы:**
- ✅ Фильтрация по grade и region работает корректно
- ✅ Сортировка по match level работает корректно
- ⚠️ **Проблема**: Не учитывается `delivery_period` при фильтрации
- ⚠️ **Проблема**: Не учитывается `target_week` при фильтрации

### 1.3. Acceptance Criteria Matching

**Код**: `src/lib/livestock-criteria.ts:55-107`

Логика проверки соответствия критериям:
- **Full Match**: Все критерии совпадают
- **Partial Match**: Часть критериев совпадает
- **No Match**: Критерии не совпадают

**Проблемы:**
- ✅ Логика проверки работает корректно
- ⚠️ **Проблема**: Не учитывается пересечение диапазонов (overlap) для age и weight
- ⚠️ **Проблема**: Логика проверки age/weight слишком строгая (требует полного вхождения)

### 1.4. Создание Matching

**Код**: `src/pages/admin/PoolMatching.tsx:331-354`

```typescript
const handleProposeMatch = async () => {
  if (!activeRequest || selectedSupply.length === 0) return;

  const matches = selectedSupply.map(s => ({
    request_id: activeRequest.id,
    batch_id: s.id,
    heads_matched: s.heads, // ⚠️ ПРОБЛЕМА: Использует все heads, а не available_heads
  }));

  await createMatch.mutateAsync(matches);
  
  // Calculate new progress and determine appropriate status
  const newMatchedVolume = activeRequest.matched_volume + selectedHeads;
  const newProgress = calculateMatchingProgress(activeRequest.required_volume, newMatchedVolume);
  const newStatus = getStatusFromProgress(newProgress);
  
  await updateRequest.mutateAsync({
    id: activeRequest.id,
    matched_volume: newMatchedVolume,
    status: newStatus,
  });

  clearSelection();
};
```

**Критические проблемы:**
1. ❌ **Использует `s.heads` вместо `available_heads`** - может создать матчинг с большим объемом, чем доступно
2. ❌ **Не проверяет `remaining_volume` заявки** - может превысить требуемый объем
3. ❌ **Не валидирует критерии перед созданием** - может создать несовместимый матчинг
4. ❌ **Не учитывает уже существующие матчинги** - может дублировать матчинги

---

## 2. UX/UI Проблемы

### 2.1. Информационная архитектура

**Проблемы:**
- ⚠️ **Три вкладки с разной логикой** - может запутать пользователя
  - "Pool Requests" - список заявок
  - "Matching Workspace" - другой интерфейс для сопоставления
  - "Pool Overview" - основной интерфейс (3-колоночный)
- ⚠️ **Дублирование функционала** - "Matching Workspace" и "Pool Overview" делают одно и то же по-разному

### 2.2. Обратная связь

**Проблемы:**
- ⚠️ **Нет предупреждения при превышении объема** - админ может выбрать больше, чем требуется
- ⚠️ **Нет предупреждения при несовместимых критериях** - админ может создать матчинг с "none" match level
- ⚠️ **Нет индикации доступного объема** - не видно, сколько heads доступно в batch после предыдущих матчингов

### 2.3. Визуальная иерархия

**Проблемы:**
- ⚠️ **Слишком много информации в одной панели** - центральная панель перегружена
- ⚠️ **Нет группировки по match level** - все batches в одном списке
- ⚠️ **Нет фильтрации по readiness** - нельзя отфильтровать только confirmed batches

---

## 3. Логическая консистентность

### 3.1. Статусы заявок

**Проблемы:**
- ⚠️ **Автоматическое обновление статуса** может конфликтовать с ручными изменениями
- ⚠️ **Статус "draft" отображается в списке** - draft заявки не должны участвовать в матчинге

### 3.2. Объемы

**Проблемы:**
- ❌ **Не учитывается `available_heads`** - используется полный `heads` из batch
- ❌ **Не учитывается `remaining_volume`** - не проверяется, сколько еще нужно для заявки
- ❌ **Нет проверки на превышение** - можно создать матчинг больше, чем требуется

### 3.3. Критерии

**Проблемы:**
- ⚠️ **Match level "none" можно выбрать** - админ может создать матчинг с несовместимыми критериями
- ⚠️ **Нет валидации перед созданием** - не проверяется совместимость перед созданием матчинга

---

## 4. Рекомендации по исправлению

### 4.1. Критические исправления

1. **Использовать `available_heads` вместо `heads`**
   ```typescript
   heads_matched: Math.min(s.available_heads, activeRequest.remaining_volume)
   ```

2. **Проверять `remaining_volume` перед созданием**
   ```typescript
   if (selectedHeads > activeRequest.remaining_volume) {
     // Показать предупреждение или автоматически ограничить
   }
   ```

3. **Валидировать критерии перед созданием**
   ```typescript
   const invalidMatches = selectedSupply.filter(s => s.matchLevel === 'none');
   if (invalidMatches.length > 0) {
     // Показать предупреждение
   }
   ```

4. **Учитывать существующие матчинги**
   ```typescript
   // Проверить, не создан ли уже матчинг для этого batch+request
   ```

### 4.2. Улучшения UX

1. **Добавить предупреждения**
   - При превышении объема
   - При несовместимых критериях
   - При выборе batches с "none" match level

2. **Улучшить визуализацию**
   - Группировать batches по match level
   - Показывать доступный объем для каждого batch
   - Показывать оставшийся объем для заявки

3. **Упростить интерфейс**
   - Объединить "Matching Workspace" и "Pool Overview" в один интерфейс
   - Убрать дублирование функционала

### 4.3. Улучшения логики

1. **Добавить фильтрацию по delivery_period и target_week**
2. **Улучшить логику проверки критериев** (учитывать overlap)
3. **Добавить проверку на дублирование матчингов**

---

## 5. Выводы

### Критические проблемы:
1. ❌ Использование `heads` вместо `available_heads`
2. ❌ Отсутствие проверки `remaining_volume`
3. ❌ Отсутствие валидации критериев
4. ❌ Отсутствие проверки на дублирование

### Средние проблемы:
1. ⚠️ Не учитывается `delivery_period` и `target_week` при фильтрации
2. ⚠️ Дублирование функционала между вкладками
3. ⚠️ Отсутствие предупреждений для пользователя

### Низкие проблемы:
1. ⚠️ Перегруженный интерфейс
2. ⚠️ Отсутствие группировки batches
3. ⚠️ Отсутствие фильтрации по readiness

