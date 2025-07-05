import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ROUTES } from '../config'

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
        const error = searchParams.get('error')

        console.log('VK OAuth callback params:', { code, state, error })

        if (error) {
          setError(`Ошибка авторизации VK ID: ${error}`)
          return
        }

        if (!code) {
          setError('Код авторизации не получен')
          return
        }

        // Отправляем код на бэкенд для обмена на токены
        const response = await fetch('/api/auth/vk-callback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code })
        })

        if (response.ok) {
          const data = await response.json()
          console.log('VK ID auth successful:', data)
          setMessage('VK ID авторизация успешна! Перенаправление...')
          
          // Перенаправляем на профиль
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