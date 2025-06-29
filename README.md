# Ads Statistics Dashboard

Веб-приложение для загрузки и обработки отчетов с рекламных платформ с интеграцией Google Sheets и Telegram Mini App.

## 🚀 Функции

- 🔐 **Авторизация через Telegram WebApp** - автоматическая авторизация при переходе из Telegram
- 🤖 **Telegram Mini App** - полноценное приложение внутри Telegram
- 📊 **Загрузка XLSX отчетов** - поддержка файлов Excel (.xlsx, .xls)
- 📈 **Автоматическая обработка и валидация данных** - обработка данных и их валидация
- 🔗 **Интеграция с Google Sheets** - автоматическая вставка данных в таблицы
- 📱 **Адаптивный интерфейс** - поддержка различных устройств
- 🔄 **Отслеживание статуса обработки отчетов** - отслеживание статуса обработки файлов

## 🛠 Технологии

### Backend
- **FastAPI** - современный веб-фреймворк для Python
- **SQLAlchemy** - ORM для работы с базой данных
- **PostgreSQL** - основная база данных
- **Redis + Celery** - фоновые задачи и кеширование
- **Google Sheets API** - интеграция с Google таблицами
- **Telegram Bot API** - авторизация через Telegram
- **Alembic** - миграции базы данных
- **JWT** - аутентификация
- **Pandas** - обработка Excel файлов
- **Pytest** - тестирование

### Frontend
- **React 18** - библиотека для создания пользовательских интерфейсов
- **TypeScript** - типизированный JavaScript
- **Vite** - быстрый сборщик
- **Tailwind CSS** - утилитарный CSS фреймворк
- **React Router** - маршрутизация
- **Axios** - HTTP клиент
- **React Dropzone** - загрузка файлов
- **Vitest** - тестирование

### Telegram Bot
- **aiogram 3.x** - современная библиотека для Telegram ботов
- **WebApp API** - интеграция с Telegram Mini Apps
- **Python-dotenv** - управление переменными окружения

## 📦 Установка

### Вариант 1: Docker (Рекомендуется)

1. **Клонируйте репозиторий:**
```bash
git clone <repository-url>
cd ads_stat
```

2. **Создайте файл .env:**
```bash
cp env.example .env
# Отредактируйте .env файл с вашими настройками
```

3. **Запустите с помощью Docker Compose:**
```bash
docker-compose up -d
```

4. **Откройте приложение:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API документация: http://localhost:8000/docs

### Вариант 2: Локальная установка

#### Backend

1. **Создайте виртуальное окружение:**
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
# или
venv\Scripts\activate  # Windows
```

2. **Установите зависимости:**
```bash
pip install -r requirements.txt
```

3. **Настройте базу данных:**
```bash
# Создайте базу данных PostgreSQL
createdb ads_stat

# Или используйте SQLite для разработки
# Измените DATABASE_URL в .env на: sqlite:///./ads_stat.db
```

4. **Настройте переменные окружения:**
```bash
cp env.example .env
# Отредактируйте .env файл
```

5. **Запустите миграции:**
```bash
alembic upgrade head
```

6. **Запустите сервер:**
```bash
python run_backend.py
# или
uvicorn app.main:app --reload
```

#### Frontend

1. **Перейдите в директорию frontend:**
```bash
cd frontend
```

2. **Установите зависимости:**
```bash
npm install
```

3. **Запустите dev сервер:**
```bash
npm run dev
```

#### Telegram Bot

1. **Перейдите в директорию telegram_bot:**
```bash
cd telegram_bot
```

2. **Установите зависимости:**
```bash
pip install -r requirements.txt
```

3. **Создайте файл .env:**
```bash
# Создайте файл .env с токеном вашего бота
TELEGRAM_BOT_TOKEN=ваш_токен_бота
WEBAPP_URL=https://azkaraz.github.io/adstat/
```

4. **Запустите бота:**
```bash
python run_bot.py
```

## ⚙️ Настройка

### Telegram Bot и Mini App

1. **Создайте бота через [@BotFather](https://t.me/botfather):**
   - Отправьте `/newbot`
   - Введите имя и username бота
   - Сохраните токен

2. **Создайте Mini App через [@BotFather](https://t.me/botfather):**
   - Отправьте `/newapp`
   - Выберите вашего бота
   - Введите название и описание
   - Укажите URL: `https://azkaraz.github.io/adstat/`

3. **Настройте бота:**
   - Добавьте токен в `telegram_bot/.env`
   - Запустите бота: `python telegram_bot/run_bot.py`

4. **Протестируйте:**
   - Найдите вашего бота в Telegram
   - Отправьте `/start`
   - Нажмите кнопку "📊 Открыть Ads Statistics"

Подробная инструкция: [telegram_bot/SETUP.md](telegram_bot/SETUP.md)

