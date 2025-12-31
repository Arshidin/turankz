# Тестирование и исправление локализации

## Дата: 2025-01-XX

---

## ✅ ВЫПОЛНЕННЫЕ ИСПРАВЛЕНИЯ

### 1. Логические ошибки

#### ✅ Sidebar - фильтрация poolRequests для MPK
**Проблема:** В Sidebar для MPK считались все draft requests, а не только текущего MPK.

**Исправление:**
- Добавлен `useCurrentMpk()` для получения `mpk_id`
- Фильтрация `poolRequests` теперь учитывает `r.mpk_id === currentMpk.mpk_id`
- Индикатор теперь показывает только черновики текущего MPK

**Файл:** `src/components/layout/Sidebar.tsx`

### 2. Локализация

#### ✅ Добавлены переводы для новых компонентов

**Добавлены секции в `ru.ts` и `en.ts`:**
- `firstActionPrompt` - переводы для FirstActionPrompt
- `observerDashboard` - переводы для ObserverDashboard
- `batchOnboarding` - переводы для BatchOnboarding
- `batchStatusPanel` - переводы для BatchFSMPanel
- `nav.requiresAttention` / `nav.requireAttention` - для индикаторов в навигации

#### ✅ Обновлен FirstActionPrompt
- Добавлен `useTranslation`
- Все хардкодные строки заменены на `t()`
- Поддержка русского и английского языков

---

## 🔄 В ПРОЦЕССЕ

### Компоненты, требующие обновления локализации:

1. **ObserverDashboard** (`src/components/farmer/ObserverDashboard.tsx`)
   - Использует хардкодные строки на русском
   - Нужно добавить `useTranslation` и заменить все строки

2. **BatchFSMPanel** (`src/components/batches/BatchFSMPanel.tsx`)
   - Использует `getCurrentLang()` и хардкодные строки
   - Нужно заменить на `useTranslation`

3. **BatchOnboarding** (`src/components/farmer/BatchOnboarding.tsx`)
   - Использует `getCurrentLang()` и хардкодные строки
   - Нужно заменить на `useTranslation`

4. **NewBatchDialog** (`src/components/farmer/NewBatchDialog.tsx`)
   - Использует `getCurrentLang()` и хардкодные строки
   - Нужно заменить на `useTranslation`

---

## 📋 ПЛАН ДАЛЬНЕЙШИХ ДЕЙСТВИЙ

### Приоритет 1: Завершить локализацию
- [ ] Обновить ObserverDashboard
- [ ] Обновить BatchFSMPanel
- [ ] Обновить BatchOnboarding
- [ ] Обновить NewBatchDialog

### Приоритет 2: Тестирование логики
- [ ] Проверить все FSM переходы
- [ ] Проверить RLS политики
- [ ] Проверить валидацию форм
- [ ] Проверить индикаторы в навигации

### Приоритет 3: Функциональное тестирование
- [ ] Создание batch (все шаги)
- [ ] Публикация batch
- [ ] Переходы статусов
- [ ] Создание pool request
- [ ] Сопоставление пулов
- [ ] Исполнение контрактов

---

## 🐛 ИЗВЕСТНЫЕ ПРОБЛЕМЫ

### Нет критических проблем

Все основные логические ошибки исправлены.

---

## 📝 ЗАМЕТКИ

- Все переводы добавлены в локализацию
- Логическая ошибка с фильтрацией poolRequests исправлена
- FirstActionPrompt полностью локализован

