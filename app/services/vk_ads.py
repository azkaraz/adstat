import requests
import logging
import urllib.parse
from app.core.config import settings
from urllib.parse import urlencode
from typing import Optional, Dict, List
import json
import base64
import hashlib
import secrets

logger = logging.getLogger(__name__)

class VKIDAuth:
    """
    Класс для работы с VK ID OAuth 2.1 и VK OAuth 2.0
    """
    
    def __init__(self, client_id: str, client_secret: str, redirect_uri: str):
        self.client_id = client_id
        self.client_secret = client_secret
        self.redirect_uri = redirect_uri
        # VK ID endpoints
        self.vkid_auth_url = "https://id.vk.com/authorize"
        self.vkid_token_url = "https://id.vk.com/oauth2/auth"
        self.vkid_user_info_url = "https://id.vk.com/oauth2/user_info"
        # VK OAuth fallback
        self.vk_token_url = "https://oauth.vk.com/access_token"
        self.vk_api_url = "https://api.vk.com/method/users.get"

    @staticmethod
    def generate_pkce_pair():
        code_verifier = base64.urlsafe_b64encode(secrets.token_bytes(32)).rstrip(b'=').decode('utf-8')
        code_challenge = base64.urlsafe_b64encode(hashlib.sha256(code_verifier.encode('utf-8')).digest()).rstrip(b'=').decode('utf-8')
        return code_verifier, code_challenge

    def get_auth_url(self, scope: str = "email", state: Optional[str] = None, use_vk_id: bool = False, code_challenge: Optional[str] = None, code_challenge_method: str = "S256") -> str:
        params = {
            'client_id': self.client_id,
            'redirect_uri': self.redirect_uri,
            'response_type': 'code',
            'scope': scope,
        }
        if state:
            params['state'] = state
        if use_vk_id:
            # Для VK ID требуется PKCE
            if code_challenge:
                params['code_challenge'] = code_challenge
                params['code_challenge_method'] = code_challenge_method
            query_string = urllib.parse.urlencode(params)
            return f"{self.vkid_auth_url}?{query_string}"
        else:
            query_string = urllib.parse.urlencode(params)
            return f"https://oauth.vk.com/authorize?{query_string}"

    def exchange_code_for_token(self, code: str, use_vk_id: bool = False, code_verifier: Optional[str] = None, device_id: Optional[str] = None) -> Optional[Dict]:
        if use_vk_id:
            return self._try_vk_id_token_exchange(code, code_verifier, device_id)
        else:
            return self._try_vk_oauth_token_exchange(code)

    def _try_vk_id_token_exchange(self, code: str, code_verifier: Optional[str], device_id: Optional[str]) -> Optional[Dict]:
        data = {
            'grant_type': 'authorization_code',
            'client_id': self.client_id,
            'client_secret': self.client_secret,
            'redirect_uri': self.redirect_uri,
            'code': code
        }
        if code_verifier:
            data['code_verifier'] = code_verifier
        if device_id:
            data['device_id'] = device_id
        headers = {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json'
        }
        try:
            logger.info(f"Trying VK ID endpoint: {self.vkid_token_url}")
            logger.info(f"VK ID token exchange data: {data}")
            response = requests.post(self.vkid_token_url, data=data, headers=headers)
            logger.info(f"VK ID Response status: {response.status_code}")
            logger.info(f"VK ID Response text: {response.text}")
            if response.status_code == 200:
                result = response.json()
                if 'access_token' in result:
                    logger.info("Success with VK ID endpoint")
                    return {
                        'success': True,
                        'access_token': result['access_token'],
                        'token_type': result.get('token_type', 'Bearer'),
                        'expires_in': result.get('expires_in'),
                        'refresh_token': result.get('refresh_token'),
                        'id_token': result.get('id_token'),
                        'user_id': result.get('user_id'),
                        'source': 'vk_id'
                    }
                else:
                    logger.warning(f"No access_token in VK ID response: {result}")
        except requests.exceptions.RequestException as e:
            logger.error(f"VK ID request failed: {e}")
        return None

    def _try_vk_oauth_token_exchange(self, code: str) -> Optional[Dict]:
        data = {
            'grant_type': 'authorization_code',
            'client_id': self.client_id,
            'client_secret': self.client_secret,
            'redirect_uri': self.redirect_uri,
            'code': code
        }
        headers = {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json'
        }
        try:
            logger.info(f"Trying VK OAuth endpoint: {self.vk_token_url}")
            response = requests.post(self.vk_token_url, data=data, headers=headers)
            logger.info(f"VK OAuth Response status: {response.status_code}")
            logger.info(f"VK OAuth Response text: {response.text}")
            if response.status_code == 200:
                result = response.json()
                if 'access_token' in result:
                    logger.info("Success with VK OAuth endpoint")
                    return {
                        'success': True,
                        'access_token': result['access_token'],
                        'token_type': 'Bearer',
                        'expires_in': result.get('expires_in'),
                        'user_id': result.get('user_id'),
                        'email': result.get('email'),
                        'source': 'vk_oauth'
                    }
                else:
                    logger.warning(f"No access_token in VK OAuth response: {result}")
        except requests.exceptions.RequestException as e:
            logger.error(f"VK OAuth request failed: {e}")
        return None

    def get_user_info(self, access_token: str, token_source: str = 'vk_oauth') -> Optional[Dict]:
        return self._get_vk_oauth_user_info(access_token)

    def _get_vk_oauth_user_info(self, access_token: str) -> Optional[Dict]:
        params = {
            'access_token': access_token,
            'v': '5.131',
            'fields': 'photo_50,photo_100,photo_200,email'
        }
        try:
            response = requests.get(self.vk_api_url, params=params)
            if response.status_code == 200:
                result = response.json()
                if 'response' in result and result['response']:
                    user_data = result['response'][0]
                    return {
                        'success': True,
                        'user': {
                            'id': user_data['id'],
                            'first_name': user_data['first_name'],
                            'last_name': user_data['last_name'],
                            'photo': user_data.get('photo_100', ''),
                            'photo_50': user_data.get('photo_50', ''),
                            'photo_200': user_data.get('photo_200', ''),
                            'email': user_data.get('email', ''),
                        },
                        'source': 'vk_oauth'
                    }
                else:
                    logger.error(f"Invalid VK API response: {result}")
        except requests.exceptions.RequestException as e:
            logger.error(f"VK API request failed: {e}")
        return None

    def refresh_token(self, refresh_token: str) -> Optional[Dict]:
        # VK OAuth не поддерживает refresh_token
        return None

