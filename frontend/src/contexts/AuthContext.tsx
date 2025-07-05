import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { authService } from '../services/authService'

export interface User {
  id: number
  telegram_id: string
  username: string
  first_name: string
  last_name: string
  email?: string
  has_google_sheet: boolean
  has_google_account?: boolean
  has_vk_account?: boolean
  created_at?: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (telegramData: any) => Promise<void>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          console.log('Attempting to get profile with token:', token)
          const userData = await authService.getProfile(token)
          console.log('Profile loaded successfully:', userData)
          setUser(userData)
        } catch (error) {
          console.error('Ошибка получения профиля:', error)
          localStorage.removeItem('token')
          setToken(null)
        }
      }
      setLoading(false)
    }

    initAuth()
  }, [token])

  const login = async (telegramData: any) => {
    try {
      console.log('🔍 AuthContext.login: Начинаем авторизацию')
      console.log('📊 AuthContext.login: Полученные данные:', telegramData)
      console.log('📊 AuthContext.login: Тип данных:', typeof telegramData)
      console.log('📊 AuthContext.login: Ключи:', Object.keys(telegramData || {}))
      console.log('📊 AuthContext.login: initData присутствует:', !!telegramData?.initData)
      
      setLoading(true)
      
      let response
      
      // Проверяем формат данных
      if (telegramData.initData) {
        // Новый формат с initData
        console.log('✅ AuthContext.login: Используем WebApp auth с initData')
        response = await authService.telegramWebAppAuth({ initData: telegramData.initData })
        console.log('🔍 AuthContext.login: Получен ответ от telegramWebAppAuth:', response)
      } else {
        // Старый формат с объектом данных
        console.log('⚠️ AuthContext.login: Используем legacy auth с объектом данных')
        response = await authService.telegramAuth(telegramData)
        console.log('🔍 AuthContext.login: Получен ответ от telegramAuth:', response)
      }
      
      console.log('✅ AuthContext.login: Авторизация успешна:', response)
      console.log('🔍 AuthContext.login: Проверяем структуру ответа:', {
        hasAccessToken: !!response?.access_token,
        hasUser: !!response?.user,
        tokenType: response?.token_type,
        userId: response?.user?.id
      })
      
      if (!response?.access_token) {
        throw new Error('Отсутствует access_token в ответе')
      }
      
      if (!response?.user) {
        throw new Error('Отсутствует user в ответе')
      }
      
      setToken(response.access_token)
      setUser(response.user)
      localStorage.setItem('token', response.access_token)
      
      console.log('✅ AuthContext.login: Пользователь авторизован:', response.user)
    } catch (error) {
      console.error('❌ AuthContext.login: Ошибка авторизации:', error)
      setLoading(false)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    console.log('Logging out user')
    setUser(null)
    setToken(null)
    localStorage.removeItem('token')
  }

  const value = {
    user,
    token,
    login,
    logout,
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
} 