#!/usr/bin/env python3
"""
Скрипт для создания Telegram бота
Помогает пользователю создать бота через @BotFather
"""

import os
import sys

def show_botfather_instructions():
    """Показывает инструкции по созданию бота"""
    print("🤖 Создание Telegram бота через @BotFather")
    print("=" * 50)
    print()
    print("📱 Откройте Telegram и найдите @BotFather")
    print()
    print("1️⃣  Создание бота:")
    print("   Отправьте команду: /newbot")
    print("   Введите имя бота (например: Ads Statistics Bot)")
    print("   Введите username бота (например: ads_stat_bot)")
    print("   Сохраните токен бота!")
    print()
    print("2️⃣  Создание Mini App:")
    print("   Отправьте команду: /newapp")
    print("   Выберите вашего бота")
    print("   Введите название: Ads Statistics Dashboard")
    print("   Введите описание: Приложение для анализа рекламной статистики")
    print("   Загрузите иконку (512x512px)")
    print("   Введите URL: https://azkaraz.github.io/adstat/")
    print()
    print("3️⃣  Настройка команд:")
    print("   Отправьте команду: /setcommands")
    print("   Выберите вашего бота")
    print("   Введите команды:")
    print("   start - Начать работу с ботом")
    print("   help - Показать справку")
    print("   app - Открыть приложение")
    print()

def create_env_file():
    """Создает файл .env с примером"""
    env_content = """# Токен вашего Telegram бота (получите у @BotFather)
TELEGRAM_BOT_TOKEN=ваш_токен_бота_здесь

# URL вашего Mini App
WEBAPP_URL=https://azkaraz.github.io/adstat/

# Настройки логирования
LOG_LEVEL=INFO

# Режим отладки
DEBUG=False
"""
    
    env_file = ".env"
    if os.path.exists(env_file):
        print(f"⚠️  Файл {env_file} уже существует")
        response = input("Перезаписать? (y/N): ")
        if response.lower() != 'y':
            print("Файл не изменен")
            return
    
    try:
        with open(env_file, 'w', encoding='utf-8') as f:
            f.write(env_content)
        print(f"✅ Файл {env_file} создан")
        print("📝 Отредактируйте файл и добавьте настоящий токен бота")
    except Exception as e:
        print(f"❌ Ошибка создания файла: {e}")

def show_next_steps():
    """Показывает следующие шаги"""
    print("\n🚀 Следующие шаги:")
    print("1. Создайте бота через @BotFather (см. инструкции выше)")
    print("2. Отредактируйте файл .env и добавьте токен")
    print("3. Запустите бота: python run_bot.py")
    print("4. Протестируйте: найдите бота в Telegram и отправьте /start")
    print()

def main():
    """Главная функция"""
    print("🎯 Помощник по созданию Telegram бота")
    print()
    
    # Показываем инструкции
    show_botfather_instructions()
    
    # Создаем файл .env
    print("📝 Создание файла .env...")
    create_env_file()
    
    # Показываем следующие шаги
    show_next_steps()
    
    print("📚 Дополнительная документация:")
    print("   • telegram_bot/SETUP.md - Подробная инструкция")
    print("   • telegram_bot/README.md - Документация бота")
    print()

if __name__ == "__main__":
    main() 