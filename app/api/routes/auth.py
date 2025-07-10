from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import Optional, Dict, Any
import hashlib
import hmac
import time
from fastapi import Request
from urllib.parse import parse_qs, unquote
import logging
from pydantic import BaseModel
import requests
import traceback

from app.core.database import get_db
from app.core.config import settings
from app.models.user import User
from app.services.auth import create_access_token, verify_telegram_auth, get_current_user
from app.services.google_sheets import get_google_auth_url, exchange_code_for_tokens, get_user_spreadsheets
from app.services.vk_ads import get_vk_auth_url, exchange_vk_code_for_tokens

router = APIRouter()
logger = logging.getLogger(__name__)

class HTTPBearer401(HTTPBearer):
    async def __call__(self, request: Request) -> HTTPAuthorizationCredentials:
        try:
            result = await super().__call__(request)
            if result is None:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Не авторизован"
                )
            return result
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Не авторизован"
            )

security = HTTPBearer401()

class GoogleCallbackRequest(BaseModel):
    code: str

class VKCallbackRequest(BaseModel):
    code: str

@router.post("/telegram")
async def telegram_auth(
    telegram_data: dict,
    db: Session = Depends(get_db)
):
    """
    Авторизация через Telegram
    """
    if not telegram_data or "id" not in telegram_data:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Отсутствуют обязательные данные Telegram"
        )
    
    if not verify_telegram_auth(telegram_data):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверная подпись Telegram"
        )
    
    try:
        telegram_id = str(telegram_data.get("id"))
        username = telegram_data.get("username", "")
        first_name = telegram_data.get("first_name", "")
        last_name = telegram_data.get("last_name", "")
        
        user = db.query(User).filter(User.telegram_id == telegram_id).first()
        
        if not user:
            user = User(
                telegram_id=telegram_id,
                username=username,
                first_name=first_name,
                last_name=last_name
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        else:
            if (user.username != username or 
                user.first_name != first_name or 
                user.last_name != last_name):
                user.username = username
                user.first_name = first_name
                user.last_name = last_name
                db.commit()
                db.refresh(user)
        
        access_token = create_access_token(data={"sub": str(user.id)})
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": user.id,
                "telegram_id": user.telegram_id,
                "username": user.username,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "email": user.email,
                "has_google_sheet": bool(user.google_sheet_id),
                "has_vk_account": bool(getattr(user, 'vk_access_token', None))
            }
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка авторизации: {str(e)}"
        )

@router.post("/google/url")
def get_google_auth_url_route():
    """
    Получить URL для авторизации в Google
    """
    auth_url = get_google_auth_url()
    return {"auth_url": auth_url}

@router.post("/google/callback")
async def google_auth_callback(
    data: GoogleCallbackRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Обработка callback от Google OAuth
    """
    try:
        code = data.code
        tokens = exchange_code_for_tokens(code)
        # Сохраняем токены для пользователя
        current_user.google_access_token = tokens['access_token']  # type: ignore[assignment]
        current_user.google_refresh_token = tokens['refresh_token']  # type: ignore[assignment]
        db.commit()
        # Создаём новый access_token для пользователя
        access_token = create_access_token(data={"sub": str(current_user.id)})
        return {
            "message": "Google авторизация успешна",
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": current_user.id,
                "telegram_id": current_user.telegram_id,
                "username": current_user.username,
                "first_name": current_user.first_name,
                "last_name": current_user.last_name,
                "email": current_user.email,
                "has_google_sheet": bool(current_user.google_sheet_id),
                "has_vk_account": bool(getattr(current_user, 'vk_access_token', None))
            }
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ошибка Google авторизации: {str(e)}"
        )

@router.post("/vk/url")
def get_vk_auth_url_route():
    """
    Получить URL для авторизации в VK
    """
    auth_url = get_vk_auth_url()
    return {"auth_url": auth_url}

@router.post("/vk/callback")
async def vk_auth_callback(
    data: VKCallbackRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Обработка callback от VK ID
    """
    try:
        code = data.code
        logger.info(f"VK CALLBACK: code={code}")
        tokens = exchange_vk_code_for_tokens(code)
        logger.info(f"VK CALLBACK: tokens={tokens}")
        # Сохраняем токены для пользователя
        current_user.vk_access_token = tokens['access_token']
        current_user.vk_refresh_token = tokens.get('refresh_token', '')
        db.commit()
        db.refresh(current_user)
        logger.info(f"VK CALLBACK: user.vk_access_token={current_user.vk_access_token}")
        # Создаём новый access_token для пользователя
        access_token = create_access_token(data={"sub": str(current_user.id)})
        return {
            "message": "VK авторизация успешна",
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": current_user.id,
                "telegram_id": current_user.telegram_id,
                "username": current_user.username,
                "first_name": current_user.first_name,
                "last_name": current_user.last_name,
                "email": current_user.email,
                "has_vk_account": bool(current_user.vk_access_token)
            }
        }
    except Exception as e:
        logger.error(f"VK CALLBACK ERROR: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ошибка VK авторизации: {str(e)}"
        )

