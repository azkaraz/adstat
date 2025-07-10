import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const Navbar: React.FC = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16 w-full">
          <div className="flex items-center flex-shrink-0">
            <Link to="/" className="flex items-center">
              <h1 className="font-bold text-gray-800 text-lg sm:text-xl truncate max-w-[160px] sm:max-w-none">
                Ads Statistics Dashboard
              </h1>
            </Link>
          </div>

          {/* Бургер-меню для мобильных */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              aria-controls="mobile-menu"
              aria-expanded={menuOpen}
            >
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                {menuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>

          {/* Меню для десктопа */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <Link
                  to="/"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Дашборд
                </Link>
                <Link
                  to="/upload"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Загрузить отчет
                </Link>
                {user.has_vk_account && (
                  <Link
                    to="/vk-campaigns"
                    className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Рекламные кампании VK
                  </Link>
                )}
                <Link
                  to="/profile"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Профиль
                </Link>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">
                    {user.first_name} {user.last_name}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    Выйти
                  </button>
                </div>
              </>
            ) : (
              <Link
                to="/login"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Войти через Telegram
              </Link>
            )}
          </div>
        </div>
      </div>
      {/* Мобильное меню */}
      <div className={`md:hidden ${menuOpen ? 'block' : 'hidden'}`} id="mobile-menu">
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {user ? (
            <>
              <Link
                to="/"
                className="block text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setMenuOpen(false)}
              >
                Дашборд
              </Link>
              <Link
                to="/upload"
                className="block text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setMenuOpen(false)}
              >
                Загрузить отчет
              </Link>
              {user.has_vk_account && (
                <Link
                  to="/vk-campaigns"
                  className="block text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-base font-medium"
                  onClick={() => setMenuOpen(false)}
                >
                  Рекламные кампании VK
                </Link>
              )}
              <Link
                to="/profile"
                className="block text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setMenuOpen(false)}
              >
                Профиль
              </Link>
              <div className="flex items-center space-x-2 px-3 py-2">
                <span className="text-sm text-gray-600">
                  {user.first_name} {user.last_name}
                </span>
                <button
                  onClick={() => { handleLogout(); setMenuOpen(false) }}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Выйти
                </button>
              </div>
            </>
          ) : (
            <Link
              to="/login"
              className="block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-base font-medium"
              onClick={() => setMenuOpen(false)}
            >
              Войти через Telegram
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar 