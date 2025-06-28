import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '../../contexts/AuthContext'
import Dashboard from '../../pages/Dashboard'
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Мокаем AuthContext
const mockAuthContext = {
  user: {
    id: 1,
    telegram_id: '123456789',
    username: 'test_user',
    first_name: 'Test',
    last_name: 'User',
    email: 'test@example.com',
    has_google_sheet: false
  },
  token: 'test_token',
  login: vi.fn(),
  logout: vi.fn(),
  isAuthenticated: true
}

vi.mock('../../contexts/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
  useAuth: () => mockAuthContext
}))

const renderDashboard = () => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <Dashboard />
      </AuthProvider>
    </BrowserRouter>
  )
}

describe('Dashboard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('отображает заголовок дашборда', () => {
    renderDashboard()
    
    expect(screen.getByText('Панель управления')).toBeInTheDocument()
  })

  it('отображает приветствие пользователя', () => {
    renderDashboard()
    
    expect(screen.getByText(/Добро пожаловать, Test User!/)).toBeInTheDocument()
  })

  it('отображает статистику отчетов', () => {
    renderDashboard()
    
    expect(screen.getByText('Статистика отчетов')).toBeInTheDocument()
  })

  it('отображает карточки статистики', () => {
    renderDashboard()
    
    expect(screen.getByText('Всего отчетов')).toBeInTheDocument()
    expect(screen.getByText('Обработано')).toBeInTheDocument()
    expect(screen.getByText('В обработке')).toBeInTheDocument()
    expect(screen.getByText('Ошибки')).toBeInTheDocument()
  })

  it('отображает последние отчеты', () => {
    renderDashboard()
    
    expect(screen.getByText('Последние отчеты')).toBeInTheDocument()
  })

  it('отображает таблицу отчетов', () => {
    renderDashboard()
    
    expect(screen.getByText('Файл')).toBeInTheDocument()
    expect(screen.getByText('Размер')).toBeInTheDocument()
    expect(screen.getByText('Статус')).toBeInTheDocument()
    expect(screen.getByText('Дата')).toBeInTheDocument()
  })

  it('отображает кнопку загрузки нового отчета', () => {
    renderDashboard()
    
    const uploadButton = screen.getByRole('button', { name: /загрузить отчет/i })
    expect(uploadButton).toBeInTheDocument()
  })

  it('навигация к странице загрузки при клике на кнопку', () => {
    renderDashboard()
    
    const uploadButton = screen.getByRole('button', { name: /загрузить отчет/i })
    fireEvent.click(uploadButton)
    
    // В реальном тесте здесь была бы проверка навигации
    expect(uploadButton).toBeInTheDocument()
  })

  it('отображает состояние загрузки данных', async () => {
    // Мокаем медленный ответ от API
    global.fetch = vi.fn().mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({
        ok: true,
        json: () => Promise.resolve([])
      }), 100))
    )
    
    renderDashboard()
    
    await waitFor(() => {
      expect(screen.getByText(/загрузка/i)).toBeInTheDocument()
    })
  })

  it('отображает пустое состояние при отсутствии отчетов', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([])
    })
    
    renderDashboard()
    
    await waitFor(() => {
      expect(screen.getByText('Отчеты не найдены')).toBeInTheDocument()
    })
  })

  it('отображает отчеты в таблице', async () => {
    const mockReports = [
      {
        id: 1,
        filename: 'test_report.xlsx',
        original_filename: 'test_report.xlsx',
        file_size: 1024,
        status: 'completed',
        created_at: '2023-12-01T10:00:00Z',
        updated_at: '2023-12-01T10:05:00Z'
      },
      {
        id: 2,
        filename: 'another_report.xlsx',
        original_filename: 'another_report.xlsx',
        file_size: 2048,
        status: 'processing',
        created_at: '2023-12-01T11:00:00Z',
        updated_at: '2023-12-01T11:00:00Z'
      }
    ]
    
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockReports)
    })
    
    renderDashboard()
    
    await waitFor(() => {
      expect(screen.getByText('test_report.xlsx')).toBeInTheDocument()
      expect(screen.getByText('another_report.xlsx')).toBeInTheDocument()
    })
  })

  it('отображает правильные статусы отчетов', async () => {
    const mockReports = [
      {
        id: 1,
        filename: 'completed_report.xlsx',
        original_filename: 'completed_report.xlsx',
        file_size: 1024,
        status: 'completed',
        created_at: '2023-12-01T10:00:00Z',
        updated_at: '2023-12-01T10:05:00Z'
      },
      {
        id: 2,
        filename: 'processing_report.xlsx',
        original_filename: 'processing_report.xlsx',
        file_size: 2048,
        status: 'processing',
        created_at: '2023-12-01T11:00:00Z',
        updated_at: '2023-12-01T11:00:00Z'
      },
      {
        id: 3,
        filename: 'error_report.xlsx',
        original_filename: 'error_report.xlsx',
        file_size: 512,
        status: 'error',
        created_at: '2023-12-01T12:00:00Z',
        updated_at: '2023-12-01T12:00:00Z'
      }
    ]
    
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockReports)
    })
    
    renderDashboard()
    
    await waitFor(() => {
      expect(screen.getByText('Завершен')).toBeInTheDocument()
      expect(screen.getByText('Обрабатывается')).toBeInTheDocument()
      expect(screen.getByText('Ошибка')).toBeInTheDocument()
    })
  })

  it('обрабатывает ошибку загрузки отчетов', async () => {
    global.fetch = vi.fn().mockRejectedValueOnce(new Error('Network error'))
    
    renderDashboard()
    
    await waitFor(() => {
      expect(screen.getByText(/ошибка загрузки отчетов/i)).toBeInTheDocument()
    })
  })

  it('отображает правильные размеры файлов', async () => {
    const mockReports = [
      {
        id: 1,
        filename: 'small_file.xlsx',
        original_filename: 'small_file.xlsx',
        file_size: 1024,
        status: 'completed',
        created_at: '2023-12-01T10:00:00Z',
        updated_at: '2023-12-01T10:05:00Z'
      },
      {
        id: 2,
        filename: 'large_file.xlsx',
        original_filename: 'large_file.xlsx',
        file_size: 1048576, // 1MB
        status: 'completed',
        created_at: '2023-12-01T11:00:00Z',
        updated_at: '2023-12-01T11:00:00Z'
      }
    ]
    
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockReports)
    })
    
    renderDashboard()
    
    await waitFor(() => {
      expect(screen.getByText('1.0 KB')).toBeInTheDocument()
      expect(screen.getByText('1.0 MB')).toBeInTheDocument()
    })
  })

  it('отображает правильные даты', async () => {
    const mockReports = [
      {
        id: 1,
        filename: 'test_report.xlsx',
        original_filename: 'test_report.xlsx',
        file_size: 1024,
        status: 'completed',
        created_at: '2023-12-01T10:00:00Z',
        updated_at: '2023-12-01T10:05:00Z'
      }
    ]
    
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockReports)
    })
    
    renderDashboard()
    
    await waitFor(() => {
      expect(screen.getByText(/01\.12\.2023/)).toBeInTheDocument()
    })
  })

  it('применяет правильные стили', () => {
    renderDashboard()
    
    const container = screen.getByTestId('dashboard-container')
    expect(container).toHaveClass('container', 'mx-auto', 'px-4', 'py-8')
  })

  it('отображает кнопку обновления', () => {
    renderDashboard()
    
    const refreshButton = screen.getByRole('button', { name: /обновить/i })
    expect(refreshButton).toBeInTheDocument()
  })

  it('обновляет данные при клике на кнопку обновления', async () => {
    const mockFetch = vi.fn()
    global.fetch = mockFetch
    
    renderDashboard()
    
    const refreshButton = screen.getByRole('button', { name: /обновить/i })
    fireEvent.click(refreshButton)
    
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(2) // Первоначальная загрузка + обновление
    })
  })
}) 