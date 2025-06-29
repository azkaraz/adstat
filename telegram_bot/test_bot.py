#!/usr/bin/env python3
"""
Скрипт для тестирования Telegram бота
"""

import os
import sys

def test_config():
    """Тестируем конфигурацию бота"""
    print("🔧 Тестирование конфигурации бота...")
    
    # Проверяем наличие токена
    token = os.getenv("TELEGRAM_BOT_TOKEN")
    if not token:
        print("❌ TELEGRAM_BOT_TOKEN не найден в переменных окружения")
        print("   Создайте файл .env с токеном вашего бота")
        return False
    
    print("✅ TELEGRAM_BOT_TOKEN найден")
    
    # Проверяем URL WebApp
    webapp_url = os.getenv("WEBAPP_URL", "https://azkaraz.github.io/adstat/")
    print(f"✅ WEBAPP_URL: {webapp_url}")
    
    return True

def test_imports():
    """Тестируем импорты"""
    print("\n📦 Тестирование импортов...")
    
    try:
        from aiogram import Bot, Dispatcher
        print("✅ aiogram импортирован успешно")
    except ImportError as e:
        print(f"❌ Ошибка импорта aiogram: {e}")
        return False
    
    try:
        from dotenv import load_dotenv
        print("✅ python-dotenv импортирован успешно")
    except ImportError as e:
        print(f"❌ Ошибка импорта python-dotenv: {e}")
        return False
    
    return True

def main():
    """Главная функция тестирования"""
    print("🤖 Тестирование Telegram бота для Ads Statistics Dashboard")
    print("=" * 60)
    
    # Загружаем переменные окружения
    from dotenv import load_dotenv
    load_dotenv()
    
    # Тестируем импорты
    if not test_imports():
        print("\n❌ Тест импортов не пройден")
        sys.exit(1)
    
    # Тестируем конфигурацию
    if not test_config():
        print("\n❌ Тест конфигурации не пройден")
        sys.exit(1)
    
    print("\n✅ Все тесты пройдены успешно!")
    print("\n📋 Следующие шаги:")
    print("1. Убедитесь, что у вас есть токен бота от @BotFather")
    print("2. Создайте файл .env с токеном")
    print("3. Запустите бота командой: python run_bot.py")
    print("4. Отправьте /start вашему боту")

if __name__ == "__main__":
    main() 