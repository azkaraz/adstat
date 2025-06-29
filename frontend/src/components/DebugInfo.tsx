import React from 'react'
import { useLocation } from 'react-router-dom'

const DebugInfo: React.FC = () => {
  const location = useLocation()
  
  // Получаем URL параметры
  const urlParams = new URLSearchParams(location.search)
  const params: any = {}
  
  for (const [key, value] of urlParams.entries()) {
    params[key] = value
  }
  
  // Проверяем Telegram WebApp
  const hasTelegramWebApp = !!window.Telegram?.WebApp
  const telegramUser = window.Telegram?.WebApp?.initDataUnsafe?.user
  const telegramInitData = window.Telegram?.WebApp?.initData

  // Дополнительная диагностика
  const userAgent = navigator.userAgent
  const isTelegramWebView = userAgent.includes('TelegramWebApp') || userAgent.includes('Telegram')

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-75 text-white p-4 rounded-lg text-xs max-w-sm">
      <h3 className="font-bold mb-2">Debug Info</h3>
      
      <div className="mb-2">
        <strong>URL Params:</strong>
        <pre className="text-xs overflow-auto">
          {JSON.stringify(params, null, 2)}
        </pre>
      </div>
      
      <div className="mb-2">
        <strong>Telegram WebApp:</strong> {hasTelegramWebApp ? 'Yes' : 'No'}
      </div>
      
      <div className="mb-2">
        <strong>User Agent:</strong>
        <div className="text-xs break-all">{userAgent}</div>
      </div>
      
      <div className="mb-2">
        <strong>Is Telegram WebView:</strong> {isTelegramWebView ? 'Yes' : 'No'}
      </div>
      
      {telegramUser && (
        <div className="mb-2">
          <strong>Telegram User:</strong>
          <pre className="text-xs overflow-auto">
            {JSON.stringify(telegramUser, null, 2)}
          </pre>
        </div>
      )}
      
      {telegramInitData && (
        <div className="mb-2">
          <strong>Init Data:</strong>
          <div className="text-xs break-all">{telegramInitData}</div>
        </div>
      )}
      
      <div>
        <strong>Current URL:</strong>
        <div className="text-xs break-all">{location.pathname + location.search}</div>
      </div>
    </div>
  )
}

export default DebugInfo 