#!/usr/bin/env python3
"""
Скрипт для применения миграций базы данных
"""

import subprocess
import argparse

def run_command(command, description, capture_output=True):
    print(f"\n🔄 {description}")
    print(f"Команда: {command}")
    try:
        result = subprocess.run(command, shell=True, capture_output=capture_output, text=True)
        if result.returncode == 0:
            print(f"✅ Успешно: {description}")
            if capture_output and result.stdout:
                print(f"Вывод: {result.stdout.strip()}")
            return True
        else:
            print(f"❌ Ошибка: {description}")
            if capture_output and result.stderr:
                print(f"Ошибка: {result.stderr.strip()}")
            return False
    except Exception as e:
        print(f"❌ Исключение: {e}")
        return False

def check_database_connection():
    print("🔍 Проверка подключения к базе данных...")
    if not run_command("alembic check", "Проверка подключения к базе данных"):
        print("❌ Не удалось подключиться к базе данных")
        print("Проверьте:")
        print("1. База данных запущена")
        print("2. DATABASE_URL правильно настроен в .env файле")
        print("3. Пользователь имеет права на создание таблиц")
        return False
    return True

def show_migration_status():
    print("\n📊 Статус миграций:")
    run_command("alembic current", "Текущая ревизия", capture_output=False)
    run_command("alembic history", "История миграций", capture_output=False)

def apply_migrations(target="head"):
    print(f"\n🚀 Применение миграций до: {target}")
    if not run_command(f"alembic upgrade {target}", f"Применение миграций до {target}"):
        print("❌ Не удалось применить миграции")
        return False
    return True

def main():
    parser = argparse.ArgumentParser(description="Управление миграциями базы данных")
    parser.add_argument("--check", action="store_true", help="Проверить статус миграций")
    parser.add_argument("--apply", action="store_true", help="Применить все миграции")
    parser.add_argument("--target", default="head", help="Целевая ревизия для применения")
    args = parser.parse_args()
    print("🗄️ Управление миграциями базы данных")
    print("=" * 50)
    if not any([args.check, args.apply]):
        show_migration_status()
        return
    if not check_database_connection():
        return
    if args.check:
        show_migration_status()
    if args.apply:
        apply_migrations(args.target)

if __name__ == "__main__":
    main() 