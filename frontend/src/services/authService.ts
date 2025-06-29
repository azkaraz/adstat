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
  async telegramAuth(data: TelegramAuthData): Promise<AuthResponse> {
    console.log('🔍 authService.telegramAuth: Начинаем авторизацию')
    console.log('📤 authService.telegramAuth: Отправляем данные:', data)
    console.log('🌐 authService.telegramAuth: URL:', `${API_BASE_URL}/auth/telegram`)
    
    try {
      const response = await api.post('/auth/telegram', data)
      console.log('✅ authService.telegramAuth: Ответ получен:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ authService.telegramAuth: Ошибка:', error)
      throw error
    }
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
  }
} 