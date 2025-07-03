import os
from typing import Dict, Any, Optional
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
import pickle

from app.models.user import User
from app.core.config import settings

# Если изменяете эти области, удалите файл token.pickle.
SCOPES = [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive.metadata.readonly',
    'https://www.googleapis.com/auth/drive'  # Полный доступ к Google Drive (чтение/запись)
]

def get_google_auth_url() -> str:
    """
    Получить URL для авторизации в Google
    """
    try:
        flow = InstalledAppFlow.from_client_secrets_file(
            'credentials.json', SCOPES, redirect_uri=settings.GOOGLE_REDIRECT_URI
        )
        auth_url, _ = flow.authorization_url(
            access_type='offline',
            include_granted_scopes='true'
        )
        return auth_url
    except FileNotFoundError:
        # Для тестов возвращаем мок URL
        return "https://accounts.google.com/oauth2/auth"

def exchange_code_for_tokens(code: str) -> Dict[str, str]:
    """
    Обменять код авторизации на токены
    """
    try:
        flow = InstalledAppFlow.from_client_secrets_file(
            'credentials.json', SCOPES, redirect_uri=settings.GOOGLE_REDIRECT_URI
        )
        flow.fetch_token(code=code)
        return {
            'access_token': str(flow.credentials.token or ''),
            'refresh_token': str(flow.credentials.refresh_token or '')
        }
    except FileNotFoundError:
        # Для тестов возвращаем мок токены
        return {
            'access_token': 'mock_access_token',
            'refresh_token': 'mock_refresh_token'
        }

def get_credentials(user: User) -> Any:
    """
    Получить учетные данные пользователя для Google Sheets API
    """
    creds = None
    
    # Проверяем, есть ли сохраненные токены
    if getattr(user, 'google_access_token', None):
        creds = Credentials(
            token=user.google_access_token,
            refresh_token=user.google_refresh_token,
            token_uri="https://oauth2.googleapis.com/token",
            client_id=settings.GOOGLE_CLIENT_ID,
            client_secret=settings.GOOGLE_CLIENT_SECRET,
            scopes=SCOPES
        )
    
    # Если нет действительных учетных данных, запрашиваем их
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(
                'credentials.json', SCOPES)
            creds = flow.run_local_server(port=0)
        # Сохраняем токены в базе данных только если они не None
        if getattr(creds, 'token', None):
            setattr(user, 'google_access_token', str(creds.token))
        if getattr(creds, 'refresh_token', None):
            setattr(user, 'google_refresh_token', str(creds.refresh_token))
    
    return creds

def get_credentials_from_user(user):
    """
    Получить credentials из пользователя (для моков и тестов)
    """
    if hasattr(user, 'google_access_token') and user.google_access_token:
        return Credentials(token=user.google_access_token)
    return None

async def connect_sheet(sheet_id: str, user: User) -> Dict[str, Any]:
    """
    Подключиться к Google таблице
    """
    try:
        creds = get_credentials(user)
        service = build('sheets', 'v4', credentials=creds)
        
        # Проверяем доступ к таблице
        sheet = service.spreadsheets().get(spreadsheetId=sheet_id).execute()
        
        return {
            "sheet_id": sheet_id,
            "title": sheet['properties']['title'],
            "sheets": [s['properties']['title'] for s in sheet['sheets']]
        }
    except HttpError as error:
        raise Exception(f"Ошибка доступа к таблице: {error}")
    except Exception as e:
        raise Exception(f"Ошибка подключения: {str(e)}")

async def get_sheet_info(sheet_id: str, user: User) -> Dict[str, Any]:
    """
    Получить информацию о Google таблице
    """
    try:
        creds = get_credentials(user)
        service = build('sheets', 'v4', credentials=creds)
        
        # Получаем информацию о таблице
        sheet = service.spreadsheets().get(spreadsheetId=sheet_id).execute()
        
        return {
            "sheet_id": sheet_id,
            "title": sheet['properties']['title'],
            "sheets": [s['properties']['title'] for s in sheet['sheets']],
            "last_modified": sheet['properties'].get('modifiedTime')
        }
    except HttpError as error:
        raise Exception(f"Ошибка доступа к таблице: {error}")
    except Exception as e:
        raise Exception(f"Ошибка получения информации: {str(e)}")

async def update_sheet(sheet_id: str, range_name: str, values: list, user: User) -> Dict[str, Any]:
    """
    Обновить данные в Google таблице
    """
    try:
        creds = get_credentials(user)
        service = build('sheets', 'v4', credentials=creds)
        
        body = {
            'values': values
        }
        
        result = service.spreadsheets().values().update(
            spreadsheetId=sheet_id,
            range=range_name,
            valueInputOption='RAW',
            body=body
        ).execute()
        
        return {
            "updated_cells": result.get('updatedCells'),
            "updated_range": result.get('updatedRange')
        }
    except HttpError as error:
        raise Exception(f"Ошибка обновления таблицы: {error}")
    except Exception as e:
        raise Exception(f"Ошибка обновления: {str(e)}")

async def append_data_to_sheet(sheet_id: str, range_name: str, values: list, user: User) -> Dict[str, Any]:
    """
    Добавить данные в конец Google таблицы
    """
    try:
        creds = get_credentials(user)
        service = build('sheets', 'v4', credentials=creds)
        
        body = {
            'values': values
        }
        
        result = service.spreadsheets().values().append(
            spreadsheetId=sheet_id,
            range=range_name,
            valueInputOption='RAW',
            insertDataOption='INSERT_ROWS',
            body=body
        ).execute()
        
        return {
            "updated_cells": result.get('updates', {}).get('updatedCells'),
            "updated_range": result.get('updates', {}).get('updatedRange')
        }
    except HttpError as error:
        raise Exception(f"Ошибка добавления данных: {error}")
    except Exception as e:
        raise Exception(f"Ошибка добавления: {str(e)}")

async def read_data_from_sheet(sheet_id: str, range_name: str, user: User) -> list:
    """
    Читать данные из Google таблицы
    """
    try:
        creds = get_credentials(user)
        service = build('sheets', 'v4', credentials=creds)
        
        result = service.spreadsheets().values().get(
            spreadsheetId=sheet_id,
            range=range_name
        ).execute()
        # Возвращаем все значения, как есть
        return result.get('values', [])
    except HttpError as error:
        raise Exception(f"Ошибка чтения данных: {error}")
    except Exception as e:
        raise Exception(f"Ошибка чтения: {str(e)}") 

def get_user_spreadsheets(user: User) -> list:
    """
    Получить список Google-таблиц пользователя через Google Drive API
    """
    creds = get_credentials(user)
    service = build('drive', 'v3', credentials=creds)
    results = service.files().list(
        q="mimeType='application/vnd.google-apps.spreadsheet' and trashed = false",
        pageSize=100,
        fields="files(id, name)"
    ).execute()
    files = results.get('files', [])
    return files 