import pytest
import io
from unittest.mock import patch, MagicMock
from fastapi import status
from app.models.report import Report

class TestUploadEndpoints:
    """Тесты для эндпоинтов загрузки файлов"""
    
    def test_upload_report_success(self, authenticated_client, db_session, test_user):
        """Тест успешной загрузки отчета"""
        from tests.factories import CompletedReportFactory, ProcessingReportFactory, ErrorReportFactory
        CompletedReportFactory._meta.sqlalchemy_session = db_session
        ProcessingReportFactory._meta.sqlalchemy_session = db_session
        ErrorReportFactory._meta.sqlalchemy_session = db_session
        # Создаем тестовый Excel файл
        excel_content = b"test excel content"
        files = {"file": ("test_report.xlsx", io.BytesIO(excel_content), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")}
        
        with patch('app.api.routes.upload.process_excel_file') as mock_process:
            response = authenticated_client.post("/upload/report", files=files)
            
            assert response.status_code == status.HTTP_200_OK
            data = response.json()
            
            assert "message" in data
            assert "report_id" in data
            assert "filename" in data
            assert "status" in data
            assert data["filename"] == "test_report.xlsx"
            assert data["status"] == "uploaded"
            
            # Проверяем, что функция обработки была вызвана
            mock_process.assert_called_once()
    
    def test_upload_report_invalid_file_type(self, authenticated_client):
        """Тест загрузки файла неподдерживаемого типа"""
        files = {"file": ("test.txt", io.BytesIO(b"test content"), "text/plain")}
        
        response = authenticated_client.post("/upload/report", files=files)
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "Поддерживаются только файлы Excel" in response.json()["detail"]
    
    def test_upload_report_file_too_large(self, authenticated_client):
        """Тест загрузки файла слишком большого размера"""
        # Создаем файл больше 10MB
        large_content = b"x" * (11 * 1024 * 1024)  # 11MB
        files = {"file": ("large_report.xlsx", io.BytesIO(large_content), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")}
        
        response = authenticated_client.post("/upload/report", files=files)
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "Размер файла превышает" in response.json()["detail"]
    
    def test_upload_report_unauthenticated(self, client):
        """Тест загрузки файла без аутентификации"""
        files = {"file": ("test.xlsx", io.BytesIO(b"test"), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")}
        
        response = client.post("/upload/report", files=files)
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    def test_get_report_status_authenticated(self, authenticated_client, test_report):
        """Тест получения статуса отчета аутентифицированным пользователем"""
        response = authenticated_client.get(f"/upload/report/{test_report.id}/status")
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        assert data["id"] == test_report.id
        assert data["filename"] == test_report.original_filename
        assert data["status"] == test_report.status
        assert "created_at" in data
    
    def test_get_report_status_wrong_user(self, authenticated_client, db_session):
        """Тест получения статуса отчета другого пользователя"""
        from tests.factories import UserFactory, ReportFactory
        UserFactory._meta.sqlalchemy_session = db_session
        ReportFactory._meta.sqlalchemy_session = db_session
        
        other_user = UserFactory()
        other_report = ReportFactory(user=other_user)
        
        db_session.add_all([other_user, other_report])
        db_session.commit()
        
        response = authenticated_client.get(f"/upload/report/{other_report.id}/status")
        
        assert response.status_code == status.HTTP_404_NOT_FOUND
        assert "Отчет не найден" in response.json()["detail"]
    
    def test_get_report_status_not_found(self, authenticated_client):
        """Тест получения статуса несуществующего отчета"""
        response = authenticated_client.get("/upload/report/99999/status")
        
        assert response.status_code == status.HTTP_404_NOT_FOUND
        assert "Отчет не найден" in response.json()["detail"]
    
    def test_get_report_status_unauthenticated(self, client, test_report):
        """Тест получения статуса отчета без аутентификации"""
        response = client.get(f"/upload/report/{test_report.id}/status")
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

class TestReportModels:
    """Тесты для моделей отчетов"""
    
    def test_report_creation(self, db_session, test_user):
        """Тест создания отчета"""
        report = Report(
            user_id=test_user.id,
            filename="test_file.xlsx",
            original_filename="original_test_file.xlsx",
            file_path="/uploads/test_file.xlsx",
            file_size=1024,
            status="uploaded"
        )
        
        db_session.add(report)
        db_session.commit()
        db_session.refresh(report)
        
        assert report.id is not None
        assert report.user_id == test_user.id
        assert report.filename == "test_file.xlsx"
        assert report.original_filename == "original_test_file.xlsx"
        assert report.file_path == "/uploads/test_file.xlsx"
        assert report.file_size == 1024
        assert report.status == "uploaded"
        assert report.error_message is None
    
    def test_report_with_error(self, db_session, test_user):
        """Тест создания отчета с ошибкой"""
        report = Report(
            user_id=test_user.id,
            filename="error_file.xlsx",
            original_filename="original_error_file.xlsx",
            file_path="/uploads/error_file.xlsx",
            file_size=2048,
            status="error",
            error_message="Test error message"
        )
        
        db_session.add(report)
        db_session.commit()
        db_session.refresh(report)
        
        assert report.status == "error"
        assert report.error_message == "Test error message"
    
    def test_report_repr(self, test_report):
        """Тест строкового представления отчета"""
        repr_str = repr(test_report)
        assert test_report.filename in repr_str
        assert test_report.status in repr_str

class TestFileProcessor:
    """Тесты для обработки файлов"""
    
    @patch('app.services.file_processor.pd.read_excel')
    @patch('app.services.file_processor.append_data_to_sheet')
    @patch('app.services.file_processor.SessionLocal')
    def test_process_excel_file_success(self, mock_session_local, mock_append, mock_read_excel, test_user, db_session):
        """Тест успешной обработки Excel файла"""
        from app.services.file_processor import process_excel_file
        
        mock_session_local.return_value = db_session
        
        mock_df = MagicMock()
        mock_df.columns.tolist.return_value = ["Дата", "Кампания", "Показы"]
        mock_df.values.tolist.return_value = [["2023-01-01", "Test Campaign", 1000]]
        mock_read_excel.return_value = mock_df
        mock_append.return_value = {"updated_rows": 1}
        
        report = Report(
            user_id=test_user.id,
            filename="test.xlsx",
            original_filename="test.xlsx",
            file_path="/uploads/test.xlsx",
            file_size=1024,
            status="uploaded"
        )
        db_session.add(report)
        db_session.commit()
        test_user.google_sheet_id = "test_sheet_id"
        db_session.commit()
        
        report_id = report.id
        
        import asyncio
        asyncio.run(process_excel_file(report_id, "/uploads/test.xlsx", test_user))
        
        # Получаем отчет заново из базы данных
        updated_report = db_session.query(Report).filter(Report.id == report_id).first()
        assert updated_report.status == "completed"
        assert updated_report.error_message is None
    
    @patch('app.services.file_processor.pd.read_excel')
    @patch('app.services.file_processor.SessionLocal')
    def test_process_excel_file_no_google_sheet(self, mock_session_local, mock_read_excel, test_user, db_session):
        """Тест обработки файла без подключенной Google таблицы"""
        from app.services.file_processor import process_excel_file
        mock_session_local.return_value = db_session
        report = Report(
            user_id=test_user.id,
            filename="test.xlsx",
            original_filename="test.xlsx",
            file_path="/uploads/test.xlsx",
            file_size=1024,
            status="uploaded"
        )
        db_session.add(report)
        db_session.commit()
        test_user.google_sheet_id = None
        db_session.commit()
        
        report_id = report.id
        
        import asyncio
        asyncio.run(process_excel_file(report_id, "/uploads/test.xlsx", test_user))
        
        # Получаем отчет заново из базы данных
        updated_report = db_session.query(Report).filter(Report.id == report_id).first()
        assert updated_report.status == "error"
        assert "Google таблица не подключена" in updated_report.error_message
    
    def test_parse_excel_file(self):
        """Тест парсинга Excel файла"""
        from app.services.file_processor import parse_excel_file
        
        # Этот тест требует реального Excel файла
        # В реальном проекте можно создать тестовый файл
        with pytest.raises(Exception):
            parse_excel_file("nonexistent_file.xlsx")
    
    def test_validate_excel_structure(self):
        """Тест валидации структуры Excel файла"""
        from app.services.file_processor import validate_excel_structure
        
        # Этот тест требует реального Excel файла
        with pytest.raises(Exception):
            validate_excel_structure("nonexistent_file.xlsx") 