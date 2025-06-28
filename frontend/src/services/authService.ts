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
  return config
})

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
    const response = await api.post('/auth/telegram', data)
    return response.data
  },

  async getProfile(token: string): Promise<UserProfile> {
    const response = await api.get('/user/profile', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
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