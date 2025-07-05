import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { authService } from '../services/authService'
import { sheetsService } from '../services/sheetsService'
import { ROUTES, API_ROUTES } from '../config'
import * as VKID from '@vkid/sdk'

const Profile: React.FC = () => {
  const { user, token } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [googleLinked, setGoogleLinked] = useState(false)
  const [vkLinked, setVkLinked] = useState(false)
  const [spreadsheets, setSpreadsheets] = useState<{ id: string, name: string }[]>([])
  const [selectedSheetId, setSelectedSheetId] = useState('')
  const [loadingSheets, setLoadingSheets] = useState(false)
  const vkIdContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!user) {
      navigate(ROUTES.LOGIN)
      return
    }
    setEmail(user.email || '')
    setGoogleLinked(!!user.has_google_account || !!user.has_google_sheet)
    setVkLinked(!!user.has_vk_account)
    if (user.has_google_account || user.has_google_sheet) {
      fetchSpreadsheets()
    }
    
    // Инициализируем VK ID SDK при загрузке компонента
    const initVkId = () => {
      try {
        console.log('Инициализация VK ID SDK...')
        
        // Инициализируем VK ID SDK
        VKID.Config.init({
          app: 53860967,
          redirectUrl: 'https://azkaraz.github.io/adstat/vk-oauth-callback'
        })
        
        console.log('VK ID SDK успешно инициализирован')
        
        // Создаем OneTap виджет
        if (vkIdContainerRef.current) {
          const oneTap = new VKID.OneTap()
          oneTap.render({ 
            container: vkIdContainerRef.current,
            showAlternativeLogin: true
          })
          
          // Обработка успешной авторизации
          oneTap.on(VKID.OneTapInternalEvents.LOGIN_SUCCESS, (data: any) => {
            console.log('VK ID авторизация успешна:', data)
            handleVkIdSuccess(data)
          })
          
          // Обработка ошибок
          oneTap.on(VKID.WidgetEvents.ERROR, (error: any) => {
            console.error('VK ID ошибка:', error)
            setMessage(`Ошибка VK ID авторизации: ${error.message || 'Неизвестная ошибка'}`)
          })
        }
      } catch (error) {
        console.error('VK ID initialization error:', error)
        setMessage(`Ошибка инициализации VK ID: ${error}`)
      }
    }
    
    initVkId()
  }, [user, navigate])







  const handleVkIdSuccess = async (data: any) => {
    try {
      console.log('Обработка успешной VK ID авторизации:', data)
      
      // Отправляем данные на бэкенд
      const response = await fetch('/api/auth/vk-callback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          code: data.code,
          device_id: data.device_id 
        })
      })

      if (response.ok) {
        const result = await response.json()
        console.log('VK ID авторизация успешна:', result)
        setMessage('VK ID авторизация успешна!')
        // Обновляем данные пользователя через перезагрузку страницы
        window.location.reload()
      } else {
        const error = await response.json()
        setMessage(`Ошибка обмена кода: ${error.detail}`)
      }
    } catch (error) {
      console.error('Ошибка обработки VK ID авторизации:', error)
      setMessage('Ошибка обработки VK ID авторизации')
    }
  }

  const fetchSpreadsheets = async () => {
    setLoadingSheets(true)
    try {
      const res = await authService.getGoogleSpreadsheets()
      setSpreadsheets(res.spreadsheets)
    } catch (e) {
      setMessage('Ошибка загрузки таблиц Google')
    } finally {
      setLoadingSheets(false)
    }
  }

  const handleUpdateEmail = async () => {
    if (!email.trim()) return
    setLoading(true)
    setMessage('')
    try {
      const response = await fetch(API_ROUTES.USER_PROFILE, {
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

  const handleGoogleLink = async () => {
    setLoading(true)
    setMessage('')
    try {
      const res = await authService.getGoogleAuthUrl()
      window.location.href = res.auth_url
    } catch (e) {
      setMessage('Ошибка получения ссылки Google OAuth')
    } finally {
      setLoading(false)
    }
  }

  const handleConnectSheet = async () => {
    if (!selectedSheetId) return
    setLoading(true)
    setMessage('')
    try {
      await sheetsService.connectGoogleSheet(selectedSheetId)
      setMessage('Google таблица успешно подключена')
      window.location.reload()
    } catch (error: any) {
      if (error.response && error.response.data && error.response.data.detail) {
        setMessage(`Ошибка: ${error.response.data.detail}`)
      } else {
        setMessage(`Ошибка: ${error.message || error}`)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDisconnectGoogle = async () => {
    setLoading(true)
    setMessage('')
    try {
      const res = await sheetsService.disconnectGoogleAccount()
      setMessage(res.message || 'Google-аккаунт успешно отключён')
      window.location.reload()
    } catch (error: any) {
      if (error.response && error.response.data && error.response.data.detail) {
        setMessage(`Ошибка: ${error.response.data.detail}`)
      } else {
        setMessage(`Ошибка: ${error.message || error}`)
      }
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

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
                  googleLinked
                    ? 'text-green-800 bg-green-100'
                    : 'text-red-800 bg-red-100'
                }`}>
                  {googleLinked ? 'Google-аккаунт привязан' : 'Не привязан'}
                </span>
              </p>
            </div>
            {!googleLinked ? (
              <button
                onClick={handleGoogleLink}
                disabled={loading}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md disabled:opacity-50"
              >
                {loading ? 'Переход...' : 'Привязать Google-аккаунт'}
              </button>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Выберите Google таблицу
                  </label>
                  {loadingSheets ? (
                    <div className="text-sm text-gray-500">Загрузка таблиц...</div>
                  ) : (
                    <select
                      value={selectedSheetId}
                      onChange={e => setSelectedSheetId(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">-- Выберите таблицу --</option>
                      {spreadsheets.map(sheet => (
                        <option key={sheet.id} value={sheet.id}>{sheet.name}</option>
                      ))}
                    </select>
                  )}
                </div>
                <button
                  onClick={handleConnectSheet}
                  disabled={loading || !selectedSheetId}
                  className="w-full mt-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md disabled:opacity-50"
                >
                  {loading ? 'Подключение...' : 'Подключить выбранную таблицу'}
                </button>
                <button
                  onClick={handleDisconnectGoogle}
                  disabled={loading}
                  className="w-full mt-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md disabled:opacity-50"
                >
                  {loading ? 'Отключение...' : 'Отключить Google-аккаунт'}
                </button>
              </>
            )}
          </div>
        </div>
        {/* VK Ads */}
        <div className="bg-white shadow rounded-lg p-6 mt-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            VK Реклама
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Статус подключения
              </label>
              <p className="mt-1 text-sm">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  vkLinked
                    ? 'text-green-800 bg-green-100'
                    : 'text-red-800 bg-red-100'
                }`}>
                  {vkLinked ? 'VK-аккаунт привязан' : 'Не привязан'}
                </span>
              </p>
            </div>
            {!vkLinked && (
              <>
                <div 
                  ref={vkIdContainerRef}
                  id="VkIdSdkOneTap"
                  className="w-full"
                />
              </>
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