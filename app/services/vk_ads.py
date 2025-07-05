import requests
from app.core.config import settings
from urllib.parse import urlencode

def get_vk_auth_url() -> str:
    """
    Получить URL для авторизации в VK
    """
    params = {
        'response_type': 'code',
        'client_id': settings.VK_CLIENT_ID,
        'redirect_uri': settings.VK_REDIRECT_URI,
        'scope': 'phone email',
        'display': 'page',
        'v': '5.131',
        'state': 'vk_oauth'
    }
    return f'https://oauth.vk.com/authorize?{urlencode(params)}'

def exchange_vk_code_for_tokens(code: str) -> dict:
    """
    Обменять код авторизации на токены через VK OAuth
    """
    params = {
        'grant_type': 'authorization_code',
        'client_id': settings.VK_CLIENT_ID,
        'client_secret': settings.VK_CLIENT_SECRET,
        'redirect_uri': settings.VK_REDIRECT_URI,
        'code': code
    }
    url = 'https://oauth.vk.com/access_token'
    resp = requests.post(url, data=params)
    resp.raise_for_status()
    data = resp.json()
    
    return {
        'access_token': data['access_token'],
        'refresh_token': data.get('refresh_token', ''),
        'user_id': data.get('user_id', '')
    } 