@router.post("/vk-callback")
async def vk_callback(request: Request, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Привязка VK-аккаунта к текущему пользователю (авторизация обязательна, новых пользователей не создаёт)
    """
    try:
        body = await request.json()
        code = body.get('code')
        error = body.get('error')
        device_id = body.get('device_id')
        code_verifier = body.get('code_verifier')
        if error:
            raise HTTPException(status_code=400, detail=f"VK authorization error: {error}")
        if not code:
            raise HTTPException(status_code=400, detail="Код авторизации не предоставлен")
        if current_user is None or current_user.id is None:
            raise HTTPException(status_code=401, detail="Авторизация обязательна для привязки VK")
        from app.services.vk_ads import handle_vk_id_callback
        callback_params = {
            'code': code,
            'error': error,
            'state': body.get('state'),
            'device_id': device_id,
            'code_verifier': code_verifier
        }
        result = handle_vk_id_callback(callback_params)
        if not result.get('success'):
            raise HTTPException(status_code=400, detail=result)
        user_data = result['user']
        token_data = result['token_data']
        source = result.get('source', 'vk_oauth')
        # Привязываем VK ID и токены к текущему пользователю
        current_user.vk_id = str(user_data.get('id', ''))  # type: ignore[assignment]
        current_user.has_vk_account = True  # type: ignore[assignment]
        current_user.vk_access_token = token_data['access_token']
        current_user.vk_refresh_token = token_data.get('refresh_token', '')
        if user_data.get('first_name'):
            current_user.first_name = user_data['first_name']
        if user_data.get('last_name'):
            current_user.last_name = user_data['last_name']
        db.commit()
        db.refresh(current_user)
        access_token = create_access_token(data={"sub": str(current_user.id)})
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": current_user.id,
                "email": current_user.email,
                "first_name": current_user.first_name,
                "last_name": current_user.last_name,
                "has_vk_account": current_user.has_vk_account,
                "has_google_account": getattr(current_user, 'has_google_account', False),
                "has_google_sheet": bool(getattr(current_user, 'google_sheet_id', None))
            },
            "vk_source": source
        }
    except Exception as e:
        logger.error(f"VK ID callback error: {e}\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Ошибка обработки VK ID callback: {e}\n{traceback.format_exc()}")

def validate(hash_str, init_data, token, c_str="WebAppData"):
    """
    Validates the data received from the Telegram web app, using the
    method documented here:
    https://core.telegram.org/bots/webapps#validating-data-received-via-the-web-app

    hash_str - the has string passed by the webapp
    init_data - the query string passed by the webapp
    token - Telegram bot's token
    c_str - constant string (default = "WebAppData")
    """

    init_data = sorted([chunk.split("=")
                        for chunk in unquote(init_data).split("&")
                        if chunk[:len("hash=")] != "hash="],
                       key=lambda x: x[0])
    init_data = "\n".join([f"{rec[0]}={rec[1]}" for rec in init_data])

    secret_key = hmac.new(c_str.encode(), token.encode(),
                          hashlib.sha256).digest()
    data_check = hmac.new(secret_key, init_data.encode(),
                          hashlib.sha256)

    return data_check.hexdigest() == hash_str

@router.post("/web-app/auth/telegram")
async def auth_telegram(data: Dict[str, Any], db: Session = Depends(get_db)):

    logger.info(f"Telegram WebApp auth request received: {data}")
    init_data_str = data.get("initData")

    if not init_data_str:
        logger.error("initData is missing in request")
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="initData is missing"
        )

    try:
        logger.info(f"Processing initData: {init_data_str[:100]}...")
        hash_str = init_data_str.split("&hash=")[1]
        decoded_query = parse_qs(init_data_str)
        user_info_str = decoded_query['user'][0]
        
        logger.info(f"User info string: {user_info_str}")
        
        # Парсим JSON из строки user_info
        import json
        user_info = json.loads(user_info_str)
        logger.info(f"Parsed user info: {user_info}")
        
        if validate(hash_str, init_data_str, settings.TELEGRAM_BOT_TOKEN):
            logger.info("Telegram signature validation successful")
            # Находим или создаем пользователя
            telegram_id = str(user_info.get("id"))
            username = user_info.get("username", "")
            first_name = user_info.get("first_name", "")
            last_name = user_info.get("last_name", "")
            
            logger.info(f"Looking for user with telegram_id: {telegram_id}")
            user = db.query(User).filter(User.telegram_id == telegram_id).first()
            
            if not user:
                logger.info(f"Creating new user with telegram_id: {telegram_id}")
                user = User(
                    telegram_id=telegram_id,
                    username=username,
                    first_name=first_name,
                    last_name=last_name
                )
                db.add(user)
                db.commit()
                db.refresh(user)
                logger.info(f"New user created with ID: {user.id}")
            else:
                logger.info(f"Found existing user with ID: {user.id}")
                if (user.username != username or 
                    user.first_name != first_name or 
                    user.last_name != last_name):
                    logger.info("Updating user information")
                    user.username = username
                    user.first_name = first_name
                    user.last_name = last_name
                    db.commit()
                    db.refresh(user)
            
            access_token = create_access_token(data={"sub": str(user.id)})
            logger.info(f"Created access token for user {user.id}")
            
            response_data = {
                "access_token": access_token,
                "token_type": "bearer",
                "user": {
                    "id": user.id,
                    "telegram_id": user.telegram_id,
                    "username": user.username,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                    "email": user.email,
                    "has_google_sheet": bool(user.google_sheet_id),
                    "has_vk_account": bool(getattr(user, 'vk_access_token', None))
                }
            }
            
            logger.info(f"Returning response: {response_data}")
            return response_data
        else:
            logger.error("Telegram signature validation failed")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Неверная подпись Telegram"
            )
    except Exception as e:
        logger.error(f"Telegram WebApp auth error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка авторизации: {str(e)}"
        )

@router.get("/google/spreadsheets")
async def list_google_spreadsheets(current_user: User = Depends(get_current_user)):
    """
    Получить список Google-таблиц пользователя
    """
    try:
        spreadsheets = get_user_spreadsheets(current_user)
        return {"spreadsheets": spreadsheets}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ошибка получения списка таблиц: {str(e)}"
        )

@router.get("/vk/debug")
async def vk_debug_info():
    """
    Отладочная информация для VK ID
    """
    return {
        "vk_client_id": settings.VK_CLIENT_ID,
        "vk_redirect_uri": settings.VK_REDIRECT_URI,
        "vk_client_secret_configured": bool(settings.VK_CLIENT_SECRET),
        "auth_url": get_vk_auth_url()
    }

def get_vk_user_info(access_token: str) -> dict:
    """
    Получить информацию о пользователе через VK API
    """
    
    # Используем стандартный VK API для получения информации о пользователе
    url = 'https://api.vk.com/method/users.get'
    params = {
        'access_token': access_token,
        'v': '5.131',
        'fields': 'photo_50,photo_100,email'
    }
    
    logger.info(f"Getting VK user info. URL: {url}")
    
    try:
        response = requests.get(url, params=params)
        logger.info(f"VK user info response status: {response.status_code}")
        logger.info(f"VK user info response: {response.text}")
        
        if response.status_code == 200:
            data = response.json()
            if 'response' in data and data['response']:
                user_data = data['response'][0]
                logger.info(f"VK user data: {user_data}")
                
                return {
                    'user_id': user_data.get('id', ''),
                    'first_name': user_data.get('first_name', ''),
                    'last_name': user_data.get('last_name', ''),
                    'email': user_data.get('email', ''),
                    'photo': user_data.get('photo_100', '')
                }
            else:
                logger.error(f"No user data in VK API response: {data}")
                raise Exception("No user data in VK API response")
        else:
            logger.error(f"VK API Error {response.status_code}: {response.text}")
            raise Exception(f"VK API Error {response.status_code}")
            
    except requests.exceptions.RequestException as e:
        logger.error(f"VK user info request failed: {e}")
        if hasattr(e, 'response') and e.response:
            logger.error(f"Response text: {e.response.text}")
        raise