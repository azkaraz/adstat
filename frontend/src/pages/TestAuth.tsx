import React, { useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'

const TestAuth: React.FC = () => {
  const { user, login, loading } = useAuth()

  const testTelegramAuth = async () => {
    console.log('Testing Telegram auth...')
    
    // Имитируем данные от Telegram
    const mockTelegramData = {
      id: 123456789,
      first_name: "Тестовый",
      last_name: "Пользователь",
      username: "test_user",
      photo_url: "https://t.me/i/userpic/320/test.jpg",
      auth_date: Math.floor(Date.now() / 1000),
      hash: "test_hash_for_development"
    }
    
    console.log('Mock Telegram data:', mockTelegramData)
    
    try {
      await login(mockTelegramData)
      console.log('Login successful!')
    } catch (error) {
      console.error('Login failed:', error)
    }
  }

  useEffect(() => {
    console.log('TestAuth component mounted')
    console.log('Current user:', user)
  }, [user])

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div>
          <h2 className="text-2xl font-bold text-center">Тест авторизации</h2>
          <p className="text-center text-gray-600 mt-2">
            Тестирование авторизации через Telegram
          </p>
        </div>
        
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold mb-2">Текущий пользователь:</h3>
            <pre className="text-sm bg-gray-100 p-2 rounded overflow-auto">
              {user ? JSON.stringify(user, null, 2) : 'Не авторизован'}
            </pre>
          </div>
          
          <button
            onClick={testTelegramAuth}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
          >
            Тест авторизации
          </button>
          
          <div className="bg-yellow-100 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Инструкции:</h3>
            <ol className="text-sm space-y-1">
              <li>1. Нажмите "Тест авторизации"</li>
              <li>2. Проверьте консоль браузера (F12)</li>
              <li>3. Посмотрите на результат выше</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TestAuth 