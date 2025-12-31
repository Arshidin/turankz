# Анализ экрана МПК для неподтвержденного пользователя

## Текущее состояние

### Определение статуса

Для МПК статус определяется в `src/lib/account-status.ts`:

```typescript
export function deriveMpkAccountStatus(
  mpkStatus: string | null | undefined,
  registrationStatus: string | null | undefined
): AccountStatus {
  if (mpkStatus === 'restricted' || mpkStatus === 'inactive') return 'suspended';
  if (registrationStatus !== 'active') return 'observer';  // ← Неподтвержденный МПК
  return 'active';
}
```

**Для нового зарегистрированного МПК:**
- `registration_status = 'pending'` → `accountStatus = 'observer'`
- `isObserver = true`
- `isSuspended = false`
- `canPerformActions = false`

---

## Что отображается на экране

### 1. Сайдбар (`src/components/layout/Sidebar.tsx`)

**Бейдж статуса:**
- Показывается бейдж "Pending" (Ожидает активации) с иконкой глаза
- НЕ показывается "Suspended Mode Banner" (только для `isSuspended = true`)

**Навигация:**
- Доступны только элементы с `requiredStatus: ['observer', 'active']`:
  - ✅ `/mpk/market` (Обзор рынка) - доступен
  - ✅ `/price-grid` (Справочная ценовая сетка) - доступен (read-only)
  - ❌ `/mpk/requests` (Заявки на закупку) - НЕ доступен
  - ❌ `/mpk/watchlist` (Отслеживание) - НЕ доступен
  - ❌ `/mpk/profile` (Профиль) - НЕ доступен

**Проблема:** В описании изображения упоминается "nav.suspendedMode" - это может быть:
- Неправильный ключ перевода
- Или отображается для другого статуса (suspended, а не observer)

---

### 2. Overview страница (`src/pages/Overview.tsx`)

**Проблема:** Для МПК с observer статусом НЕТ специального dashboard (в отличие от фермера).

**Текущее поведение:**
- МПК с observer статусом видит обычный Overview с метриками
- Все метрики показывают "0":
  - "Доступные партии": 0
  - "В отслеживании": 0
  - "Активные заявки": 0
  - "Заполнение пула": 0%

**Почему все "0":**
1. `currentMpk` может быть `null` или иметь пустые `intake_regions`
2. `mpkRequests` пустой (нет заявок, т.к. нельзя создавать)
3. `availableBatches` пустой (нет регионов для фильтрации)

**Код метрик:**
```typescript
const mpkStats = useMemo((): StatItem[] => {
  // Доступные партии для регионов МПК
  const availableBatches = batches.filter(b => 
    ['confirmed', 'soft_committed', 'forecast'].includes(b.status) &&
    (!currentMpk?.intake_regions?.length || currentMpk.intake_regions.includes(b.region))
  );
  
  const activeRequests = mpkRequests.filter(r => 
    r.status === 'submitted' || r.status === 'matching' || r.status === 'partial'
  ).length;
  
  // ...
}, [batches, mpkRequests, currentMpk]);
```

---

### 3. Сравнение с Farmer Observer

**Для фермера с observer статусом:**
- ✅ Есть специальный `ObserverDashboard` компонент
- ✅ Показывается упрощенный интерфейс с информационными блоками
- ✅ Нет метрик и счетчиков

**Для МПК с observer статусом:**
- ❌ НЕТ специального dashboard
- ❌ Показывается обычный Overview с нулевыми метриками
- ❌ Пользователь видит пустые карточки

---

## Проблемы и рекомендации

### Проблема 1: Нет специального dashboard для observer МПК

**Текущее состояние:**
```typescript
// В Overview.tsx
if (role === 'farmer' && !observerLoading && isObserver) {
  return <ObserverDashboard />; // ← Только для фермера
}

// Для МПК всегда показывается обычный Overview
```

**Рекомендация:**
Создать специальный dashboard для observer МПК, аналогичный `ObserverDashboard` для фермера.

---

### Проблема 2: Пустые метрики вводят в заблуждение

**Текущее состояние:**
- Пользователь видит "0" во всех метриках
- Непонятно, почему нет данных
- Нет объяснения, что нужно дождаться активации

