# 🚀 Деплой - Быстрый старт

## 📋 Что нужно сделать

### 1. Тестирование (ОБЯЗАТЕЛЬНО!)
```bash
# Протестировать на dev окружении
# См. TESTING_PLAN.md для деталей
```

### 2. Backup
```bash
# Создать backup production БД
supabase db dump -f backup_$(date +%Y%m%d_%H%M%S).sql
```

### 3. Деплой
```bash
# Применить миграции
supabase db push

# Деплой frontend (зависит от вашего провайдера)
git push origin main
```

### 4. Проверка
- См. `DEPLOYMENT_CHECKLIST.md`

---

## 📚 Документация

- **TESTING_PLAN.md** - План тестирования
- **DEPLOYMENT_GUIDE.md** - Детальное руководство
- **DEPLOYMENT_CHECKLIST.md** - Чеклист для деплоя
- **DEPLOYMENT_READY.md** - Статус готовности

---

## ⚠️ ВАЖНО

1. **Миграция 2 требует downtime** (1-5 минут)
2. **Применяйте миграции строго по порядку**
3. **Обязательно создайте backup перед началом**

---

**Готово к деплою!** ✅

