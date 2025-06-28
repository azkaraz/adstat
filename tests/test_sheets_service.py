import pytest
import asyncio
from unittest.mock import patch, MagicMock

# Глобальные моки для отключения реальных вызовов Google API
@pytest.fixture(autouse=True)
def mock_google_services():
    """Автоматически применяемый мок для всех Google сервисов"""
    with patch('app.services.google_sheets.InstalledAppFlow.from_client_secrets_file', side_effect=FileNotFoundError()), \
         patch('app.services.google_sheets.get_credentials', return_value=MagicMock()):
        yield

class TestGoogleSheetsService:
    """Тесты для сервиса Google Sheets"""
    
    def test_get_google_auth_url(self):
        """Тест получения URL для Google авторизации"""
        with patch('app.services.google_sheets.InstalledAppFlow.from_client_secrets_file') as mock_flow:
            mock_flow.side_effect = FileNotFoundError()
            from app.services.google_sheets import get_google_auth_url
            url = get_google_auth_url()
            assert url == "https://accounts.google.com/oauth2/auth"
    
    def test_exchange_code_for_tokens(self):
        """Тест обмена кода на токены"""
        with patch('app.services.google_sheets.InstalledAppFlow.from_client_secrets_file') as mock_flow:
            mock_flow.side_effect = FileNotFoundError()
            from app.services.google_sheets import exchange_code_for_tokens
            tokens = exchange_code_for_tokens("test_code")
            assert tokens["access_token"] == "mock_access_token"
            assert tokens["refresh_token"] == "mock_refresh_token"
    
    def test_get_credentials_from_user_with_token(self, test_user):
        """Тест получения credentials из данных пользователя с токеном"""
        from app.services.google_sheets import get_credentials_from_user
        
        test_user.google_access_token = "test_token"
        test_user.google_refresh_token = "test_refresh"
        
        with patch('app.services.google_sheets.get_credentials_from_user', return_value=MagicMock()):
            credentials = get_credentials_from_user(test_user)
            assert credentials is not None
    
    def test_get_credentials_from_user_without_token(self, test_user):
        """Тест получения credentials из данных пользователя без токена"""
        from app.services.google_sheets import get_credentials_from_user
        
        test_user.google_access_token = None
        test_user.google_refresh_token = None
        
        credentials = get_credentials_from_user(test_user)
        assert credentials is None
    
    @patch('app.services.google_sheets.build')
    def test_get_sheet_info_success(self, mock_build, test_user):
        """Тест успешного получения информации о таблице"""
        from app.services.google_sheets import get_sheet_info
        
        # Мокаем Google Sheets API
        mock_service = MagicMock()
        mock_spreadsheet = {
            "properties": {"title": "Test Sheet"},
            "sheets": [
                {"properties": {"title": "Sheet1", "sheetId": 0}}
            ]
        }
        mock_service.spreadsheets().get().execute.return_value = mock_spreadsheet
        mock_build.return_value = mock_service
        
        # Мокаем credentials
        with patch('app.services.google_sheets.get_credentials_from_user') as mock_creds:
            mock_creds.return_value = MagicMock()
            
            result = asyncio.run(get_sheet_info("test_sheet_id", test_user))
            assert result["title"] == "Test Sheet"
            assert result["sheet_id"] == "test_sheet_id"
    
    @patch('app.services.google_sheets.Credentials')
    @patch('app.services.google_sheets.build')
    def test_get_sheet_info_http_error(self, mock_build, mock_credentials, test_user):
        """Тест ошибки HTTP при получении информации о таблице"""
        from app.services.google_sheets import get_sheet_info
        
        # Добавляем токены пользователю
        test_user.google_access_token = "test_token"
        test_user.google_refresh_token = "test_refresh"
        
        # Мокаем Credentials
        mock_creds_instance = MagicMock()
        mock_credentials.return_value = mock_creds_instance
        
        # Мокаем Google Sheets API для вызова исключения
        mock_service = MagicMock()
        mock_service.spreadsheets().get().execute.side_effect = Exception("Ошибка доступа к Google Sheets")
        mock_build.return_value = mock_service
        
        # Мокаем get_credentials чтобы он возвращал наши мок credentials
        with patch('app.services.google_sheets.get_credentials') as mock_get_creds:
            mock_get_creds.return_value = mock_creds_instance
            
            with pytest.raises(Exception, match="Ошибка доступа к Google Sheets"):
                asyncio.run(get_sheet_info("test_sheet_id", test_user))
    
    @patch('app.services.google_sheets.build')
    def test_append_data_to_sheet_success(self, mock_build, test_user):
        """Тест успешного добавления данных в таблицу"""
        from app.services.google_sheets import append_data_to_sheet
        
        # Мокаем Google Sheets API
        mock_service = MagicMock()
        mock_result = {
            "updates": {
                "updatedCells": 10,
                "updatedRows": 2,
                "updatedColumns": 5
            }
        }
        mock_service.spreadsheets().values().append().execute.return_value = mock_result
        mock_build.return_value = mock_service
        
        # Мокаем credentials
        with patch('app.services.google_sheets.get_credentials_from_user') as mock_creds:
            mock_creds.return_value = MagicMock()
            
            result = asyncio.run(append_data_to_sheet(
                "test_sheet_id",
                "A1",
                [["Дата", "Кампания"], ["2023-01-01", "Test"]],
                test_user
            ))
            assert result["updated_cells"] == 10
    
    @patch('app.services.google_sheets.Credentials')
    @patch('app.services.google_sheets.build')
    def test_read_data_from_sheet_success(self, mock_build, mock_credentials, test_user):
        """Тест успешного чтения данных из таблицы"""
        from app.services.google_sheets import read_data_from_sheet
        
        # Добавляем токены пользователю
        test_user.google_access_token = "test_token"
        test_user.google_refresh_token = "test_refresh"
        
        # Мокаем Credentials
        mock_creds_instance = MagicMock()
        mock_credentials.return_value = mock_creds_instance
        
        # Мокаем Google Sheets API
        mock_service = MagicMock()
        mock_values = {
            "values": [
                ["Дата", "Кампания", "Показы"],
                ["2023-01-01", "Test Campaign", "1000"]
            ]
        }
        mock_service.spreadsheets().values().get().execute.return_value = mock_values
        mock_build.return_value = mock_service
        
        # Мокаем get_credentials чтобы он возвращал наши мок credentials
        with patch('app.services.google_sheets.get_credentials') as mock_get_creds:
            mock_get_creds.return_value = mock_creds_instance
            
            result = asyncio.run(read_data_from_sheet("test_sheet_id", "A1:C2", test_user))
            
            assert len(result) == 2
            assert result[0] == ["Дата", "Кампания", "Показы"]
            assert result[1] == ["2023-01-01", "Test Campaign", "1000"] 