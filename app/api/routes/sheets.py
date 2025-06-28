from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.core.database import get_db
from app.models.user import User
from app.services.auth import get_current_user
from app.services.google_sheets import get_sheet_info
from app.api.routes.auth import HTTPBearer401

router = APIRouter()
security = HTTPBearer401()

class SheetConnectRequest(BaseModel):
    sheet_id: str

@router.post("/connect")
async def connect_google_sheet(
    request: SheetConnectRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Подключить Google таблицу
    """
    try:
        # Проверяем доступ к таблице
        sheet_info = await get_sheet_info(request.sheet_id, current_user)
        
        # Сохраняем ID таблицы в профиле пользователя
        current_user.google_sheet_id = request.sheet_id
        db.commit()
        
        return {
            "message": "Google таблица успешно подключена",
            "sheet_info": sheet_info
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ошибка подключения таблицы: {str(e)}"
        )

@router.get("/info")
async def get_connected_sheet_info(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Получить информацию о подключенной таблице
    """
    if not current_user.google_sheet_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Google таблица не подключена"
        )
    
    try:
        sheet_info = await get_sheet_info(current_user.google_sheet_id, current_user)
        return sheet_info
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ошибка получения информации о таблице: {str(e)}"
        )

@router.delete("/disconnect")
async def disconnect_google_sheet(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Отключить Google таблицу
    """
    current_user.google_sheet_id = None
    db.commit()
    
    return {"message": "Google таблица отключена"} 