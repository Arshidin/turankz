# 🚀 Автоматический деплой документации - Настройка

## ✅ Что уже настроено

Автоматический деплой через GitHub Actions уже настроен! При каждом push в `main` ветку документация будет автоматически собираться и деплоиться.

## 🎯 Варианты деплоя

### Вариант 1: GitHub Pages (Самый простой - Рекомендуется для начала)

**Преимущества:**
- ✅ Не требует дополнительных токенов
- ✅ Работает сразу после настройки
- ✅ Бесплатно
- ✅ Автоматический HTTPS

**Настройка (1 минута):**

1. Перейдите в ваш репозиторий на GitHub
2. Откройте **Settings** → **Pages**
3. В разделе **Source** выберите **GitHub Actions**
4. Сохраните изменения

**Готово!** После следующего push в `main` документация автоматически задеплоится.

**URL документации:**
- `https://YOUR_USERNAME.github.io/turankz/docs/`

**Примечание:** Если хотите использовать кастомный домен `turanstandard.kz`, используйте Вариант 2 или 3.

---

### Вариант 2: Vercel (Рекомендуется для кастомного домена)

**Преимущества:**
- ✅ Простая настройка кастомного домена
- ✅ Быстрый CDN
- ✅ Preview deployments для PR

**Настройка:**

1. **Подключите проект к Vercel:**
   - Перейдите на [vercel.com](https://vercel.com)
   - Войдите через GitHub
   - Нажмите **"Add New Project"**
   - Выберите репозиторий `turankz`
   - Настройки уже в `vercel.json` - нажмите **"Deploy"**

2. **Получите токены из Vercel:**
   - **VERCEL_TOKEN:** Settings → Tokens → Create Token
   - **VERCEL_ORG_ID:** Settings → General → Team ID
   - **VERCEL_PROJECT_ID:** Project Settings → General → Project ID

3. **Добавьте Secrets в GitHub:**
   - Перейдите в репозиторий → **Settings** → **Secrets and variables** → **Actions**
   - Нажмите **"New repository secret"**
   - Добавьте три секрета:
     - `VERCEL_TOKEN`
     - `VERCEL_ORG_ID`
     - `VERCEL_PROJECT_ID`

**Готово!** GitHub Actions будет автоматически деплоить на Vercel.

**URL документации:**
- `https://your-project.vercel.app/docs`
- После настройки DNS: `https://turanstandard.kz/docs`

---

### Вариант 3: Netlify

**Преимущества:**
- ✅ Бесплатный план
- ✅ Простая настройка
- ✅ Встроенная поддержка форм

**Настройка:**

1. **Подключите проект к Netlify:**
   - Перейдите на [netlify.com](https://netlify.com)
   - Войдите через GitHub
   - Нажмите **"Add new site"** → **"Import an existing project"**
   - Выберите репозиторий `turankz`
   - Настройки уже в `netlify.toml` - нажмите **"Deploy site"**

2. **Получите токены из Netlify:**
   - **NETLIFY_AUTH_TOKEN:** User settings → Applications → New access token
   - **NETLIFY_SITE_ID:** Site settings → General → Site details → Site ID

3. **Добавьте Secrets в GitHub:**
   - Перейдите в репозиторий → **Settings** → **Secrets and variables** → **Actions**
   - Нажмите **"New repository secret"**
   - Добавьте два секрета:
     - `NETLIFY_AUTH_TOKEN`
     - `NETLIFY_SITE_ID`

**Готово!** GitHub Actions будет автоматически деплоить на Netlify.

**URL документации:**
- `https://your-project.netlify.app/docs`
- После настройки DNS: `https://turanstandard.kz/docs`

---

## 🔄 Как это работает

1. Вы делаете изменения в документации
2. Коммитите и пушите в `main` ветку
3. GitHub Actions автоматически:
   - Устанавливает зависимости
   - Собирает документацию (`npm run docs:build`)
   - Деплоит на выбранную платформу
4. Документация обновляется автоматически (обычно 1-3 минуты)

---

## 📋 Проверка работы

После настройки:

1. Сделайте небольшое изменение в документации
2. Закоммитьте и запушьте в `main`
3. Перейдите в **Actions** вкладку на GitHub
4. Убедитесь, что workflow запустился и завершился успешно
5. Проверьте, что документация обновилась на сайте

---

## 🛠️ Troubleshooting

### GitHub Actions не запускается

**Решение:** Убедитесь, что файлы `.github/workflows/*.yml` находятся в репозитории

### Ошибка при деплое на Vercel/Netlify

**Решение:** Проверьте, что все Secrets правильно добавлены в GitHub

### Документация не открывается

**Решение:** 
- Для GitHub Pages: Убедитесь, что в Settings → Pages выбран "GitHub Actions"
- Для Vercel/Netlify: Проверьте, что base path `/docs/` правильно настроен

### Ссылки не работают

**Решение:** Убедитесь, что `base: '/docs/'` установлен в `docs-site/.vitepress/config.ts`

---

## 📚 Дополнительная информация

- Подробное руководство: [`docs-site/DEPLOYMENT.md`](./docs-site/DEPLOYMENT.md)
- Быстрый старт: [`DEPLOY_DOCS.md`](./DEPLOY_DOCS.md)

---

## ✅ Готово!

После настройки одного из вариантов, документация будет автоматически деплоиться при каждом push. Никаких дополнительных действий не требуется!

