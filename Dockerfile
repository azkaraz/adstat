# Используем официальный образ Python
FROM python:3.11-slim

# Устанавливаем рабочую директорию
WORKDIR /app

# Устанавливаем системные зависимости
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Копируем файлы зависимостей
COPY requirements.txt .

# Устанавливаем Python зависимости
RUN pip install --no-cache-dir -r requirements.txt

# Копируем код приложения
COPY . .

# Создаем директорию для загрузок
RUN mkdir -p uploads

# Делаем startup скрипт исполняемым
COPY startup.sh .
RUN chmod +x startup.sh

# Открываем порт
EXPOSE 8000

# Команда для запуска приложения с миграциями
CMD ["./startup.sh"] 