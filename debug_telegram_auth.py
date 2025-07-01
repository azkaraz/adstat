#!/usr/bin/env python3
"""
Детальная отладка верификации подписи Telegram
"""

import os
import sys
import hmac
import hashlib
import json
from urllib.parse import parse_qs, unquote

# Добавляем путь к проекту
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.config import settings

def debug_telegram_auth():
    """Детальная отладка верификации подписи Telegram"""
    
    print("🔍 Детальная отладка верификации подписи Telegram")
    print("=" * 60)
    
    # Данные из логов
    test_init_data = "user=%7B%22id%22%3A5583588138%2C%22first_name%22%3A%22Senoro%22%2C%22last_name%22%3A%22Pomodoro%22%2C%22username%22%3A%22senoropomodoro%22%2C%22language_code%22%3A%22ru%22%2C%22allows_write_to_pm%22%3Atrue%2C%22photo_url%22%3A%22https%3A%5C%2F%5C%2Ft.me%5C%2Fi%5C%2Fuserpic%5C%2F320%5C%2F8IDMs2EzSGrsZcnWwXho31zG22pwaa7YeQj2e_sd81YWRyFZGdFAiODkBSVsxiZH.svg%22%7D&chat_instance=4655770683956331623&chat_type=private&auth_date=1751313796&signature=26pfzpu5xMkR8LJ7xDl9zeAlj-TLoksxAEmPl-mJLdziOAhFs2kKdLTaN62B_pQ7ibDHk3YIgPtdzWNhoeCdAQ&hash=90fdb9585451090036b8c4effbb3c02eb6316f5c04f12775510c51f6a9e3a89c"
    
    print(f"📊 Исходные данные: {test_init_data}")
    print()
    
    # Декодируем URL-encoded строку
    decoded_data = unquote(test_init_data)
    print(f"📊 Декодированные данные: {decoded_data}")
    print()
    
    # Парсим параметры
    params = parse_qs(decoded_data)
    print(f"📊 Парсированные параметры:")
    for key, values in params.items():
        print(f"   {key}: {values[0] if values else 'None'}")
    print()
    
    # Создаем словарь с данными
    data_dict = {}
    for key, values in params.items():
        if values:
            data_dict[key] = values[0]
    
    # Извлекаем hash
    received_hash = data_dict.pop('hash', '') or ''
    print(f"📊 Извлеченный hash: {received_hash}")
    print()
    
    print(f"📊 Данные для проверки:")
    for key, value in data_dict.items():
        print(f"   {key}: {value}")
    print()
    
    # Создаем строку для проверки (без hash и signature)
    fields_to_exclude = ['hash', 'signature']
    data_check_string = '\n'.join([
        f"{k}={v}" for k, v in sorted(data_dict.items())
        if k not in fields_to_exclude
    ])
    
    print(f"📊 Строка для проверки:")
    print(f"'{data_check_string}'")
    print()
    
    print(f"📊 Байты строки: {data_check_string.encode('utf-8')}")
    print()
    
    # Проверяем токен бота
    print(f"🔑 Токен бота: {settings.TELEGRAM_BOT_TOKEN}")
    print(f"🔑 Байты токена: {settings.TELEGRAM_BOT_TOKEN.encode('utf-8')}")
    print()
    
    # Создаем секретный ключ
    secret_key = hmac.new(
        "WebAppData".encode('utf-8'),
        settings.TELEGRAM_BOT_TOKEN.encode('utf-8'),
        hashlib.sha256
    ).digest()
    
    print(f"🔑 Секретный ключ (hex): {secret_key.hex()}")
    print()
    
    # Вычисляем hash
    computed_hash = hmac.new(
        secret_key,
        data_check_string.encode('utf-8'),
        hashlib.sha256
    ).hexdigest()
    
    print(f"📊 Вычисленный hash: {computed_hash}")
    print(f"📊 Полученный hash: {received_hash}")
    print(f"📊 Хеши совпадают: {computed_hash == received_hash}")
    print()
    
    # Попробуем разные варианты алгоритма
    print("🧪 Тестирование разных вариантов алгоритма:")
    print("-" * 40)
    
    # Вариант 1: Без "WebAppData" ключа
    try:
        secret_key_v1 = hmac.new(
            settings.TELEGRAM_BOT_TOKEN.encode('utf-8'),
            data_check_string.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()
        print(f"Вариант 1 (без WebAppData): {secret_key_v1}")
        print(f"Совпадает: {secret_key_v1 == received_hash}")
    except Exception as e:
        print(f"Вариант 1 ошибка: {e}")
    print()
    
    # Вариант 2: Прямое SHA256
    try:
        hash_v2 = hashlib.sha256(data_check_string.encode('utf-8')).hexdigest()
        print(f"Вариант 2 (SHA256): {hash_v2}")
        print(f"Совпадает: {hash_v2 == received_hash}")
    except Exception as e:
        print(f"Вариант 2 ошибка: {e}")
    print()
    
    # Вариант 3: HMAC с токеном как ключом
    try:
        hash_v3 = hmac.new(
            settings.TELEGRAM_BOT_TOKEN.encode('utf-8'),
            data_check_string.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()
        print(f"Вариант 3 (HMAC с токеном): {hash_v3}")
        print(f"Совпадает: {hash_v3 == received_hash}")
    except Exception as e:
        print(f"Вариант 3 ошибка: {e}")
    print()
    
    # Вариант 4: Проверим, может быть проблема в сортировке
    print("🧪 Проверка сортировки полей:")
    print("-" * 30)
    
    # Показываем все поля в алфавитном порядке
    sorted_fields = sorted([k for k in data_dict.keys() if k not in fields_to_exclude])
    print(f"Отсортированные поля: {sorted_fields}")
    
    for field in sorted_fields:
        print(f"   {field}: {data_dict[field]}")
    print()
    
    # Вариант 5: Проверим, может быть проблема в экранировании JSON
    print("🧪 Проверка JSON экранирования:")
    print("-" * 30)
    
    try:
        user_data = json.loads(data_dict['user'])
        print(f"Парсированный JSON: {json.dumps(user_data, indent=2, ensure_ascii=False)}")
        
        # Попробуем пересоздать JSON без экранирования
        user_data_clean = json.dumps(user_data, separators=(',', ':'), ensure_ascii=False)
        print(f"Очищенный JSON: {user_data_clean}")
        
        # Создаем новую строку с очищенным JSON
        data_dict_clean = data_dict.copy()
        data_dict_clean['user'] = user_data_clean
        
        data_check_string_clean = '\n'.join([
            f"{k}={v}" for k, v in sorted(data_dict_clean.items())
            if k not in fields_to_exclude
        ])
        
        print(f"Очищенная строка: {data_check_string_clean}")
        
        computed_hash_clean = hmac.new(
            secret_key,
            data_check_string_clean.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()
        
        print(f"Hash с очищенным JSON: {computed_hash_clean}")
        print(f"Совпадает: {computed_hash_clean == received_hash}")
        
    except Exception as e:
        print(f"Ошибка при работе с JSON: {e}")
    
    print()
    print("💡 Рекомендации:")
    print("1. Проверьте правильность токена бота в BotFather")
    print("2. Убедитесь, что бот настроен как Mini App")
    print("3. Проверьте, что URL в настройках Mini App правильный")
    print("4. Попробуйте создать новый бот и получить новый токен")

if __name__ == "__main__":
    debug_telegram_auth() 