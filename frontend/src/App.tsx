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

// Компонент для инициализации Telegram аутентификации
const TelegramAuthInitializer = () => {
  const { login, user, loading } = useAuth()

  React.useEffect(() => {
    const initTelegramAuth = async () => {
      console.log('🔍 TelegramAuthInitializer: Начинаем инициализацию')
      console.log('🔍 TelegramAuthInitializer: user =', user)
      console.log('🔍 TelegramAuthInitializer: loading =', loading)
      console.log('🔍 TelegramAuthInitializer: window.Telegram =', window.Telegram)
      console.log('🔍 TelegramAuthInitializer: window.Telegram?.WebApp =', window.Telegram?.WebApp)
      
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
                expand: () => console.log('✅ Telegram WebApp expanded')
              }
            }
            
            console.log('✅ TelegramAuthInitializer: Telegram WebApp создан из URL:', window.Telegram.WebApp)
          } catch (error) {
            console.error('❌ TelegramAuthInitializer: Ошибка создания Telegram WebApp:', error)
          }
        }
      }
      
      if (window.Telegram?.WebApp && !user && !loading) {
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
        }
      } else {
        console.log('❌ TelegramAuthInitializer: Telegram WebApp недоступен или пользователь уже авторизован')
        console.log('📊 TelegramAuthInitializer: Причины:', {
          hasTelegram: !!window.Telegram,
          hasWebApp: !!window.Telegram?.WebApp,
          userExists: !!user,
          isLoading: loading
        })
      }
    }

    initTelegramAuth()
  }, [login, user, loading])

  return <></>
}

function App() {
  return (
    <AuthProvider>
      <TelegramAuthInitializer />
      <Router>
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