# Руководство по тестированию

## Обзор

Этот документ описывает стратегию тестирования для приложения Ads Statistics Dashboard, включая backend (FastAPI) и frontend (React) компоненты.

## Типы тестов

### Backend тесты

#### Unit тесты
- **Назначение**: Тестирование отдельных функций и классов
- **Расположение**: `tests/test_*.py`
- **Примеры**: 
  - Тестирование сервисов авторизации
  - Тестирование обработки файлов
  - Тестирование моделей данных

#### Integration тесты
- **Назначение**: Тестирование взаимодействия компонентов
- **Расположение**: `tests/test_integration.py`
- **Примеры**:
  - Полный рабочий процесс пользователя
  - Взаимодействие с базой данных
  - API эндпоинты

#### API тесты
- **Назначение**: Тестирование HTTP эндпоинтов
- **Расположение**: `tests/test_*.py` (в соответствующих файлах)
- **Примеры**:
  - Авторизация через Telegram
  - Загрузка файлов
  - Работа с Google Sheets

### Frontend тесты

#### Component тесты
- **Назначение**: Тестирование React компонентов
- **Расположение**: `frontend/src/test/components/`
- **Примеры**:
  - Рендеринг компонентов
  - Обработка событий
  - Состояние компонентов

#### Service тесты
- **Назначение**: Тестирование API сервисов
- **Расположение**: `frontend/src/test/services/`
- **Примеры**:
  - HTTP запросы
  - Обработка ответов
  - Обработка ошибок

## Запуск тестов

### Backend тесты

```bash
# Все тесты
pytest

# С покрытием
pytest --cov=app --cov-report=html

# Конкретный файл
pytest tests/test_auth.py

# Конкретный тест
pytest tests/test_auth.py::TestAuthService::test_create_access_token

# С маркерами
pytest -m "auth"
pytest -m "not slow"
```

### Frontend тесты

```bash
# Перейти в директорию frontend
cd frontend

# Установить зависимости
npm install

# Запустить тесты
npm test

# С покрытием
npm run test:coverage

# В режиме watch
npm run test:ui
```

### Все тесты

```bash
# Запуск всех тестов
python run_tests.py

# Только backend
python run_tests.py backend

# Только frontend
python run_tests.py frontend
```

## Структура тестов

### Backend структура

```
tests/
├── __init__.py
├── conftest.py              # Конфигурация pytest
├── factories.py             # Фабрики для тестовых данных
├── test_auth.py            # Тесты авторизации
├── test_user.py            # Тесты пользователей
├── test_upload.py          # Тесты загрузки файлов
├── test_sheets.py          # Тесты Google Sheets
└── test_integration.py     # Интеграционные тесты
```

### Frontend структура

```
frontend/src/test/
├── setup.ts                # Настройки тестов
├── mocks/
│   └── server.ts           # MSW сервер для мокирования API
├── components/
│   ├── Login.test.tsx      # Тесты компонента Login
│   └── Dashboard.test.tsx  # Тесты компонента Dashboard
└── services/
    └── authService.test.ts # Тесты сервиса авторизации
```

## Фикстуры и моки

### Backend фикстуры

```python
# conftest.py
@pytest.fixture
def test_user(db_session) -> User:
    """Создаем тестового пользователя"""
    user = UserFactory()
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user

@pytest.fixture
def authenticated_client(client, test_user_with_token) -> TestClient:
    """Клиент с аутентифицированным пользователем"""
    user, token = test_user_with_token
    client.headers.update({"Authorization": f"Bearer {token}"})
    return client
```

### Frontend моки

```typescript
// setup.ts
Object.defineProperty(window, 'Telegram', {
  value: {
    WebApp: {
      initData: 'test_init_data',
      initDataUnsafe: {
        user: {
          id: 123456789,
          first_name: 'Test',
          last_name: 'User',
          username: 'test_user'
        }
      },
      ready: vi.fn(),
      expand: vi.fn(),
      close: vi.fn()
    }
  },
  writable: true
})
```

## Покрытие кода

