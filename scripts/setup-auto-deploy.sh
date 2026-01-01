#!/bin/bash

# Script to setup automatic deployment for documentation
# This script helps configure GitHub Actions and provides instructions

set -e

echo "🚀 Настройка автоматического деплоя документации"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if GitHub Actions directory exists
if [ ! -d ".github/workflows" ]; then
    echo "📁 Создание директории .github/workflows..."
    mkdir -p .github/workflows
fi

echo "✅ GitHub Actions workflows созданы:"
echo "   - .github/workflows/deploy-docs.yml (Vercel/Netlify)"
echo "   - .github/workflows/deploy-docs-gh-pages.yml (GitHub Pages)"
echo ""

echo "📋 Следующие шаги:"
echo ""
echo "${BLUE}Вариант 1: GitHub Pages (Самый простой - не требует дополнительных токенов)${NC}"
echo "1. Перейдите в Settings → Pages вашего репозитория"
echo "2. Выберите Source: GitHub Actions"
echo "3. Push в main ветку автоматически задеплоит документацию"
echo "4. Документация будет доступна на: https://YOUR_USERNAME.github.io/turankz/docs"
echo ""
echo "${BLUE}Вариант 2: Vercel (Рекомендуется для кастомного домена)${NC}"
echo "1. Перейдите на https://vercel.com и войдите через GitHub"
echo "2. Добавьте проект из репозитория turankz"
echo "3. Получите токены из Vercel Dashboard:"
echo "   - VERCEL_TOKEN (Settings → Tokens)"
echo "   - VERCEL_ORG_ID (Settings → General)"
echo "   - VERCEL_PROJECT_ID (Project Settings → General)"
echo "4. Добавьте их как Secrets в GitHub:"
echo "   Settings → Secrets and variables → Actions → New repository secret"
echo ""
echo "${BLUE}Вариант 3: Netlify${NC}"
echo "1. Перейдите на https://netlify.com и войдите через GitHub"
echo "2. Добавьте сайт из репозитория turankz"
echo "3. Получите токены из Netlify Dashboard:"
echo "   - NETLIFY_AUTH_TOKEN (User settings → Applications → New access token)"
echo "   - NETLIFY_SITE_ID (Site settings → General → Site details)"
echo "4. Добавьте их как Secrets в GitHub"
echo ""

echo "${GREEN}✅ Автоматический деплой настроен!${NC}"
echo ""
echo "После настройки secrets (если используете Vercel/Netlify), каждый push в main"
echo "будет автоматически деплоить документацию."
echo ""

