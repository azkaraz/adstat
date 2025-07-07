#!/usr/bin/env python3
"""
Тест улучшенной VK OAuth реализации с правильными endpoints
"""

import requests
import json
from urllib.parse import urlencode

def test_vk_oauth_improved():
    """Тестирует улучшенную VK OAuth реализацию"""
    
    # Настройки VK приложения
    client_id = '53860967'
    client_secret = 'Mxj67Hx2XnM6AV9g22JV'  # Замените на ваш секрет
    redirect_uri = 'https://azkaraz.github.io/adstat/vk-oauth-callback'
    
    print("=== Тест улучшенной VK OAuth реализации ===")
    print(f"Client ID: {client_id}")
    print(f"Redirect URI: {redirect_uri}")
    print()
    
    # Тест 1: Проверка URL авторизации VK OAuth
    print("1. Тестируем URL авторизации VK OAuth...")
    auth_params = {
        'client_id': client_id,
        'redirect_uri': redirect_uri,
        'response_type': 'code',
        'scope': 'email',
        'v': '5.131'
    }
    
    auth_url = f"https://oauth.vk.com/authorize?{urlencode(auth_params)}"
    print(f"VK OAuth URL: {auth_url}")
    
    try:
        response = requests.get(auth_url, allow_redirects=False)
        print(f"Status: {response.status_code}")
        if response.status_code == 302:
            print(f"Redirect to: {response.headers.get('Location', 'N/A')}")
            print("✅ VK OAuth URL работает!")
        elif response.status_code == 200:
            print("✅ VK OAuth URL доступен (может потребоваться настройка)")
        else:
            print(f"Response: {response.text[:200]}...")
            print("❌ VK OAuth URL не работает")
    except Exception as e:
        print(f"❌ Ошибка: {e}")
    
    print()
    
    # Тест 2: Проверка endpoint для обмена токенов
    print("2. Тестируем endpoint для обмена токенов...")
    
    # Тестовый код (недействительный, но для проверки endpoints)
    test_code = "test_code_123"
    
    token_url = "https://oauth.vk.com/access_token"
    
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
        print(f"Testing endpoint: {token_url}")
        response = requests.post(token_url, data=data, headers=headers)
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
    
    # Тест 3: Проверка VK API
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

def test_vk_class():
    """Тестирует класс VKIDAuth"""
    
    print("\n=== Тест класса VKIDAuth ===")
    
    try:
        from app.services.vk_ads import VKIDAuth
        
        # Создаем экземпляр класса
        vk_auth = VKIDAuth(
            client_id='53860967',
            client_secret='Mxj67Hx2XnM6AV9g22JV',
            redirect_uri='https://azkaraz.github.io/adstat/vk-oauth-callback'
        )
        
        # Тестируем генерацию URL
        auth_url = vk_auth.get_auth_url()
        print(f"Generated auth URL: {auth_url}")
        
        # Тестируем обмен токенов (с тестовым кодом)
        test_code = "test_code_456"
        result = vk_auth.exchange_code_for_token(test_code)
        
        if result:
            print(f"✅ Token exchange successful: {result}")
        else:
            print("❌ Token exchange failed (expected with test code)")
        
        # Тестируем получение информации о пользователе (с тестовым токеном)
        test_token = "test_token_456"
        user_info = vk_auth.get_user_info(test_token)
        
        if user_info:
            print(f"✅ User info successful: {user_info}")
        else:
            print("❌ User info failed (expected with test token)")
            
    except ImportError as e:
        print(f"❌ Не удалось импортировать VKIDAuth: {e}")
    except Exception as e:
        print(f"❌ Ошибка тестирования класса: {e}")

def test_handle_vk_callback():
    """Тестирует функцию handle_vk_callback"""
    
    print("\n=== Тест функции handle_vk_callback ===")
    
    try:
        from app.services.vk_ads import handle_vk_callback
        
        # Тест с ошибкой
        error_result = handle_vk_callback("", "test_error")
        print(f"Error test result: {error_result}")
        
        # Тест без кода
        no_code_result = handle_vk_callback("")
        print(f"No code test result: {no_code_result}")
        
        # Тест с тестовым кодом
        test_code = "test_code_789"
        code_result = handle_vk_callback(test_code)
        print(f"Code test result: {code_result}")
        
    except ImportError as e:
        print(f"❌ Не удалось импортировать handle_vk_callback: {e}")
    except Exception as e:
        print(f"❌ Ошибка тестирования callback: {e}")

if __name__ == "__main__":
    test_vk_oauth_improved()
    test_vk_class()
    test_handle_vk_callback()
    
    print("\n=== Рекомендации ===")
    print("1. Убедитесь, что VK приложение опубликовано")
    print("2. Проверьте правильность client_id и client_secret")
    print("3. Убедитесь, что redirect_uri точно совпадает в настройках")
    print("4. Для получения реального кода авторизации перейдите по URL авторизации")
    print("5. Используйте полученный код для тестирования обмена токенов")
    print("6. VK OAuth более стабилен чем VK ID для интеграции") 