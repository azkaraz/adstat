#!/bin/bash

# Полная пересборка базы данных
echo "Dropping and recreating database..."
alembic downgrade base
echo "Database dropped successfully"

echo "Creating fresh database..."
alembic upgrade head
echo "Database created successfully"

# Запускаем приложение
echo "Starting application..."
uvicorn app.main:app --host 0.0.0.0 --port 8000 