import pandas as pd
import asyncio
from sqlalchemy.orm import Session
from typing import List, Dict, Any

from app.core.database import SessionLocal
from app.models.report import Report
from app.models.user import User
from app.services.google_sheets import append_data_to_sheet

async def process_excel_file(report_id: int, file_path: str, user: User):
    """
    Обработать Excel файл и загрузить данные в Google Sheets
    """
    db = SessionLocal()
    
    try:
        # Обновляем статус на "processing"
        report = db.query(Report).filter(Report.id == report_id).first()
        if report is None:
            return
        
        setattr(report, 'status', 'processing')
        db.commit()
        
        # Читаем Excel файл
        df = pd.read_excel(file_path)
        
        # Преобразуем DataFrame в список списков для Google Sheets
        data = [df.columns.tolist()] + df.values.tolist()
        
        # Проверяем, подключена ли Google таблица
        if not getattr(user, 'google_sheet_id', None):
            setattr(report, 'status', 'error')
            setattr(report, 'error_message', 'Google таблица не подключена')
            db.commit()
            return
        
        # Добавляем данные в Google Sheets
        result = await append_data_to_sheet(
            str(user.google_sheet_id),
            "A1",  # Начинаем с первой ячейки
            data,
            user
        )
        
        # Обновляем статус на "completed"
        setattr(report, 'status', 'completed')
        db.commit()
        
    except Exception as e:
        # Обновляем статус на "error"
        report = db.query(Report).filter(Report.id == report_id).first()
        if report is not None:
            setattr(report, 'status', 'error')
            setattr(report, 'error_message', str(e))
            db.commit()
    
    finally:
        db.close()

def parse_excel_file(file_path: str) -> Dict[str, Any]:
    """
    Парсить Excel файл и возвращать метаданные
    """
    try:
        # Читаем все листы
        excel_file = pd.ExcelFile(file_path)
        sheets_info = {}
        
        for sheet_name in excel_file.sheet_names:
            df = pd.read_excel(file_path, sheet_name=sheet_name)
            sheets_info[sheet_name] = {
                "rows": len(df),
                "columns": len(df.columns),
                "column_names": df.columns.tolist(),
                "sample_data": df.head(5).to_dict('records')
            }
        
        return {
            "total_sheets": len(excel_file.sheet_names),
            "sheet_names": excel_file.sheet_names,
            "sheets_info": sheets_info
        }
        
    except Exception as e:
        raise Exception(f"Ошибка парсинга Excel файла: {str(e)}")

def validate_excel_structure(file_path: str) -> bool:
    """
    Проверить структуру Excel файла на соответствие требованиям
    """
    try:
        df = pd.read_excel(file_path)
        
        # Проверяем наличие обязательных колонок
        required_columns = ['Дата', 'Кампания', 'Показы', 'Клики', 'Расходы']
        missing_columns = [col for col in required_columns if col not in df.columns]
        
        if missing_columns:
            raise Exception(f"Отсутствуют обязательные колонки: {', '.join(missing_columns)}")
        
        # Проверяем, что есть данные
        if len(df) == 0:
            raise Exception("Файл не содержит данных")
        
        return True
        
    except Exception as e:
        raise Exception(f"Ошибка валидации структуры файла: {str(e)}") 