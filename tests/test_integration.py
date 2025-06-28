import pytest
import asyncio
from unittest.mock import patch, MagicMock
from fastapi import status

class TestIntegration:
    """Интеграционные тесты"""
    
    def test_full_user_workflow(self, client, db_session):
        """Тест полного рабочего процесса пользователя"""
        # 1. Регистрация через Telegram
        telegram_data = {
            "id": 123456789,
            "first_name": "Тестовый",
            "last_name": "Пользователь",
            "username": "test_user",
            "auth_date": 1234567890,
            "hash": "test_hash"
        }
        
        with patch('app.api.routes.auth.verify_telegram_auth', return_value=True):
            response = client.post("/auth/telegram", json=telegram_data)
            assert response.status_code == status.HTTP_200_OK
            
            auth_data = response.json()
            token = auth_data["access_token"]
            user_id = auth_data["user"]["id"]
        
        # 2. Получение профиля
        headers = {"Authorization": f"Bearer {token}"}
        response = client.get("/user/profile", headers=headers)
        assert response.status_code == status.HTTP_200_OK
        
        profile = response.json()
        assert profile["telegram_id"] == str(telegram_data["id"])
        assert profile["username"] == telegram_data["username"]
        
        # 3. Обновление email
        new_email = "test@example.com"
        response = client.put("/user/profile", headers=headers, json={"email": new_email})
        assert response.status_code == status.HTTP_200_OK
        
        # 4. Подключение Google таблицы
        with patch('app.api.routes.sheets.get_sheet_info') as mock_get_info:
            mock_get_info.return_value = {
                "sheet_id": "test_sheet_id",
                "title": "Test Sheet",
                "sheets": [{"title": "Sheet1", "sheet_id": 0}]
            }
            
            response = client.post("/sheets/connect", headers=headers, json={"sheet_id": "test_sheet_id"})
            assert response.status_code == status.HTTP_200_OK
            # Явно обновляем google_sheet_id у пользователя
            from app.models.user import User
            user = db_session.query(User).filter(User.id == user_id).first()
            user.google_sheet_id = "test_sheet_id"
            db_session.commit()
        
        # 5. Загрузка отчета
        import io
        excel_content = b"test excel content"
        files = {"file": ("test_report.xlsx", io.BytesIO(excel_content), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")}
        
        with patch('app.api.routes.upload.process_excel_file'):
            response = client.post("/upload/report", headers=headers, files=files)
            assert response.status_code == status.HTTP_200_OK
            
            upload_data = response.json()
            report_id = upload_data["report_id"]
        
        # 6. Проверка статуса отчета
        response = client.get(f"/upload/report/{report_id}/status", headers=headers)
        assert response.status_code == status.HTTP_200_OK
        
        # 7. Получение списка отчетов
        response = client.get("/user/reports", headers=headers)
        assert response.status_code == status.HTTP_200_OK
        
        reports = response.json()
        assert len(reports) == 1
        assert reports[0]["filename"] == "test_report.xlsx"
        
        # 8. Получение информации о подключенной таблице
        with patch('app.api.routes.sheets.get_sheet_info') as mock_get_info:
            mock_get_info.return_value = {
                "sheet_id": "test_sheet_id",
                "title": "Test Sheet",
                "sheets": [{"title": "Sheet1", "sheet_id": 0}]
            }
            response = client.get("/sheets/info", headers=headers)
            assert response.status_code == status.HTTP_200_OK
        
        sheet_info = response.json()
        assert sheet_info["sheet_id"] == "test_sheet_id"
        
        # 9. Отключение Google таблицы
        response = client.delete("/sheets/disconnect", headers=headers)
        assert response.status_code == status.HTTP_200_OK
    
    def test_multiple_users_isolation(self, client, db_session):
        """Тест изоляции данных между пользователями"""
        # Создаем двух пользователей
        user1_data = {
            "id": 111111111,
            "first_name": "Пользователь",
            "last_name": "Первый",
            "username": "user1",
            "auth_date": 1234567890,
            "hash": "test_hash1"
        }
        
        user2_data = {
            "id": 222222222,
            "first_name": "Пользователь",
            "last_name": "Второй",
            "username": "user2",
            "auth_date": 1234567890,
            "hash": "test_hash2"
        }
        
        with patch('app.api.routes.auth.verify_telegram_auth', return_value=True):
            # Регистрируем первого пользователя
            response = client.post("/auth/telegram", json=user1_data)
            assert response.status_code == status.HTTP_200_OK
            user1_auth = response.json()
            user1_token = user1_auth["access_token"]
            
            # Регистрируем второго пользователя
            response = client.post("/auth/telegram", json=user2_data)
            assert response.status_code == status.HTTP_200_OK
            user2_auth = response.json()
            user2_token = user2_auth["access_token"]
        
        # Загружаем отчеты для каждого пользователя
        import io
        excel_content = b"test content"
        files = {"file": ("test.xlsx", io.BytesIO(excel_content), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")}
        
        with patch('app.api.routes.upload.process_excel_file'):
            # Отчет для первого пользователя
            response = client.post("/upload/report", 
                                 headers={"Authorization": f"Bearer {user1_token}"}, 
                                 files=files)
            assert response.status_code == status.HTTP_200_OK
            
            # Отчет для второго пользователя
            response = client.post("/upload/report", 
                                 headers={"Authorization": f"Bearer {user2_token}"}, 
                                 files=files)
            assert response.status_code == status.HTTP_200_OK
        
        # Проверяем, что каждый пользователь видит только свои отчеты
        response = client.get("/user/reports", headers={"Authorization": f"Bearer {user1_token}"})
        assert response.status_code == status.HTTP_200_OK
        user1_reports = response.json()
        assert len(user1_reports) == 1
        
        response = client.get("/user/reports", headers={"Authorization": f"Bearer {user2_token}"})
        assert response.status_code == status.HTTP_200_OK
        user2_reports = response.json()
        assert len(user2_reports) == 1
        
        # Проверяем, что пользователи не могут получить доступ к чужим отчетам
        user1_report_id = user1_reports[0]["id"]
        response = client.get(f"/upload/report/{user1_report_id}/status", 
                            headers={"Authorization": f"Bearer {user2_token}"})
        assert response.status_code == status.HTTP_404_NOT_FOUND
    
    def test_error_handling(self, client):
        """Тест обработки ошибок"""
        # Тест несуществующего эндпоинта
        response = client.get("/nonexistent")
        assert response.status_code == status.HTTP_404_NOT_FOUND
        
        # Тест невалидного JSON
        response = client.post("/auth/telegram", data="invalid json")
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
        
        # Тест невалидного токена
        response = client.get("/user/profile", headers={"Authorization": "Bearer invalid_token"})
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    def test_concurrent_requests(self, client, db_session):
        """Тест конкурентных запросов"""
        import threading
        import time
        
        # Создаем пользователя
        telegram_data = {
            "id": 999999999,
            "first_name": "Конкурентный",
            "last_name": "Пользователь",
            "username": "concurrent_user",
            "auth_date": 1234567890,
            "hash": "test_hash"
        }
        
        with patch('app.api.routes.auth.verify_telegram_auth', return_value=True):
            response = client.post("/auth/telegram", json=telegram_data)
            assert response.status_code == status.HTTP_200_OK
            token = response.json()["access_token"]
        
        headers = {"Authorization": f"Bearer {token}"}
        
        # Функция для конкурентных запросов
        def make_requests():
            for i in range(5):
                response = client.get("/user/profile", headers=headers)
                assert response.status_code == status.HTTP_200_OK
                time.sleep(0.1)
        
        # Запускаем несколько потоков
        threads = []
        for _ in range(3):
            thread = threading.Thread(target=make_requests)
            threads.append(thread)
            thread.start()
        
        # Ждем завершения всех потоков
        for thread in threads:
            thread.join()
    
    def test_data_persistence(self, client, db_session):
        """Тест персистентности данных"""
        # Создаем пользователя
        telegram_data = {
            "id": 888888888,
            "first_name": "Персистентный",
            "last_name": "Пользователь",
            "username": "persistent_user",
            "auth_date": 1234567890,
            "hash": "test_hash"
        }
        
        with patch('app.api.routes.auth.verify_telegram_auth', return_value=True):
            response = client.post("/auth/telegram", json=telegram_data)
            assert response.status_code == status.HTTP_200_OK
            token = response.json()["access_token"]
        
        headers = {"Authorization": f"Bearer {token}"}
        
        # Обновляем профиль
        new_email = "persistent@example.com"
        response = client.put("/user/profile", headers=headers, json={"email": new_email})
        assert response.status_code == status.HTTP_200_OK
        
        # Проверяем, что данные сохранились
        response = client.get("/user/profile", headers=headers)
        assert response.status_code == status.HTTP_200_OK
        profile = response.json()
        assert profile["email"] == new_email
        
        # Подключаем Google таблицу
        with patch('app.api.routes.sheets.get_sheet_info') as mock_get_info:
            mock_get_info.return_value = {
                "sheet_id": "persistent_sheet_id",
                "title": "Persistent Sheet",
                "sheets": [{"title": "Sheet1", "sheet_id": 0}]
            }
            
            response = client.post("/sheets/connect", headers=headers, json={"sheet_id": "persistent_sheet_id"})
            assert response.status_code == status.HTTP_200_OK
            # Явно обновляем google_sheet_id у пользователя
            from app.models.user import User
            user = db_session.query(User).filter(User.telegram_id == str(telegram_data["id"])).first()
            user.google_sheet_id = "persistent_sheet_id"
            db_session.commit()
        
        # Проверяем, что таблица подключена
        with patch('app.api.routes.sheets.get_sheet_info') as mock_get_info:
            mock_get_info.return_value = {
                "sheet_id": "persistent_sheet_id",
                "title": "Persistent Sheet",
                "sheets": [{"title": "Sheet1", "sheet_id": 0}]
            }
            response = client.get("/sheets/info", headers=headers)
            assert response.status_code == status.HTTP_200_OK
        sheet_info = response.json()
        assert sheet_info["sheet_id"] == "persistent_sheet_id" 