import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { authService } from '../services/authService'
import { sheetsService } from '../services/sheetsService'
import { ROUTES, API_ROUTES, API_BASE_URL } from '../config'
// Удаляем импорт VKID SDK
// import * as VKID from '@vkid/sdk'

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
  }, [user, navigate])







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

  // --- VK ID PKCE генерация ---
  function generateRandomString(length: number) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_' // VK рекомендует a-z, A-Z, 0-9, _, -
    let result = ''
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }
  function base64urlencode(bytes: Uint8Array) {
    let str = ''
    for (let i = 0; i < bytes.length; i++) {
      str += String.fromCharCode(bytes[i])
    }
    return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
  }
  async function sha256base64(str: string) {
    const encoder = new TextEncoder()
    const data = encoder.encode(str)
    const hash = await window.crypto.subtle.digest('SHA-256', data)
    return base64urlencode(new Uint8Array(hash))
  }
  async function startVkIdAuth() {
    const code_verifier = generateRandomString(64)
    const code_challenge = await sha256base64(code_verifier)
    const state = generateRandomString(32)
    console.log('[VKID] Перед редиректом:', { code_verifier, code_challenge, state })
    localStorage.setItem('vk_code_verifier', code_verifier)
    localStorage.setItem('vk_state', state)
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: '53860967', // заменить на переменную, если нужно
      redirect_uri: 'https://azkaraz.github.io/adstat/vk-oauth-callback',
      code_challenge,
      code_challenge_method: 'S256',
      state,
      scope: 'email phone'
    })
    window.location.href = `https://id.vk.com/authorize?${params.toString()}`
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
              <button
                onClick={startVkIdAuth}
                className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Привязать ВК
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