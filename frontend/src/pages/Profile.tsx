import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

const Profile: React.FC = () => {
  const { user, token } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [sheetId, setSheetId] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    
    setEmail(user.email || '')
  }, [user, navigate])

  const handleUpdateEmail = async () => {
    if (!email.trim()) return

    setLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ email })
      })

      if (response.ok) {
        setMessage('Email успешно обновлен')
      } else {
        const error = await response.json()
        setMessage(`Ошибка: ${error.detail}`)
      }
    } catch (error) {
      setMessage(`Ошибка: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const handleConnectSheet = async () => {
    if (!sheetId.trim()) return

    setLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/sheets/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ sheet_id: sheetId })
      })

      if (response.ok) {
        setMessage('Google таблица успешно подключена')
        setSheetId('')
        // Обновляем страницу для отображения нового статуса
        window.location.reload()
      } else {
        const error = await response.json()
        setMessage(`Ошибка: ${error.detail}`)
      }
    } catch (error) {
      setMessage(`Ошибка: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const handleDisconnectSheet = async () => {
    setLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/sheets/disconnect', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        setMessage('Google таблица отключена')
        // Обновляем страницу для отображения нового статуса
        window.location.reload()
      } else {
        const error = await response.json()
        setMessage(`Ошибка: ${error.detail}`)
      }
    } catch (error) {
      setMessage(`Ошибка: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return null
  }

  return (
    <div className="max-w-4xl mx-auto px-2 sm:px-4">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Профиль пользователя
        </h1>
        <p className="mt-2 text-gray-600 text-sm sm:text-base">
          Управляйте настройками вашего аккаунта
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
        {/* Информация о пользователе */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Информация о пользователе
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Telegram ID
              </label>
              <p className="mt-1 text-sm text-gray-900">{user.telegram_id}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Имя
              </label>
              <p className="mt-1 text-sm text-gray-900">
                {user.first_name} {user.last_name}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <p className="mt-1 text-sm text-gray-900">
                @{user.username || 'Не указан'}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="mt-1 flex space-x-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Введите email"
                />
                <button
                  onClick={handleUpdateEmail}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md disabled:opacity-50"
                >
                  {loading ? 'Сохранение...' : 'Сохранить'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Google Sheets */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Google Sheets
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Статус подключения
              </label>
              <p className="mt-1 text-sm">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  user.has_google_sheet
                    ? 'text-green-800 bg-green-100'
                    : 'text-red-800 bg-red-100'
                }`}>
                  {user.has_google_sheet ? 'Подключена' : 'Не подключена'}
                </span>
              </p>
            </div>
            
            {!user.has_google_sheet ? (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  ID Google таблицы
                </label>
                <div className="mt-1 flex space-x-2">
                  <input
                    type="text"
                    value={sheetId}
                    onChange={(e) => setSheetId(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Введите ID таблицы"
                  />
                  <button
                    onClick={handleConnectSheet}
                    disabled={loading || !sheetId.trim()}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md disabled:opacity-50"
                  >
                    {loading ? 'Подключение...' : 'Подключить'}
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  ID таблицы можно найти в URL: https://docs.google.com/spreadsheets/d/[ID]/edit
                </p>
              </div>
            ) : (
              <button
                onClick={handleDisconnectSheet}
                disabled={loading}
                className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md disabled:opacity-50"
              >
                {loading ? 'Отключение...' : 'Отключить Google таблицу'}
              </button>
            )}
          </div>
        </div>
      </div>

      {message && (
        <div className={`mt-6 p-4 rounded-md ${
          message.includes('Ошибка')
            ? 'bg-red-50 text-red-700 border border-red-200'
            : 'bg-green-50 text-green-700 border border-green-200'
        }`}>
          <p className="text-sm font-medium">{message}</p>
        </div>
      )}
    </div>
  )
}

export default Profile 