#!/bin/bash

# Применяем миграции
alembic upgrade head
echo "Database migrated successfully"

# Запускаем приложение
echo "Starting application..."
uvicorn app.main:app --host 0.0.0.0 --port 8000 