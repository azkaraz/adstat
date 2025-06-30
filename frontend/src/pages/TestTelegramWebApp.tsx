import React, { useEffect, useState } from 'react'

const TestTelegramWebApp: React.FC = () => {
  const [telegramData, setTelegramData] = useState<any>(null)
  const [diagnostics, setDiagnostics] = useState<any>({})

  useEffect(() => {
    // Собираем диагностическую информацию
    const diag = {
      userAgent: navigator.userAgent,
      referrer: document.referrer,
      url: window.location.href,
      search: window.location.search,
      hash: window.location.hash,
      hasTelegram: !!window.Telegram,
      hasWebApp: !!window.Telegram?.WebApp,
      telegramScript: !!document.querySelector('script[src*="telegram"]'),
      isTelegramWebApp: navigator.userAgent.includes('TelegramWebApp'),
      referrerHasTelegram: document.referrer.includes('telegram'),
      urlHasTgWebApp: window.location.search.includes('tgWebApp') || window.location.hash.includes('tgWebApp')
    }
    
    setDiagnostics(diag)

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
  }, [])

  const copyDiagnostics = () => {
    const text = JSON.stringify(diagnostics, null, 2)
    navigator.clipboard.writeText(text)
    alert('Диагностика скопирована в буфер обмена!')
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">🔍 Тест Telegram WebApp</h1>
        
        {/* Статус */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">📊 Статус</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><strong>Telegram объект:</strong> {diagnostics.hasTelegram ? '✅ Да' : '❌ Нет'}</div>
            <div><strong>WebApp доступен:</strong> {diagnostics.hasWebApp ? '✅ Да' : '❌ Нет'}</div>
            <div><strong>Telegram скрипт:</strong> {diagnostics.telegramScript ? '✅ Загружен' : '❌ Не загружен'}</div>
            <div><strong>User-Agent Telegram:</strong> {diagnostics.isTelegramWebApp ? '✅ Да' : '❌ Нет'}</div>
            <div><strong>Referrer Telegram:</strong> {diagnostics.referrerHasTelegram ? '✅ Да' : '❌ Нет'}</div>
            <div><strong>URL содержит tgWebApp:</strong> {diagnostics.urlHasTgWebApp ? '✅ Да' : '❌ Нет'}</div>
          </div>
        </div>

        {/* Диагностика */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">🔧 Диагностика</h2>
            <button 
              onClick={copyDiagnostics}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              📋 Копировать
            </button>
          </div>
          <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto max-h-96">
            {JSON.stringify(diagnostics, null, 2)}
          </pre>
        </div>

        {/* Данные Telegram WebApp */}
        {telegramData && (
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-xl font-semibold mb-4">📱 Данные Telegram WebApp</h2>
            <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto max-h-96">
              {JSON.stringify(telegramData, null, 2)}
            </pre>
          </div>
        )}

        {/* Инструкции */}
        <div className="bg-blue-50 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">📋 Инструкции</h2>
          <div className="space-y-2 text-sm">
            <p><strong>1.</strong> Откройте @BotFather в Telegram</p>
            <p><strong>2.</strong> Отправьте команду <code>/newapp</code></p>
            <p><strong>3.</strong> Выберите вашего бота</p>
            <p><strong>4.</strong> Введите название: <code>Ads Statistics Dashboard</code></p>
            <p><strong>5.</strong> Введите URL: <code>https://azkaraz.github.io/adstat/</code></p>
            <p><strong>6.</strong> Загрузите иконку</p>
            <p><strong>7.</strong> Откройте бота и нажмите кнопку WebApp</p>
            <p><strong>8.</strong> Проверьте эту страницу в контексте WebApp</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TestTelegramWebApp 