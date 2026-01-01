# ⚡ Быстрый деплой на turanstandard.kz/docs

## 🎯 Самый быстрый способ (5 минут)

### Шаг 1: Подключите проект к Vercel

1. Откройте: https://vercel.com/new
2. Войдите через GitHub
3. Нажмите **"Import"** рядом с репозиторием `turankz`
4. Настройки уже готовы в `vercel.json`:
   - ✅ Build Command: `npm run docs:build`
   - ✅ Output Directory: `docs-site/.vitepress/dist`
5. Нажмите **"Deploy"**

**⏱️ Деплой займет 1-2 минуты**

---

### Шаг 2: Настройте кастомный домен

1. После деплоя откройте проект в Vercel Dashboard
2. Перейдите в **Settings** → **Domains**
3. Нажмите **"Add"** и введите: `turanstandard.kz`
4. Vercel покажет инструкции по настройке DNS

**Настройка DNS:**

**Вариант A: Поддомен (Рекомендуется)**
```
Type: CNAME
Name: docs
Value: cname.vercel-dns.com
```

**Вариант B: Корневой домен**
Добавьте A записи, которые покажет Vercel (обычно 4 IP адреса)

5. Сохраните DNS записи у вашего регистратора домена
6. Vercel автоматически настроит SSL (1-5 минут)

**✅ Готово!** Документация будет на `https://turanstandard.kz/docs`

---

## 🔄 Автоматические обновления

После первого деплоя:
- Каждый push в `main` автоматически обновит документацию
- Обновления появятся через 1-3 минуты

---

## 🛠️ Альтернатива: Через командную строку

Если у вас установлен Vercel CLI:

```bash
# Установите Vercel CLI (если еще не установлен)
npm install -g vercel

# Войдите в Vercel
vercel login

# Задеплойте
./scripts/deploy-docs.sh
```

Или вручную:

```bash
npm run docs:build
vercel --prod
```

---

## 📋 Проверка после деплоя

1. ✅ Откройте `https://turanstandard.kz/docs`
2. ✅ Проверьте главную страницу
3. ✅ Проверьте навигацию
4. ✅ Проверьте переключение языка (EN/RU)
5. ✅ Проверьте поиск

---

## 🆘 Проблемы?

### Документация не открывается

1. Проверьте DNS записи (может потребоваться до 24 часов)
2. Проверьте SSL сертификат в Vercel Dashboard
3. Убедитесь, что домен правильно добавлен в Vercel

### 404 ошибка

1. Проверьте, что Output Directory правильный: `docs-site/.vitepress/dist`
2. Проверьте логи деплоя в Vercel Dashboard

### Ссылки не работают

1. Убедитесь, что `base: '/docs/'` установлен в `docs-site/.vitepress/config.ts`

---

## 📞 Нужна помощь?

- Vercel Support: https://vercel.com/support
- Документация: [`DEPLOY_NOW.md`](./DEPLOY_NOW.md)

