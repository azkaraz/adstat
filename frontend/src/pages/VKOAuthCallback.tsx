import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '../services/authService'
import { ROUTES } from '../config'
import { useAuth } from '../contexts/AuthContext'

const VKOAuthCallback: React.FC = () => {
  const navigate = useNavigate()
  const { token, login } = useAuth()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get('code')
    if (!code) {
      setStatus('error')
      setMessage('Не найден code в URL')
      setTimeout(() => navigate(ROUTES.PROFILE), 2000)
      return
    }
    authService.vkAuthCallback(code)
      .then(() => {
        setStatus('success')
        setMessage('VK аккаунт успешно привязан!')
        setTimeout(() => window.location.href = ROUTES.PROFILE, 1500)
      })
      .catch(() => {
        setStatus('error')
        setMessage('Ошибка при привязке VK аккаунта')
        setTimeout(() => navigate(ROUTES.PROFILE), 2000)
      })
  }, [navigate, token, login])

  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh]">
      {status === 'loading' && <p className="text-lg">Привязываем VK аккаунт...</p>}
      {status === 'success' && <p className="text-green-600 text-lg">{message}</p>}
      {status === 'error' && <p className="text-red-600 text-lg">{message}</p>}
    </div>
  )
}

export default VKOAuthCallback 