# Telegram Bot для Ads Statistics Dashboard

Этот бот открывает Mini App для работы с рекламной статистикой.

## Установка

1. Установите зависимости:
```bash
pip install -r requirements.txt
```

2. Создайте файл `.env` в папке `telegram_bot/`:
```env
TELEGRAM_BOT_TOKEN=ваш_токен_бота
WEBAPP_URL=https://azkaraz.github.io/adstat/
DEBUG=False
LOG_LEVEL=INFO
```

## Запуск

```bash
python run_bot.py
```

## Команды бота

- `/start` - Начать работу с ботом
- `/help` - Показать справку
- `/app` - Открыть приложение

## Функции

- Открывает Mini App через WebApp кнопки
- Поддерживает как обычные, так и inline кнопки
- Автоматическая авторизация пользователей через Telegram

## Настройка Mini App

1. Создайте бота через @BotFather
2. Получите токен бота
3. Добавьте токен в файл `.env`
4. Убедитесь, что URL вашего Mini App правильный
5. Запустите бота

## Структура файлов

- `bot.py` - Основной файл бота
- `config.py` - Конфигурация
- `run_bot.py` - Скрипт запуска
- `requirements.txt` - Зависимости
- `README.md` - Документация 