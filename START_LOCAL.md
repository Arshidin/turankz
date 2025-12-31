# 🚀 Запуск проекта локально

## 📋 Быстрый старт

### 1. Установите зависимости (если еще не установлены)

```bash
cd "/Users/arshidintokhtamov/Desktop/TURAN Standart Pool/turankz"
npm install
```

Или если используете bun:
```bash
bun install
```

### 2. Запустите dev сервер

```bash
npm run dev
```

Или:
```bash
bun run dev
```

### 3. Откройте в браузере

После запуска сервера вы увидите сообщение:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

**Откройте в браузере:** http://localhost:5173

---

## 🔧 Настройка окружения

### Переменные окружения

Убедитесь, что у вас настроены переменные окружения для Supabase:

Создайте файл `.env.local` (если его нет):
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## ✅ Проверка после запуска

После открытия в браузере проверьте:

1. **Страница загружается** ✅
2. **Нет ошибок в консоли браузера** (F12 → Console)
3. **Можно войти в систему**
4. **Все страницы работают**

---

## 🧪 Тестирование изменений

После запуска локально проверьте:

### UI изменения:
- [ ] Farmer не видит "Herd Structure" в навигации
- [ ] MPK не видит "Market Intent" в Regional Outlook
- [ ] Premium UI не показывает total price
- [ ] Observer видит "Pending Activation"

### Функциональность:
- [ ] Создание batch → статус = draft
- [ ] Создание pool request → статус = draft
- [ ] Submit draft request работает
- [ ] Все переходы статусов работают

---

## 🚨 Если что-то не работает

### Проблема: Зависимости не установлены
```bash
npm install
```

### Проблема: Порт 5173 занят
```bash
# Vite автоматически найдет свободный порт
# Или укажите другой порт:
npm run dev -- --port 3000
```

### Проблема: Ошибки компиляции
```bash
# Проверьте версию Node.js (нужна 18+)
node --version

# Очистите кэш и переустановите
rm -rf node_modules package-lock.json
npm install
```

### Проблема: Supabase не подключается
- Проверьте `.env.local` файл
- Убедитесь, что переменные окружения правильные
- Проверьте, что Supabase проект активен

---

## 📝 Команды

```bash
# Запуск dev сервера
npm run dev

# Сборка для production
npm run build

# Просмотр production build
npm run preview

# Линтинг
npm run lint
```

---

**Готово! Проект должен быть доступен на http://localhost:5173**

