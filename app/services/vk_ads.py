import requests
from app.core.config import settings
from urllib.parse import urlencode
import base64
import hashlib
import secrets

def get_vk_auth_url() -> str:
    """
    Получить URL для авторизации в VK ID
    """
    # Генерируем code_verifier и code_challenge для PKCE
    code_verifier = base64.urlsafe_b64encode(secrets.token_bytes(32)).decode('utf-8').rstrip('=')
    code_challenge = base64.urlsafe_b64encode(
        hashlib.sha256(code_verifier.encode('utf-8')).digest()
    ).decode('utf-8').rstrip('=')
    
    params = {
        'response_type': 'code',
        'client_id': settings.VK_CLIENT_ID,
        'redirect_uri': settings.VK_REDIRECT_URI,
        'scope': 'email,phone',
        'state': secrets.token_urlsafe(32),
        'code_challenge': code_challenge,
        'code_challenge_method': 'S256'
    }
    return f'https://id.vk.com/oauth2/auth?{urlencode(params)}'

def exchange_vk_code_for_tokens(code: str, code_verifier: str) -> dict:
    """
    Обменять код авторизации на токены через VK ID
    """
    params = {
        'grant_type': 'authorization_code',
        'client_id': settings.VK_CLIENT_ID,
        'client_secret': settings.VK_CLIENT_SECRET,
        'redirect_uri': settings.VK_REDIRECT_URI,
        'code': code,
        'code_verifier': code_verifier
    }
    
    url = 'https://id.vk.com/oauth2/access_token'
    resp = requests.post(url, data=params)
    resp.raise_for_status()
    data = resp.json()
    
    return {
        'access_token': data['access_token'],
        'refresh_token': data.get('refresh_token', ''),
        'user_id': data.get('user_id'),
        'id_token': data.get('id_token', '')
    } 