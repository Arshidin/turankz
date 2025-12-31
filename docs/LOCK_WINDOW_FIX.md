# Исправление функции "Lock Window" в админ-панели

## Проблема

Кнопка "Lock Window" в админ-панели не работала корректно:
- После нажатия и подтверждения появлялось уведомление об успешном изменении статуса
- Но фактически статус не менялся - оставался 'active' вместо 'locked'

## Причина

Функция `withEffectiveStatus` в `useMatchingWindows.ts` всегда перезаписывала статус из базы данных вычисленным статусом на основе дат:

```typescript
// ПРОБЛЕМНЫЙ КОД:
function withEffectiveStatus(window: MatchingWindow): MatchingWindow {
  const effectiveStatus = getEffectiveWindowStatus(window);
  return {
    ...window,
    status: effectiveStatus, // Всегда перезаписывает статус!
  };
}
```

**Что происходило:**
1. Админ нажимает "Lock Window" → статус обновляется в БД на 'locked'
2. При следующей загрузке данных `withEffectiveStatus` перезаписывает статус вычисленным значением
3. Если текущая дата еще не прошла `lock_date`, то `getEffectiveWindowStatus` возвращает 'active' вместо 'locked'
4. Результат: статус снова становится 'active', хотя в БД он 'locked'

## Решение

Изменена логика `withEffectiveStatus`, чтобы она **уважала ручные изменения админа**:

```typescript
// ИСПРАВЛЕННЫЙ КОД:
function withEffectiveStatus(window: MatchingWindow): MatchingWindow {
  // Если статус вручную установлен на 'locked' или 'closed', 
  // уважаем это ручное изменение и не перезаписываем
  if (window.status === 'locked' || window.status === 'closed') {
    return window; // Сохраняем вручную установленный статус
  }
  
  // Для 'upcoming' и 'active' вычисляем статус из дат
  const effectiveStatus = getEffectiveWindowStatus(window);
  return {
    ...window,
    status: effectiveStatus,
  };
}
```

## Логика работы

### Автоматическое вычисление статуса (для 'upcoming' и 'active'):
- Если текущая дата < `start_date` → 'upcoming'
- Если текущая дата <= `lock_date` → 'active'
- Если текущая дата <= `close_date` → 'locked'
- Если текущая дата > `close_date` → 'closed'

### Ручное управление админом (для 'locked' и 'closed'):
- Если админ вручную установил статус 'locked' или 'closed', этот статус **сохраняется** и не перезаписывается
- Это позволяет админу:
  - Заблокировать окно раньше `lock_date`
  - Держать окно заблокированным после `lock_date`
  - Закрыть окно вручную независимо от дат

## Результат

После исправления:
- ✅ Кнопка "Lock Window" работает корректно
- ✅ Статус 'locked' сохраняется после ручного изменения
- ✅ Статус 'closed' сохраняется после ручного изменения
- ✅ Автоматическое вычисление статуса работает для 'upcoming' и 'active'
- ✅ Админ может вручную управлять жизненным циклом окон

## Тестирование

Для проверки исправления:
1. Откройте админ-панель → "Matching Windows"
2. Найдите окно со статусом 'active'
3. Нажмите "Lock Window" и подтвердите действие
4. Проверьте, что статус изменился на 'locked' и остался таким после обновления страницы

