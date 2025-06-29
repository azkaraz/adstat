import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'

// Базовый URL API - используем ngrok URL как в приложении
const API_BASE_URL = 'https://4fe4-2a12-5940-a96b-00-2.ngrok-free.app'

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
        file_size: 1024,
        status: 'completed',
        created_at: '2023-12-01T10:00:00Z'
      },
      {
        id: 2,
        filename: 'another_report.xlsx',
        file_size: 2048,
        status: 'processing',
        created_at: '2023-12-01T11:00:00Z'
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
      file_size: 1024,
      status: 'completed',
      created_at: '2023-12-01T10:00:00Z'
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

  // Получение данных отчета
  http.get(`${API_BASE_URL}/sheets/report/:id`, ({ request, params }) => {
    const authHeader = request.headers.get('Authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(
        { detail: 'Не авторизован' },
        { status: 401 }
      )
    }

    const { id } = params

    return HttpResponse.json({
      report_id: parseInt(id as string),
      data: [
        {
          date: '2023-12-01',
          campaign: 'Test Campaign',
          impressions: 1000,
          clicks: 50,
          spend: 100.50,
          conversions: 5
        }
      ]
    })
  }),

  // Запись данных в Google таблицу
  http.post(`${API_BASE_URL}/sheets/write`, ({ request }) => {
    const authHeader = request.headers.get('Authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(
        { detail: 'Не авторизован' },
        { status: 401 }
      )
    }

    return HttpResponse.json({
      message: 'Данные успешно записаны в Google таблицу',
      rows_written: 10
    })
  })
]

// Создаем и экспортируем сервер
export const server = setupServer(...handlers) 