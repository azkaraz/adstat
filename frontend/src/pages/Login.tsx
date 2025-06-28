import React, { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
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
  const location = useLocation()

  // Функция для извлечения параметров из URL
  const getUrlParams = () => {
    const urlParams = new URLSearchParams(location.search)
    const params: any = {}
    
    // Telegram передает данные через параметры
    if (urlParams.get('user')) {
      try {
        const userData = JSON.parse(decodeURIComponent(urlParams.get('user') || '{}'))
        params.user = userData
      } catch (e) {
        console.error('Error parsing user data:', e)
      }
    }
    
    // Другие параметры Telegram
    params.auth_date = urlParams.get('auth_date')
    params.hash = urlParams.get('hash')
    params.query_id = urlParams.get('query_id')
    
    return params
  }

  // Функция для авторизации через Telegram WebApp
  const handleTelegramWebAppAuth = () => {
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp
      tg.ready()
      tg.expand()

      if (tg.initDataUnsafe?.user) {
        const telegramData = {
          ...tg.initDataUnsafe.user,
          auth_date: Math.floor(Date.now() / 1000),
          hash: tg.initData
        }
        
        console.log('Telegram WebApp auth data:', telegramData)
        return login(telegramData)
      }
    }
    return Promise.reject('No Telegram WebApp data')
  }

  // Функция для авторизации через URL параметры
  const handleUrlParamsAuth = () => {
    const params = getUrlParams()
    
    if (params.user && params.user.id) {
      const telegramData = {
        id: params.user.id,
        first_name: params.user.first_name || '',
        last_name: params.user.last_name || '',
        username: params.user.username || '',
        photo_url: params.user.photo_url || '',
        auth_date: params.auth_date || Math.floor(Date.now() / 1000),
        hash: params.hash || 'url_auth'
      }
      
      console.log('URL params auth data:', telegramData)
      return login(telegramData)
    }
    
    return Promise.reject('No valid URL parameters')
  }

  useEffect(() => {
    if (user) {
      navigate('/')
      return
    }

    // Пытаемся авторизоваться автоматически
    const autoAuth = async () => {
      try {
        // Сначала пробуем Telegram WebApp
        await handleTelegramWebAppAuth()
      } catch (error) {
        console.log('Telegram WebApp auth failed, trying URL params...')
        
        try {
          // Затем пробуем URL параметры
          await handleUrlParamsAuth()
        } catch (urlError) {
          console.log('URL params auth failed:', urlError)
          // Если ничего не работает, показываем кнопку для ручной авторизации
        }
      }
    }

    autoAuth()
  }, [user, login, navigate, location])

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