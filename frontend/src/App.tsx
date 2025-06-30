import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Navbar from './components/Navbar'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import Upload from './pages/Upload'
import TestAuth from './pages/TestAuth'
import DebugInfo from './components/DebugInfo'
import './App.css'

// Определяем базовый путь для GitHub Pages
const basename = import.meta.env.MODE === 'production' ? '/adstat' : '/'

// Компонент для инициализации Telegram аутентификации
const TelegramAuthInitializer = () => {
  const { login, user, loading } = useAuth()
  const [hasAttemptedAuth, setHasAttemptedAuth] = React.useState(false)

  React.useEffect(() => {
    const initTelegramAuth = async () => {
      console.log('🔍 TelegramAuthInitializer: Начинаем инициализацию')
      console.log('🔍 TelegramAuthInitializer: user =', user)
      console.log('🔍 TelegramAuthInitializer: loading =', loading)
      console.log('🔍 TelegramAuthInitializer: hasAttemptedAuth =', hasAttemptedAuth)
      console.log('🔍 TelegramAuthInitializer: window.Telegram =', window.Telegram)
      console.log('🔍 TelegramAuthInitializer: window.Telegram?.WebApp =', window.Telegram?.WebApp)
      
      // Защита от повторных попыток авторизации
      if (hasAttemptedAuth || user || loading) {
        console.log('❌ TelegramAuthInitializer: Пропускаем инициализацию - уже авторизован или в процессе')
        return
      }
      
      // Если Telegram WebApp недоступен, но есть данные в URL, создаем его
      if (!window.Telegram?.WebApp && window.location.hash.includes('tgWebAppData')) {
        console.log('🔧 TelegramAuthInitializer: Создаем Telegram WebApp из URL данных')
        
        const urlData = new URLSearchParams(window.location.hash.substring(1))
        const tgWebAppData = urlData.get('tgWebAppData')
        
        if (tgWebAppData) {
          try {
            const decoded = decodeURIComponent(tgWebAppData)
            const params = new URLSearchParams(decoded)
            
            const userStr = params.get('user')
            const user = userStr ? JSON.parse(userStr) : null
            
            window.Telegram = {
              WebApp: {
                initData: decoded,
                initDataUnsafe: {
                  user: user
                },
                platform: urlData.get('tgWebAppPlatform') || '',
                version: urlData.get('tgWebAppVersion') || '',
                ready: () => console.log('✅ Telegram WebApp ready'),
                expand: () => console.log('✅ Telegram WebApp expanded'),
                close: () => {},
                isExpanded: false,
                viewportHeight: 0,
                viewportStableHeight: 0,
                headerColor: '',
                backgroundColor: '',
                themeParams: {},
                colorScheme: 'light',
                isClosingConfirmationEnabled: false,
                BackButton: {
                  isVisible: false,
                  text: '',
                  show: () => {},
                  hide: () => {},
                  onClick: () => {},
                  offClick: () => {}
                },
                MainButton: {
                  text: '',
                  color: '',
                  textColor: '',
                  isVisible: false,
                  isProgressVisible: false,
                  isActive: false,
                  show: () => {},
                  hide: () => {},
                  enable: () => {},
                  disable: () => {},
                  showProgress: () => {},
                  hideProgress: () => {},
                  onClick: () => {},
                  offClick: () => {}
                },
                HapticFeedback: {
                  impactOccurred: () => {},
                  notificationOccurred: () => {},
                  selectionChanged: () => {}
                },
                CloudStorage: {
                  getItem: async () => null,
                  setItem: async () => {},
                  getItems: async () => ({}),
                  removeItem: async () => {},
                  removeItems: async () => {}
                },
                showAlert: () => {},
                showConfirm: () => {},
                showPopup: () => {},
                showScanQrPopup: () => {},
                closeScanQrPopup: () => {},
                readTextFromClipboard: () => {},
                requestWriteAccess: () => {},
                requestContact: () => {},
                invokeCustomMethod: () => {},
                switchInlineQuery: () => {},
                openLink: () => {},
                openTelegramLink: () => {},
                openInvoice: () => {},
                setHeaderColor: () => {},
                setBackgroundColor: () => {},
                enableClosingConfirmation: () => {},
                disableClosingConfirmation: () => {},
                onEvent: () => {},
                offEvent: () => {},
                sendData: () => {},
                isVersionAtLeast: () => false
              }
            }
            
            console.log('✅ TelegramAuthInitializer: Telegram WebApp создан из URL:', window.Telegram.WebApp)
          } catch (error) {
            console.error('❌ TelegramAuthInitializer: Ошибка создания Telegram WebApp:', error)
          }
        }
      }
      
      if (window.Telegram?.WebApp && !user && !loading && !hasAttemptedAuth) {
        console.log('✅ TelegramAuthInitializer: Telegram WebApp доступен')
        const tg = window.Telegram.WebApp
        
        // Инициализируем WebApp
        tg.ready()
        tg.expand()
        
        console.log('✅ TelegramAuthInitializer: WebApp инициализирован')
        console.log('📊 TelegramAuthInitializer: initDataUnsafe =', tg.initDataUnsafe)
        console.log('📊 TelegramAuthInitializer: initData =', tg.initData)
        console.log('📊 TelegramAuthInitializer: platform =', tg.platform)
        console.log('📊 TelegramAuthInitializer: version =', tg.version)
        
        // Проверяем, есть ли данные пользователя от Telegram
        if (tg.initDataUnsafe?.user) {
          console.log('✅ TelegramAuthInitializer: Данные пользователя найдены')
          
          // Отмечаем, что попытка авторизации была сделана
          setHasAttemptedAuth(true)
          
          try {
            // Создаем объект с данными для авторизации
            // Важно: используем initData для проверки подписи
            const telegramData = {
              id: tg.initDataUnsafe.user.id,
              first_name: tg.initDataUnsafe.user.first_name,
              last_name: tg.initDataUnsafe.user.last_name || '',
              username: tg.initDataUnsafe.user.username || '',
              photo_url: tg.initDataUnsafe.user.photo_url || '',
              auth_date: Math.floor(Date.now() / 1000), // Текущее время в секундах
              hash: tg.initData // Это строка с подписью от Telegram
            }
            
            console.log('📤 TelegramAuthInitializer: Отправляем данные для авторизации:', telegramData)
            await login(telegramData)
            console.log('✅ TelegramAuthInitializer: Авторизация успешна!')
          } catch (error) {
            console.error('❌ TelegramAuthInitializer: Ошибка авторизации:', error)
            // Сбрасываем флаг, чтобы можно было попробовать снова
            setHasAttemptedAuth(false)
            // Если автоматическая авторизация не удалась, 
            // пользователь может войти вручную
          }
        } else {
          console.log('⚠️ TelegramAuthInitializer: Данные пользователя недоступны')
          console.log('📊 TelegramAuthInitializer: Доступные данные:', {
            initData: tg.initData,
            initDataUnsafe: tg.initDataUnsafe,
            platform: tg.platform,
            version: tg.version
          })
          // Отмечаем, что попытка была сделана, но данных нет
          setHasAttemptedAuth(true)
        }
      } else {
        console.log('❌ TelegramAuthInitializer: Telegram WebApp недоступен или пользователь уже авторизован')
        console.log('📊 TelegramAuthInitializer: Причины:', {
          hasTelegram: !!window.Telegram,
          hasWebApp: !!window.Telegram?.WebApp,
          userExists: !!user,
          isLoading: loading,
          hasAttempted: hasAttemptedAuth
        })
      }
    }

    initTelegramAuth()
  }, []) // Убираем зависимости, чтобы эффект запускался только один раз

  return <></>
}

function App() {
  return (
    <AuthProvider>
      <TelegramAuthInitializer />
      <Router basename={basename}>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/login" element={<Login />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/upload" element={<Upload />} />
              <Route path="/test" element={<TestAuth />} />
            </Routes>
          </main>
          <DebugInfo />
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App 