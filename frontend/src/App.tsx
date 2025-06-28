import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Navbar from './components/Navbar'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import Upload from './pages/Upload'
import TestAuth from './pages/TestAuth'
import DebugInfo from './components/DebugInfo'
import './App.css'

function App() {
  // Инициализация Telegram WebApp
  React.useEffect(() => {
    if (window.Telegram?.WebApp) {
      console.log('Initializing Telegram WebApp...')
      const tg = window.Telegram.WebApp
      
      // Инициализируем WebApp
      tg.ready()
      tg.expand()
      
      console.log('Telegram WebApp initialized')
      console.log('initDataUnsafe:', tg.initDataUnsafe)
      console.log('initData:', tg.initData)
    } else {
      console.log('Telegram WebApp not available')
    }
  }, [])

  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/login" element={<Login />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/upload" element={<Upload />} />
              <Route path="/test" element={<TestAuth />} />
            </Routes>
          </main>
          <DebugInfo />
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App 