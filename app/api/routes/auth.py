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

from app.core.database import get_db
from app.core.config import settings
from app.models.user import User
from app.services.auth import create_access_token, verify_telegram_auth
from app.services.google_sheets import get_google_auth_url, exchange_code_for_tokens

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

@router.post("/telegram")
async def telegram_auth(
    telegram_data: dict,
    db: Session = Depends(get_db)
):
    """
    Авторизация через Telegram
    """
    print(f"DEBUG: telegram_auth called with data: {telegram_data}")
    
    # Проверяем наличие обязательных данных
    if not telegram_data or "id" not in telegram_data:
        print("DEBUG: Missing required data")
        print(f"DEBUG: telegram_data type: {type(telegram_data)}")
        print(f"DEBUG: telegram_data keys: {list(telegram_data.keys()) if telegram_data else 'None'}")
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Отсутствуют обязательные данные Telegram"
        )
    
    # Проверяем подпись от Telegram
    print("DEBUG: Verifying Telegram auth...")
    if not verify_telegram_auth(telegram_data):
        print("DEBUG: Telegram auth verification failed")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверная подпись Telegram"
        )
    
    print("DEBUG: Telegram auth verification passed")
    
    try:
        # Получаем данные пользователя
        telegram_id = str(telegram_data.get("id"))
        username = telegram_data.get("username", "")
        first_name = telegram_data.get("first_name", "")
        last_name = telegram_data.get("last_name", "")
        
        print(f"DEBUG: User data - id: {telegram_id}, username: {username}, first_name: {first_name}")
        
        # Ищем пользователя в базе
        user = db.query(User).filter(User.telegram_id == telegram_id).first()
        
        if not user:
            print("DEBUG: Creating new user")
            # Создаем нового пользователя
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
            print("DEBUG: User found in database")
            # Обновляем данные пользователя, если они изменились
            if (user.username != username or 
                user.first_name != first_name or 
                user.last_name != last_name):
                user.username = username
                user.first_name = first_name
                user.last_name = last_name
                db.commit()
                db.refresh(user)
        
        # Создаем JWT токен
        access_token = create_access_token(data={"sub": str(user.id)})
        
        print("DEBUG: Auth successful, returning response")
        
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
                "has_google_sheet": bool(user.google_sheet_id)
            }
        }
        
    except Exception as e:
        print(f"DEBUG: Error during auth: {str(e)}")
        import traceback
        print(f"DEBUG: Full traceback: {traceback.format_exc()}")
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
    code: str,
    db: Session = Depends(get_db)
):
    """
    Обработка callback от Google OAuth
    """
    try:
        tokens = exchange_code_for_tokens(code)
        # Здесь нужно сохранить токены для пользователя
        # Пока возвращаем успех
        return {"message": "Google авторизация успешна"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ошибка Google авторизации: {str(e)}"
        )

@router.post("/web-app/auth/telegram")
async def auth_telegram_webapp(
    data: Dict[str, Any],
    db: Session = Depends(get_db)
):
    """
    Авторизация через Telegram WebApp с initData
    """
    logger.info(f"WebApp auth called with data: {data}")
    
    init_data_str = data.get("initData")
    
    if not init_data_str:
        logger.warning("No initData provided")
        return {"success": False, "error": "initData is missing"}
    
    from urllib.parse import parse_qs
    decoded_query = parse_qs(init_data_str)
    hash_str = decoded_query.get('hash', [''])[0]
    user_info = decoded_query.get('user', [''])[0]

    # Формируем строку для проверки подписи
    fields_to_exclude = ['hash', 'signature']
    data_check_string = '\n'.join([
        f"{k}={v[0]}" for k, v in sorted(decoded_query.items())
        if k not in fields_to_exclude
    ])

    import hmac, hashlib
    secret_key = hmac.new(
        "WebAppData".encode('utf-8'),
        settings.TELEGRAM_BOT_TOKEN.encode('utf-8'),
        hashlib.sha256
    ).digest()
    computed_hash = hmac.new(
        secret_key,
        data_check_string.encode('utf-8'),
        hashlib.sha256
    ).hexdigest()

    logger.info(f"Data check string: {data_check_string}")
    logger.info(f"Computed hash: {computed_hash}")
    logger.info(f"Received hash: {hash_str}")

    if computed_hash == hash_str:
        import json
        try:
            user_data = json.loads(user_info) if user_info else {}
            telegram_id = str(user_data.get("id", ""))
            username = user_data.get("username", "")
            first_name = user_data.get("first_name", "")
            last_name = user_data.get("last_name", "")
            # Ищем или создаем пользователя
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
                "success": True,
                "user": user_info,
                "access_token": access_token,
                "token_type": "bearer",
                "user_data": {
                    "id": user.id,
                    "telegram_id": user.telegram_id,
                    "username": user.username,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                    "email": user.email,
                    "has_google_sheet": bool(user.google_sheet_id)
                }
            }
        except json.JSONDecodeError as e:
            logger.error(f"Error parsing user info JSON: {e}")
            return {"success": False, "error": "Invalid user data format"}
    else:
        logger.warning(f"Authorization failed for user: {user_info}")
        return {"success": False, "error": "Авторизация не пройдена"} 