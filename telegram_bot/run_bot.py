#!/usr/bin/env python3
"""
Скрипт для запуска Telegram бота
"""

import sys
import os

# Добавляем текущую директорию в путь
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from bot import main
import asyncio

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\nБот остановлен пользователем")
    except Exception as e:
        print(f"Ошибка запуска бота: {e}")
        sys.exit(1) 