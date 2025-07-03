// Конфигурация для разных окружений
const environment = import.meta.env.MODE || 'development'
export const API_BASE_URL = environment === 'production'
  ? 'https://458f-2a12-5940-a96b-00-2.ngrok-free.app'
  : 'http://localhost:8000' // Локальный адрес для разработки

// Telegram Bot Token (должен быть в .env файле)
export const TELEGRAM_BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN

// Домен для Telegram Apps
export const APP_DOMAIN = import.meta.env.VITE_APP_DOMAIN || 
  (environment === 'production' ? 'https://azkaraz.github.io' : window.location.origin)

// URL для Telegram авторизации
export const TELEGRAM_AUTH_URL = environment === 'production' 
  ? 'https://azkaraz.github.io/adstat/' 
  : 'http://localhost:3000'

// Централизованные маршруты и редиректы
export const ROUTES = {
  LOGIN: '/login',
  PROFILE: '/profile',
  DASHBOARD: '/',
  UPLOAD: '/upload',
  GOOGLE_OAUTH_CALLBACK: '/google-oauth-callback',
  VK_OAUTH_CALLBACK: '/vk-oauth-callback',
}

export const API_ROUTES = {
  AUTH_TELEGRAM: '/api/auth/telegram',
  AUTH_WEBAPP_TELEGRAM: '/api/auth/web-app/auth/telegram',
  USER_PROFILE: '/api/user/profile',
  USER_REPORTS: '/api/user/reports',
  UPLOAD_REPORT: '/api/upload/report',
  UPLOAD_REPORT_STATUS: (id: number|string) => `/api/upload/report/${id}/status`,
  SHEETS_CONNECT: '/api/sheets/connect',
  SHEETS_INFO: '/api/sheets/info',
  SHEETS_DISCONNECT: '/api/sheets/disconnect',
  SHEETS_REPORT: (id: number|string) => `/api/sheets/report/${id}`,
  SHEETS_WRITE: '/api/sheets/write',
  AUTH_GOOGLE_URL: '/api/auth/google/url',
  AUTH_GOOGLE_CALLBACK: '/api/auth/google/callback',
  AUTH_GOOGLE_SPREADSHEETS: '/api/auth/google/spreadsheets',
  AUTH_VK_URL: '/api/auth/vk/url',
  AUTH_VK_CALLBACK: '/api/auth/vk/callback',
}

console.log('Environment:', environment)
console.log('API Base URL:', API_BASE_URL)
console.log('App Domain:', APP_DOMAIN)
console.log('Current location:', window.location.href)
console.log('Current pathname:', window.location.pathname) 