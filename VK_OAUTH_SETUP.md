# Настройка VK OAuth для исправления 404 ошибки

## Проблема
При переходе по ссылке VK ID получается 404 ошибка:
```
https://id.vk.com/oauth2/auth?response_type=code&client_id=53860967&redirect_uri=https%3A%2F%2Fazkaraz.github.io%2Fadstat%2Fvk-oauth-callback&scope=phone+email&state=vk_oauth
```

## Решение: Использование обычного VK OAuth

### 1. Правильные Endpoints

**VK OAuth (работает):**
- Авторизация: `https://oauth.vk.com/authorize`
- Обмен токенов: `https://oauth.vk.com/access_token`
- API: `https://api.vk.com/method/`

**VK ID (не работает):**
- Авторизация: `https://id.vk.com/oauth2/auth` ❌ 404
- Обмен токенов: `https://id.vk.com/oauth2/access_token` ❌ 404

### 2. Настройка VK приложения

#### Шаг 1: Создание приложения
1. Перейдите на https://vk.com/dev
2. Создайте новое приложение или используйте существующее
3. Выберите тип приложения: **Standalone-приложение**

#### Шаг 2: Настройка OAuth
1. В настройках приложения найдите раздел "Настройки"
2. Укажите **Redirect URI**: `https://azkaraz.github.io/adstat/vk-oauth-callback`
3. Включите права доступа: `email`
4. Сохраните настройки

#### Шаг 3: Публикация приложения
1. Убедитесь, что приложение опубликовано
2. Статус должен быть "Опубликовано", а не "Черновик"

### 3. Обновленный код

#### Backend (app/services/vk_ads.py)
```python
def get_vk_auth_url() -> str:
    """
    Получить URL для авторизации в VK OAuth
    """
    params = {
        'response_type': 'code',
        'client_id': settings.VK_CLIENT_ID,
        'redirect_uri': settings.VK_REDIRECT_URI,
        'scope': 'email',  # Упрощенный scope
        'state': 'vk_oauth'
    }
    return f'https://oauth.vk.com/authorize?{urlencode(params)}'

def exchange_vk_code_for_tokens(code: str) -> dict:
    """
    Обменять код авторизации на токены
    """
    url = "https://oauth.vk.com/access_token"
    
    data = {
        'grant_type': 'authorization_code',
        'client_id': settings.VK_CLIENT_ID,
        'client_secret': settings.VK_CLIENT_SECRET,
        'redirect_uri': settings.VK_REDIRECT_URI,
        'code': code
    }
    
    headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
    }
    
    response = requests.post(url, data=data, headers=headers)
    response.raise_for_status()
    return response.json()
```

#### Frontend
```typescript
// Используйте правильный URL авторизации
const vkAuthUrl = 'https://oauth.vk.com/authorize?response_type=code&client_id=53860967&redirect_uri=https%3A%2F%2Fazkaraz.github.io%2Fadstat%2Fvk-oauth-callback&scope=email&state=vk_oauth';
```

### 4. Тестирование

#### Проверка URL авторизации
```bash
curl -I "https://oauth.vk.com/authorize?response_type=code&client_id=53860967&redirect_uri=https%3A%2F%2Fazkaraz.github.io%2Fadstat%2Fvk-oauth-callback&scope=email&state=test"
```

#### Проверка endpoint обмена токенов
```bash
curl -X POST "https://oauth.vk.com/access_token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=authorization_code&client_id=53860967&client_secret=YOUR_SECRET&redirect_uri=https%3A%2F%2Fazkaraz.github.io%2Fadstat%2Fvk-oauth-callback&code=test_code"
```

### 5. Возможные ошибки и решения

#### "Selected sign-in method not available for app"
- **Причина**: Приложение не настроено для OAuth
- **Решение**: В настройках приложения включите OAuth и укажите правильный redirect URI

#### "invalid_grant"
- **Причина**: Недействительный или истекший код авторизации
- **Решение**: Используйте свежий код авторизации

#### "invalid_client"
- **Причина**: Неправильный client_id или client_secret
- **Решение**: Проверьте настройки приложения

### 6. Рекомендации

1. **Используйте обычный VK OAuth** вместо VK ID
2. **Упростите scope** до `email` для начала
3. **Проверьте настройки приложения** в VK Developer Console
4. **Убедитесь, что приложение опубликовано**
5. **Используйте правильные endpoints** из документации

### 7. Полезные ссылки

- [VK OAuth Documentation](https://vk.com/dev/auth_sites)
- [VK API Documentation](https://vk.com/dev/api_requests)
- [VK Developer Console](https://vk.com/dev)

### 8. Пример рабочего URL

```
https://oauth.vk.com/authorize?response_type=code&client_id=53860967&redirect_uri=https%3A%2F%2Fazkaraz.github.io%2Fadstat%2Fvk-oauth-callback&scope=email&state=vk_oauth
```

Этот URL должен открыть страницу авторизации VK и после успешной авторизации перенаправить на указанный redirect URI с кодом авторизации. 