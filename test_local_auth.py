#!/usr/bin/env python3
"""
Скрипт для тестирования авторизации локально
"""

import requests
import json
import time

# Конфигурация
API_BASE_URL = "http://localhost:8000"  # Локальный URL

def test_telegram_auth():
    """Тестирование авторизации через Telegram"""
    
    # Тестовые данные (имитация данных от Telegram WebApp)
    test_data = {
        "id": 123456789,
        "first_name": "Тестовый",
        "last_name": "Пользователь",
        "username": "test_user",
        "photo_url": "https://t.me/i/userpic/320/test.jpg",
        "auth_date": int(time.time()),
        "hash": "mock_hash"  # Для тестирования без проверки подписи
    }
    
    print("🧪 Тестирование Telegram аутентификации (локально)")
    print(f"📡 API URL: {API_BASE_URL}")
    print(f"📊 Тестовые данные: {json.dumps(test_data, indent=2, ensure_ascii=False)}")
    
    try:
        # Отправляем запрос на авторизацию
        response = requests.post(
            f"{API_BASE_URL}/auth/telegram",
            json=test_data,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        print(f"\n📤 Запрос отправлен")
        print(f"📥 Статус ответа: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Авторизация успешна!")
            print(f"🔑 Токен: {data.get('access_token', 'Не найден')[:20]}...")
            print(f"👤 Пользователь: {data.get('user', {}).get('first_name', 'Неизвестно')}")
            
            # Тестируем получение профиля
            test_get_profile(data.get('access_token'))
            
        else:
            print("❌ Ошибка авторизации")
            print(f"📄 Ответ: {response.text}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Ошибка сети: {e}")
    except Exception as e:
        print(f"❌ Неожиданная ошибка: {e}")

def test_get_profile(access_token):
    """Тестирование получения профиля пользователя"""
    
    if not access_token:
        print("❌ Нет токена для тестирования профиля")
        return
    
    print(f"\n🔍 Тестирование получения профиля")
    print(f"🔑 Токен: {access_token[:20]}...")
    
    try:
        response = requests.get(
            f"{API_BASE_URL}/user/profile",
            headers={"Authorization": f"Bearer {access_token}"},
            timeout=10
        )
        
        print(f"📥 Статус ответа: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Профиль получен успешно!")
            print(f"👤 Данные пользователя: {json.dumps(data, indent=2, ensure_ascii=False)}")
        else:
            print("❌ Ошибка получения профиля")
            print(f"📄 Ответ: {response.text}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Ошибка сети: {e}")
    except Exception as e:
        print(f"❌ Неожиданная ошибка: {e}")

def test_health_check():
    """Проверка здоровья API"""
    
    print("🏥 Проверка здоровья API")
    
    try:
        response = requests.get(f"{API_BASE_URL}/docs", timeout=5)
        print(f"📥 Статус: {response.status_code}")
        
        if response.status_code == 200:
            print("✅ API доступен")
            return True
        else:
            print("⚠️ API недоступен")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Ошибка подключения: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Запуск тестов Telegram аутентификации")
    print("=" * 50)
    
    # Проверяем здоровье API
    if test_health_check():
        print("\n✅ API доступен, продолжаем тестирование")
        test_telegram_auth()
    else:
        print("\n❌ API недоступен. Проверьте:")
        print("1. Запущен ли бэкенд")
        print("2. Правильный ли URL")
        print("3. Доступен ли порт 8000")
    
    print("\n🏁 Тестирование завершено") 