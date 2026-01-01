#!/bin/bash

# Script to deploy documentation to Vercel
# Usage: ./scripts/deploy-docs.sh

set -e

echo "🚀 Деплой документации на turanstandard.kz/docs"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "${RED}❌ Ошибка: Запустите скрипт из корня проекта${NC}"
    exit 1
fi

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "${YELLOW}⚠️  Vercel CLI не установлен${NC}"
    echo ""
    echo "Установите Vercel CLI:"
    echo "  npm install -g vercel"
    echo ""
    echo "Или используйте веб-интерфейс:"
    echo "  1. Перейдите на https://vercel.com"
    echo "  2. Войдите через GitHub"
    echo "  3. Add New Project → Выберите turankz → Deploy"
    echo ""
    exit 1
fi

echo "${BLUE}📦 Сборка документации...${NC}"
npm run docs:build

if [ ! -d "docs-site/.vitepress/dist" ]; then
    echo "${RED}❌ Ошибка: Сборка не удалась${NC}"
    exit 1
fi

echo "${GREEN}✅ Сборка завершена${NC}"
echo ""

# Check if user is logged in to Vercel
if ! vercel whoami &> /dev/null; then
    echo "${YELLOW}⚠️  Вы не вошли в Vercel${NC}"
    echo "Войдите: vercel login"
    exit 1
fi

echo "${BLUE}🚀 Деплой на Vercel...${NC}"
echo ""

# Deploy to Vercel
vercel --prod --yes

echo ""
echo "${GREEN}✅ Деплой завершен!${NC}"
echo ""
echo "${BLUE}📝 Следующие шаги для настройки кастомного домена:${NC}"
echo ""
echo "1. Перейдите в Vercel Dashboard: https://vercel.com/dashboard"
echo "2. Откройте ваш проект"
echo "3. Перейдите в Settings → Domains"
echo "4. Добавьте домен: turanstandard.kz"
echo "5. Настройте DNS записи согласно инструкциям Vercel"
echo "6. Vercel автоматически настроит SSL сертификат (1-5 минут)"
echo ""
echo "Документация будет доступна на: https://turanstandard.kz/docs"
echo ""

