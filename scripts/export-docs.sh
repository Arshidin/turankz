#!/bin/bash

# Script to export all documentation to PDF/TXT format
# Usage: ./scripts/export-docs.sh [format]
# Format: pdf, txt, or both (default: both)

set -e

FORMAT=${1:-both}
OUTPUT_DIR="docs-export"
DOCS_DIR="docs-site"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "📚 Экспорт документации Turan Standard Pool"
echo ""

# Create output directory
mkdir -p "$OUTPUT_DIR"

# Function to convert markdown to text
convert_md_to_txt() {
    local md_file=$1
    local txt_file=$2
    
    # Remove markdown syntax, keep structure
    sed 's/^#\{1,6\} //' "$md_file" | \
    sed 's/\*\*\([^*]*\)\*\*/\\1/g' | \
    sed 's/\*\([^*]*\)\*/\\1/g' | \
    sed 's/`\([^`]*\)`/\\1/g' | \
    sed 's/\[\([^\]]*\)\]([^)]*)/\\1/g' | \
    sed 's/^---$//' | \
    sed '/^$/N;/^\\n$/d' > "$txt_file"
}

# Function to collect all documentation
collect_docs() {
    local lang=$1
    local output_file=$2
    
    echo "" > "$output_file"
    echo "═══════════════════════════════════════════════════════════════" >> "$output_file"
    echo "  TURAN STANDARD POOL - ПОЛНАЯ ДОКУМЕНТАЦИЯ" >> "$output_file"
    if [ "$lang" = "en" ]; then
        echo "  Complete Documentation (English)" >> "$output_file"
    else
        echo "  Полная документация (Русский)" >> "$output_file"
    fi
    echo "═══════════════════════════════════════════════════════════════" >> "$output_file"
    echo "" >> "$output_file"
    echo "Version: 1.0" >> "$output_file"
    echo "Date: $(date +'%Y-%m-%d')" >> "$output_file"
    echo "Status: Production" >> "$output_file"
    echo "" >> "$output_file"
    echo "═══════════════════════════════════════════════════════════════" >> "$output_file"
    echo "" >> "$output_file"
    
    # Table of Contents
    echo "СОДЕРЖАНИЕ / TABLE OF CONTENTS" >> "$output_file"
    echo "═══════════════════════════════════════════════════════════════" >> "$output_file"
    echo "" >> "$output_file"
    echo "1. Introduction / Введение" >> "$output_file"
    echo "2. Role Model & Access Control / Модель ролей и контроль доступа" >> "$output_file"
    echo "3. Farmer Guide / Руководство для фермеров" >> "$output_file"
    echo "4. MPK Guide / Руководство для МПК" >> "$output_file"
    echo "5. Admin Guide / Руководство для администраторов" >> "$output_file"
    echo "6. Core System Modules / Основные модули системы" >> "$output_file"
    echo "7. Business Logic & Guardrails / Бизнес-логика и защитные меры" >> "$output_file"
    echo "8. Status Machines (FSM) / Машины состояний" >> "$output_file"
    echo "9. Data & Security Model / Модель данных и безопасности" >> "$output_file"
    echo "10. Limitations & Non-Goals / Ограничения и нецели" >> "$output_file"
    echo "11. Glossary / Глоссарий" >> "$output_file"
    echo "" >> "$output_file"
    echo "═══════════════════════════════════════════════════════════════" >> "$output_file"
    echo "" >> "$output_file"
    
    # Process each section
    local sections=(
        "introduction:Introduction / Введение"
        "roles:Role Model & Access Control / Модель ролей и контроль доступа"
        "farmer-guide:Farmer Guide / Руководство для фермеров"
        "mpk-guide:MPK Guide / Руководство для МПК"
        "admin-guide:Admin Guide / Руководство для администраторов"
        "modules:Core System Modules / Основные модули системы"
        "business-logic:Business Logic & Guardrails / Бизнес-логика и защитные меры"
        "fsm:Status Machines (FSM) / Машины состояний"
        "security:Data & Security Model / Модель данных и безопасности"
        "limitations:Limitations & Non-Goals / Ограничения и нецели"
        "glossary:Glossary / Глоссарий"
    )
    
    for section_info in "${sections[@]}"; do
        IFS=':' read -r section_name section_title <<< "$section_info"
        local section_file="$DOCS_DIR/$lang/$section_name/index.md"
        
        if [ -f "$section_file" ]; then
            echo "" >> "$output_file"
            echo "═══════════════════════════════════════════════════════════════" >> "$output_file"
            echo "  $section_title" >> "$output_file"
            echo "═══════════════════════════════════════════════════════════════" >> "$output_file"
            echo "" >> "$output_file"
            
            # Convert markdown to plain text
            convert_md_to_txt "$section_file" "$output_file.tmp"
            cat "$output_file.tmp" >> "$output_file"
            rm -f "$output_file.tmp"
            
            echo "" >> "$output_file"
            echo "" >> "$output_file"
        fi
    done
    
    echo "" >> "$output_file"
    echo "═══════════════════════════════════════════════════════════════" >> "$output_file"
    echo "  КОНЕЦ ДОКУМЕНТАЦИИ / END OF DOCUMENTATION" >> "$output_file"
    echo "═══════════════════════════════════════════════════════════════" >> "$output_file"
}

