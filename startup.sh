#!/bin/bash

# Полная пересборка базы данных
echo "Dropping and recreating database..."

# Удаляем все таблицы напрямую через SQL
psql $DATABASE_URL -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public; GRANT ALL ON SCHEMA public TO postgres; GRANT ALL ON SCHEMA public TO public;"

echo "Database dropped successfully"

echo "Creating fresh database..."
alembic upgrade 001_initial_schema
echo "Database created successfully"

# Запускаем приложение
echo "Starting application..."
uvicorn app.main:app --host 0.0.0.0 --port 8000 