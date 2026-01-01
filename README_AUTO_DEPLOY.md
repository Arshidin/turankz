# ✅ Автоматический деплой настроен!

## 🎉 Что уже готово

✅ GitHub Actions workflows созданы  
✅ Автоматический деплой при каждом push в `main`  
✅ Поддержка Vercel, Netlify и GitHub Pages  

## 🚀 Быстрый старт (выберите один вариант)

### 1️⃣ GitHub Pages (Самый простой - 1 минута)

1. Откройте репозиторий на GitHub
2. Перейдите в **Settings** → **Pages**
3. В разделе **Source** выберите **GitHub Actions**
4. Готово! Документация будет деплоиться автоматически

**URL:** `https://YOUR_USERNAME.github.io/turankz/docs/`

---

### 2️⃣ Vercel (Для кастомного домена)

1. Перейдите на [vercel.com](https://vercel.com) → Войдите через GitHub
2. **Add New Project** → Выберите `turankz` → **Deploy**
3. Получите токены из Vercel Dashboard
4. Добавьте Secrets в GitHub: Settings → Secrets → Actions:
   - `VERCEL_TOKEN`
   - `VERCEL_ORG_ID`
   - `VERCEL_PROJECT_ID`

**URL:** `https://your-project.vercel.app/docs`

---

### 3️⃣ Netlify

1. Перейдите на [netlify.com](https://netlify.com) → Войдите через GitHub
2. **Add new site** → Import `turankz` → **Deploy site**
3. Получите токены из Netlify Dashboard
4. Добавьте Secrets в GitHub:
   - `NETLIFY_AUTH_TOKEN`
   - `NETLIFY_SITE_ID`

**URL:** `https://your-project.netlify.app/docs`

---

## 📖 Подробная инструкция

См. [`AUTO_DEPLOY_SETUP.md`](./AUTO_DEPLOY_SETUP.md) для детальной настройки.

---

## ✨ Как это работает

1. Вы делаете изменения в `docs-site/`
2. Коммитите и пушите в `main`
3. GitHub Actions автоматически собирает и деплоит
4. Документация обновляется через 1-3 минуты

**Всё автоматически!** 🎯

