import React, { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { ROUTES } from '../config'

const Login: React.FC = () => {
  const { user, login, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [hasAttemptedAutoAuth, setHasAttemptedAutoAuth] = React.useState(false)
  const [errorMessage, setErrorMessage] = React.useState<string>('')

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
    console.log('Checking Telegram WebApp...')
    console.log('🔍 Login: window.Telegram =', window.Telegram)
    console.log('🔍 Login: window.Telegram?.WebApp =', window.Telegram?.WebApp)
    console.log('🔍 Login: window.location.href =', window.location.href)
    console.log('🔍 Login: User-Agent =', navigator.userAgent)
    console.log('🔍 Login: Referrer =', document.referrer)
    
    // Проверяем, загружен ли Telegram WebApp скрипт
    const telegramScript = document.querySelector('script[src*="telegram"]')
    console.log('🔍 Login: Telegram script found =', !!telegramScript)
    
    if (window.Telegram?.WebApp) {
      console.log('Telegram WebApp found!')
      const tg = window.Telegram.WebApp
      tg.ready()
      tg.expand()

      console.log('initDataUnsafe:', tg.initDataUnsafe)
      console.log('initData:', tg.initData)
      console.log('platform:', tg.platform)
      console.log('version:', tg.version)

      if (tg.initDataUnsafe?.user) {
        // Используем новый формат с initData
        const telegramData = {
          initData: tg.initData
        }
        console.log('Telegram WebApp auth data:', telegramData)
        return login(telegramData)
      } else {
        console.log('No user data in Telegram WebApp')
      }
    } else {
      console.log('Telegram WebApp not found')
      console.log('🔍 Login: Возможные причины:')
      console.log('   - Приложение открыто не через Telegram WebApp')
      console.log('   - Mini App не настроен в BotFather')
      console.log('   - Telegram WebApp скрипт не загрузился')
      console.log('   - URL неправильный в настройках Mini App')
    }
    return Promise.reject('No Telegram WebApp data')
  }

  // Функция для авторизации через URL параметры
  const handleUrlParamsAuth = () => {
    console.log('Checking URL parameters...')
    const params = getUrlParams()
    console.log('URL params:', params)
    
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
    
    console.log('No valid URL parameters found')
    return Promise.reject('No valid URL parameters')
  }

  useEffect(() => {
    console.log('Login component mounted')
    console.log('Current URL:', window.location.href)
    console.log('User state:', user)
    console.log('Has attempted auto auth:', hasAttemptedAutoAuth)
    
    if (user) {
      console.log('User already logged in, redirecting...')
      navigate(ROUTES.DASHBOARD)
      return
    }

    // Защита от повторных попыток автоматической авторизации
    if (hasAttemptedAutoAuth || loading) {
      console.log('Skipping auto auth - already attempted or loading')
      return
    }

    // Пытаемся авторизоваться автоматически
    const autoAuth = async () => {
      console.log('Starting automatic auth...')
      setHasAttemptedAutoAuth(true)
      setErrorMessage('')
      
      try {
        // Сначала пробуем Telegram WebApp
        console.log('Trying Telegram WebApp auth...')
        await handleTelegramWebAppAuth()
      } catch (error) {
        console.log('Telegram WebApp auth failed:', error)
        
        try {
          // Затем пробуем URL параметры
          console.log('Trying URL params auth...')
          await handleUrlParamsAuth()
        } catch (urlError) {
          console.log('URL params auth failed:', urlError)
          console.log('No automatic auth methods worked, showing manual login button')
          
          // Показываем информативное сообщение об ошибке
          if (error instanceof Error) {
            if (error.message.includes('429')) {
              setErrorMessage('Слишком много запросов. Попробуйте через несколько секунд.')
            } else if (error.message.includes('Network Error')) {
              setErrorMessage('Ошибка подключения к серверу. Проверьте интернет-соединение.')
            } else {
              setErrorMessage(`Ошибка авторизации: ${error.message}`)
            }
          } else {
            setErrorMessage('Не удалось выполнить автоматическую авторизацию')
          }
        }
      }
    }

    autoAuth()
  }, []) // Убираем зависимости, чтобы эффект запускался только один раз

  const handleTelegramLogin = async () => {
    console.log('Manual Telegram login clicked')
    setErrorMessage('')
    
    try {
      // Для тестирования вне Telegram
      const mockData = {
        id: 123456789,
        first_name: "Тестовый",
        last_name: "Пользователь",
        username: "test_user",
        auth_date: Math.floor(Date.now() / 1000),
        hash: "mock_hash"
      }
      
      console.log('Using mock data for testing:', mockData)
      await login(mockData)
    } catch (error) {
      console.error('Manual login error:', error)
      if (error instanceof Error) {
        if (error.message.includes('429')) {
          setErrorMessage('Слишком много запросов. Попробуйте через несколько секунд.')
        } else if (error.message.includes('Network Error')) {
          setErrorMessage('Ошибка подключения к серверу. Проверьте интернет-соединение.')
        } else {
          setErrorMessage(`Ошибка авторизации: ${error.message}`)
        }
      } else {
        setErrorMessage('Неизвестная ошибка при авторизации')
      }
    }
  }

  // Редиректим на Дашборд, когда user появился
  useEffect(() => {
    if (user) {
      navigate(ROUTES.DASHBOARD)
    }
  }, [user, navigate])

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
        
        {/* Сообщение об ошибке */}
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">
                  {errorMessage}
                </p>
              </div>
            </div>
          </div>
        )}
        
        <div className="mt-8 space-y-6">
          <div>
            <button
              onClick={handleTelegramLogin}
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Авторизация...
                </>
              ) : (
                <>
                  <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                    <svg className="h-5 w-5 text-blue-500 group-hover:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                  </span>
                  Войти через Telegram
                </>
              )}
            </button>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Если у вас возникли проблемы с авторизацией, обратитесь к администратору
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login 