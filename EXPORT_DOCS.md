# 📥 Экспорт документации

## Быстрый экспорт

Для экспорта всей документации в текстовый формат:

```bash
npm run docs:export
```

Или напрямую:

```bash
node scripts/export-docs-simple.cjs
```

## Созданные файлы

После выполнения команды в директории `docs-export/` будут созданы:

1. **`turan-standard-pool-docs-en.txt`** - Полная документация на английском языке
2. **`turan-standard-pool-docs-ru.txt`** - Полная документация на русском языке
3. **`turan-standard-pool-docs-complete.txt`** - Объединенная версия (EN + RU)

## Формат файлов

Файлы содержат:
- ✅ Все разделы документации
- ✅ Содержание (Table of Contents)
- ✅ Полный текст всех руководств
- ✅ FSM документацию
- ✅ Бизнес-логику
- ✅ Модель безопасности
- ✅ Глоссарий

## Конвертация в PDF

### Вариант 1: Онлайн конвертер

1. Откройте созданный `.txt` файл
2. Используйте онлайн конвертер:
   - https://www.ilovepdf.com/txt-to-pdf
   - https://www.freepdfconvert.com/txt-to-pdf
   - https://convertio.co/txt-pdf/

### Вариант 2: Pandoc (если установлен)

```bash
# Установите pandoc (если еще не установлен)
# macOS:
brew install pandoc

# Затем конвертируйте:
pandoc docs-export/turan-standard-pool-docs-complete.txt \
  -o docs-export/turan-standard-pool-docs-complete.pdf \
  --pdf-engine=xelatex \
  -V geometry:margin=1in \
  -V fontsize=11pt
```

### Вариант 3: Через текстовый редактор

1. Откройте `.txt` файл в Microsoft Word или Pages
2. Сохраните как PDF (File → Export → PDF)

## Размеры файлов

- **English (EN):** ~200-300 KB
- **Русский (RU):** ~200-300 KB
- **Complete (EN + RU):** ~400-600 KB

## Использование

Экспортированные файлы можно:
- 📧 Отправить по email
- 💾 Сохранить локально
- 📱 Открыть на любом устройстве
- 🖨️ Распечатать
- 📚 Использовать для офлайн-доступа

## Обновление

Для обновления экспортированных файлов просто запустите команду снова:

```bash
npm run docs:export
```

Старые файлы будут перезаписаны.

---

**Примечание:** Экспортированные файлы находятся в директории `docs-export/`, которая добавлена в `.gitignore` и не будет включена в репозиторий.

