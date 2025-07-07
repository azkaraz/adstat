#!/usr/bin/env python3
"""
Тест исправленного VK OAuth с правильными endpoints
"""

import requests
import json
from urllib.parse import urlencode

def test_vk_oauth_endpoints():
    """Тестирует различные VK OAuth endpoints"""
    
    # Настройки VK приложения
    client_id = '53860967'
    client_secret = 'Mxj67Hx2XnM6AV9g22JV'  # Замените на ваш секрет
    redirect_uri = 'https://azkaraz.github.io/adstat/vk-oauth-callback'
    
    print("=== Тест VK OAuth Endpoints ===")
    print(f"Client ID: {client_id}")
    print(f"Redirect URI: {redirect_uri}")
    print()
    
    # Тест 1: Проверка URL авторизации
    print("1. Тестируем URL авторизации...")
    auth_params = {
        'response_type': 'code',
        'client_id': client_id,
        'redirect_uri': redirect_uri,
        'scope': 'phone email',
        'state': 'test'
    }
    
    auth_url = f"https://id.vk.com/oauth2/auth?{urlencode(auth_params)}"
    print(f"Auth URL: {auth_url}")
    
    try:
        response = requests.get(auth_url, allow_redirects=False)
        print(f"Status: {response.status_code}")
        if response.status_code == 302:
            print(f"Redirect to: {response.headers.get('Location', 'N/A')}")
            print("✅ URL авторизации работает!")
        else:
            print(f"Response: {response.text[:200]}...")
            print("❌ URL авторизации не работает")
    except Exception as e:
        print(f"❌ Ошибка: {e}")
    
    print()
    
    # Тест 2: Проверка основных endpoints для обмена токенов
    print("2. Тестируем endpoints для обмена токенов...")
    
    # Тестовый код (недействительный, но для проверки endpoints)
    test_code = "test_code_123"
    
    endpoints = [
        "https://oauth.vk.com/access_token",
        "https://id.vk.com/oauth2/access_token",
    ]
    
    for endpoint in endpoints:
        print(f"\nТестируем endpoint: {endpoint}")
        
        data = {
            'grant_type': 'authorization_code',
            'client_id': client_id,
            'client_secret': client_secret,
            'redirect_uri': redirect_uri,
            'code': test_code
        }
        
        headers = {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json'
        }
        
        try:
            response = requests.post(endpoint, data=data, headers=headers)
            print(f"Status: {response.status_code}")
            print(f"Response: {response.text[:300]}...")
            
            if response.status_code == 200:
                print("✅ Endpoint доступен!")
            elif response.status_code == 400:
                print("✅ Endpoint работает (ожидаемая ошибка с тестовым кодом)")
            else:
                print(f"❌ Endpoint недоступен (статус {response.status_code})")
                
        except Exception as e:
            print(f"❌ Ошибка запроса: {e}")
    
    print()
    
    # Тест 3: Проверка VK API для получения информации о пользователе
    print("3. Тестируем VK API для получения информации о пользователе...")
    
    # Тестовый токен (недействительный)
    test_token = "test_token_123"
    
    api_url = "https://api.vk.com/method/users.get"
    params = {
        'access_token': test_token,
        'v': '5.131',
        'fields': 'photo_50,photo_100,email'
    }
    
    try:
        response = requests.get(api_url, params=params)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text[:300]}...")
        
        if response.status_code == 200:
            data = response.json()
            if 'error' in data:
                print("✅ VK API работает (ожидаемая ошибка с тестовым токеном)")
            else:
                print("✅ VK API работает!")
        else:
            print(f"❌ VK API недоступен (статус {response.status_code})")
            
    except Exception as e:
        print(f"❌ Ошибка VK API: {e}")

def test_quick_token_exchange():
    """Тестирует быструю функцию обмена токенов"""
    
    print("\n=== Тест быстрой функции обмена токенов ===")
    
    # Импортируем функцию из нашего сервиса
    try:
        from app.services.vk_ads import quick_vk_token_exchange
        
        # Тестовый код
        test_code = "test_code_456"
        
        print(f"Тестируем с кодом: {test_code}")
        result = quick_vk_token_exchange(test_code)
        
        if result:
            print(f"✅ Функция работает, результат: {result}")
        else:
            print("❌ Функция вернула None")
            
    except ImportError as e:
        print(f"❌ Не удалось импортировать функцию: {e}")
    except Exception as e:
        print(f"❌ Ошибка выполнения: {e}")

if __name__ == "__main__":
    test_vk_oauth_endpoints()
    test_quick_token_exchange()
    
    print("\n=== Рекомендации ===")
    print("1. Убедитесь, что VK приложение опубликовано")
    print("2. Проверьте правильность client_id и client_secret")
    print("3. Убедитесь, что redirect_uri точно совпадает в настройках")
    print("4. Для получения реального кода авторизации перейдите по URL авторизации")
    print("5. Используйте полученный код для тестирования обмена токенов") 