import pytest
import asyncio
from typing import Generator, Dict, Any
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool

from app.main import app
from app.core.database import get_db, Base
from app.models.user import User
from app.models.report import Report
from app.services.auth import create_access_token
from tests.factories import UserFactory, ReportFactory, CompletedReportFactory, ProcessingReportFactory

# Создаем тестовую базу данных в памяти
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Создаем таблицы
Base.metadata.create_all(bind=engine)

@pytest.fixture(scope="session")
def event_loop():
    """Создает event loop для асинхронных тестов"""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()

@pytest.fixture
def db_session() -> Generator[Session, None, None]:
    """Фикстура для тестовой сессии базы данных"""
    connection = engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)
    
    yield session
    
    session.close()
    transaction.rollback()
    connection.close()

@pytest.fixture
def client(db_session: Session) -> Generator[TestClient, None, None]:
    """Фикстура для тестового клиента FastAPI"""
    def override_get_db():
        try:
            yield db_session
        finally:
            pass
    
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()

@pytest.fixture
def test_user(db_session: Session) -> User:
    """Фикстура для тестового пользователя"""
    UserFactory._meta.sqlalchemy_session = db_session
    user = UserFactory()
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user

@pytest.fixture
def authenticated_client(client: TestClient, test_user: User) -> TestClient:
    """Фикстура для аутентифицированного клиента"""
    token = create_access_token(data={"sub": str(test_user.id)})
    client.headers.update({"Authorization": f"Bearer {token}"})
    return client

@pytest.fixture
def test_report(db_session: Session, test_user: User) -> Report:
    """Фикстура для тестового отчета"""
    ReportFactory._meta.sqlalchemy_session = db_session
    report = ReportFactory(user_id=test_user.id)
    db_session.add(report)
    db_session.commit()
    db_session.refresh(report)
    return report

@pytest.fixture
def telegram_auth_data() -> Dict[str, Any]:
    """Фикстура для данных авторизации Telegram"""
    return {
        "id": 123456789,
        "first_name": "Test",
        "last_name": "User",
        "username": "testuser",
        "photo_url": "https://t.me/i/userpic/320/testuser.jpg",
        "auth_date": 1234567890,
        "hash": "test_hash"
    }

@pytest.fixture
def google_sheet_data() -> Dict[str, Any]:
    """Фикстура для данных Google таблицы"""
    return {
        "sheet_id": "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms",
        "title": "Test Sheet",
        "sheets": ["Sheet1", "Sheet2"],
        "last_modified": "2023-01-01T00:00:00.000Z"
    }

@pytest.fixture
def excel_file_data() -> Dict[str, Any]:
    """Фикстура для данных Excel файла"""
    return {
        "filename": "test_report.xlsx",
        "content": b"test_excel_content",
        "size": 1024
    }

@pytest.fixture
def completed_report_factory(db_session: Session):
    CompletedReportFactory._meta.sqlalchemy_session = db_session
    return CompletedReportFactory

@pytest.fixture
def processing_report_factory(db_session: Session):
    ProcessingReportFactory._meta.sqlalchemy_session = db_session
    return ProcessingReportFactory 