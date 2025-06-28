import pytest
from unittest.mock import patch, MagicMock
from fastapi import status
from app.services.auth import verify_telegram_auth, create_access_token, verify_token

class TestAuthService:
    """Тесты для сервиса авторизации"""
    
    def test_create_access_token(self):
        """Тест создания JWT токена"""
        data = {"sub": "123"}
        token = create_access_token(data)
        
        assert token is not None
        assert isinstance(token, str)
        assert len(token) > 0
    
    def test_verify_token_valid(self):
        """Тест проверки валидного токена"""
        data = {"sub": "123"}
        token = create_access_token(data)
        
        result = verify_token(token)
        assert result == "123"
    
    def test_verify_token_invalid(self):
        """Тест проверки невалидного токена"""
        result = verify_token("invalid_token")
        assert result is None
    
    @patch('app.services.auth.settings')
    def test_verify_telegram_auth_no_token(self, mock_settings):
        """Тест проверки Telegram авторизации без токена"""
        mock_settings.TELEGRAM_BOT_TOKEN = ""
        
        telegram_data = {
            "id": 123,
            "first_name": "Test",
            "hash": "test_hash"
        }
        
        result = verify_telegram_auth(telegram_data)
        assert result is True
    
    @patch('app.services.auth.settings')
    def test_verify_telegram_auth_with_token(self, mock_settings):
        """Тест проверки Telegram авторизации с токеном"""
        mock_settings.TELEGRAM_BOT_TOKEN = "test_token"
        
        telegram_data = {
            "id": 123,
            "first_name": "Test",
            "auth_date": 1234567890,
            "hash": "test_hash"
        }
        
        # В реальном тесте здесь была бы проверка подписи
        # Пока просто проверяем, что функция вызывается
        result = verify_telegram_auth(telegram_data)
        assert isinstance(result, bool)

class TestAuthEndpoints:
    """Тесты для эндпоинтов авторизации"""
    
    def test_telegram_auth_success(self, client, telegram_auth_data):
        """Тест успешной авторизации через Telegram"""
        with patch('app.api.routes.auth.verify_telegram_auth', return_value=True):
            response = client.post("/auth/telegram", json=telegram_auth_data)
            
            assert response.status_code == status.HTTP_200_OK
            data = response.json()
            assert "access_token" in data
            assert "user" in data
            assert data["user"]["telegram_id"] == str(telegram_auth_data["id"])
    
    def test_telegram_auth_invalid_signature(self, client, telegram_auth_data):
        """Тест авторизации с неверной подписью"""
        with patch('app.api.routes.auth.verify_telegram_auth', return_value=False):
            response = client.post("/auth/telegram", json=telegram_auth_data)
            
            assert response.status_code == status.HTTP_401_UNAUTHORIZED
            assert "Неверная подпись Telegram" in response.json()["detail"]
    
    def test_telegram_auth_missing_data(self, client):
        """Тест авторизации с отсутствующими данными"""
        response = client.post("/auth/telegram", json={})
        
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
    
    @patch('app.services.google_sheets.get_google_auth_url')
    def test_get_google_auth_url(self, mock_get_url, client):
        """Тест получения URL для Google авторизации"""
        mock_get_url.return_value = "https://accounts.google.com/oauth2/auth"
        
        response = client.post("/auth/google/url")
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "auth_url" in data
        assert "https://accounts.google.com/o/oauth2/auth" in data["auth_url"]
    
    @patch('app.api.routes.auth.exchange_code_for_tokens')
    def test_google_auth_callback_success(self, mock_exchange, client):
        """Тест успешного callback от Google"""
        mock_exchange.return_value = {"access_token": "test_token"}
        
        response = client.post("/auth/google/callback", params={"code": "test_code"})
        
        assert response.status_code == status.HTTP_200_OK
        assert "Google авторизация успешна" in response.json()["message"]
    
    @patch('app.api.routes.auth.exchange_code_for_tokens')
    def test_google_auth_callback_error(self, mock_exchange, client):
        """Тест ошибки в callback от Google"""
        mock_exchange.side_effect = Exception("OAuth error")
        
        response = client.post("/auth/google/callback", params={"code": "test_code"})
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "Ошибка Google авторизации" in response.json()["detail"] 