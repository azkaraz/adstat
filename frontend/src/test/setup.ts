import '@testing-library/jest-dom'
import { beforeAll, afterEach, afterAll, vi } from 'vitest'
import { server } from './mocks/server'

// Устанавливаем MSW сервер для мокирования API
beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

// Мокаем window.Telegram для тестов
Object.defineProperty(window, 'Telegram', {
  value: {
    WebApp: {
      initData: 'test_init_data',
      initDataUnsafe: {
        user: {
          id: 123456789,
          first_name: 'Test',
          last_name: 'User',
          username: 'test_user'
        }
      },
      ready: vi.fn(),
      expand: vi.fn(),
      close: vi.fn()
    }
  },
  writable: true
})

// Мокаем localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

// Мокаем fetch
global.fetch = vi.fn()

// Мокаем ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Мокаем IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
})) 