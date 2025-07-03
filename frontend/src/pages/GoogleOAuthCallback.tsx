import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '../services/authService'
import { ROUTES } from '../config'

const GoogleOAuthCallback: React.FC = () => {
  const navigate = useNavigate()
  // const { token, user } = useAuth() // удалено как неиспользуемое
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get('code')
    if (!code) {
      setStatus('error')
      setMessage('Не найден code в URL')
      return
    }
    authService.googleAuthCallback(code)
      .then(() => {
        // После успешной привязки обновляем профиль пользователя
        window.location.href = ROUTES.PROFILE
      })
      .catch(() => {
        setStatus('error')
        setMessage('Ошибка при привязке Google аккаунта')
      })
  }, [navigate])

  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh]">
      {status === 'loading' && <p className="text-lg">Привязываем Google аккаунт...</p>}
      {status === 'success' && <p className="text-green-600 text-lg">{message}</p>}
      {status === 'error' && <p className="text-red-600 text-lg">{message}</p>}
    </div>
  )
}

export default GoogleOAuthCallback 