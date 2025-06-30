// Конфигурация для разных окружений
const environment = import.meta.env.MODE || 'development'
export const API_BASE_URL = environment === 'production'
  ? 'https://005a-185-161-251-62.ngrok-free.app' // Адрес бэкенда для продакшена
  : 'https://005a-185-161-251-62.ngrok-free.app' // Адрес для разработки через ngrok

// Telegram Bot Token (должен быть в .env файле)
export const TELEGRAM_BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN

// Домен для Telegram Apps
export const APP_DOMAIN = import.meta.env.VITE_APP_DOMAIN || 
  (environment === 'production' ? 'https://azkaraz.github.io' : window.location.origin)

// URL для Telegram авторизации
export const TELEGRAM_AUTH_URL = environment === 'production' 
  ? 'https://azkaraz.github.io/adstat/' 
  : 'http://localhost:3000'

console.log('Environment:', environment)
console.log('API Base URL:', API_BASE_URL)
console.log('App Domain:', APP_DOMAIN)
console.log('Current location:', window.location.href)
console.log('Current pathname:', window.location.pathname) 