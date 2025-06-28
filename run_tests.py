#!/usr/bin/env python3
"""
Скрипт для запуска тестов backend и frontend
"""

import subprocess
import sys
import os
from pathlib import Path

def run_backend_tests():
    """Запуск тестов backend"""
    print("🚀 Запуск тестов backend...")
    
    try:
        # Устанавливаем зависимости для тестирования
        subprocess.run([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"], check=True)
        
        # Запускаем тесты с покрытием
        result = subprocess.run([
            sys.executable, "-m", "pytest", 
            "--cov=app", 
            "--cov-report=term-missing",
            "--cov-report=html:htmlcov",
            "-v"
        ], check=True)
        
        print("✅ Тесты backend выполнены успешно!")
        return True
        
    except subprocess.CalledProcessError as e:
        print(f"❌ Ошибка при выполнении тестов backend: {e}")
        return False

def run_frontend_tests():
    """Запуск тестов frontend"""
    print("🚀 Запуск тестов frontend...")
    
    frontend_dir = Path("frontend")
    if not frontend_dir.exists():
        print("❌ Директория frontend не найдена")
        return False
    
    try:
        # Переходим в директорию frontend
        os.chdir(frontend_dir)
        
        # Устанавливаем зависимости
        subprocess.run(["npm", "install"], check=True)
        
        # Запускаем тесты
        result = subprocess.run(["npm", "test", "--", "--coverage"], check=True)
        
        print("✅ Тесты frontend выполнены успешно!")
        return True
        
    except subprocess.CalledProcessError as e:
        print(f"❌ Ошибка при выполнении тестов frontend: {e}")
        return False
    finally:
        # Возвращаемся в корневую директорию
        os.chdir("..")

def run_all_tests():
    """Запуск всех тестов"""
    print("🧪 Запуск всех тестов...")
    
    backend_success = run_backend_tests()
    frontend_success = run_frontend_tests()
    
    if backend_success and frontend_success:
        print("🎉 Все тесты выполнены успешно!")
        return True
    else:
        print("💥 Некоторые тесты завершились с ошибками")
        return False

def run_specific_tests(test_type):
    """Запуск конкретных тестов"""
    if test_type == "backend":
        return run_backend_tests()
    elif test_type == "frontend":
        return run_frontend_tests()
    else:
        print(f"❌ Неизвестный тип тестов: {test_type}")
        return False

if __name__ == "__main__":
    if len(sys.argv) > 1:
        test_type = sys.argv[1]
        success = run_specific_tests(test_type)
    else:
        success = run_all_tests()
    
    sys.exit(0 if success else 1) 