#!/usr/bin/env node

/**
 * Simple documentation exporter to TXT format
 * Converts all markdown files to plain text
 */

const fs = require('fs');
const path = require('path');

const DOCS_DIR = path.join(__dirname, '..', 'docs-site');
const OUTPUT_DIR = path.join(__dirname, '..', 'docs-export');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Simple markdown to text converter
function markdownToText(md) {
  return md
    // Remove HTML comments
    .replace(/<!--[\s\S]*?-->/g, '')
    // Headers
    .replace(/^#{6}\s+(.+)$/gm, '$1')
    .replace(/^#{5}\s+(.+)$/gm, '$1')
    .replace(/^#{4}\s+(.+)$/gm, '$1')
    .replace(/^#{3}\s+(.+)$/gm, '$1')
    .replace(/^#{2}\s+(.+)$/gm, '$1')
    .replace(/^#{1}\s+(.+)$/gm, '$1')
    // Bold
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    // Italic
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    // Code blocks
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`([^`]+)`/g, '$1')
    // Links
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Images
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '')
    // Horizontal rules
    .replace(/^---+$/gm, '═══════════════════════════════════════════════════════════════')
    .replace(/^\*\*\*+$/gm, '═══════════════════════════════════════════════════════════════')
    // Lists
    .replace(/^\s*[-*+]\s+/gm, '  • ')
    .replace(/^\s*\d+\.\s+/gm, '  ')
    // Clean up multiple newlines
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function collectDocumentation(lang) {
  const langDir = path.join(DOCS_DIR, lang);
  if (!fs.existsSync(langDir)) {
    return null;
  }

  let content = '';
  
  // Header
  content += '═══════════════════════════════════════════════════════════════\n';
  content += '  TURAN STANDARD POOL - ПОЛНАЯ ДОКУМЕНТАЦИЯ\n';
  if (lang === 'en') {
    content += '  Complete Documentation (English)\n';
  } else {
    content += '  Полная документация (Русский)\n';
  }
  content += '═══════════════════════════════════════════════════════════════\n\n';
  content += `Version: 1.0\n`;
  content += `Date: ${new Date().toISOString().split('T')[0]}\n`;
  content += `Status: Production\n\n`;
  content += '═══════════════════════════════════════════════════════════════\n\n';

  // Table of Contents
  content += 'СОДЕРЖАНИЕ / TABLE OF CONTENTS\n';
  content += '═══════════════════════════════════════════════════════════════\n\n';
  content += '1. Introduction / Введение\n';
  content += '2. Role Model & Access Control / Модель ролей и контроль доступа\n';
  content += '3. Farmer Guide / Руководство для фермеров\n';
  content += '4. MPK Guide / Руководство для МПК\n';
  content += '5. Admin Guide / Руководство для администраторов\n';
  content += '6. Core System Modules / Основные модули системы\n';
  content += '7. Business Logic & Guardrails / Бизнес-логика и защитные меры\n';
  content += '8. Status Machines (FSM) / Машины состояний\n';
  content += '9. Data & Security Model / Модель данных и безопасности\n';
  content += '10. Limitations & Non-Goals / Ограничения и нецели\n';
  content += '11. Glossary / Глоссарий\n\n';
  content += '═══════════════════════════════════════════════════════════════\n\n';

  // Sections
  const sections = [
    { dir: 'introduction', title: 'Introduction / Введение' },
    { dir: 'roles', title: 'Role Model & Access Control / Модель ролей и контроль доступа' },
    { dir: 'farmer-guide', title: 'Farmer Guide / Руководство для фермеров' },
    { dir: 'mpk-guide', title: 'MPK Guide / Руководство для МПК' },
    { dir: 'admin-guide', title: 'Admin Guide / Руководство для администраторов' },
    { dir: 'modules', title: 'Core System Modules / Основные модули системы' },
    { dir: 'business-logic', title: 'Business Logic & Guardrails / Бизнес-логика и защитные меры' },
    { dir: 'fsm', title: 'Status Machines (FSM) / Машины состояний' },
    { dir: 'security', title: 'Data & Security Model / Модель данных и безопасности' },
    { dir: 'limitations', title: 'Limitations & Non-Goals / Ограничения и нецели' },
    { dir: 'glossary', title: 'Glossary / Глоссарий' },
  ];

  sections.forEach((section, index) => {
    const sectionFile = path.join(langDir, section.dir, 'index.md');
    
    if (fs.existsSync(sectionFile)) {
      const mdContent = fs.readFileSync(sectionFile, 'utf8');
      const textContent = markdownToText(mdContent);
      
      content += '\n';
      content += '═══════════════════════════════════════════════════════════════\n';
      content += `  ${section.title}\n`;
      content += '═══════════════════════════════════════════════════════════════\n\n';
      content += textContent;
      content += '\n\n';
    }
  });

  content += '\n═══════════════════════════════════════════════════════════════\n';
  content += '  КОНЕЦ ДОКУМЕНТАЦИИ / END OF DOCUMENTATION\n';
  content += '═══════════════════════════════════════════════════════════════\n';

  return content;
}

// Export documentation
console.log('📚 Экспорт документации Turan Standard Pool\n');

// English
const enContent = collectDocumentation('en');
if (enContent) {
  const enFile = path.join(OUTPUT_DIR, 'turan-standard-pool-docs-en.txt');
  fs.writeFileSync(enFile, enContent, 'utf8');
  console.log(`✅ Создан: ${enFile}`);
}

// Russian
const ruContent = collectDocumentation('ru');
if (ruContent) {
  const ruFile = path.join(OUTPUT_DIR, 'turan-standard-pool-docs-ru.txt');
  fs.writeFileSync(ruFile, ruContent, 'utf8');
  console.log(`✅ Создан: ${ruFile}`);
}

// Combined
if (enContent && ruContent) {
  const combinedContent = enContent + '\n\n\n' +
    '═══════════════════════════════════════════════════════════════\n' +
    '  РУССКАЯ ВЕРСИЯ / RUSSIAN VERSION\n' +
    '═══════════════════════════════════════════════════════════════\n\n\n' +
    ruContent;
  
  const combinedFile = path.join(OUTPUT_DIR, 'turan-standard-pool-docs-complete.txt');
  fs.writeFileSync(combinedFile, combinedContent, 'utf8');
  console.log(`✅ Создан: ${combinedFile}`);
}

console.log('\n✅ Экспорт завершен!');
console.log(`📁 Файлы находятся в: ${OUTPUT_DIR}/`);

