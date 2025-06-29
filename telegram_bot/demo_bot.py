#!/usr/bin/env python3
"""
Демо-версия Telegram бота для Ads Statistics Dashboard
Показывает, как будет работать бот без реального токена
"""

import os
import sys
from dotenv import load_dotenv

# Загружаем переменные окружения
load_dotenv()

def show_bot_info():
    """Показывает информацию о боте"""
    print("🤖 Telegram Bot для Ads Statistics Dashboard")
    print("=" * 50)
    
    # Получаем настройки
    bot_token = os.getenv("TELEGRAM_BOT_TOKEN", "не настроен")
    webapp_url = os.getenv("WEBAPP_URL", "https://azkaraz.github.io/adstat/")
    
    print(f"📋 Токен бота: {bot_token}")
    print(f"🌐 URL WebApp: {webapp_url}")
    print()

def show_commands():
    """Показывает команды бота"""
    print("📝 Команды бота:")
    print("   /start - Начать работу с ботом")
    print("   /help - Показать справку")
    print("   /app - Открыть приложение")
    print()

def show_keyboards():
    """Показывает клавиатуры бота"""
    print("⌨️  Клавиатуры бота:")
    print()
    print("📱 Обычная клавиатура (/start):")
    print("   ┌─────────────────────────────┐")
    print("   │ 📊 Открыть Ads Statistics   │  ← WebApp кнопка")
    print("   │ ℹ️ Помощь                   │")
    print("   └─────────────────────────────┘")
    print()
    print("🔗 Inline клавиатура (/help):")
    print("   ┌─────────────────────────────┐")
    print("   │ 🚀 Открыть приложение       │  ← WebApp кнопка")
    print("   └─────────────────────────────┘")
    print()

def show_webapp_info():
    """Показывает информацию о WebApp"""
    print("🌐 WebApp информация:")
    print("   • URL: https://azkaraz.github.io/adstat/")
    print("   • Автоматическая авторизация через Telegram")
    print("   • Поддержка всех функций приложения")
    print("   • Адаптивный дизайн для мобильных устройств")
    print()

def show_setup_steps():
    """Показывает шаги настройки"""
    print("🔧 Шаги настройки:")
    print("   1. Создайте бота через @BotFather")
    print("      /newbot")
    print()
    print("   2. Создайте Mini App через @BotFather")
    print("      /newapp")
    print()
    print("   3. Добавьте токен в файл .env:")
    print("      TELEGRAM_BOT_TOKEN=ваш_настоящий_токен")
    print()
    print("   4. Запустите бота:")
    print("      python run_bot.py")
    print()
    print("   5. Протестируйте:")
    print("      • Найдите бота в Telegram")
    print("      • Отправьте /start")
    print("      • Нажмите кнопку WebApp")
    print()

def show_features():
    """Показывает функции бота"""
    print("✨ Функции бота:")
    print("   ✅ Автоматическая авторизация через Telegram")
    print("   ✅ Открытие Mini App в Telegram")
    print("   ✅ Поддержка обычных и inline кнопок")
    print("   ✅ Обработка команд /start, /help, /app")
    print("   ✅ Логирование и обработка ошибок")
    print("   ✅ Конфигурация через переменные окружения")
    print()

def main():
    """Главная функция"""
    show_bot_info()
    show_commands()
    show_keyboards()
    show_webapp_info()
    show_features()
    show_setup_steps()
    
    print("📚 Подробная документация:")
    print("   • telegram_bot/SETUP.md - Инструкция по настройке")
    print("   • telegram_bot/README.md - Документация бота")
    print("   • README.md - Общая документация проекта")
    print()
    
    print("🚀 Готов к запуску!")
    print("   Создайте бота через @BotFather и добавьте токен в .env")

if __name__ == "__main__":
    main() 