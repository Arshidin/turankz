#!/bin/bash

# Скрипт для применения миграции документации в Supabase
# 
# Использование:
#   bash scripts/apply-docs-migration.sh
#   или
#   chmod +x scripts/apply-docs-migration.sh && ./scripts/apply-docs-migration.sh

MIGRATION_FILE="supabase/migrations/20250121000002_create_docs_schema.sql"
PROJECT_ID="pyznqeopylcqdjsusyzj"
DASHBOARD_URL="https://supabase.com/dashboard/project/${PROJECT_ID}/sql/new"

echo ""
echo "🚀 Применение миграции документации в Supabase"
echo ""
echo "═══════════════════════════════════════════════════════════════════════"
echo ""
echo "📋 ИНСТРУКЦИЯ:"
echo ""
echo "1. Откройте Supabase Dashboard:"
echo "   ${DASHBOARD_URL}"
echo ""
echo "2. Скопируйте SQL код ниже (весь блок)"
echo ""
echo "3. Вставьте в SQL Editor"
echo ""
echo "4. Нажмите 'Run' или Cmd/Ctrl + Enter"
echo ""
echo "═══════════════════════════════════════════════════════════════════════"
echo ""
echo "📄 SQL МИГРАЦИЯ:"
echo ""
echo "───────────────────────────────────────────────────────────────────────"

if [ ! -f "$MIGRATION_FILE" ]; then
    echo "❌ Ошибка: Файл миграции не найден: $MIGRATION_FILE"
    exit 1
fi

cat "$MIGRATION_FILE"

echo ""
echo "───────────────────────────────────────────────────────────────────────"
echo ""
echo "✅ Проверка после применения:"
echo ""
echo "1. Table Editor → docs_pages (должна быть создана)"
echo "2. Table Editor → docs_navigation (должна быть создана)"
echo "3. В docs_pages должно быть 3 записи"
echo "4. В docs_navigation должно быть 3 записи"
echo "5. Authentication → Policies → должно быть 5 политик"
echo ""
echo "═══════════════════════════════════════════════════════════════════════"
echo ""
echo "💡 Совет: Скопируйте весь SQL блок выше"
echo "🔗 Откройте: ${DASHBOARD_URL}"
echo ""