### Google Sheets API

1. Создайте проект в [Google Cloud Console](https://console.cloud.google.com/)
2. Включите Google Sheets API
3. Создайте OAuth 2.0 credentials
4. Добавьте credentials в `.env` файл:
```
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
```

### База данных

Для продакшена рекомендуется использовать PostgreSQL:

```bash
# Ubuntu/Debian
sudo apt-get install postgresql postgresql-contrib

# macOS
brew install postgresql

# Создание базы данных
createdb ads_stat
```

## 📁 Структура проекта

```
ads_stat/
├── app/                    # Backend приложение
│   ├── api/               # API роуты
│   │   └── routes/        # Эндпоинты
│   ├── core/              # Конфигурация
│   ├── models/            # Модели базы данных
│   ├── services/          # Бизнес-логика
│   └── utils/             # Утилиты
├── frontend/              # Frontend приложение
│   ├── src/
│   │   ├── components/    # React компоненты
│   │   ├── pages/         # Страницы
│   │   ├── services/      # API сервисы
│   │   ├── contexts/      # React контексты
│   │   └── types/         # TypeScript типы
│   └── public/            # Статические файлы
├── telegram_bot/          # Telegram бот
│   ├── bot.py            # Основной файл бота
│   ├── config.py         # Конфигурация
│   ├── run_bot.py        # Скрипт запуска
│   ├── test_bot.py       # Тестирование
│   └── SETUP.md          # Инструкция по настройке
├── alembic/               # Миграции базы данных
├── uploads/               # Загруженные файлы
├── requirements.txt       # Python зависимости
├── package.json           # Node.js зависимости
├── docker-compose.yml     # Docker конфигурация
└── README.md             # Документация
```

## 🔌 API Endpoints

### Авторизация
- `POST /auth/telegram` - Авторизация через Telegram
- `POST /auth/google/url` - Получить URL для Google OAuth
- `POST /auth/google/callback` - Callback для Google OAuth

### Пользователь
- `GET /user/profile` - Получить профиль пользователя
- `PUT /user/profile` - Обновить профиль
- `GET /user/reports` - Список отчетов пользователя

### Google Sheets
- `POST /sheets/connect` - Подключить Google таблицу
- `GET /sheets/info` - Информация о подключенной таблице
- `DELETE /sheets/disconnect` - Отключить Google таблицу

### Загрузка файлов
- `POST /upload/report` - Загрузить отчет
- `GET /upload/report/{id}/status` - Статус обработки отчета

## 🚀 Развертывание

### Docker

```bash
# Сборка и запуск
docker-compose up -d --build

# Просмотр логов
docker-compose logs -f

# Остановка
docker-compose down
```

### Продакшен

1. **Настройте веб-сервер (Nginx):**
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

2. **Настройте SSL сертификат (Let's Encrypt):**
```bash
sudo certbot --nginx -d your-domain.com
```

3. **Настройте systemd сервисы для автозапуска**

## 🧪 Тестирование

### Backend тесты

Запуск всех тестов:
```bash
python run_tests.py backend
```

Или напрямую через pytest:
```bash
pytest tests/ -v --cov=app --cov-report=html
```

### Frontend тесты

Запуск всех тестов:
```bash
python run_tests.py frontend
```

Или из директории frontend:
```bash
cd frontend
npm test
```

### Все тесты

Запуск тестов backend и frontend:
```bash
python run_tests.py
```

### Покрытие кода

Backend покрытие генерируется автоматически в `htmlcov/` директории.

Frontend покрытие доступно через:
```bash
cd frontend
npm run test:coverage
```

## 📝 Лицензия

MIT License - см. файл [LICENSE](LICENSE) для деталей.

## 🤝 Вклад в проект

1. Форкните репозиторий
2. Создайте ветку для новой функции (`git checkout -b feature/amazing-feature`)
3. Зафиксируйте изменения (`git commit -m 'Add amazing feature'`)
4. Отправьте в ветку (`git push origin feature/amazing-feature`)
5. Откройте Pull Request

## 📞 Поддержка

Если у вас есть вопросы или проблемы:

1. Создайте Issue в GitHub
2. Опишите проблему подробно
3. Приложите логи и скриншоты при необходимости

## 🔄 Обновления

Для обновления приложения:

```bash
# Остановите сервисы
docker-compose down

# Получите последние изменения
git pull origin main

# Пересоберите и запустите
docker-compose up -d --build
```

## 📞 Поддержка

Если у вас есть вопросы или проблемы:

1. Создайте Issue в GitHub
2. Опишите проблему подробно
3. Приложите логи и конфигурацию

## 🔄 Обновления

Для обновления приложения:

```bash
# Остановите сервисы
docker-compose down

# Получите последние изменения
git pull origin main

# Пересоберите и запустите
docker-compose up -d --build
``` 