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
      if (window.Telegram?.WebApp && !user && !loading) {
        console.log('Initializing Telegram WebApp...')
        const tg = window.Telegram.WebApp
        
        // Инициализируем WebApp
        tg.ready()
        tg.expand()
        
        console.log('Telegram WebApp initialized')
        console.log('initDataUnsafe:', tg.initDataUnsafe)
        console.log('initData:', tg.initData)
        
        // Проверяем, есть ли данные пользователя от Telegram
        if (tg.initDataUnsafe?.user) {
          console.log('Telegram user data found, attempting auto-login...')
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
            
            console.log('Sending telegram data for auth:', telegramData)
            await login(telegramData)
            console.log('Auto-login successful!')
          } catch (error) {
            console.error('Auto-login failed:', error)
            // Если автоматическая авторизация не удалась, 
            // пользователь может войти вручную
          }
        } else {
          console.log('No Telegram user data available')
          console.log('Available data:', {
            initData: tg.initData,
            initDataUnsafe: tg.initDataUnsafe,
            platform: tg.platform,
            version: tg.version
          })
        }
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