# Функции для обратной совместимости
def get_vk_auth_url() -> str:
    """
    Получить URL для авторизации в VK OAuth
    Использует VK ID с fallback на обычный VK OAuth
    """
    vk_auth = VKIDAuth(
        client_id=settings.VK_CLIENT_ID,
        client_secret=settings.VK_CLIENT_SECRET,
        redirect_uri=settings.VK_REDIRECT_URI
    )
    return vk_auth.get_auth_url(scope="email", state="vk_oauth")

def get_vk_id_auth_url() -> str:
    """
    Получить URL для авторизации в VK ID (альтернативный)
    """
    vk_auth = VKIDAuth(
        client_id=settings.VK_CLIENT_ID,
        client_secret=settings.VK_CLIENT_SECRET,
        redirect_uri=settings.VK_REDIRECT_URI
    )
    return vk_auth.get_auth_url(scope="phone email", state="vk_oauth")

def exchange_vk_code_for_tokens(code: str) -> dict:
    """
    Обменять код авторизации на токены через VK OAuth API
    Использует правильные endpoints с fallback механизмом
    """
    vk_auth = VKIDAuth(
        client_id=settings.VK_CLIENT_ID,
        client_secret=settings.VK_CLIENT_SECRET,
        redirect_uri=settings.VK_REDIRECT_URI
    )
    
    result = vk_auth.exchange_code_for_token(code)
    
    if not result:
        raise Exception("Не удалось обменять код на токены через VK OAuth API")
    
    return {
        'access_token': result['access_token'],
        'refresh_token': result.get('refresh_token', ''),
        'user_id': result.get('user_id', ''),
        'expires_in': result.get('expires_in', ''),
        'source': result.get('source', 'vk_oauth')
    }

def get_vk_user_info(access_token: str, token_source: str = 'vk_oauth') -> Optional[Dict]:
    """
    Получить информацию о пользователе через VK API
    """
    vk_auth = VKIDAuth(
        client_id=settings.VK_CLIENT_ID,
        client_secret=settings.VK_CLIENT_SECRET,
        redirect_uri=settings.VK_REDIRECT_URI
    )
    
    result = vk_auth.get_user_info(access_token, token_source)
    
    if result and result.get('success'):
        return result['user']
    
    return None

