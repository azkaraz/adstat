#!/usr/bin/env python3
"""
Скрипт для проверки настроек Telegram бота
"""

import os
import sys
import requests
import json

# Добавляем путь к проекту
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.config import settings

def check_telegram_bot():
    """Проверка настроек Telegram бота"""
    
    print("🔍 Проверка настроек Telegram бота")
    print("=" * 50)
    
    if not settings.TELEGRAM_BOT_TOKEN:
        print("❌ TELEGRAM_BOT_TOKEN не настроен!")
        return False
    
    # Извлекаем ID бота из токена
    bot_id = settings.TELEGRAM_BOT_TOKEN.split(':')[0]
    print(f"🤖 ID бота: {bot_id}")
    print(f"🔑 Токен: {settings.TELEGRAM_BOT_TOKEN[:10]}...")
    
    # Проверяем бота через Telegram API
    try:
        url = f"https://api.telegram.org/bot{settings.TELEGRAM_BOT_TOKEN}/getMe"
        response = requests.get(url, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if data.get('ok'):
                bot_info = data['result']
                print("✅ Бот найден и активен!")
                print(f"📝 Имя: {bot_info.get('first_name', 'Не указано')}")
                print(f"👤 Username: @{bot_info.get('username', 'Не указано')}")
                print(f"🆔 ID: {bot_info.get('id', 'Не указано')}")
                print(f"🔗 Can join groups: {bot_info.get('can_join_groups', False)}")
                print(f"📱 Can read all group messages: {bot_info.get('can_read_all_group_messages', False)}")
                print(f"🤖 Supports inline queries: {bot_info.get('supports_inline_queries', False)}")
                
                # Проверяем, есть ли у бота Mini Apps
                print("\n🔍 Проверка Mini Apps...")
                check_mini_apps(settings.TELEGRAM_BOT_TOKEN)
                
                return True
            else:
                print(f"❌ Ошибка API: {data.get('description', 'Неизвестная ошибка')}")
                return False
        else:
            print(f"❌ HTTP ошибка: {response.status_code}")
            print(f"📄 Ответ: {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Ошибка сети: {e}")
        return False
    except Exception as e:
        print(f"❌ Неожиданная ошибка: {e}")
        return False

def check_mini_apps(bot_token):
    """Проверка Mini Apps бота"""
    
    try:
        # Получаем информацию о боте (включая Mini Apps)
        url = f"https://api.telegram.org/bot{bot_token}/getMyDefaultAdministratorRights"
        response = requests.get(url, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            print(f"📊 Ответ API: {json.dumps(data, indent=2, ensure_ascii=False)}")
        
        # Попробуем получить информацию о командах
        url = f"https://api.telegram.org/bot{bot_token}/getMyCommands"
        response = requests.get(url, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if data.get('ok') and data['result']:
                print("📋 Команды бота:")
                for cmd in data['result']:
                    print(f"   /{cmd['command']} - {cmd['description']}")
            else:
                print("📋 Команды не настроены")
        
        # Попробуем получить информацию о меню
        url = f"https://api.telegram.org/bot{bot_token}/getChatMenuButton"
        response = requests.get(url, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if data.get('ok') and data['result']:
                menu = data['result']
                print(f"🍔 Меню бота: {menu.get('type', 'Неизвестно')}")
                if menu.get('text'):
                    print(f"📝 Текст кнопки: {menu['text']}")
                if menu.get('web_app'):
                    web_app = menu['web_app']
                    print(f"🌐 WebApp URL: {web_app.get('url', 'Не указан')}")
        
    except Exception as e:
        print(f"⚠️  Ошибка при проверке Mini Apps: {e}")

def test_webhook():
    """Тестирование webhook"""
    
    print("\n🔗 Проверка webhook...")
    
    try:
        url = f"https://api.telegram.org/bot{settings.TELEGRAM_BOT_TOKEN}/getWebhookInfo"
        response = requests.get(url, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if data.get('ok'):
                webhook_info = data['result']
                print(f"📡 Webhook URL: {webhook_info.get('url', 'Не настроен')}")
                print(f"🔒 SSL: {webhook_info.get('has_custom_certificate', False)}")
                print(f"📊 Ожидающие обновления: {webhook_info.get('pending_update_count', 0)}")
                print(f"⏰ Последняя ошибка: {webhook_info.get('last_error_date', 'Нет')}")
                print(f"❌ Последняя ошибка: {webhook_info.get('last_error_message', 'Нет')}")
            else:
                print(f"❌ Ошибка API: {data.get('description', 'Неизвестная ошибка')}")
        else:
            print(f"❌ HTTP ошибка: {response.status_code}")
            
    except Exception as e:
        print(f"⚠️  Ошибка при проверке webhook: {e}")

def create_test_webapp_button():
    """Создание тестовой кнопки WebApp"""
    
    print("\n🔧 Создание тестовой кнопки WebApp...")
    
    try:
        # Создаем inline клавиатуру с WebApp кнопкой
        keyboard = {
            "inline_keyboard": [
                [
                    {
                        "text": "📊 Открыть Ads Statistics",
                        "web_app": {
                            "url": "https://azkaraz.github.io/adstat/"
                        }
                    }
                ]
            ]
        }
        
        print(f"⌨️  Клавиатура: {json.dumps(keyboard, indent=2, ensure_ascii=False)}")
        print("💡 Используйте эту клавиатуру в команде /start вашего бота")
        
    except Exception as e:
        print(f"⚠️  Ошибка при создании кнопки: {e}")

if __name__ == "__main__":
    success = check_telegram_bot()
    
    if success:
        test_webhook()
        create_test_webapp_button()
        
        print("\n✅ Проверка завершена!")
        print("\n💡 Рекомендации:")
        print("1. Убедитесь, что Mini App создан в BotFather")
        print("2. Проверьте, что URL в Mini App правильный")
        print("3. Убедитесь, что бот имеет права на создание Mini Apps")
        print("4. Попробуйте пересоздать Mini App в BotFather")
    else:
        print("\n❌ Проверка не прошла. Проверьте токен бота.")
        sys.exit(1) 