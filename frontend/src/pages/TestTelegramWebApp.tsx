import React, { useState } from 'react'
import { authService } from '../services/authService'

const TestTelegramWebApp: React.FC = () => {
  const [initData, setInitData] = useState('')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')

  const handleTest = async () => {
    if (!initData.trim()) {
      setError('Введите initData')
      return
    }

    setLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await authService.telegramWebAppAuth({ initData })
      setResult(response)
      console.log('✅ WebApp auth successful:', response)
    } catch (err: any) {
      setError(err.message || 'Ошибка авторизации')
      console.error('❌ WebApp auth failed:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleGetFromTelegram = () => {
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp
      setInitData(tg.initData || '')
      console.log('📊 Telegram WebApp data:', {
        initData: tg.initData,
        initDataUnsafe: tg.initDataUnsafe,
        platform: tg.platform,
        version: tg.version
      })
    } else {
      setError('Telegram WebApp недоступен')
    }
  }

  const handleTestWithMockData = () => {
    // Тестовые данные в формате initData
    const mockInitData = 'user=%7B%22id%22%3A123456789%2C%22first_name%22%3A%22Test%22%2C%22last_name%22%3A%22User%22%2C%22username%22%3A%22testuser%22%7D&auth_date=1234567890&hash=mock_hash'
    setInitData(mockInitData)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Тест Telegram WebApp Auth</h1>
      
      <div className="bg-gray-100 p-6 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-4">Информация о Telegram WebApp</h2>
        <div className="space-y-2">
          <p><strong>Telegram доступен:</strong> {window.Telegram ? '✅ Да' : '❌ Нет'}</p>
          <p><strong>WebApp доступен:</strong> {window.Telegram?.WebApp ? '✅ Да' : '❌ Нет'}</p>
          {window.Telegram?.WebApp && (
            <>
              <p><strong>Platform:</strong> {window.Telegram.WebApp.platform}</p>
              <p><strong>Version:</strong> {window.Telegram.WebApp.version}</p>
              <p><strong>initData:</strong> {window.Telegram.WebApp.initData || 'Нет данных'}</p>
              <p><strong>initDataUnsafe:</strong> {JSON.stringify(window.Telegram.WebApp.initDataUnsafe, null, 2)}</p>
            </>
          )}
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Тест авторизации</h2>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            initData:
          </label>
          <textarea
            value={initData}
            onChange={(e) => setInitData(e.target.value)}
            className="w-full h-32 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Введите initData строку..."
          />
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={handleGetFromTelegram}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Получить из Telegram
          </button>
          <button
            onClick={handleTestWithMockData}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Тестовые данные
          </button>
          <button
            onClick={handleTest}
            disabled={loading}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          >
            {loading ? 'Тестируем...' : 'Тестировать'}
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            <strong>Ошибка:</strong> {error}
          </div>
        )}

        {result && (
          <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded">
            <h3 className="font-semibold mb-2">✅ Успешная авторизация:</h3>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>

      <div className="mt-6 bg-yellow-100 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">📋 Инструкции:</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>Откройте приложение через Telegram WebApp</li>
          <li>Нажмите "Получить из Telegram" для автоматического заполнения</li>
          <li>Или введите initData вручную</li>
          <li>Нажмите "Тестировать" для проверки авторизации</li>
        </ol>
      </div>
    </div>
  )
}

export default TestTelegramWebApp 