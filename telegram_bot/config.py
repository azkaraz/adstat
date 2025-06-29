"""
Конфигурация для Telegram бота
"""

import os
from dotenv import load_dotenv

# Загружаем переменные окружения
load_dotenv()

class BotConfig:
    """Конфигурация бота"""
    
    # Токен бота (обязательно)
    BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
    
    # URL вашего Mini App
    WEBAPP_URL = os.getenv("WEBAPP_URL", "https://azkaraz.github.io/adstat/")
    
    # Настройки логирования
    LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
    
    # Настройки для разработки
    DEBUG = os.getenv("DEBUG", "False").lower() == "true"
    
    @classmethod
    def validate(cls):
        """Проверяем обязательные настройки"""
        if not cls.BOT_TOKEN:
            raise ValueError("TELEGRAM_BOT_TOKEN не найден в переменных окружения")
        
        if not cls.WEBAPP_URL:
            raise ValueError("WEBAPP_URL не найден в переменных окружения")
        
        return True 