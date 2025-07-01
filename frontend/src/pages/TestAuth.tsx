import React, { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { authService } from '../services/authService'

const TestAuth: React.FC = () => {
  const { user, token } = useAuth()
  const [telegramData, setTelegramData] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Получаем данные Telegram WebApp
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp
      setTelegramData({
        initData: tg.initData,
        initDataUnsafe: tg.initDataUnsafe,
        platform: tg.platform,
        version: tg.version
      })
    }
  }, [])

  const handleManualLogin = async () => {
    if (!window.Telegram?.WebApp?.initDataUnsafe?.user) {
      alert('Данные Telegram недоступны')
      return
    }

    setLoading(true)
    try {
      const tg = window.Telegram.WebApp
      await authService.telegramWebAppAuth({ initData: tg.initData })
      alert('Авторизация успешна!')
    } catch (error) {
      console.error('Ошибка авторизации:', error)
      alert('Ошибка авторизации: ' + (error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Тестирование Telegram Аутентификации
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Статус аутентификации */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Статус аутентификации</h2>
          <div className="space-y-2">
            <p><strong>Авторизован:</strong> {user ? 'Да' : 'Нет'}</p>
            {user && (
              <>
                <p><strong>ID:</strong> {user.id}</p>
                <p><strong>Telegram ID:</strong> {user.telegram_id}</p>
                <p><strong>Имя:</strong> {user.first_name}</p>
                <p><strong>Фамилия:</strong> {user.last_name}</p>
                <p><strong>Username:</strong> {user.username}</p>
                <p><strong>Токен:</strong> {token ? 'Есть' : 'Нет'}</p>
              </>
            )}
          </div>
        </div>

        {/* Данные Telegram WebApp */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Данные Telegram WebApp</h2>
          <div className="space-y-2">
            <p><strong>Доступен:</strong> {window.Telegram?.WebApp ? 'Да' : 'Нет'}</p>
            {telegramData && (
              <>
                <p><strong>Платформа:</strong> {telegramData.platform}</p>
                <p><strong>Версия:</strong> {telegramData.version}</p>
                <p><strong>Пользователь:</strong> {telegramData.initDataUnsafe?.user ? 'Есть' : 'Нет'}</p>
                <p><strong>Init Data:</strong> {telegramData.initData ? 'Есть' : 'Нет'}</p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Действия */}
      <div className="mt-8 bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Действия</h2>
        <div className="space-y-4">
          <button
            onClick={handleManualLogin}
            disabled={loading || !window.Telegram?.WebApp?.initDataUnsafe?.user}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md"
          >
            {loading ? 'Авторизация...' : 'Авторизоваться через Telegram'}
          </button>
          
          <button
            onClick={() => {
              console.log('Telegram WebApp data:', window.Telegram?.WebApp)
              console.log('User data:', user)
              console.log('Token:', token)
            }}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md ml-4"
          >
            Логировать данные в консоль
          </button>
        </div>
      </div>

      {/* Детальные данные */}
      {telegramData && (
        <div className="mt-8 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Детальные данные Telegram</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(telegramData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}

export default TestAuth 