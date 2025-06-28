import pytest
from unittest.mock import patch, MagicMock
from fastapi import status

# Глобальные моки для отключения реальных вызовов Google API
@pytest.fixture(autouse=True)
def mock_google_services():
    """Автоматически применяемый мок для всех Google сервисов"""
    with patch('app.services.google_sheets.get_google_auth_url', return_value="https://accounts.google.com/o/oauth2/auth"), \
         patch('app.services.google_sheets.exchange_code_for_tokens', return_value={
             "access_token": "mock_access_token",
             "refresh_token": "mock_refresh_token"
         }), \
         patch('app.services.google_sheets.get_credentials_from_user', return_value=MagicMock()), \
         patch('app.services.google_sheets.get_sheet_info', return_value={
             "sheet_id": "test_sheet_id",
             "title": "Test Sheet",
             "sheets": ["Sheet1", "Sheet2"],
             "last_modified": "2023-01-01T00:00:00.000Z"
         }), \
         patch('app.services.google_sheets.append_data_to_sheet', return_value={
             "updated_cells": 10,
             "updated_rows": 2
         }), \
         patch('app.services.google_sheets.read_data_from_sheet', return_value=[
             ["Дата", "Кампания"],
             ["2023-01-01", "Test Campaign"]
         ]):
        yield

class TestSheetsEndpoints:
    """Тесты для эндпоинтов Google Sheets"""
    
    @patch('app.api.routes.sheets.get_sheet_info')
    def test_connect_google_sheet_success(self, mock_get_info, authenticated_client, test_user, db_session, google_sheet_data):
        """Тест успешного подключения Google таблицы"""
        
        # Используем мок-данные с ожидаемым sheet_id
        mock_sheet_data = {
            "sheet_id": "test_sheet_id",
            "title": "Test Sheet",
            "sheets": ["Sheet1", "Sheet2"],
            "last_modified": "2023-01-01T00:00:00.000Z"
        }
        mock_get_info.return_value = mock_sheet_data
        
        response = authenticated_client.post("/sheets/connect", json={"sheet_id": "test_sheet_id"})
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        assert "message" in data
        assert "sheet_info" in data
        assert data["sheet_info"]["sheet_id"] == "test_sheet_id"
        
        # Проверяем, что sheet_id сохранился в базе данных
        db_session.refresh(test_user)
        assert test_user.google_sheet_id == "test_sheet_id"
    
    @patch('app.api.routes.sheets.get_sheet_info')
    def test_connect_google_sheet_error(self, mock_get_info, authenticated_client):
        """Тест ошибки при подключении Google таблицы"""
        mock_get_info.side_effect = Exception("Access denied")
        
        response = authenticated_client.post("/sheets/connect", json={"sheet_id": "invalid_sheet_id"})
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "Ошибка подключения таблицы" in response.json()["detail"]
    
    def test_connect_google_sheet_unauthenticated(self, client):
        """Тест подключения Google таблицы без аутентификации"""
        response = client.post("/sheets/connect", json={"sheet_id": "test_sheet_id"})
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    @patch('app.api.routes.sheets.get_sheet_info')
    def test_get_connected_sheet_info_success(self, mock_get_info, authenticated_client, test_user, db_session, google_sheet_data):
        """Тест получения информации о подключенной таблице"""
        # Подключаем таблицу к пользователю
        test_user.google_sheet_id = "test_sheet_id"
        db_session.commit()
        
        # Используем мок-данные с ожидаемым sheet_id
        mock_sheet_data = {
            "sheet_id": "test_sheet_id",
            "title": "Test Sheet",
            "sheets": ["Sheet1", "Sheet2"],
            "last_modified": "2023-01-01T00:00:00.000Z"
        }
        mock_get_info.return_value = mock_sheet_data
        
        response = authenticated_client.get("/sheets/info")
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        assert data["sheet_id"] == "test_sheet_id"
        assert data["title"] == "Test Sheet"
        assert "sheets" in data
    
    def test_get_connected_sheet_info_not_connected(self, authenticated_client):
        """Тест получения информации о таблице без подключения"""
        response = authenticated_client.get("/sheets/info")
        
        assert response.status_code == status.HTTP_404_NOT_FOUND
        assert "Google таблица не подключена" in response.json()["detail"]
    
    @patch('app.api.routes.sheets.get_sheet_info')
    def test_get_connected_sheet_info_error(self, mock_get_info, authenticated_client, test_user, db_session):
        """Тест ошибки при получении информации о таблице"""
        # Подключаем таблицу к пользователю
        test_user.google_sheet_id = "test_sheet_id"
        db_session.commit()
        
        mock_get_info.side_effect = Exception("API error")
        
        response = authenticated_client.get("/sheets/info")
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "Ошибка получения информации о таблице" in response.json()["detail"]
    
    def test_disconnect_google_sheet_success(self, authenticated_client, test_user, db_session):
        """Тест успешного отключения Google таблицы"""
        # Подключаем таблицу к пользователю
        test_user.google_sheet_id = "test_sheet_id"
        db_session.commit()
        
        response = authenticated_client.delete("/sheets/disconnect")
        
        assert response.status_code == status.HTTP_200_OK
        assert "Google таблица отключена" in response.json()["message"]
        
        # Проверяем, что sheet_id удалился из базы данных
        db_session.refresh(test_user)
        assert test_user.google_sheet_id is None
    
    def test_disconnect_google_sheet_unauthenticated(self, client):
        """Тест отключения Google таблицы без аутентификации"""
        response = client.delete("/sheets/disconnect")
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED 