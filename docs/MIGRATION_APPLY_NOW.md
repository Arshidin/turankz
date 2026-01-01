# 🚀 Применить миграцию документации СЕЙЧАС

## Быстрый способ (1 команда)

```bash
npm run docs:migrate
```

Или:

```bash
node scripts/apply-docs-migration.cjs
```

Или:

```bash
bash scripts/apply-docs-migration.sh
```

---

## Что делать дальше:

1. **Скопируйте SQL код** из вывода скрипта (весь блок между `───`)

2. **Откройте Supabase Dashboard:**
   - https://supabase.com/dashboard/project/pyznqeopylcqdjsusyzj/sql/new

3. **Вставьте SQL** в SQL Editor

4. **Нажмите "Run"** или `Cmd/Ctrl + Enter`

5. **Проверьте результат:**
   - Table Editor → `docs_pages` ✅
   - Table Editor → `docs_navigation` ✅
   - В `docs_pages` должно быть 3 записи
   - В `docs_navigation` должно быть 3 записи

---

## ✅ Готово!

После применения миграции:
- Документация будет доступна на `docs.turanstandard.kz`
- Админы смогут управлять контентом через `/admin/docs`
- Пользователи смогут читать документацию без авторизации

---

**Время применения:** ~5-10 секунд  
**Безопасность:** Миграция использует `IF NOT EXISTS`, безопасна для повторного запуска

