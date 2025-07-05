#!/bin/bash

# Применяем миграции
echo "Applying database migrations..."
echo "Current migration status:"
alembic current
echo "Available migrations:"
alembic history --verbose
echo "Upgrading to head..."
alembic upgrade head

# Запускаем приложение
echo "Starting application..."
uvicorn app.main:app --host 0.0.0.0 --port 8000 