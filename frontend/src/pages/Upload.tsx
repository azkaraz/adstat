import React, { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { ROUTES, API_ROUTES } from '../config'

const Upload: React.FC = () => {
  const { user, token } = useAuth()
  const navigate = useNavigate()
  const [uploading, setUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<string>('')

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!user) {
      navigate(ROUTES.LOGIN)
      return
    }

    if (acceptedFiles.length === 0) return

    const file = acceptedFiles[0]
    
    // Проверяем тип файла
    if (!file.name.match(/\.(xlsx|xls)$/)) {
      setUploadStatus('Ошибка: Поддерживаются только файлы Excel (.xlsx, .xls)')
      return
    }

    // Проверяем размер файла (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setUploadStatus('Ошибка: Размер файла превышает 10MB')
      return
    }

    setUploading(true)
    setUploadStatus('Загрузка файла...')

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(API_ROUTES.UPLOAD_REPORT, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      if (response.ok) {
        const result = await response.json()
        setUploadStatus(`Файл успешно загружен! ID: ${result.report_id}`)
        
        // Перенаправляем на дашборд через 2 секунды
        setTimeout(() => {
          navigate(ROUTES.DASHBOARD)
        }, 2000)
      } else {
        const error = await response.json()
        setUploadStatus(`Ошибка загрузки: ${error.detail}`)
      }
    } catch (error) {
      setUploadStatus(`Ошибка: ${error}`)
    } finally {
      setUploading(false)
    }
  }, [user, token, navigate])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    multiple: false
  })

  if (!user) {
    return null
  }

  return (
    <div className="max-w-4xl mx-auto px-2 sm:px-4">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Загрузка отчета
        </h1>
        <p className="mt-2 text-gray-600 text-sm sm:text-base">
          Загрузите Excel файл с рекламными данными для обработки
        </p>
      </div>

      <div className="bg-white shadow rounded-lg p-4 sm:p-8">
        <div className="mb-6">
          <h2 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
            Требования к файлу:
          </h2>
          <ul className="list-disc list-inside text-gray-600 space-y-1 text-sm sm:text-base">
            <li>Формат: .xlsx или .xls</li>
            <li>Максимальный размер: 10MB</li>
            <li>Обязательные колонки: Дата, Кампания, Показы, Клики, Расходы</li>
            <li>Данные должны быть в первом листе</li>
          </ul>
        </div>

        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-6 sm:p-12 text-center cursor-pointer transition-colors ${
            isDragActive
              ? 'border-blue-400 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <input {...getInputProps()} />
          
          <div className="space-y-4">
            <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>
            
            <div>
              <p className="text-base sm:text-lg font-medium text-gray-900">
                {isDragActive
                  ? 'Отпустите файл здесь'
                  : 'Перетащите файл сюда или нажмите для выбора'}
              </p>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Поддерживаются только файлы Excel
              </p>
            </div>
          </div>
        </div>

        {uploadStatus && (
          <div className={`mt-6 p-4 rounded-md ${
            uploadStatus.includes('Ошибка')
              ? 'bg-red-50 text-red-700 border border-red-200'
              : uploadStatus.includes('успешно')
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-blue-50 text-blue-700 border border-blue-200'
          }`}>
            <p className="text-sm font-medium">{uploadStatus}</p>
          </div>
        )}

        {uploading && (
          <div className="mt-6 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Обработка файла...</span>
          </div>
        )}
      </div>

      {!user.has_google_sheet && (
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Google таблица не подключена
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  Для автоматической загрузки данных в Google таблицу необходимо подключить её в профиле.
                </p>
              </div>
              <div className="mt-4">
                <button
                  onClick={() => navigate(ROUTES.PROFILE)}
                  className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Подключить Google таблицу
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Upload 