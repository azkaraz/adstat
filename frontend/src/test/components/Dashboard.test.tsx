import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import Dashboard from '../../pages/Dashboard'

// Мокаем fetch
global.fetch = vi.fn()

// Мокаем useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate
  }
})

// Мокаем AuthContext
const mockUser = {
  id: 1,
  first_name: 'Test',
  last_name: 'User',
  username: 'testuser',
  has_google_sheet: false
}

const mockToken = 'mock-token'

const MockAuthProvider = ({ children }: { children: React.ReactNode }) => (
  <div data-testid="auth-provider">{children}</div>
)

vi.mock('../../contexts/AuthContext', () => ({
  AuthProvider: MockAuthProvider,
  useAuth: () => ({
    user: mockUser,
    token: mockToken,
    login: vi.fn(),
    logout: vi.fn()
  })
}))

describe('Dashboard Component', () => {
  const renderDashboard = () => {
    return render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    )
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('отображает приветствие пользователя', () => {
    renderDashboard()
    
    expect(screen.getByText(/Добро пожаловать, Test!/)).toBeInTheDocument()
  })

  it('отображает карточки статистики', () => {
    renderDashboard()
    
    expect(screen.getByText('Всего отчетов')).toBeInTheDocument()
    expect(screen.getByText('Обработано')).toBeInTheDocument()
    expect(screen.getByText('Google таблица')).toBeInTheDocument()
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

  it('отображает кнопку загрузки первого отчета при пустом состоянии', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([])
    })
    
    renderDashboard()
    
    await waitFor(() => {
      const uploadButton = screen.getByRole('button', { name: /загрузить первый отчет/i })
      expect(uploadButton).toBeInTheDocument()
    })
  })

  it('навигация к странице загрузки при клике на кнопку', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([])
    })
    
    renderDashboard()
    
    await waitFor(() => {
      const uploadButton = screen.getByRole('button', { name: /загрузить первый отчет/i })
      fireEvent.click(uploadButton)
      expect(mockNavigate).toHaveBeenCalledWith('/upload')
    })
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
      expect(screen.getByText(/загрузка отчетов/i)).toBeInTheDocument()
    })
  })

  it('отображает пустое состояние при отсутствии отчетов', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([])
    })
    
    renderDashboard()
    
    await waitFor(() => {
      expect(screen.getByText('У вас пока нет отчетов')).toBeInTheDocument()
    })
  })

  it('отображает отчеты в таблице', async () => {
    const mockReports = [
      {
        id: 1,
        filename: 'test_report.xlsx',
        file_size: 1024,
        status: 'completed',
        created_at: '2023-12-01T10:00:00Z'
      },
      {
        id: 2,
        filename: 'another_report.xlsx',
        file_size: 2048,
        status: 'processing',
        created_at: '2023-12-01T11:00:00Z'
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
        file_size: 1024,
        status: 'completed',
        created_at: '2023-12-01T10:00:00Z'
      },
      {
        id: 2,
        filename: 'processing_report.xlsx',
        file_size: 2048,
        status: 'processing',
        created_at: '2023-12-01T11:00:00Z'
      },
      {
        id: 3,
        filename: 'error_report.xlsx',
        file_size: 512,
        status: 'error',
        created_at: '2023-12-01T12:00:00Z'
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

  it('отображает правильные размеры файлов', async () => {
    const mockReports = [
      {
        id: 1,
        filename: 'small_file.xlsx',
        file_size: 1024,
        status: 'completed',
        created_at: '2023-12-01T10:00:00Z'
      },
      {
        id: 2,
        filename: 'large_file.xlsx',
        file_size: 1048576, // 1MB
        status: 'completed',
        created_at: '2023-12-01T11:00:00Z'
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

  it('показывает правильную статистику', async () => {
    const mockReports = [
      {
        id: 1,
        filename: 'completed1.xlsx',
        file_size: 1024,
        status: 'completed',
        created_at: '2023-12-01T10:00:00Z'
      },
      {
        id: 2,
        filename: 'completed2.xlsx',
        file_size: 2048,
        status: 'completed',
        created_at: '2023-12-01T11:00:00Z'
      },
      {
        id: 3,
        filename: 'processing.xlsx',
        file_size: 512,
        status: 'processing',
        created_at: '2023-12-01T12:00:00Z'
      }
    ]
    
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockReports)
    })
    
    renderDashboard()
    
    await waitFor(() => {
      expect(screen.getByText('3')).toBeInTheDocument() // Всего отчетов
      expect(screen.getByText('2')).toBeInTheDocument() // Обработано
    })
  })

  it('показывает статус Google таблицы', () => {
    renderDashboard()
    
    expect(screen.getByText('Не подключена')).toBeInTheDocument()
  })
}) 