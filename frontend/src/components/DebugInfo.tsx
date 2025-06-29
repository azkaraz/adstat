import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'

// Debug component updated: 2024-06-29 11:40
const DebugInfo: React.FC = () => {
  const { user, token } = useAuth()
  const [telegramData, setTelegramData] = useState<any>(null)
  const [logs, setLogs] = useState<string[]>([])

  useEffect(() => {
    // Перехватываем console.log для отображения в UI
    const originalLog = console.log
    const originalError = console.error
    
    console.log = (...args) => {
      originalLog.apply(console, args)
      setLogs(prev => [...prev, `LOG: ${args.join(' ')}`])
    }
    
    console.error = (...args) => {
      originalError.apply(console, args)
      setLogs(prev => [...prev, `ERROR: ${args.join(' ')}`])
    }

    // Получаем данные Telegram WebApp
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp
      setTelegramData({
        initData: tg.initData,
        initDataUnsafe: tg.initDataUnsafe,
        platform: tg.platform,
        version: tg.version,
        isExpanded: tg.isExpanded,
        viewportHeight: tg.viewportHeight,
        colorScheme: tg.colorScheme
      })
    }

    return () => {
      console.log = originalLog
      console.error = originalError
    }
  }, [])

  const clearLogs = () => {
    setLogs([])
  }

  const copyLogs = () => {
    navigator.clipboard.writeText(logs.join('\n'))
    alert('Логи скопированы в буфер обмена!')
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-w-md max-h-96 overflow-auto">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-semibold">Debug Info</h3>
        <div className="space-x-2">
          <button 
            onClick={clearLogs}
            className="text-xs bg-gray-200 px-2 py-1 rounded"
          >
            Очистить
          </button>
          <button 
            onClick={copyLogs}
            className="text-xs bg-blue-200 px-2 py-1 rounded"
          >
            Копировать
          </button>
        </div>
      </div>
      
      <div className="text-xs space-y-1">
        <div><strong>URL Params:</strong> {JSON.stringify(new URLSearchParams(window.location.search))}</div>
        <div><strong>Telegram WebApp:</strong> {window.Telegram?.WebApp ? 'Yes' : 'No'}</div>
        <div><strong>Current URL:</strong> {window.location.pathname}</div>
        <div><strong>User:</strong> {user ? 'Logged in' : 'Not logged in'}</div>
        <div><strong>Token:</strong> {token ? 'Present' : 'Missing'}</div>
        
        {telegramData && (
          <div className="mt-2">
            <strong>Telegram Data:</strong>
            <div className="bg-gray-100 p-2 rounded text-xs">
              <div>Platform: {telegramData.platform}</div>
              <div>Version: {telegramData.version}</div>
              <div>User: {telegramData.initDataUnsafe?.user ? 'Yes' : 'No'}</div>
              <div>Init Data: {telegramData.initData ? 'Present' : 'Missing'}</div>
            </div>
          </div>
        )}
        
        <div className="mt-2">
          <strong>Recent Logs:</strong>
          <div className="bg-gray-100 p-2 rounded text-xs max-h-32 overflow-auto">
            {logs.slice(-10).map((log, index) => (
              <div key={index} className="mb-1">
                {log}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DebugInfo 