# Простая функция для быстрого тестирования
def quick_vk_token_exchange(code: str) -> Optional[Dict]:
    """
    Быстрая функция для обмена кода на токен
    """
    try:
        return exchange_vk_code_for_tokens(code)
    except Exception as e:
        logger.error(f"Quick VK token exchange failed: {e}")
        return None

def handle_vk_callback(code: str, error: Optional[str] = None) -> Dict:
    """
    Обработчик callback для VK OAuth
    """
    if error:
        return {
            "success": False,
            "error": f"VK authorization error: {error}"
        }
    
    if not code:
        return {
            "success": False,
            "error": "No authorization code received"
        }
    
    # Инициализация VK OAuth
    vk_auth = VKIDAuth(
        client_id=settings.VK_CLIENT_ID,
        client_secret=settings.VK_CLIENT_SECRET,
        redirect_uri=settings.VK_REDIRECT_URI
    )
    
    # Обмен кода на токен
    token_data = vk_auth.exchange_code_for_token(code)
    
    if not token_data or not token_data.get('success'):
        return {
            "success": False,
            "error": "Failed to get access token",
            "details": token_data
        }
    
    access_token = token_data['access_token']
    token_source = token_data.get('source', 'vk_oauth')
    
    # Получение информации о пользователе
    user_info = vk_auth.get_user_info(access_token, token_source)
    
    if not user_info or not user_info.get('success'):
        return {
            "success": False,
            "error": "Failed to get user info",
            "token_data": token_data
        }
    
    return {
        "success": True,
        "user": user_info['user'],
        "token_data": token_data,
        "source": token_source
    }

def handle_vk_id_callback(request_args: Dict) -> Dict:
    """
    Обработчик callback для VK ID
    Args:
        request_args: Словарь с параметрами запроса (code, error, state, device_id)
    Returns:
        Результат авторизации
    """
    vk_auth = VKIDAuth(
        client_id=settings.VK_CLIENT_ID,
        client_secret=settings.VK_CLIENT_SECRET,
        redirect_uri=settings.VK_REDIRECT_URI
    )
    error = request_args.get('error')
    if error:
        return {
            "success": False,
            "error": f"VK authorization error: {error}",
            "error_description": request_args.get('error_description', '')
        }
    code = request_args.get('code')
    if not code:
        return {
            "success": False,
            "error": "No authorization code received"
        }
    device_id = request_args.get('device_id')
    # Обмен кода на токен
    token_data = vk_auth.exchange_code_for_token(code, use_vk_id=True, code_verifier=request_args.get('code_verifier'), device_id=device_id)
    if not token_data or not token_data.get('success'):
        return {
            "success": False,
            "error": "Failed to get access token",
            "details": token_data
        }
    access_token = token_data['access_token']
    token_source = token_data.get('source', 'vk_id')
    user_info = vk_auth.get_user_info(access_token, token_source)
    if not user_info or not user_info.get('success'):
        return {
            "success": False,
            "error": "Failed to get user info",
            "token_data": token_data
        }
    return {
        "success": True,
        "user": user_info['user'],
        "token_data": token_data,
        "source": token_source
    }

def test_vk_auth_urls():
    """
    Тестирует доступность URL авторизации
    """
    print("=== Тест URL авторизации VK ===")
    
    # Тест VK ID
    vk_id_url = get_vk_id_auth_url()
    print(f"VK ID URL: {vk_id_url}")
    
    try:
        response = requests.get(vk_id_url, allow_redirects=False)
        print(f"VK ID Status: {response.status_code}")
        if response.status_code == 302:
            print("✅ VK ID URL работает!")
        else:
            print(f"❌ VK ID URL не работает: {response.text[:100]}...")
    except Exception as e:
        print(f"❌ Ошибка VK ID: {e}")
    
    # Тест обычного VK OAuth
    vk_oauth_url = get_vk_auth_url()
    print(f"\nVK OAuth URL: {vk_oauth_url}")
    
    try:
        response = requests.get(vk_oauth_url, allow_redirects=False)
        print(f"VK OAuth Status: {response.status_code}")
        if response.status_code == 302:
            print("✅ VK OAuth URL работает!")
        else:
            print(f"❌ VK OAuth URL не работает: {response.text[:100]}...")
    except Exception as e:
        print(f"❌ Ошибка VK OAuth: {e}")
    
    print("\n=== Рекомендации ===")
    print("1. VK ID требует правильной настройки приложения")
    print("2. VK OAuth более стабилен и прост в настройке")
    print("3. Используйте fallback механизм для максимальной совместимости") 