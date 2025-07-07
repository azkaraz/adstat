from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel

from app.core.database import get_db
from app.models.user import User
from app.models.report import Report
from app.services.auth import get_current_user
from app.api.routes.auth import HTTPBearer401

router = APIRouter()
security = HTTPBearer401()

class UserProfileUpdate(BaseModel):
    email: Optional[str] = None

@router.get("/profile")
async def get_user_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Получить профиль пользователя
    """
    return {
        "id": current_user.id,
        "telegram_id": current_user.telegram_id,
        "username": current_user.username,
        "first_name": current_user.first_name,
        "last_name": current_user.last_name,
        "email": current_user.email,
        "has_google_sheet": bool(current_user.google_sheet_id),
        "has_google_account": bool(current_user.google_access_token),
        "has_vk_account": bool(current_user.has_vk_account),
        "created_at": current_user.created_at
    }

@router.put("/profile")
async def update_user_profile(
    profile_data: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Обновить профиль пользователя
    """
    if profile_data.email:
        current_user.email = profile_data.email
    
    db.commit()
    db.refresh(current_user)
    
    return {
        "message": "Профиль обновлен",
        "user": {
            "id": current_user.id,
            "email": current_user.email
        }
    }

@router.get("/reports")
async def get_user_reports(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Получить список отчетов пользователя
    """
    reports = db.query(Report).filter(Report.user_id == current_user.id).all()
    
    return [
        {
            "id": report.id,
            "filename": report.original_filename,
            "file_size": report.file_size,
            "status": report.status,
            "created_at": report.created_at,
            "error_message": report.error_message
        }
        for report in reports
    ] 