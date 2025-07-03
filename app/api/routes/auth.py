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
            return await super().__call__(request)
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
        current_user.google_access_token = tokens['access_token']
        current_user.google_refresh_token = tokens['refresh_token']
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
    Обработка callback от VK OAuth
    """
    try:
        code = data.code
        tokens = exchange_vk_code_for_tokens(code)
        # Сохраняем токены для пользователя
        current_user.vk_access_token = tokens['access_token']
        current_user.vk_refresh_token = tokens.get('refresh_token', '')
        db.commit()
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
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ошибка VK авторизации: {str(e)}"
        )

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
async def auth_telegram(data: Dict[str, Any]):

    init_data_str = data.get("initData")

    if not init_data_str:
        return {"success": False, "error": "initData is missing"}

    hash_str = init_data_str.split("&hash=")[1]

    decoded_query = parse_qs(init_data_str)
    user_info = decoded_query['user'][0]

    if validate(hash_str, init_data_str, settings.TELEGRAM_BOT_TOKEN):

        return {"success": True, "user": user_info}
    else:
        return {"success": False, "error": "Авторизация не пройдена"}

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