# Export English documentation
if [ "$FORMAT" = "txt" ] || [ "$FORMAT" = "both" ]; then
    echo "${BLUE}📝 Создание TXT файла (English)...${NC}"
    collect_docs "en" "$OUTPUT_DIR/turan-standard-pool-docs-en.txt"
    echo "${GREEN}✅ Создан: $OUTPUT_DIR/turan-standard-pool-docs-en.txt${NC}"
fi

# Export Russian documentation
if [ "$FORMAT" = "txt" ] || [ "$FORMAT" = "both" ]; then
    echo "${BLUE}📝 Создание TXT файла (Русский)...${NC}"
    collect_docs "ru" "$OUTPUT_DIR/turan-standard-pool-docs-ru.txt"
    echo "${GREEN}✅ Создан: $OUTPUT_DIR/turan-standard-pool-docs-ru.txt${NC}"
fi

# Export combined documentation
if [ "$FORMAT" = "txt" ] || [ "$FORMAT" = "both" ]; then
    echo "${BLUE}📝 Создание объединенного TXT файла (EN + RU)...${NC}"
    {
        cat "$OUTPUT_DIR/turan-standard-pool-docs-en.txt"
        echo ""
        echo ""
        echo "═══════════════════════════════════════════════════════════════"
        echo "  РУССКАЯ ВЕРСИЯ / RUSSIAN VERSION"
        echo "═══════════════════════════════════════════════════════════════"
        echo ""
        echo ""
        cat "$OUTPUT_DIR/turan-standard-pool-docs-ru.txt"
    } > "$OUTPUT_DIR/turan-standard-pool-docs-complete.txt"
    echo "${GREEN}✅ Создан: $OUTPUT_DIR/turan-standard-pool-docs-complete.txt${NC}"
fi

# Export to PDF if pandoc is available
if [ "$FORMAT" = "pdf" ] || [ "$FORMAT" = "both" ]; then
    if command -v pandoc &> /dev/null; then
        echo "${BLUE}📄 Создание PDF файлов...${NC}"
        
        # English PDF
        if [ -f "$OUTPUT_DIR/turan-standard-pool-docs-en.txt" ]; then
            pandoc "$OUTPUT_DIR/turan-standard-pool-docs-en.txt" \
                -o "$OUTPUT_DIR/turan-standard-pool-docs-en.pdf" \
                --pdf-engine=wkhtmltopdf 2>/dev/null || \
            pandoc "$DOCS_DIR/en/index.md" \
                -o "$OUTPUT_DIR/turan-standard-pool-docs-en.pdf" \
                --pdf-engine=xelatex -V geometry:margin=1in 2>/dev/null || \
            echo "${YELLOW}⚠️  Pandoc доступен, но PDF конвертация требует дополнительных настроек${NC}"
        fi
        
        # Russian PDF
        if [ -f "$OUTPUT_DIR/turan-standard-pool-docs-ru.txt" ]; then
            pandoc "$OUTPUT_DIR/turan-standard-pool-docs-ru.txt" \
                -o "$OUTPUT_DIR/turan-standard-pool-docs-ru.pdf" \
                --pdf-engine=wkhtmltopdf 2>/dev/null || \
            pandoc "$DOCS_DIR/ru/index.md" \
                -o "$OUTPUT_DIR/turan-standard-pool-docs-ru.pdf" \
                --pdf-engine=xelatex -V geometry:margin=1in 2>/dev/null || \
            echo "${YELLOW}⚠️  Pandoc доступен, но PDF конвертация требует дополнительных настроек${NC}"
        fi
    else
        echo "${YELLOW}⚠️  Pandoc не установлен. Установите для создания PDF:${NC}"
        echo "   brew install pandoc (macOS)"
        echo "   или используйте онлайн конвертер для TXT → PDF"
    fi
fi

echo ""
echo "${GREEN}✅ Экспорт завершен!${NC}"
echo ""
echo "📁 Файлы находятся в директории: $OUTPUT_DIR/"
echo ""
ls -lh "$OUTPUT_DIR/" 2>/dev/null || echo "Директория создана"

