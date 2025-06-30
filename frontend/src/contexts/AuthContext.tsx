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
      console.log('Starting login with telegram data:', telegramData)
      setLoading(true)
      
      let response
      
      // Проверяем формат данных
      if (telegramData.initData) {
        // Новый формат с initData
        console.log('Using WebApp auth with initData')
        response = await authService.telegramWebAppAuth({ initData: telegramData.initData })
      } else {
        // Старый формат с объектом данных
        console.log('Using legacy auth with telegram data object')
        response = await authService.telegramAuth(telegramData)
      }
      
      console.log('Login successful:', response)
      
      setToken(response.access_token)
      setUser(response.user)
      localStorage.setItem('token', response.access_token)
      
      console.log('User logged in successfully:', response.user)
    } catch (error) {
      console.error('Ошибка авторизации:', error)
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