### Backend покрытие

```bash
# Генерация отчета
pytest --cov=app --cov-report=html --cov-report=term-missing

# Минимальное покрытие
pytest --cov=app --cov-fail-under=80
```

Отчеты сохраняются в:
- `htmlcov/` - HTML отчет
- `coverage.xml` - XML отчет для CI/CD

### Frontend покрытие

```bash
# Генерация отчета
npm run test:coverage
```

Отчеты сохраняются в:
- `frontend/coverage/` - HTML отчет

## Маркеры тестов

### Backend маркеры

```python
@pytest.mark.slow
def test_slow_operation():
    """Медленный тест"""
    pass

@pytest.mark.integration
def test_full_workflow():
    """Интеграционный тест"""
    pass

@pytest.mark.auth
def test_telegram_auth():
    """Тест авторизации"""
    pass
```

### Frontend маркеры

```typescript
describe('AuthService', () => {
  it('should login with Telegram', async () => {
    // Тест авторизации
  })
})
```

## Тестовые данные

### Backend фабрики

```python
# factories.py
class UserFactory(factory.SQLAlchemyModelFactory):
    class Meta:
        model = User
    
    telegram_id = factory.Sequence(lambda n: f"telegram_{n}")
    username = factory.Faker('user_name')
    first_name = factory.Faker('first_name')
    last_name = factory.Faker('last_name')
    email = factory.Faker('email')
```

### Frontend моки

```typescript
// mocks/server.ts
export const handlers = [
  rest.post('/auth/telegram', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        access_token: 'test_jwt_token',
        user: {
          id: 1,
          telegram_id: '123456789',
          username: 'test_user'
        }
      })
    )
  })
]
```

## CI/CD интеграция

### GitHub Actions

```yaml
name: Tests
on: [push, pull_request]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Set up Python
        uses: actions/setup-python@v2
        with:
          python-version: 3.9
      - name: Install dependencies
        run: pip install -r requirements.txt
      - name: Run tests
        run: pytest --cov=app --cov-report=xml

  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Set up Node.js
        uses: actions/setup-node@v2
        with:
          node-version: 18
      - name: Install dependencies
        run: cd frontend && npm install
      - name: Run tests
        run: cd frontend && npm test
```

## Лучшие практики

### Backend

1. **Используйте фикстуры** для создания тестовых данных
2. **Мокайте внешние зависимости** (API, база данных)
3. **Тестируйте граничные случаи** и ошибки
4. **Используйте параметризованные тесты** для множественных сценариев
5. **Проверяйте покрытие кода**

### Frontend

1. **Тестируйте поведение, а не реализацию**
2. **Используйте MSW** для мокирования API
3. **Тестируйте пользовательские взаимодействия**
4. **Проверяйте доступность** (accessibility)
5. **Используйте data-testid** для селекторов

### Общие

1. **Пишите читаемые тесты** с понятными названиями
2. **Следуйте принципу AAA** (Arrange, Act, Assert)
3. **Изолируйте тесты** друг от друга
4. **Используйте описательные сообщения об ошибках**
5. **Регулярно запускайте тесты**

## Отладка тестов

### Backend отладка

```bash
# Подробный вывод
pytest -v -s

# Остановка на первой ошибке
pytest -x

# Отладка конкретного теста
pytest --pdb tests/test_auth.py::test_telegram_auth
```

### Frontend отладка

```bash
# Подробный вывод
npm test -- --verbose

# Отладка в браузере
npm run test:ui
```

## Производительность тестов

### Оптимизация

1. **Используйте базу данных в памяти** для тестов
2. **Мокайте медленные операции**
3. **Запускайте тесты параллельно**
4. **Кэшируйте зависимости**

### Мониторинг

```bash
# Время выполнения тестов
pytest --durations=10

# Профилирование
pytest --profile
```

## Ресурсы

- [Pytest документация](https://docs.pytest.org/)
- [Vitest документация](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [MSW документация](https://mswjs.io/)
- [Factory Boy документация](https://factoryboy.readthedocs.io/) 