import { describe, it, expect, vi, beforeEach } from 'vitest'
import { loginWithTelegram, getGoogleAuthUrl, connectGoogleSheet } from '../../services/authService'

// Мокаем axios
vi.mock('axios', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    defaults: {
      headers: {
        common: {}
      }
    }
  }
}))

import axios from 'axios'

describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('loginWithTelegram', () => {
    it('успешно авторизуется через Telegram', async () => {
      const mockResponse = {
        data: {
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
        }
      }

      vi.mocked(axios.post).mockResolvedValueOnce(mockResponse)

      const telegramData = {
        id: 123456789,
        first_name: 'Test',
        last_name: 'User',
        username: 'test_user',
        auth_date: 1234567890,
        hash: 'test_hash'
      }

      const result = await loginWithTelegram(telegramData)

      expect(axios.post).toHaveBeenCalledWith('/auth/telegram', telegramData)
      expect(result).toEqual(mockResponse.data)
    })

    it('обрабатывает ошибку авторизации', async () => {
      const errorMessage = 'Неверная подпись Telegram'
      vi.mocked(axios.post).mockRejectedValueOnce({
        response: {
          status: 401,
          data: { detail: errorMessage }
        }
      })

      const telegramData = {
        id: 123456789,
        first_name: 'Test',
        last_name: 'User',
        username: 'test_user',
        auth_date: 1234567890,
        hash: 'invalid_hash'
      }

      await expect(loginWithTelegram(telegramData)).rejects.toThrow(errorMessage)
    })

    it('обрабатывает сетевую ошибку', async () => {
      vi.mocked(axios.post).mockRejectedValueOnce(new Error('Network error'))

      const telegramData = {
        id: 123456789,
        first_name: 'Test',
        last_name: 'User',
        username: 'test_user',
        auth_date: 1234567890,
        hash: 'test_hash'
      }

      await expect(loginWithTelegram(telegramData)).rejects.toThrow('Network error')
    })
  })

  describe('getGoogleAuthUrl', () => {
    it('получает URL для Google авторизации', async () => {
      const mockResponse = {
        data: {
          auth_url: 'https://accounts.google.com/oauth2/auth?client_id=test&redirect_uri=test'
        }
      }

      vi.mocked(axios.post).mockResolvedValueOnce(mockResponse)

      const result = await getGoogleAuthUrl()

      expect(axios.post).toHaveBeenCalledWith('/auth/google/url')
      expect(result).toEqual(mockResponse.data.auth_url)
    })

    it('обрабатывает ошибку получения URL', async () => {
      vi.mocked(axios.post).mockRejectedValueOnce(new Error('API error'))

      await expect(getGoogleAuthUrl()).rejects.toThrow('API error')
    })
  })

  describe('connectGoogleSheet', () => {
    it('подключает Google таблицу', async () => {
      const mockResponse = {
        data: {
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
        }
      }

      vi.mocked(axios.post).mockResolvedValueOnce(mockResponse)

      const sheetId = 'test_sheet_id'
      const result = await connectGoogleSheet(sheetId)

      expect(axios.post).toHaveBeenCalledWith('/api/sheets/connect', { sheet_id: sheetId })
      expect(result).toEqual(mockResponse.data)
    })

    it('обрабатывает ошибку подключения таблицы', async () => {
      const errorMessage = 'Ошибка доступа к таблице'
      vi.mocked(axios.post).mockRejectedValueOnce({
        response: {
          status: 400,
          data: { detail: errorMessage }
        }
      })

      const sheetId = 'invalid_sheet_id'

      await expect(connectGoogleSheet(sheetId)).rejects.toThrow(errorMessage)
    })

    it('обрабатывает ошибку без авторизации', async () => {
      vi.mocked(axios.post).mockRejectedValueOnce({
        response: {
          status: 401,
          data: { detail: 'Не авторизован' }
        }
      })

      const sheetId = 'test_sheet_id'

      await expect(connectGoogleSheet(sheetId)).rejects.toThrow('Не авторизован')
    })
  })

  describe('setAuthToken', () => {
    it('устанавливает токен авторизации', () => {
      const token = 'test_jwt_token'
      
      // Импортируем функцию setAuthToken
      const { setAuthToken } = require('../../services/authService')
      setAuthToken(token)

      expect(axios.defaults.headers.common['Authorization']).toBe(`Bearer ${token}`)
    })

    it('удаляет токен авторизации', () => {
      // Импортируем функцию setAuthToken
      const { setAuthToken } = require('../../services/authService')
      setAuthToken(null)

      expect(axios.defaults.headers.common['Authorization']).toBeUndefined()
    })
  })

  describe('getUserProfile', () => {
    it('получает профиль пользователя', async () => {
      const mockResponse = {
        data: {
          id: 1,
          telegram_id: '123456789',
          username: 'test_user',
          first_name: 'Test',
          last_name: 'User',
          email: 'test@example.com',
          has_google_sheet: false
        }
      }

      vi.mocked(axios.get).mockResolvedValueOnce(mockResponse)

      // Импортируем функцию getUserProfile
      const { getUserProfile } = require('../../services/authService')
      const result = await getUserProfile()

      expect(axios.get).toHaveBeenCalledWith('/user/profile')
      expect(result).toEqual(mockResponse.data)
    })

    it('обрабатывает ошибку получения профиля', async () => {
      vi.mocked(axios.get).mockRejectedValueOnce({
        response: {
          status: 401,
          data: { detail: 'Не авторизован' }
        }
      })

      // Импортируем функцию getUserProfile
      const { getUserProfile } = require('../../services/authService')
      await expect(getUserProfile()).rejects.toThrow('Не авторизован')
    })
  })

  describe('updateUserProfile', () => {
    it('обновляет профиль пользователя', async () => {
      const mockResponse = {
        data: {
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
        }
      }

      vi.mocked(axios.put).mockResolvedValueOnce(mockResponse)

      const profileData = { email: 'updated@example.com' }

      // Импортируем функцию updateUserProfile
      const { updateUserProfile } = require('../../services/authService')
      const result = await updateUserProfile(profileData)

      expect(axios.put).toHaveBeenCalledWith('/user/profile', profileData)
      expect(result).toEqual(mockResponse.data)
    })

    it('обрабатывает ошибку обновления профиля', async () => {
      vi.mocked(axios.put).mockRejectedValueOnce({
        response: {
          status: 400,
          data: { detail: 'Неверные данные' }
        }
      })

      const profileData = { email: 'invalid-email' }

      // Импортируем функцию updateUserProfile
      const { updateUserProfile } = require('../../services/authService')
      await expect(updateUserProfile(profileData)).rejects.toThrow('Неверные данные')
    })
  })

  describe('logout', () => {
    it('выполняет выход из системы', () => {
      // Импортируем функцию logout
      const { logout } = require('../../services/authService')
      logout()

      expect(axios.defaults.headers.common['Authorization']).toBeUndefined()
    })
  })
}) 