#!/usr/bin/env python3
"""
Скрипт для проверки токена Telegram бота
"""

import os
import sys
import hmac
import hashlib
from urllib.parse import parse_qs, unquote

# Добавляем путь к проекту
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.config import settings

def test_telegram_token():
    """Тестирование токена Telegram бота"""
    
    print("🔍 Проверка токена Telegram бота")
    print("=" * 50)
    
    # Проверяем наличие токена
    if not settings.TELEGRAM_BOT_TOKEN:
        print("❌ TELEGRAM_BOT_TOKEN не настроен!")
        print("💡 Убедитесь, что в .env файле или переменных окружения установлен TELEGRAM_BOT_TOKEN")
        return False
    
    print(f"✅ TELEGRAM_BOT_TOKEN найден")
    print(f"📏 Длина токена: {len(settings.TELEGRAM_BOT_TOKEN)} символов")
    print(f"🔑 Первые 10 символов: {settings.TELEGRAM_BOT_TOKEN[:10]}...")
    print(f"🔑 Последние 10 символов: ...{settings.TELEGRAM_BOT_TOKEN[-10:]}")
    
    # Проверяем формат токена (должен быть в формате 1234567890:ABCdefGHIjklMNOpqrsTUVwxyz)
    if ':' not in settings.TELEGRAM_BOT_TOKEN:
        print("⚠️  Внимание: токен не содержит двоеточие, возможно неправильный формат")
    else:
        parts = settings.TELEGRAM_BOT_TOKEN.split(':')
        if len(parts) != 2:
            print("⚠️  Внимание: неправильный формат токена (должно быть 2 части через двоеточие)")
        else:
            bot_id, bot_token = parts
            print(f"🤖 ID бота: {bot_id}")
            print(f"🔐 Токен бота: {bot_token[:10]}...")
    
    # Тестируем создание секретного ключа
    try:
        secret_key = hmac.new(
            "WebAppData".encode('utf-8'),
            settings.TELEGRAM_BOT_TOKEN.encode('utf-8'),
            hashlib.sha256
        ).digest()
        
        print(f"✅ Секретный ключ создан успешно")
        print(f"🔑 Секретный ключ (hex): {secret_key.hex()}")
        print(f"🔑 Секретный ключ (первые 16 байт): {secret_key[:16].hex()}")
        
    except Exception as e:
        print(f"❌ Ошибка при создании секретного ключа: {e}")
        return False
    
    # Тестируем с реальными данными из логов
    print("\n🧪 Тестирование с реальными данными из логов")
    print("=" * 50)
    
    # Данные из логов
    test_init_data = "user=%7B%22id%22%3A5583588138%2C%22first_name%22%3A%22Senoro%22%2C%22last_name%22%3A%22Pomodoro%22%2C%22username%22%3A%22senoropomodoro%22%2C%22language_code%22%3A%22ru%22%2C%22allows_write_to_pm%22%3Atrue%2C%22photo_url%22%3A%22https%3A%5C%2F%5C%2Ft.me%5C%2Fi%5C%2Fuserpic%5C%2F320%5C%2F8IDMs2EzSGrsZcnWwXho31zG22pwaa7YeQj2e_sd81YWRyFZGdFAiODkBSVsxiZH.svg%22%7D&chat_instance=4655770683956331623&chat_type=private&auth_date=1751313796&signature=26pfzpu5xMkR8LJ7xDl9zeAlj-TLoksxAEmPl-mJLdziOAhFs2kKdLTaN62B_pQ7ibDHk3YIgPtdzWNhoeCdAQ&hash=90fdb9585451090036b8c4effbb3c02eb6316f5c04f12775510c51f6a9e3a89c"
    
    print(f"📊 Тестовые данные: {test_init_data}")
    
    try:
        # Декодируем URL-encoded строку
        decoded_data = unquote(test_init_data)
        print(f"📊 Декодированные данные: {decoded_data}")
        
        # Парсим параметры
        params = parse_qs(decoded_data)
        print(f"📊 Парсированные параметры: {params}")
        
        # Создаем словарь с данными
        data_dict = {}
        for key, values in params.items():
            if values:
                data_dict[key] = values[0]
        
        # Извлекаем hash
        received_hash = data_dict.pop('hash', '') or ''
        print(f"📊 Извлеченный hash: {received_hash}")
        print(f"📊 Данные для проверки: {data_dict}")
        
        # Создаем строку для проверки
        fields_to_exclude = ['hash', 'signature']
        data_check_string = '\n'.join([
            f"{k}={v}" for k, v in sorted(data_dict.items())
            if k not in fields_to_exclude
        ])
        
        print(f"📊 Строка для проверки: {data_check_string}")
        print(f"📊 Байты строки: {data_check_string.encode('utf-8')}")
        
        # Вычисляем hash
        computed_hash = hmac.new(
            secret_key,
            data_check_string.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()
        
        print(f"📊 Вычисленный hash: {computed_hash}")
        print(f"📊 Полученный hash: {received_hash}")
        print(f"📊 Хеши совпадают: {computed_hash == received_hash}")
        
        if computed_hash == received_hash:
            print("✅ Тест прошел успешно!")
            return True
        else:
            print("❌ Тест не прошел - хеши не совпадают")
            print("💡 Возможные причины:")
            print("   - Неправильный токен бота")
            print("   - Данные были изменены")
            print("   - Проблема с кодировкой")
            return False
            
    except Exception as e:
        print(f"❌ Ошибка при тестировании: {e}")
        import traceback
        print(f"📄 Полный traceback: {traceback.format_exc()}")
        return False

if __name__ == "__main__":
    success = test_telegram_token()
    if success:
        print("\n✅ Все тесты прошли успешно!")
    else:
        print("\n❌ Тесты не прошли. Проверьте настройки.")
        sys.exit(1) 