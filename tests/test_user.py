import pytest
from fastapi import status

class TestUserEndpoints:
    """Тесты для эндпоинтов пользователя"""
    
    def test_get_user_profile_authenticated(self, authenticated_client, test_user):
        """Тест получения профиля аутентифицированного пользователя"""
        response = authenticated_client.get("/user/profile")
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        assert data["id"] == test_user.id
        assert data["telegram_id"] == test_user.telegram_id
        assert data["username"] == test_user.username
        assert data["first_name"] == test_user.first_name
        assert data["last_name"] == test_user.last_name
        assert data["email"] == test_user.email
        assert data["has_google_sheet"] == bool(test_user.google_sheet_id)
    
    def test_get_user_profile_unauthenticated(self, client):
        """Тест получения профиля без аутентификации"""
        response = client.get("/user/profile")
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    def test_update_user_profile_email(self, authenticated_client, test_user, db_session):
        """Тест обновления email пользователя"""
        new_email = "newemail@example.com"
        
        response = authenticated_client.put("/user/profile", json={"email": new_email})
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        assert data["message"] == "Профиль обновлен"
        assert data["user"]["email"] == new_email
        
        # Проверяем, что email обновился в базе данных
        db_session.refresh(test_user)
        assert test_user.email == new_email
    
    def test_update_user_profile_no_email(self, authenticated_client):
        """Тест обновления профиля без email"""
        response = authenticated_client.put("/user/profile", json={})
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["message"] == "Профиль обновлен"
    
    def test_get_user_reports_authenticated(self, authenticated_client, test_user, db_session, completed_report_factory, processing_report_factory):
        """Тест получения отчетов аутентифицированного пользователя"""
        from tests.factories import ReportFactory, ErrorReportFactory
        ReportFactory._meta.sqlalchemy_session = db_session
        completed_report_factory._meta.sqlalchemy_session = db_session
        ErrorReportFactory._meta.sqlalchemy_session = db_session
        
        report1 = ReportFactory(user_id=test_user.id)
        report2 = completed_report_factory(user_id=test_user.id)
        report3 = ErrorReportFactory(user_id=test_user.id)
        
        db_session.add_all([report1, report2, report3])
        db_session.commit()
        
        response = authenticated_client.get("/user/reports")
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        assert len(data) == 3
        
        # Проверяем структуру данных отчета
        report = data[0]
        assert "id" in report
        assert "filename" in report
        assert "file_size" in report
        assert "status" in report
        assert "created_at" in report
    
    def test_get_user_reports_empty(self, authenticated_client):
        """Тест получения отчетов пустого списка"""
        response = authenticated_client.get("/user/reports")
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data) == 0
    
    def test_get_user_reports_unauthenticated(self, client):
        """Тест получения отчетов без аутентификации"""
        response = client.get("/user/reports")
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

class TestUserModels:
    """Тесты для моделей пользователя"""
    
    def test_user_creation(self, db_session):
        """Тест создания пользователя"""
        from app.models.user import User
        
        user = User(
            telegram_id="test_telegram_id",
            username="test_user",
            first_name="Test",
            last_name="User",
            email="test@example.com"
        )
        
        db_session.add(user)
        db_session.commit()
        db_session.refresh(user)
        
        assert user.id is not None
        assert user.telegram_id == "test_telegram_id"
        assert user.username == "test_user"
        assert user.first_name == "Test"
        assert user.last_name == "User"
        assert user.email == "test@example.com"
        assert user.is_active is True
        assert user.google_sheet_id is None
    
    def test_user_repr(self, test_user):
        """Тест строкового представления пользователя"""
        repr_str = repr(test_user)
        assert test_user.telegram_id in repr_str
        assert test_user.username in repr_str
    
    def test_user_google_sheet_connection(self, db_session):
        """Тест подключения Google таблицы к пользователю"""
        from app.models.user import User
        
        user = User(
            telegram_id="test_telegram_id",
            username="test_user",
            first_name="Test",
            last_name="User"
        )
        
        db_session.add(user)
        db_session.commit()
        
        # Подключаем Google таблицу
        user.google_sheet_id = "test_sheet_id"
        user.google_access_token = "test_access_token"
        user.google_refresh_token = "test_refresh_token"
        
        db_session.commit()
        db_session.refresh(user)
        
        assert user.google_sheet_id == "test_sheet_id"
        assert user.google_access_token == "test_access_token"
        assert user.google_refresh_token == "test_refresh_token" 