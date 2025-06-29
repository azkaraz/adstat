import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'

// Базовый URL API
const API_BASE_URL = 'http://localhost:8000'

// Моки для API эндпоинтов
export const handlers = [
  // Авторизация через Telegram
  http.post(`${API_BASE_URL}/auth/telegram`, () => {
    return HttpResponse.json({
      access_token: 'test_jwt_token',
      user: {
        id: 1,
        telegram_id: '123456789',
        username: 'test_user',
        first_name: 'Test',
        last_name: 'User',
        email: 'test@example.com',
        has_google_sheet: false
      }
    })
  }),

  // Получение профиля пользователя
  http.get(`${API_BASE_URL}/user/profile`, ({ request }) => {
    const authHeader = request.headers.get('Authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(
        { detail: 'Не авторизован' },
        { status: 401 }
      )
    }

    return HttpResponse.json({
      id: 1,
      telegram_id: '123456789',
      username: 'test_user',
      first_name: 'Test',
      last_name: 'User',
      email: 'test@example.com',
      has_google_sheet: false
    })
  }),

  // Обновление профиля
  http.put(`${API_BASE_URL}/user/profile`, ({ request }) => {
    const authHeader = request.headers.get('Authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(
        { detail: 'Не авторизован' },
        { status: 401 }
      )
    }

    return HttpResponse.json({
      message: 'Профиль обновлен',
      user: {
        id: 1,
        telegram_id: '123456789',
        username: 'test_user',
        first_name: 'Test',
        last_name: 'User',
        email: 'updated@example.com',
        has_google_sheet: false
      }
    })
  }),

  // Получение отчетов пользователя
  http.get(`${API_BASE_URL}/user/reports`, ({ request }) => {
    const authHeader = request.headers.get('Authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(
        { detail: 'Не авторизован' },
        { status: 401 }
      )
    }

    return HttpResponse.json([
      {
        id: 1,
        filename: 'test_report.xlsx',
        original_filename: 'test_report.xlsx',
        file_size: 1024,
        status: 'completed',
        created_at: '2023-12-01T10:00:00Z',
        updated_at: '2023-12-01T10:05:00Z'
      },
      {
        id: 2,
        filename: 'another_report.xlsx',
        original_filename: 'another_report.xlsx',
        file_size: 2048,
        status: 'processing',
        created_at: '2023-12-01T11:00:00Z',
        updated_at: '2023-12-01T11:00:00Z'
      }
    ])
  }),

  // Загрузка отчета
  http.post(`${API_BASE_URL}/upload/report`, ({ request }) => {
    const authHeader = request.headers.get('Authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(
        { detail: 'Не авторизован' },
        { status: 401 }
      )
    }

    return HttpResponse.json({
      message: 'Файл успешно загружен',
      report_id: 3,
      filename: 'uploaded_report.xlsx',
      status: 'uploaded'
    })
  }),

  // Получение статуса отчета
  http.get(`${API_BASE_URL}/upload/report/:id/status`, ({ request, params }) => {
    const authHeader = request.headers.get('Authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(
        { detail: 'Не авторизован' },
        { status: 401 }
      )
    }

    const { id } = params

    return HttpResponse.json({
      id: parseInt(id as string),
      filename: 'test_report.xlsx',
      original_filename: 'test_report.xlsx',
      file_size: 1024,
      status: 'completed',
      created_at: '2023-12-01T10:00:00Z',
      updated_at: '2023-12-01T10:05:00Z'
    })
  }),

  // Подключение Google таблицы
  http.post(`${API_BASE_URL}/sheets/connect`, ({ request }) => {
    const authHeader = request.headers.get('Authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(
        { detail: 'Не авторизован' },
        { status: 401 }
      )
    }

    return HttpResponse.json({
      message: 'Google таблица успешно подключена',
      sheet_info: {
        sheet_id: 'test_sheet_id',
        title: 'Test Sheet',
        sheets: [
          {
            title: 'Sheet1',
            sheet_id: 0
          }
        ]
      }
    })
  }),

  // Получение информации о подключенной таблице
  http.get(`${API_BASE_URL}/sheets/info`, ({ request }) => {
    const authHeader = request.headers.get('Authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(
        { detail: 'Не авторизован' },
        { status: 401 }
      )
    }

    return HttpResponse.json({
      sheet_info: {
        sheet_id: 'test_sheet_id',
        title: 'Test Sheet',
        sheets: [
          {
            title: 'Sheet1',
            sheet_id: 0
          }
        ]
      }
    })
  }),

  // Отключение Google таблицы
  http.delete(`${API_BASE_URL}/sheets/disconnect`, ({ request }) => {
    const authHeader = request.headers.get('Authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(
        { detail: 'Не авторизован' },
        { status: 401 }
      )
    }

    return HttpResponse.json({
      message: 'Google таблица успешно отключена'
    })
  }),

  // Получение URL для Google авторизации
  http.post(`${API_BASE_URL}/auth/google/url`, () => {
    return HttpResponse.json({
      auth_url: 'https://accounts.google.com/oauth2/auth?client_id=test&redirect_uri=test'
    })
  }),

  // Callback от Google
  http.post(`${API_BASE_URL}/auth/google/callback`, () => {
    return HttpResponse.json({
      message: 'Google авторизация успешна'
    })
  })
]

// Создаем сервер для тестов
export const server = setupServer(...handlers) 