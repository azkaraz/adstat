import axios from 'axios'
import { API_BASE_URL, API_ROUTES } from '../config'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Интерцептор для добавления токена
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const sheetsService = {
  async disconnectGoogleAccount(): Promise<{ message: string }> {
    const response = await api.delete(API_ROUTES.SHEETS_DISCONNECT)
    return response.data
  },
  async connectGoogleSheet(sheetId: string): Promise<any> {
    const response = await api.post(API_ROUTES.SHEETS_CONNECT, { sheet_id: sheetId })
    return response.data
  },
} 