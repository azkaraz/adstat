import axios from 'axios'
import { API_BASE_URL } from '../config'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Интерцептор для добавления токена
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  console.log('DEBUG: Axios request:', {
    url: config.url,
    method: config.method,
    data: config.data,
    headers: config.headers
  })
  return config
})

// Интерцептор для логирования ответов
api.interceptors.response.use(
  (response) => {
    console.log('DEBUG: Axios response:', {
      status: response.status,
      data: response.data
    })
    return response
  },
  (error) => {
    console.error('DEBUG: Axios error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    })
    return Promise.reject(error)
  }
)

export interface TelegramAuthData {
  id: number
  first_name: string
  last_name?: string
  username?: string
  photo_url?: string
  auth_date: number
  hash: string
}

export interface TelegramWebAppAuthData {
  initData: string
}

export interface AuthResponse {
  access_token: string
  token_type: string
  user: {
    id: number
    telegram_id: string
    username: string
    first_name: string
    last_name: string
    email?: string
    has_google_sheet: boolean
  }
}

export interface UserProfile {
  id: number
  telegram_id: string
  username: string
  first_name: string
  last_name: string
  email?: string
  has_google_sheet: boolean
  created_at: string
}

export const authService = {
  // Флаг для отслеживания активного запроса авторизации
  _authInProgress: false,
  _authPromise: null as Promise<AuthResponse> | null,

  async telegramAuth(data: TelegramAuthData): Promise<AuthResponse> {
    console.log('🔍 authService.telegramAuth: Начинаем LEGACY авторизацию')
    console.log('📤 authService.telegramAuth: Отправляем данные:', data)
    console.log('🌐 authService.telegramAuth: URL:', `${API_BASE_URL}/auth/telegram`)
    
    // Если уже есть активный запрос авторизации, возвращаем его
    if (this._authInProgress && this._authPromise) {
      console.log('⚠️ authService.telegramAuth: Уже есть активный запрос авторизации, возвращаем существующий')
      return this._authPromise
    }
    
    // Создаем новый запрос
    this._authInProgress = true
    this._authPromise = this._performTelegramAuth(data)
    
    try {
      const result = await this._authPromise
      return result
    } finally {
      // Сбрасываем флаги после завершения
      this._authInProgress = false
      this._authPromise = null
    }
  },

  async telegramWebAppAuth(data: TelegramWebAppAuthData): Promise<AuthResponse> {
    console.log('🔍 authService.telegramWebAppAuth: Начинаем WEBAPP авторизацию')
    console.log('📤 authService.telegramWebAppAuth: Отправляем initData:', data.initData)
    console.log('🌐 authService.telegramWebAppAuth: URL:', `${API_BASE_URL}/auth/web-app/auth/telegram`)
    
    // Если уже есть активный запрос авторизации, возвращаем его
    if (this._authInProgress && this._authPromise) {
      console.log('⚠️ authService.telegramWebAppAuth: Уже есть активный запрос авторизации, возвращаем существующий')
      return this._authPromise
    }
    
    // Создаем новый запрос
    this._authInProgress = true
    this._authPromise = this._performTelegramWebAppAuth(data)
    
    try {
      const result = await this._authPromise
      return result
    } finally {
      // Сбрасываем флаги после завершения
      this._authInProgress = false
      this._authPromise = null
    }
  },

  async _performTelegramAuth(data: TelegramAuthData): Promise<AuthResponse> {
    const maxRetries = 3
    const baseDelay = 1000 // 1 секунда
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await api.post('/auth/telegram', data)
        console.log('✅ authService.telegramAuth: Ответ получен:', response.data)
        return response.data
      } catch (error: any) {
        console.error(`❌ authService.telegramAuth: Попытка ${attempt}/${maxRetries} - Ошибка:`, error)
        
        // Если это ошибка 429 (Too Many Requests), ждем и повторяем
        if (error.response?.status === 429 && attempt < maxRetries) {
          const delay = baseDelay * Math.pow(2, attempt - 1) // Экспоненциальная задержка
          console.log(`⏳ authService.telegramAuth: Ожидаем ${delay}ms перед повтором...`)
          await new Promise(resolve => setTimeout(resolve, delay))
          continue
        }
        
        // Для других ошибок или последней попытки - выбрасываем ошибку
        throw error
      }
    }
    
    // Этот код не должен выполняться, но на всякий случай
    throw new Error('Превышено максимальное количество попыток авторизации')
  },

  async _performTelegramWebAppAuth(data: TelegramWebAppAuthData): Promise<AuthResponse> {
    const maxRetries = 3
    const baseDelay = 1000 // 1 секунда
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await api.post('/auth/web-app/auth/telegram', data)
        console.log('✅ authService.telegramWebAppAuth: Ответ получен:', response.data)
        
        // Проверяем успешность авторизации
        if (response.data.success) {
          return {
            access_token: response.data.access_token,
            token_type: response.data.token_type,
            user: response.data.user_data
          }
        } else {
          throw new Error(response.data.error || 'Авторизация не удалась')
        }
      } catch (error: any) {
        console.error(`❌ authService.telegramWebAppAuth: Попытка ${attempt}/${maxRetries} - Ошибка:`, error)
        
        // Если это ошибка 429 (Too Many Requests), ждем и повторяем
        if (error.response?.status === 429 && attempt < maxRetries) {
          const delay = baseDelay * Math.pow(2, attempt - 1) // Экспоненциальная задержка
          console.log(`⏳ authService.telegramWebAppAuth: Ожидаем ${delay}ms перед повтором...`)
          await new Promise(resolve => setTimeout(resolve, delay))
          continue
        }
        
        // Для других ошибок или последней попытки - выбрасываем ошибку
        throw error
      }
    }
    
    // Этот код не должен выполняться, но на всякий случай
    throw new Error('Превышено максимальное количество попыток авторизации')
  },

  async getProfile(token: string): Promise<UserProfile> {
    console.log('🔍 authService.getProfile: Получаем профиль')
    const response = await api.get('/user/profile', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    console.log('✅ authService.getProfile: Профиль получен:', response.data)
    return response.data
  },

  async updateProfile(email: string): Promise<{ message: string; user: Partial<UserProfile> }> {
    const response = await api.put('/user/profile', { email })
    return response.data
  },

  async getGoogleAuthUrl(): Promise<{ auth_url: string }> {
    const response = await api.post('/auth/google/url')
    return response.data
  },

  async googleAuthCallback(code: string): Promise<{ message: string }> {
    const token = localStorage.getItem('token')
    const response = await api.post('/auth/google/callback', { code }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    return response.data
  },

  async getGoogleSpreadsheets(): Promise<{ spreadsheets: { id: string, name: string }[] }> {
    const response = await api.get('/auth/google/spreadsheets')
    return response.data
  }
}

// Экспортируем в глобальную область видимости для отладки
if (typeof window !== 'undefined') {
  (window as any).authService = authService
} 