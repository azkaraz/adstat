from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from fastapi.security import HTTPBearer
from sqlalchemy.orm import Session
import os
import uuid
from datetime import datetime

from app.core.database import get_db
from app.core.config import settings
from app.models.user import User
from app.models.report import Report
from app.services.auth import get_current_user
from app.services.file_processor import process_excel_file
from app.api.routes.auth import HTTPBearer401

router = APIRouter()
security = HTTPBearer401()

@router.post("/report")
async def upload_report(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Загрузить отчет в формате XLSX
    """
    # Проверяем тип файла
    if not file.filename.endswith(('.xlsx', '.xls')):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Поддерживаются только файлы Excel (.xlsx, .xls)"
        )
    
    # Проверяем размер файла
    if file.size > settings.MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Размер файла превышает {settings.MAX_FILE_SIZE // (1024*1024)}MB"
        )
    
    try:
        # Генерируем уникальное имя файла
        file_extension = os.path.splitext(file.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = os.path.join(settings.UPLOAD_DIR, unique_filename)
        
        # Сохраняем файл
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        # Создаем запись в базе данных
        report = Report(
            user_id=current_user.id,
            filename=unique_filename,
            original_filename=file.filename,
            file_path=file_path,
            file_size=len(content),
            status="uploaded"
        )
        db.add(report)
        db.commit()
        db.refresh(report)
        
        # Запускаем обработку файла в фоновом режиме
        await process_excel_file(report.id, file_path, current_user)
        
        return {
            "message": "Файл успешно загружен",
            "report_id": report.id,
            "filename": file.filename,
            "status": report.status
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка загрузки файла: {str(e)}"
        )

@router.get("/report/{report_id}/status")
async def get_report_status(
    report_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Получить статус обработки отчета
    """
    report = db.query(Report).filter(
        Report.id == report_id,
        Report.user_id == current_user.id
    ).first()
    
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Отчет не найден"
        )
    
    return {
        "id": report.id,
        "filename": report.original_filename,
        "status": report.status,
        "created_at": report.created_at,
        "error_message": report.error_message
    } 