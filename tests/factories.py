import factory
from factory.fuzzy import FuzzyText, FuzzyInteger
from factory.alchemy import SQLAlchemyModelFactory
from datetime import datetime, timedelta
from app.models.user import User
from app.models.report import Report

class UserFactory(SQLAlchemyModelFactory):
    """Фабрика для создания тестовых пользователей"""
    
    class Meta:
        model = User
        sqlalchemy_session = None
    
    telegram_id = factory.Sequence(lambda n: f"telegram_{n}")
    username = factory.Faker('user_name')
    first_name = factory.Faker('first_name')
    last_name = factory.Faker('last_name')
    email = factory.Faker('email')
    is_active = True
    google_access_token = None
    google_refresh_token = None
    google_sheet_id = None

class ReportFactory(SQLAlchemyModelFactory):
    """Фабрика для создания тестовых отчетов"""
    
    class Meta:
        model = Report
        sqlalchemy_session = None
    
    user_id = factory.SubFactory(UserFactory)
    filename = factory.Faker('file_name', extension='xlsx')
    original_filename = factory.Faker('file_name', extension='xlsx')
    file_path = factory.LazyAttribute(lambda obj: f"uploads/{obj.filename}")
    file_size = FuzzyInteger(1000, 10000000)  # 1KB - 10MB
    status = factory.Iterator(['uploaded', 'processing', 'completed', 'error'])
    error_message = None
    created_at = factory.LazyFunction(datetime.utcnow)
    updated_at = factory.LazyFunction(datetime.utcnow)

class CompletedReportFactory(ReportFactory):
    """Фабрика для завершенных отчетов"""
    class Meta:
        model = Report
        sqlalchemy_session = None
    status = 'completed'

class ProcessingReportFactory(ReportFactory):
    """Фабрика для обрабатываемых отчетов"""
    class Meta:
        model = Report
        sqlalchemy_session = None
    status = 'processing'

class ErrorReportFactory(ReportFactory):
    """Фабрика для отчетов с ошибками"""
    status = 'error'
    error_message = factory.Faker('sentence')

class UserWithGoogleSheetFactory(UserFactory):
    """Фабрика для пользователей с подключенной Google таблицей"""
    google_access_token = factory.Faker('sha256')
    google_refresh_token = factory.Faker('sha256')
    google_sheet_id = factory.Faker('sha256') 