**Рекомендация:**
Добавить информационный баннер для observer МПК, объясняющий:
- Статус аккаунта (ожидает активации)
- Что можно делать (просмотр рынка, ценовая сетка)
- Что нельзя делать (создание заявок)
- Когда будет доступен полный функционал

---

### Проблема 3: Неправильный ключ перевода "nav.suspendedMode"

**Текущее состояние:**
- В описании изображения упоминается "nav.suspendedMode"
- Но для observer статуса показывается "Pending", а не "Suspended"

**Рекомендация:**
Проверить ключи переводов и убедиться, что:
- Для observer показывается "Pending Activation" / "Ожидает активации"
- Для suspended показывается "Suspended" / "Приостановлен"

---

## Предлагаемые улучшения

### 1. Создать ObserverMpkDashboard компонент

**Файл:** `src/components/mpk/ObserverMpkDashboard.tsx`

**Структура:**
```typescript
export function ObserverMpkDashboard({ mpkName }: { mpkName?: string }) {
  return (
    <>
      <ObserverModeBanner />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Блок 1: Market Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Обзор рынка</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Просматривайте доступные партии и рыночные данные</p>
            <Link to="/mpk/market">Перейти →</Link>
          </CardContent>
        </Card>
        
        {/* Блок 2: Price Grid */}
        <Card>
          <CardHeader>
            <CardTitle>Справочная ценовая сетка</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Ознакомьтесь с текущими справочными ценами</p>
            <Link to="/price-grid">Перейти →</Link>
          </CardContent>
        </Card>
        
        {/* Блок 3: Activation Status */}
        <Card>
          <CardHeader>
            <CardTitle>Статус активации</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Ваш аккаунт ожидает активации администратором</p>
            <p className="text-sm text-muted-foreground">
              После активации вы сможете создавать заявки на закупку
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
```

### 2. Обновить Overview.tsx

**Добавить проверку для observer МПК:**
```typescript
// После проверки для observer фермера
if (role === 'mpk' && !observerLoading && isObserver) {
  return (
    <MainLayout>
      <PageHeader 
        title="Обзор" 
        description={`Добро пожаловать в Turan Standard Pool`} 
      />
      <ObserverMpkDashboard mpkName={currentMpk?.name} />
    </MainLayout>
  );
}
```

### 3. Добавить информационный баннер

**Если оставить обычный Overview:**
Добавить баннер перед метриками:
```typescript
{role === 'mpk' && isObserver && (
  <Alert className="mb-6">
    <AlertCircle className="h-4 w-4" />
    <AlertTitle>Ожидает активации</AlertTitle>
    <AlertDescription>
      Ваш аккаунт ожидает активации администратором. 
      Вы можете просматривать рыночные данные, но не можете создавать заявки на закупку.
    </AlertDescription>
  </Alert>
)}
```

---

## Текущий поток данных

```
Новый МПК регистрируется
    ↓
registration_status = 'pending'
    ↓
deriveMpkAccountStatus() → 'observer'
    ↓
useAccountStatus() → { isObserver: true, isSuspended: false }
    ↓
Sidebar: Показывает бейдж "Pending", ограниченную навигацию
    ↓
Overview: Показывает обычный dashboard с нулевыми метриками
    ↓
Пользователь видит пустые карточки без объяснения
```

---

## Рекомендуемый поток

```
Новый МПК регистрируется
    ↓
registration_status = 'pending'
    ↓
deriveMpkAccountStatus() → 'observer'
    ↓
useAccountStatus() → { isObserver: true, isSuspended: false }
    ↓
Sidebar: Показывает бейдж "Pending", ограниченную навигацию
    ↓
Overview: Показывает ObserverMpkDashboard
    ↓
Пользователь видит:
  - Информационный баннер о статусе
  - Блоки с доступными функциями
  - Объяснение, что нужно дождаться активации
```

---

## Заключение

**Текущие проблемы:**
1. ❌ Нет специального dashboard для observer МПК
2. ❌ Пустые метрики без объяснения
3. ❌ Нет информационного баннера о статусе

**Рекомендации:**
1. ✅ Создать `ObserverMpkDashboard` компонент
2. ✅ Добавить проверку в `Overview.tsx` для observer МПК
3. ✅ Добавить информационный баннер (если оставить обычный Overview)

**Приоритет:** Средний (UX улучшение, не критично для функциональности)

