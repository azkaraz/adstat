# Ads Stat Frontend

Фронтенд для приложения статистики рекламы с Telegram авторизацией.

## 🚀 Деплой

Приложение развернуто на GitHub Pages: **https://azkaraz.github.io/adstat**

## Установка

```bash
npm install
```

## Разработка

```bash
npm run dev
```

## Сборка

```bash
npm run build
```

## Деплой на GitHub Pages

### Автоматический деплой (настроен)

1. При каждом push в main ветку автоматически запускается GitHub Actions
2. Сборка и деплой происходят автоматически
3. Сайт обновляется в течение 2-5 минут

### Ручной деплой

```bash
npm run deploy
```

## Настройка для Telegram Apps

### 1. Telegram Bot настройки

В вашем Telegram боте (через @BotFather):

```
/setdomain
```

Укажите домен: `azkaraz.github.io`

### 2. Переменные окружения

Создайте файл `.env.production` в папке frontend:

```env
VITE_API_BASE_URL=https://your-backend-domain.com
VITE_TELEGRAM_BOT_TOKEN=your_telegram_bot_token
VITE_APP_DOMAIN=https://azkaraz.github.io
```

### 3. Бэкенд

Убедитесь, что ваш бэкенд:
- Доступен по HTTPS
- Настроен для работы с доменом `azkaraz.github.io`
- Имеет CORS настройки для этого домена

## Структура проекта

```
frontend/
├── src/
│   ├── components/     # React компоненты
│   ├── pages/         # Страницы приложения
│   ├── services/      # API сервисы
│   ├── contexts/      # React контексты
│   └── config.ts      # Конфигурация
├── public/            # Статические файлы
└── dist/              # Собранное приложение
```

## Технологии

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Axios
- React Router 