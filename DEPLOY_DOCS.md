# 🚀 Быстрый старт: Деплой документации

## Выберите платформу

### ✅ Vercel (Рекомендуется)

1. Перейдите на [vercel.com](https://vercel.com) и войдите через GitHub
2. Нажмите **"Add New Project"**
3. Выберите репозиторий `turankz`
4. Настройки уже в `vercel.json` - просто нажмите **"Deploy"**
5. После деплоя добавьте кастомный домен `turanstandard.kz` в настройках проекта

**Готово!** Документация будет автоматически деплоиться при каждом push в `main`.

---

### ✅ Netlify

1. Перейдите на [netlify.com](https://netlify.com) и войдите через GitHub
2. Нажмите **"Add new site"** → **"Import an existing project"**
3. Выберите репозиторий `turankz`
4. Настройки уже в `netlify.toml` - просто нажмите **"Deploy site"**
5. После деплоя добавьте кастомный домен `turanstandard.kz` в настройках сайта

**Готово!** Документация будет автоматически деплоиться при каждом push в `main`.

---

## 📋 Что уже настроено

✅ **Build command:** `npm run docs:build`  
✅ **Output directory:** `docs-site/.vitepress/dist`  
✅ **Base path:** `/docs/`  
✅ **Rewrites/Redirects** для правильной работы маршрутов  
✅ **Cache headers** для оптимизации производительности  

---

## 🔗 После деплоя

Документация будет доступна по адресу:
- **Vercel:** `https://your-project.vercel.app/docs`
- **Netlify:** `https://your-project.netlify.app/docs`
- **Кастомный домен:** `https://turanstandard.kz/docs` (после настройки DNS)

---

## 📚 Подробная инструкция

См. [docs-site/DEPLOYMENT.md](./docs-site/DEPLOYMENT.md) для детальной информации.

