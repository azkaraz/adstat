#!/usr/bin/env python3
"""
Скрипт для тестирования миграций базы данных
"""

import os
import sys
import subprocess
from pathlib import Path

def run_command(command, description):
    """Выполняет команду и выводит результат"""
    print(f"\n🔄 {description}")
    print(f"Команда: {command}")
    
    try:
        result = subprocess.run(command, shell=True, capture_output=True, text=True)
        
        if result.returncode == 0:
            print(f"✅ Успешно: {description}")
            if result.stdout:
                print(f"Вывод: {result.stdout.strip()}")
        else:
            print(f"❌ Ошибка: {description}")
            print(f"Ошибка: {result.stderr.strip()}")
            return False
            
    except Exception as e:
        print(f"❌ Исключение: {e}")
        return False
    
    return True

def main():
    """Основная функция тестирования миграций"""
    print("🧪 Тестирование миграций базы данных")
    print("=" * 50)
    
    # Проверяем наличие alembic
    if not run_command("which alembic", "Проверка наличия alembic"):
        print("❌ Alembic не найден. Установите: pip install alembic")
        return
    
    # Проверяем текущий статус миграций
    if not run_command("alembic current", "Проверка текущего статуса миграций"):
        print("❌ Не удалось проверить статус миграций")
        return
    
    # Проверяем историю миграций
    if not run_command("alembic history", "Проверка истории миграций"):
        print("❌ Не удалось получить историю миграций")
        return
    
    # Проверяем, что можем подключиться к базе данных
    if not run_command("alembic check", "Проверка подключения к базе данных"):
        print("❌ Не удалось подключиться к базе данных")
        print("Убедитесь, что:")
        print("1. База данных запущена")
        print("2. DATABASE_URL правильно настроен в .env файле")
        print("3. Пользователь имеет права на создание таблиц")
        return
    
    print("\n✅ Все проверки пройдены успешно!")
    print("\nДля применения миграций выполните:")
    print("alembic upgrade head")
    
    print("\nДля создания новой миграции выполните:")
    print("alembic revision --autogenerate -m 'описание изменений'")

if __name__ == "__main__":
    main() 