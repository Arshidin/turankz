# Анализ раздела "Contracts & Execution" в админ-панели

## Обзор функционала

Раздел "Contracts & Execution" предназначен для управления исполнением контрактов после сопоставления (matching). Отслеживает жизненный цикл от создания execution до закрытия.

**Жизненный цикл Execution:**
1. `matched` - Создан после finalization matching
2. `scheduled` - Админ запланировал доставку
3. `delivered` - МПК подтвердил доставку
4. `confirmed` - Админ подтвердил соответствие
5. `settled` - Рассчитан settlement (индикативный)
6. `closed` - Исполнение завершено

---

## Выявленные проблемы

### 🔴 КРИТИЧЕСКИЕ ПРОБЛЕМЫ

#### 1. Хардкод имен пользователей

**Проблема**: В `ExecutionManagement.tsx` используются хардкод строки для `admin_confirmed_by` и `closed_by`:
```typescript
admin_confirmed_by: 'Admin',
closed_by: 'Admin',
```

**Риск**: 
- Нет аудита реального пользователя
- Невозможно отследить, кто выполнил действие
- Нарушение требований к аудиту

**Исправление**: Использовать реальное имя пользователя из контекста.

---

#### 2. Неправильный расчет Pending Actions

**Проблема**: `pendingActions` рассчитывается как сумма всех статусов, которые могут требовать действий:
```typescript
const pendingActions = statusCounts.matched + statusCounts.delivered + statusCounts.confirmed;
```

**Проблема**: 
- `matched` - требует действия (Schedule Delivery)
- `delivered` - требует действия (Confirm Compliance) ✅
- `confirmed` - требует действия (Calculate Settlement) ✅
- Но также нужно учитывать `scheduled` - ожидает действия от МПК (не админа)

**Исправление**: Учитывать только статусы, требующие действий от админа.

---

#### 3. Нет проверки связи с finalized matching

**Проблема**: Execution может существовать даже если matching был отменен (`cancelled`).

**Риск**:
- Data inconsistency: Execution показывает "delivered", но matching "cancelled"
- Business logic: Нельзя исполнять отмененные matchings

**Исправление**: Добавить проверку статуса matching перед отображением/действиями.

---

### 🟠 СРЕДНИЕ ПРОБЛЕМЫ

#### 4. Нет фильтрации по датам

**Проблема**: Нет возможности фильтровать executions по дате создания, доставки или закрытия.

**Исправление**: Добавить фильтры по датам.

---

#### 5. Settlement calculation использует неактуальные данные

**Проблема**: В `SettlementCalculationDialog` передаются данные из `match`, но они могут быть устаревшими:
```typescript
suggestedReferencePrice={selectedExecution.match?.total_price_per_kg || 0}
suggestedPremiums={selectedExecution.match?.total_premium || 0}
```

**Исправление**: Использовать актуальные данные из price grid на момент расчета settlement.

---

#### 6. Нет валидации переходов статусов через FSM

**Проблема**: Действия выполняются напрямую без проверки FSM:
```typescript
const handleConfirmCompliance = async (execution: ExecutionWithDetails) => {
  await confirmCompliance.mutateAsync({
    id: execution.id,
    admin_confirmed_by: 'Admin',
    admin_compliance_notes: 'Compliance verified',
  });
};
```

**Исправление**: Использовать `validateExecutionTransition` перед изменением статуса.

---

### 🟡 НИЗКИЕ ПРОБЛЕМЫ

#### 7. Нет экспорта данных

**Проблема**: Нет возможности экспортировать execution records в CSV/Excel.

**Исправление**: Добавить функцию экспорта.

---

#### 8. Нет группировки по статусам в таблице

**Проблема**: Все executions отображаются в одной таблице без группировки.

**Исправление**: Добавить возможность группировки по статусам.

---

## Рекомендации по исправлению

### Приоритет 1 (Критические)
1. Использовать реальное имя пользователя из контекста
2. Исправить расчет Pending Actions
3. Добавить проверку статуса matching

### Приоритет 2 (Средние)
4. Добавить фильтрацию по датам
5. Исправить settlement calculation
6. Добавить валидацию FSM переходов

### Приоритет 3 (Низкие)
7. Добавить экспорт данных
8. Добавить группировку по статусам

