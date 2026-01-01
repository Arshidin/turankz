#!/usr/bin/env node

/**
 * Скрипт для применения миграции документации в Supabase
 * 
 * Использование:
 *   node scripts/apply-docs-migration.js
 * 
 * Скрипт выводит SQL миграцию и инструкции для применения через Supabase Dashboard
 */

const fs = require('fs');
const path = require('path');

const MIGRATION_FILE = path.join(__dirname, '../supabase/migrations/20250121000002_create_docs_schema.sql');
const PROJECT_ID = 'pyznqeopylcqdjsusyzj';
const DASHBOARD_URL = `https://supabase.com/dashboard/project/${PROJECT_ID}/sql/new`;

console.log('\n🚀 Применение миграции документации в Supabase\n');
console.log('═'.repeat(70));
console.log('\n📋 ИНСТРУКЦИЯ:\n');
console.log('1. Откройте Supabase Dashboard:');
console.log(`   ${DASHBOARD_URL}\n`);
console.log('2. Скопируйте SQL код ниже (весь блок)\n');
console.log('3. Вставьте в SQL Editor\n');
console.log('4. Нажмите "Run" или Cmd/Ctrl + Enter\n');
console.log('═'.repeat(70));
console.log('\n📄 SQL МИГРАЦИЯ:\n');
console.log('─'.repeat(70));

try {
  const migrationSQL = fs.readFileSync(MIGRATION_FILE, 'utf8');
  console.log(migrationSQL);
  console.log('─'.repeat(70));
  
  console.log('\n✅ Проверка после применения:\n');
  console.log('1. Table Editor → docs_pages (должна быть создана)');
  console.log('2. Table Editor → docs_navigation (должна быть создана)');
  console.log('3. В docs_pages должно быть 3 записи');
  console.log('4. В docs_navigation должно быть 3 записи');
  console.log('5. Authentication → Policies → должно быть 5 политик\n');
  
  console.log('═'.repeat(70));
  console.log('\n💡 Совет: Скопируйте весь SQL блок выше (от ─ до ─)');
  console.log(`🔗 Откройте: ${DASHBOARD_URL}\n`);
  
} catch (error) {
  console.error('❌ Ошибка при чтении файла миграции:', error.message);
  console.error(`   Проверьте путь: ${MIGRATION_FILE}`);
  process.exit(1);
}

