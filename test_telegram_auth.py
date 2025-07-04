#!/usr/bin/env python3
"""
Скрипт для тестирования Telegram аутентификации
"""

import requests
import json
import time

# Конфигурация
API_BASE_URL = "https://e73b-2a12-5940-a96b-00-2.ngrok-free.app"  # Замените на ваш ngrok URL

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
    
    print("🧪 Тестирование Telegram аутентификации")
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

def test_get_profile(token):
    """Тестирование получения профиля пользователя"""
    
    print(f"\n🧪 Тестирование получения профиля")
    
    try:
        response = requests.get(
            f"{API_BASE_URL}/user/profile",
            headers={
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json"
            },
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

def test_api_health():
    """Проверка доступности API"""
    
    print("🏥 Проверка здоровья API")
    
    try:
        response = requests.get(f"{API_BASE_URL}/health", timeout=5)
        print(f"📥 Статус: {response.status_code}")
        
        if response.status_code == 200:
            print("✅ API доступен")
            return True
        else:
            print("⚠️ API недоступен")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ API недоступен: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Запуск тестов Telegram аутентификации\n")
    
    # Проверяем доступность API
    if test_api_health():
        print("\n" + "="*50)
        # Тестируем авторизацию
        test_telegram_auth()
    else:
        print("\n❌ API недоступен. Проверьте:")
        print("1. Запущен ли бэкенд")
        print("2. Правильный ли ngrok URL")
        print("3. Доступен ли ngrok туннель")
    
    print("\n🏁 Тестирование завершено") 