import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ROUTES, API_BASE_URL } from '../config'

const VKOAuthCallback: React.FC = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [message, setMessage] = useState('Обработка авторизации VK ID...')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code')
        const state = searchParams.get('state')
        const device_id = searchParams.get('device_id')
        const error = searchParams.get('error')

        // Получаем сохранённые значения PKCE и state
        const code_verifier = localStorage.getItem('vk_code_verifier')
        const state_original = localStorage.getItem('vk_state')
        console.log('[VKID] После редиректа:', { code, state, device_id, error, code_verifier, state_original })

        if (error) {
          setError(`Ошибка авторизации VK ID: ${error}`)
          return
        }

        if (!code) {
          setError('Код авторизации не получен')
          return
        }
        if (!device_id) {
          setError('device_id не получен')
          return
        }
        if (!code_verifier) {
          setError('code_verifier не найден (авторизация не инициирована корректно)')
          return
        }
        if (!state || !state_original || state !== state_original) {
          setError('Ошибка безопасности: state не совпадает!')
          return
        }

        // Отправляем code, device_id, code_verifier на backend
        const response = await fetch(`${API_BASE_URL}/api/auth/vk-callback`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code, device_id, code_verifier })
        })

        if (response.ok) {
          const data = await response.json()
          console.log('VK ID auth successful:', data)
          setMessage('VK ID авторизация успешна! Перенаправление...')
          // Очищаем PKCE и state
          localStorage.removeItem('vk_code_verifier')
          localStorage.removeItem('vk_state')
          setTimeout(() => {
            navigate(ROUTES.PROFILE)
          }, 2000)
        } else {
          const errorData = await response.json()
          setError(`Ошибка обмена кода: ${errorData.detail || 'Неизвестная ошибка'}`)
        }
      } catch (err: any) {
        console.error('VK OAuth callback error:', err)
        setError(`Ошибка обработки callback: ${err.message || 'Неизвестная ошибка'}`)
      }
    }

    handleCallback()
  }, [searchParams, navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              VK ID Авторизация
            </h2>
            
            {error ? (
              <div className="text-red-600">
                <p className="text-sm">{error}</p>
                <button
                  onClick={() => navigate(ROUTES.PROFILE)}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Вернуться в профиль
                </button>
              </div>
            ) : (
              <div className="text-gray-600">
                <p className="text-sm">{message}</p>
                <div className="mt-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default VKOAuthCallback 