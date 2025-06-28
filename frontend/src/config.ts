// Конфигурация для разных окружений
const config = {
  development: {
    apiBaseUrl: 'http://localhost:8000',
  },
  production: {
    apiBaseUrl: process.env.VITE_API_BASE_URL || 'https://your-backend-domain.com',
  },
  staging: {
    apiBaseUrl: process.env.VITE_API_BASE_URL || 'https://your-staging-backend.com',
  }
}

const environment = import.meta.env.MODE || 'development'
export const API_BASE_URL = config[environment as keyof typeof config]?.apiBaseUrl || config.development.apiBaseUrl

// Telegram Bot Token (должен быть в .env файле)
export const TELEGRAM_BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN

// Домен для Telegram Apps
export const APP_DOMAIN = import.meta.env.VITE_APP_DOMAIN || 
  (environment === 'production' ? 'https://azkaraz.github.io' : window.location.origin) 