# Проблема: Watchlist показывает тестовые данные

## Проблема

В разделе "Watchlist" (Отслеживание) для МПК отображаются **жестко закодированные тестовые данные**, даже если МПК еще не добавлял ничего в отслеживаемые.

## Анализ кода

### Текущая реализация (`src/pages/mpk/Watchlist.tsx`)

1. **Тестовые данные в коде:**
   ```typescript
   const watchlistItems: WatchlistItem[] = [
     { id: '1', region: 'Almaty', ... },
     { id: '2', region: 'Akmola', ... },
     { id: '3', region: 'Karaganda', ... },
     { id: '4', region: 'East KZ', ... },
   ];
   ```

2. **Комментарий в коде:**
   ```typescript
   // Filter watchlist items based on criteria (using mock data for watchlist structure)
   // In production, this would be a saved watchlist in the database
   ```

3. **Нет таблицы watchlist в базе данных** - нет миграции, которая создает таблицу для хранения watchlist элементов.

4. **Кнопка "Add to Watchlist"** в `MarketOverview.tsx` не работает (нет функционала).

## Требования из документации

Из `docs/ACCESS_CONTROL.md`:
- **MPK может видеть:** "Watchlist items | ✅ Own only" - только свои элементы watchlist
- Watchlist должен быть привязан к конкретному МПК

## Правильная логика

1. **Watchlist должен храниться в базе данных** в таблице `mpk_watchlist`
2. **Каждый МПК видит только свои элементы** watchlist
3. **Если МПК ничего не добавил**, должен показываться пустой список с сообщением "Your watchlist is empty"
4. **МПК должен иметь возможность:**
   - Добавлять регионы/недели в watchlist из MarketOverview
   - Удалять элементы из watchlist
   - Видеть реальные данные по отслеживаемым регионам (из batches)

## Что нужно исправить

1. ✅ Убрать тестовые данные из кода
2. ✅ Создать таблицу `mpk_watchlist` в базе данных
3. ✅ Создать хук для работы с watchlist (добавление, удаление, получение)
4. ✅ Обновить компонент Watchlist для работы с реальными данными из БД
5. ✅ Реализовать функционал "Add to Watchlist" в MarketOverview

