#!/bin/bash
# Скрипт для запуска проекта локально

echo "🚀 Запуск TURAN Standard Pool локально..."
echo ""

# Проверка зависимостей
if [ ! -d "node_modules" ]; then
    echo "📦 Установка зависимостей..."
    npm install
    echo ""
fi

# Запуск dev сервера
echo "🔥 Запуск dev сервера..."
echo "📍 Откройте в браузере: http://localhost:5173"
echo ""

npm run dev

