# Ads Stat Frontend

Фронтенд для приложения статистики рекламы с Telegram авторизацией.

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

### Автоматический деплой (рекомендуется)

1. Убедитесь, что у вас есть GitHub репозиторий
2. Замените `your-username` в `package.json` на ваше имя пользователя GitHub
3. Замените `your-username` в `vite.config.ts` на ваше имя пользователя GitHub
4. Замените `your-username` в `src/config.ts` на ваше имя пользователя GitHub
5. Настройте GitHub Actions (файл уже создан в `.github/workflows/deploy.yml`)
6. При каждом push в main ветку будет автоматический деплой

### Ручной деплой

```bash
npm run deploy
```

## Настройка для Telegram Apps

1. В Telegram Bot API укажите URL: `https://your-username.github.io/ads_stat`
2. Убедитесь, что ваш бэкенд доступен по HTTPS
3. Обновите `VITE_API_BASE_URL` в переменных окружения

## Переменные окружения

Создайте файл `.env` в папке frontend:

```env
VITE_API_BASE_URL=https://your-backend-domain.com
VITE_TELEGRAM_BOT_TOKEN=your_telegram_bot_token
VITE_APP_DOMAIN=https://your-username.github.io
``` 