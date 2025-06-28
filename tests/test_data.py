"""
Тестовые данные для приложения
"""

import io
import pandas as pd
from datetime import datetime

# Тестовые данные для Telegram авторизации
TELEGRAM_AUTH_DATA = {
    "id": 123456789,
    "first_name": "Тестовый",
    "last_name": "Пользователь",
    "username": "test_user",
    "auth_date": 1234567890,
    "hash": "test_hash"
}

# Тестовые данные для пользователей
TEST_USERS = [
    {
        "telegram_id": "111111111",
        "username": "user1",
        "first_name": "Пользователь",
        "last_name": "Первый",
        "email": "user1@example.com"
    },
    {
        "telegram_id": "222222222",
        "username": "user2",
        "first_name": "Пользователь",
        "last_name": "Второй",
        "email": "user2@example.com"
    },
    {
        "telegram_id": "333333333",
        "username": "user3",
        "first_name": "Пользователь",
        "last_name": "Третий",
        "email": "user3@example.com"
    }
]

# Тестовые данные для отчетов
TEST_REPORTS = [
    {
        "filename": "yandex_report.xlsx",
        "original_filename": "yandex_report_2023_12_01.xlsx",
        "file_size": 1024,
        "status": "completed",
        "created_at": datetime(2023, 12, 1, 10, 0, 0),
        "updated_at": datetime(2023, 12, 1, 10, 5, 0)
    },
    {
        "filename": "google_ads_report.xlsx",
        "original_filename": "google_ads_report_2023_12_01.xlsx",
        "file_size": 2048,
        "status": "processing",
        "created_at": datetime(2023, 12, 1, 11, 0, 0),
        "updated_at": datetime(2023, 12, 1, 11, 0, 0)
    },
    {
        "filename": "facebook_report.xlsx",
        "original_filename": "facebook_report_2023_12_01.xlsx",
        "file_size": 512,
        "status": "error",
        "error_message": "Неверный формат файла",
        "created_at": datetime(2023, 12, 1, 12, 0, 0),
        "updated_at": datetime(2023, 12, 1, 12, 0, 0)
    }
]

# Тестовые данные для Google Sheets
GOOGLE_SHEET_DATA = {
    "sheet_id": "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms",
    "title": "Test Sheet",
    "sheets": [
        {
            "title": "Sheet1",
            "sheet_id": 0
        },
        {
            "title": "Sheet2",
            "sheet_id": 1
        }
    ]
}

# Тестовые данные для Excel файлов
def create_test_excel_file():
    """Создает тестовый Excel файл в памяти"""
    # Создаем тестовые данные
    data = {
        'Дата': ['2023-12-01', '2023-12-02', '2023-12-03'],
        'Кампания': ['Кампания 1', 'Кампания 2', 'Кампания 3'],
        'Показы': [1000, 2000, 1500],
        'Клики': [100, 200, 150],
        'CTR': [0.1, 0.1, 0.1],
        'Расходы': [5000, 10000, 7500]
    }
    
    df = pd.DataFrame(data)
    
    # Создаем Excel файл в памяти
    output = io.BytesIO()
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        df.to_excel(writer, sheet_name='Отчет', index=False)
    
    output.seek(0)
    return output

def create_invalid_excel_file():
    """Создает невалидный Excel файл"""
    # Создаем данные с неправильной структурой
    data = {
        'Неправильная колонка': ['Значение 1', 'Значение 2'],
        'Другая колонка': [1, 2]
    }
    
    df = pd.DataFrame(data)
    
    output = io.BytesIO()
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        df.to_excel(writer, sheet_name='Отчет', index=False)
    
    output.seek(0)
    return output

def create_large_excel_file():
    """Создает большой Excel файл для тестирования лимитов"""
    # Создаем много данных
    data = {
        'Дата': [f'2023-12-{i:02d}' for i in range(1, 1001)],
        'Кампания': [f'Кампания {i}' for i in range(1, 1001)],
        'Показы': [1000 + i for i in range(1000)],
        'Клики': [100 + i for i in range(1000)],
        'CTR': [0.1 for _ in range(1000)],
        'Расходы': [5000 + i * 10 for i in range(1000)]
    }
    
    df = pd.DataFrame(data)
    
    output = io.BytesIO()
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        df.to_excel(writer, sheet_name='Отчет', index=False)
    
    output.seek(0)
    return output

# Тестовые данные для API ответов
API_RESPONSES = {
    "auth_success": {
        "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "user": {
            "id": 1,
            "telegram_id": "123456789",
            "username": "test_user",
            "first_name": "Тестовый",
            "last_name": "Пользователь",
            "email": "test@example.com",
            "has_google_sheet": False
        }
    },
    "auth_error": {
        "detail": "Неверная подпись Telegram"
    },
    "profile_updated": {
        "message": "Профиль обновлен",
        "user": {
            "id": 1,
            "telegram_id": "123456789",
            "username": "test_user",
            "first_name": "Тестовый",
            "last_name": "Пользователь",
            "email": "updated@example.com",
            "has_google_sheet": False
        }
    },
    "upload_success": {
        "message": "Файл успешно загружен",
        "report_id": 1,
        "filename": "test_report.xlsx",
        "status": "uploaded"
    },
    "upload_error": {
        "detail": "Поддерживаются только файлы Excel"
    },
    "sheet_connected": {
        "message": "Google таблица успешно подключена",
        "sheet_info": {
            "sheet_id": "test_sheet_id",
            "title": "Test Sheet",
            "sheets": [
                {
                    "title": "Sheet1",
                    "sheet_id": 0
                }
            ]
        }
    }
}

# Тестовые данные для ошибок
ERROR_MESSAGES = {
    "network_error": "Ошибка сети",
    "auth_required": "Не авторизован",
    "invalid_file": "Неверный формат файла",
    "file_too_large": "Размер файла превышает лимит",
    "sheet_not_found": "Таблица не найдена",
    "access_denied": "Доступ запрещен",
    "validation_error": "Ошибка валидации данных"
}

# Тестовые данные для валидации
VALIDATION_DATA = {
    "valid_email": "test@example.com",
    "invalid_email": "invalid-email",
    "valid_sheet_id": "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms",
    "invalid_sheet_id": "invalid-sheet-id",
    "valid_telegram_id": "123456789",
    "invalid_telegram_id": "not-a-number"
}

# Тестовые данные для производительности
PERFORMANCE_DATA = {
    "small_file_size": 1024,  # 1KB
    "medium_file_size": 1024 * 1024,  # 1MB
    "large_file_size": 10 * 1024 * 1024,  # 10MB
    "max_file_size": 10 * 1024 * 1024,  # 10MB
    "concurrent_requests": 10,
    "timeout_seconds": 30
} 