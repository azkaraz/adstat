#!/bin/bash

# Скрипт для запуска React frontend

echo "Запуск React frontend..."

# Переходим в директорию frontend
cd frontend

# Проверяем, установлены ли зависимости
if [ ! -d "node_modules" ]; then
    echo "Устанавливаем зависимости..."
    npm install
fi

# Запускаем dev сервер
echo "Запуск dev сервера на http://localhost:3000"
npm run dev 