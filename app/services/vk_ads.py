import requests
import logging
from app.core.config import settings
from urllib.parse import urlencode

logger = logging.getLogger(__name__)

def get_vk_auth_url() -> str:
    """
    Получить URL для авторизации в VK ID
    """
    params = {
        'response_type': 'code',
        'client_id': settings.VK_CLIENT_ID,
        'redirect_uri': settings.VK_REDIRECT_URI,
        'scope': 'phone email',
        'state': 'vk_oauth'
    }
    return f'https://id.vk.com/oauth2/auth?{urlencode(params)}'

def exchange_vk_code_for_tokens(code: str) -> dict:
    """
    Обменять код авторизации на токены через VK ID OAuth 2.1
    """
    params = {
        'grant_type': 'authorization_code',
        'client_id': settings.VK_CLIENT_ID,
        'client_secret': settings.VK_CLIENT_SECRET,
        'redirect_uri': settings.VK_REDIRECT_URI,
        'code': code
    }
    url = 'https://api.vk.com/oauth/access_token'
    
    logger.info(f"Exchanging VK code for tokens. URL: {url}")
    logger.info(f"VK Client ID: {settings.VK_CLIENT_ID}")
    logger.info(f"VK Redirect URI: {settings.VK_REDIRECT_URI}")
    logger.info(f"Code length: {len(code) if code else 0}")
    
    try:
        resp = requests.post(url, data=params)
        logger.info(f"VK API response status: {resp.status_code}")
        logger.info(f"VK API response: {resp.text}")
        
        resp.raise_for_status()
        data = resp.json()
        
        logger.info(f"VK tokens received: {data}")
        
        return {
            'access_token': data['access_token'],
            'refresh_token': data.get('refresh_token', ''),
            'user_id': data.get('user_id', '')
        }
    except requests.exceptions.RequestException as e:
        logger.error(f"VK API request failed: {e}")
        logger.error(f"Request URL: {url}")
        logger.error(f"Request params: {params}")
        raise 