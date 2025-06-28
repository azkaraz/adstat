import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

declare global {
  interface Window {
    Telegram: {
      WebApp: {
        initData: string
        initDataUnsafe: {
          user: {
            id: number
            first_name: string
            last_name?: string
            username?: string
            photo_url?: string
          }
        }
        ready: () => void
        expand: () => void
        close: () => void
      }
    }
  }
}

const Login: React.FC = () => {
  const { user, login, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) {
      navigate('/')
      return
    }

    // Проверяем, запущено ли приложение в Telegram
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp
      tg.ready()
      tg.expand()

      // Если есть данные пользователя, авторизуемся
      if (tg.initDataUnsafe?.user) {
        const telegramData = {
          ...tg.initDataUnsafe.user,
          auth_date: Math.floor(Date.now() / 1000),
          hash: tg.initData
        }
        
        login(telegramData).catch(console.error)
      }
    }
  }, [user, login, navigate])

  const handleTelegramLogin = () => {
    // Для тестирования вне Telegram
    const mockData = {
      id: 123456789,
      first_name: "Тестовый",
      last_name: "Пользователь",
      username: "test_user",
      auth_date: Math.floor(Date.now() / 1000),
      hash: "mock_hash"
    }
    
    login(mockData).catch(console.error)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Загрузка...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Войти в систему
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Авторизуйтесь через Telegram для доступа к личному кабинету
          </p>
        </div>
        
        <div className="mt-8 space-y-6">
          <div>
            <button
              onClick={handleTelegramLogin}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                <svg className="h-5 w-5 text-blue-500 group-hover:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
              </span>
              Войти через Telegram
            </button>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-gray-500">
              Приложение автоматически авторизуется при запуске из Telegram
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login 