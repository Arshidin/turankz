# 🚀 Немедленный деплой на turanstandard.kz/docs

## Вариант 1: Через Vercel CLI (Самый быстрый)

### Шаг 1: Установите Vercel CLI

```bash
npm install -g vercel
```

### Шаг 2: Войдите в Vercel

```bash
vercel login
```

### Шаг 3: Задеплойте документацию

```bash
cd "/Users/arshidintokhtamov/Desktop/TURAN Standart Pool/turankz"
vercel --prod
```

При первом деплое Vercel спросит:
- **Set up and deploy?** → `Y`
- **Which scope?** → Выберите ваш аккаунт
- **Link to existing project?** → `N` (создать новый)
- **Project name?** → `turankz-docs` или оставьте по умолчанию
- **Directory?** → `./docs-site/.vitepress/dist`

### Шаг 4: Настройте кастомный домен

1. После деплоя перейдите на [vercel.com/dashboard](https://vercel.com/dashboard)
2. Откройте ваш проект
3. Перейдите в **Settings** → **Domains**
4. Добавьте домен: `turanstandard.kz`
5. Настройте DNS записи:
   - Добавьте CNAME запись: `docs.turanstandard.kz` → `cname.vercel-dns.com`
   - Или A запись согласно инструкциям Vercel
6. Vercel автоматически настроит SSL сертификат (обычно 1-5 минут)

**Готово!** Документация будет доступна на `https://turanstandard.kz/docs`

---

## Вариант 2: Через Vercel Dashboard (Без CLI)

### Шаг 1: Подключите проект

1. Перейдите на [vercel.com](https://vercel.com)
2. Войдите через GitHub
3. Нажмите **"Add New Project"**
4. Выберите репозиторий `turankz`
5. Настройки уже в `vercel.json`:
   - **Framework Preset:** Other
   - **Root Directory:** `/` (корень)
   - **Build Command:** `npm run docs:build`
   - **Output Directory:** `docs-site/.vitepress/dist`
6. Нажмите **"Deploy"**

### Шаг 2: Настройте кастомный домен

1. После деплоя откройте проект в Vercel Dashboard
2. Перейдите в **Settings** → **Domains**
3. Добавьте домен: `turanstandard.kz`
4. Настройте DNS записи согласно инструкциям Vercel
5. Дождитесь настройки SSL (1-5 минут)

**Готово!** Документация будет доступна на `https://turanstandard.kz/docs`

---

## Вариант 3: Через Netlify

### Шаг 1: Подключите проект

1. Перейдите на [netlify.com](https://netlify.com)
2. Войдите через GitHub
3. Нажмите **"Add new site"** → **"Import an existing project"**
4. Выберите репозиторий `turankz`
5. Настройки уже в `netlify.toml`:
   - **Build command:** `npm run docs:build`
   - **Publish directory:** `docs-site/.vitepress/dist`
6. Нажмите **"Deploy site"**

### Шаг 2: Настройте кастомный домен

1. После деплоя откройте сайт в Netlify Dashboard
2. Перейдите в **Domain settings**
3. Нажмите **"Add custom domain"**
4. Введите: `turanstandard.kz`
5. Настройте DNS записи согласно инструкциям Netlify
6. Netlify автоматически настроит SSL

**Готово!** Документация будет доступна на `https://turanstandard.kz/docs`

---

## ⚙️ Настройка DNS для turanstandard.kz

### Для Vercel:

**Вариант A: Поддомен (Рекомендуется)**
```
Type: CNAME
Name: docs
Value: cname.vercel-dns.com
```

**Вариант B: Корневой домен**
Добавьте A записи согласно инструкциям в Vercel Dashboard

### Для Netlify:

```
Type: CNAME
Name: docs (или @ для корневого домена)
Value: your-site.netlify.app
```

---

## ✅ Проверка после деплоя

После настройки DNS и SSL (обычно 1-5 минут):

1. Откройте `https://turanstandard.kz/docs`
2. Проверьте, что главная страница загружается
3. Проверьте навигацию
4. Проверьте переключение языка (EN/RU)
5. Проверьте поиск

---

## 🔄 Автоматические обновления

После первого деплоя:
- Каждый push в `main` будет автоматически деплоить документацию
- Обновления появятся через 1-3 минуты после push

---

## 🆘 Если что-то не работает

### Документация не открывается

1. Проверьте DNS записи (может потребоваться до 24 часов для распространения)
2. Проверьте SSL сертификат (обычно настраивается автоматически)
3. Убедитесь, что `base: '/docs/'` установлен в `docs-site/.vitepress/config.ts`

### 404 ошибка

1. Проверьте, что Output Directory правильный: `docs-site/.vitepress/dist`
2. Проверьте, что Build Command правильный: `npm run docs:build`
3. Убедитесь, что сборка проходит успешно

### Ссылки не работают

1. Проверьте, что все внутренние ссылки используют относительные пути
2. Убедитесь, что `base: '/docs/'` установлен в конфигурации

---

## 📞 Поддержка

Если возникли проблемы:
- Vercel: [vercel.com/support](https://vercel.com/support)
- Netlify: [netlify.com/support](https://netlify.com/support)

