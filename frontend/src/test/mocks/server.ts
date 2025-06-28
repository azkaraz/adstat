import { setupServer } from 'msw/node'
import { rest } from 'msw'

// Базовый URL API
const API_BASE_URL = 'http://localhost:8000'

// Моки для API эндпоинтов
export const handlers = [
  // Авторизация через Telegram
  rest.post(`${API_BASE_URL}/auth/telegram`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
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
    )
  }),

  // Получение профиля пользователя
  rest.get(`${API_BASE_URL}/user/profile`, (req, res, ctx) => {
    const authHeader = req.headers.get('Authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res(
        ctx.status(401),
        ctx.json({ detail: 'Не авторизован' })
      )
    }

    return res(
      ctx.status(200),
      ctx.json({
        id: 1,
        telegram_id: '123456789',
        username: 'test_user',
        first_name: 'Test',
        last_name: 'User',
        email: 'test@example.com',
        has_google_sheet: false
      })
    )
  }),

  // Обновление профиля
  rest.put(`${API_BASE_URL}/user/profile`, (req, res, ctx) => {
    const authHeader = req.headers.get('Authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res(
        ctx.status(401),
        ctx.json({ detail: 'Не авторизован' })
      )
    }

    return res(
      ctx.status(200),
      ctx.json({
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
    )
  }),

  // Получение отчетов пользователя
  rest.get(`${API_BASE_URL}/user/reports`, (req, res, ctx) => {
    const authHeader = req.headers.get('Authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res(
        ctx.status(401),
        ctx.json({ detail: 'Не авторизован' })
      )
    }

    return res(
      ctx.status(200),
      ctx.json([
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
    )
  }),

  // Загрузка отчета
  rest.post(`${API_BASE_URL}/upload/report`, (req, res, ctx) => {
    const authHeader = req.headers.get('Authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res(
        ctx.status(401),
        ctx.json({ detail: 'Не авторизован' })
      )
    }

    return res(
      ctx.status(200),
      ctx.json({
        message: 'Файл успешно загружен',
        report_id: 3,
        filename: 'uploaded_report.xlsx',
        status: 'uploaded'
      })
    )
  }),

  // Получение статуса отчета
  rest.get(`${API_BASE_URL}/upload/report/:id/status`, (req, res, ctx) => {
    const authHeader = req.headers.get('Authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res(
        ctx.status(401),
        ctx.json({ detail: 'Не авторизован' })
      )
    }

    const { id } = req.params

    return res(
      ctx.status(200),
      ctx.json({
        id: parseInt(id as string),
        filename: 'test_report.xlsx',
        original_filename: 'test_report.xlsx',
        file_size: 1024,
        status: 'completed',
        created_at: '2023-12-01T10:00:00Z',
        updated_at: '2023-12-01T10:05:00Z'
      })
    )
  }),

  // Подключение Google таблицы
  rest.post(`${API_BASE_URL}/sheets/connect`, (req, res, ctx) => {
    const authHeader = req.headers.get('Authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res(
        ctx.status(401),
        ctx.json({ detail: 'Не авторизован' })
      )
    }

    return res(
      ctx.status(200),
      ctx.json({
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
    )
  }),

  // Получение информации о подключенной таблице
  rest.get(`${API_BASE_URL}/sheets/info`, (req, res, ctx) => {
    const authHeader = req.headers.get('Authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res(
        ctx.status(401),
        ctx.json({ detail: 'Не авторизован' })
      )
    }

    return res(
      ctx.status(200),
      ctx.json({
        sheet_id: 'test_sheet_id',
        title: 'Test Sheet',
        sheets: [
          {
            title: 'Sheet1',
            sheet_id: 0
          }
        ]
      })
    )
  }),

  // Отключение Google таблицы
  rest.delete(`${API_BASE_URL}/sheets/disconnect`, (req, res, ctx) => {
    const authHeader = req.headers.get('Authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res(
        ctx.status(401),
        ctx.json({ detail: 'Не авторизован' })
      )
    }

    return res(
      ctx.status(200),
      ctx.json({
        message: 'Google таблица отключена'
      })
    )
  }),

  // Получение URL для Google авторизации
  rest.post(`${API_BASE_URL}/auth/google/url`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        auth_url: 'https://accounts.google.com/oauth2/auth?client_id=test&redirect_uri=test'
      })
    )
  }),

  // Callback от Google
  rest.post(`${API_BASE_URL}/auth/google/callback`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        message: 'Google авторизация успешна'
      })
    )
  })
]

export const server = setupServer(...handlers) 