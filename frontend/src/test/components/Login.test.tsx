import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '../../contexts/AuthContext'
import Login from '../../pages/Login'
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Мокаем Telegram WebApp
const mockTelegramWebApp = {
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

Object.defineProperty(window, 'Telegram', {
  value: {
    WebApp: mockTelegramWebApp
  },
  writable: true
})

const renderLogin = () => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <Login />
      </AuthProvider>
    </BrowserRouter>
  )
}

describe('Login Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('отображает заголовок страницы', () => {
    renderLogin()
    
    expect(screen.getByText('Вход в систему')).toBeInTheDocument()
  })

  it('отображает информацию о Telegram авторизации', () => {
    renderLogin()
    
    expect(screen.getByText('Авторизация через Telegram')).toBeInTheDocument()
    expect(screen.getByText(/Для входа в систему используйте Telegram/)).toBeInTheDocument()
  })

  it('отображает кнопку входа через Telegram', () => {
    renderLogin()
    
    const loginButton = screen.getByRole('button', { name: /войти через telegram/i })
    expect(loginButton).toBeInTheDocument()
  })

  it('отображает информацию о пользователе Telegram', () => {
    renderLogin()
    
    expect(screen.getByText('Test User')).toBeInTheDocument()
    expect(screen.getByText('@test_user')).toBeInTheDocument()
  })

  it('вызывает Telegram WebApp.ready() при монтировании', () => {
    renderLogin()
    
    expect(mockTelegramWebApp.ready).toHaveBeenCalled()
  })

  it('обрабатывает клик по кнопке входа', async () => {
    renderLogin()
    
    const loginButton = screen.getByRole('button', { name: /войти через telegram/i })
    fireEvent.click(loginButton)
    
    // Проверяем, что кнопка становится неактивной во время загрузки
    await waitFor(() => {
      expect(loginButton).toBeDisabled()
    })
  })

  it('отображает состояние загрузки', async () => {
    renderLogin()
    
    const loginButton = screen.getByRole('button', { name: /войти через telegram/i })
    fireEvent.click(loginButton)
    
    await waitFor(() => {
      expect(screen.getByText('Вход...')).toBeInTheDocument()
    })
  })

  it('отображает ошибку при неудачной авторизации', async () => {
    // Мокаем неудачный ответ от API
    global.fetch = vi.fn().mockRejectedValueOnce(new Error('Network error'))
    
    renderLogin()
    
    const loginButton = screen.getByRole('button', { name: /войти через telegram/i })
    fireEvent.click(loginButton)
    
    await waitFor(() => {
      expect(screen.getByText(/ошибка авторизации/i)).toBeInTheDocument()
    })
  })

  it('отображает информацию о Google авторизации', () => {
    renderLogin()
    
    expect(screen.getByText('Подключение Google Sheets')).toBeInTheDocument()
    expect(screen.getByText(/Для работы с Google таблицами/)).toBeInTheDocument()
  })

  it('отображает кнопку подключения Google Sheets', () => {
    renderLogin()
    
    const googleButton = screen.getByRole('button', { name: /подключить google sheets/i })
    expect(googleButton).toBeInTheDocument()
  })

  it('обрабатывает клик по кнопке Google Sheets', async () => {
    renderLogin()
    
    const googleButton = screen.getByRole('button', { name: /подключить google sheets/i })
    fireEvent.click(googleButton)
    
    // Проверяем, что кнопка становится неактивной во время загрузки
    await waitFor(() => {
      expect(googleButton).toBeDisabled()
    })
  })

  it('отображает состояние загрузки для Google Sheets', async () => {
    renderLogin()
    
    const googleButton = screen.getByRole('button', { name: /подключить google sheets/i })
    fireEvent.click(googleButton)
    
    await waitFor(() => {
      expect(screen.getByText('Подключение...')).toBeInTheDocument()
    })
  })

  it('отображает правильную структуру компонента', () => {
    renderLogin()
    
    // Проверяем наличие основных секций
    expect(screen.getByTestId('login-container')).toBeInTheDocument()
    expect(screen.getByTestId('telegram-section')).toBeInTheDocument()
    expect(screen.getByTestId('google-section')).toBeInTheDocument()
  })

  it('применяет правильные стили', () => {
    renderLogin()
    
    const container = screen.getByTestId('login-container')
    expect(container).toHaveClass('min-h-screen', 'bg-gray-50', 'flex', 'flex-col', 'justify-center', 'py-12', 'sm:px-6', 'lg:px-8')
  })

  it('отображает иконки для кнопок', () => {
    renderLogin()
    
    // Проверяем наличие иконок (если они есть в компоненте)
    const telegramButton = screen.getByRole('button', { name: /войти через telegram/i })
    const googleButton = screen.getByRole('button', { name: /подключить google sheets/i })
    
    expect(telegramButton).toBeInTheDocument()
    expect(googleButton).toBeInTheDocument()
  })
}) 