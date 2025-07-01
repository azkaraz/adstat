# 🔧 Настройка Mini App в BotFather

## 🚨 Проблема
Авторизация Telegram не работает, потому что хеши не совпадают. Это происходит из-за того, что Mini App не настроен в BotFather.

## ✅ Решение

### Шаг 1: Создание Mini App

1. **Откройте Telegram** и найдите @BotFather
2. **Отправьте команду** `/newapp`
3. **Выберите вашего бота** `@ads_statistic_bot` из списка
4. **Введите название приложения**: `Ads Statistics Dashboard`
5. **Введите короткое описание**: `Личный кабинет для управления рекламными отчетами`
6. **Загрузите иконку** (512x512px) - можно использовать любую подходящую иконку
7. **Введите URL приложения**: `https://azkaraz.github.io/adstat/`

### Шаг 2: Проверка настроек

После создания Mini App, BotFather выдаст вам информацию о приложении. Убедитесь, что:

- ✅ **URL правильный**: `https://azkaraz.github.io/adstat/`
- ✅ **Название корректное**: `Ads Statistics Dashboard`
- ✅ **Иконка загружена**

### Шаг 3: Настройка команд бота

Отправьте @BotFather команду `/setcommands` и выберите вашего бота `@ads_statistic_bot`:

```
start - Начать работу с ботом
help - Показать справку
app - Открыть приложение
```

### Шаг 4: Настройка кнопки WebApp

В коде бота добавьте кнопку WebApp в команду `/start`:

```python
from telegram import InlineKeyboardButton, InlineKeyboardMarkup

def start_command(update, context):
    keyboard = [
        [InlineKeyboardButton("📊 Открыть Ads Statistics", web_app=WebAppInfo(url="https://azkaraz.github.io/adstat/"))]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    update.message.reply_text(
        "Добро пожаловать в Ads Statistics Dashboard!\n\nНажмите кнопку ниже, чтобы открыть приложение:",
        reply_markup=reply_markup
    )
```

### Шаг 5: Тестирование

1. **Найдите вашего бота** `@ads_statistic_bot` в Telegram
2. **Отправьте команду** `/start`
3. **Нажмите кнопку** "📊 Открыть Ads Statistics"
4. **Должно открыться приложение** с автоматической авторизацией

## 🔍 Диагностика

### Проверка в консоли браузера

При открытии приложения из Telegram, в консоли должны появиться:

```
🔍 TelegramAuthInitializer: Telegram script found = true
✅ TelegramAuthInitializer: Telegram WebApp доступен
✅ TelegramAuthInitializer: WebApp инициализирован
📊 TelegramAuthInitializer: initDataUnsafe = {user: {...}}
✅ TelegramAuthInitializer: Данные пользователя найдены
```

### Проверка в логах бэкенда

В логах бэкенда должны появиться:

```
DEBUG: telegram_auth called with data: {...}
DEBUG: Verifying Telegram auth...
DEBUG: Telegram auth verification passed
DEBUG: Auth successful, returning response
```

## 🚀 Команды BotFather

### Полезные команды:

- `/myapps` - Список ваших Mini Apps
- `/mybots` - Список ваших ботов
- `/setcommands` - Настройка команд бота
- `/setdescription` - Описание бота

## 🔧 Технические детали

### Что происходит при открытии Mini App:

1. **Telegram загружает ваше приложение** в WebView
2. **Автоматически вставляет скрипт** `telegram-web-app.js`
3. **Создает объект** `window.Telegram.WebApp`
4. **Передает данные пользователя** в `initDataUnsafe.user`
5. **Передает подпись** в `initData`

### Критически важно:

- ✅ **Mini App должен быть создан в BotFather**
- ✅ **URL должен быть точным**
- ✅ **Приложение должно открываться через кнопку бота**
- ✅ **Telegram WebApp скрипт должен загрузиться**

## 🐛 Устранение неполадок

### Проблема: "Telegram WebApp not found"
**Решение**: Убедитесь, что Mini App создан в BotFather и URL правильный

### Проблема: "No user data available"
**Решение**: Проверьте, что открываете приложение через кнопку бота, а не напрямую

### Проблема: "Telegram script not found"
**Решение**: Скрипт автоматически добавляется Telegram, но можно проверить в консоли

### Проблема: "Hashes don't match"
**Решение**: 
1. Убедитесь, что Mini App создан в BotFather
2. Проверьте правильность токена бота
3. Убедитесь, что приложение открывается через кнопку бота

## 📞 Поддержка

Если проблемы остаются:
1. Проверьте логи в консоли браузера
2. Убедитесь, что Mini App настроен правильно
3. Попробуйте пересоздать Mini App в BotFather
4. Проверьте, что токен бота правильный

## 🔄 После настройки Mini App

После успешной настройки Mini App:

1. **Удалите временный код** из `app/services/auth.py` (строки с `# ВРЕМЕННО:`)
2. **Включите проверку подписи** обратно
3. **Протестируйте авторизацию** через кнопку бота
4. **Убедитесь, что хеши совпадают** в логах 