import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { authService } from '../services/authService'

interface User {
  id: number
  telegram_id: string
  username: string
  first_name: string
  last_name: string
  email?: string
  has_google_sheet: boolean
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
      } else {
        // Старый формат с объектом данных
        console.log('⚠️ AuthContext.login: Используем legacy auth с объектом данных')
        response = await authService.telegramAuth(telegramData)
      }
      
      console.log('✅ AuthContext.login: Авторизация успешна:', response)
      
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