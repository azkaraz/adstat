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
    const state = urlParams.get('state')
    
    if (!code) {
      setStatus('error')
      setMessage('Не найден code в URL')
      setTimeout(() => navigate(ROUTES.PROFILE), 2000)
      return
    }
    
    // Получаем code_verifier из sessionStorage
    const codeVerifier = sessionStorage.getItem('vk_code_verifier')
    if (!codeVerifier) {
      setStatus('error')
      setMessage('Не найден code_verifier')
      setTimeout(() => navigate(ROUTES.PROFILE), 2000)
      return
    }
    
    // Проверяем state для безопасности
    const savedState = sessionStorage.getItem('vk_state')
    if (state !== savedState) {
      setStatus('error')
      setMessage('Неверный state параметр')
      setTimeout(() => navigate(ROUTES.PROFILE), 2000)
      return
    }
    
    // Очищаем sessionStorage
    sessionStorage.removeItem('vk_code_verifier')
    sessionStorage.removeItem('vk_state')
    
    authService.vkAuthCallback(code, codeVerifier)
      .then(() => {
        setStatus('success')
        setMessage('VK аккаунт успешно привязан!')
        setTimeout(() => navigate(ROUTES.PROFILE), 1500)
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