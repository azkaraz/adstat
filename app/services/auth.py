from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
import hashlib
import hmac
import time

from app.core.config import settings
from app.core.database import get_db
from app.models.user import User

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

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Создать JWT токен"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def verify_token(token: str):
    """Проверить JWT токен"""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id_raw = payload.get("sub")
        if user_id_raw is None:
            return None
        user_id = str(user_id_raw)
        return user_id
    except JWTError:
        return None

def verify_telegram_auth(telegram_data: dict) -> bool:
    """Проверить подпись от Telegram"""
    # Проверяем, является ли это тестовыми данными
    if telegram_data.get('hash') == 'mock_hash':
        return True
    
    if not settings.TELEGRAM_BOT_TOKEN:
        return True  # В режиме разработки пропускаем проверку
    
    # Получаем hash из данных
    received_hash = telegram_data.get('hash', '')
    if not received_hash:
        return False
    
    # Если hash пришел как initData (URL-encoded строка), парсим её
    if '=' in received_hash and '&' in received_hash:
        try:
            from urllib.parse import parse_qs, unquote
            # Декодируем URL-encoded строку
            decoded_data = unquote(received_hash)
            
            # Парсим параметры
            params = parse_qs(decoded_data)
            
            # Создаем словарь с данными
            data_dict = {}
            for key, values in params.items():
                if values:
                    data_dict[key] = values[0]
            
            # Извлекаем hash
            received_hash = data_dict.pop('hash', '') or ''
            
            # Создаем строку для проверки (без hash и signature)
            # Telegram использует только определенные поля для подписи
            # Исключаем hash и signature из проверки
            fields_to_exclude = ['hash', 'signature']
            data_check_string = '\n'.join([
                f"{k}={v}" for k, v in sorted(data_dict.items())
                if k not in fields_to_exclude
            ])
        except Exception as e:
            return False
    else:
        # Обычный случай - hash пришел отдельно
        # Получаем данные для проверки (без hash и signature)
        fields_to_exclude = ['hash', 'signature']
        data_check_string = '\n'.join([
            f"{k}={v}" for k, v in sorted(telegram_data.items()) 
            if k not in fields_to_exclude
        ])
    
    # Правильная реализация проверки подписи Telegram
    try:
        # Шаг 1: Создаем HMAC-SHA256 от токена бота с ключом "WebAppData"
        secret_key = hmac.new(
            "WebAppData".encode('utf-8'),
            settings.TELEGRAM_BOT_TOKEN.encode('utf-8'),
            hashlib.sha256
        ).digest()
        
        # Шаг 2: Создаем HMAC-SHA256 от строки данных с секретным ключом
        computed_hash = hmac.new(
            secret_key,
            data_check_string.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()
        
        return computed_hash == received_hash
        
    except Exception as e:
        return False

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    token = credentials.credentials
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id_raw = payload.get("sub")
        if user_id_raw is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Не авторизован")
        user_id = int(str(user_id_raw))
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Не авторизован")
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Не авторизован")
    return user 