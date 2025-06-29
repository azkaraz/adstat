#!/usr/bin/env python3
"""
Telegram Bot для Ads Statistics Dashboard
Открывает Mini App для пользователей
"""

import asyncio
import logging
from aiogram import Bot, Dispatcher, types
from aiogram.filters import Command
from aiogram.types import (
    KeyboardButton, 
    ReplyKeyboardMarkup, 
    InlineKeyboardButton, 
    InlineKeyboardMarkup,
    WebAppInfo
)
from aiogram.utils.keyboard import ReplyKeyboardBuilder
import os
from dotenv import load_dotenv

# Загружаем переменные окружения
load_dotenv()

# Настройка логирования
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Получаем токен бота из переменных окружения
BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
if not BOT_TOKEN:
    raise ValueError("TELEGRAM_BOT_TOKEN не найден в переменных окружения")

# Проверяем, является ли это тестовым токеном
if BOT_TOKEN == "your_bot_token_here" or BOT_TOKEN == "test_token":
    print("⚠️  ВНИМАНИЕ: Используется тестовый токен!")
    print("   Для работы с реальным ботом создайте бота через @BotFather")
    print("   и добавьте настоящий токен в файл .env")
    print("   Подробная инструкция: telegram_bot/SETUP.md")
    print()
    print("🤖 Запуск в тестовом режиме...")
    print("   Бот будет работать только с mock данными")
    print()

# URL вашего Mini App
WEBAPP_URL = os.getenv("WEBAPP_URL", "https://azkaraz.github.io/adstat/")

# Создаем экземпляры бота и диспетчера
bot = Bot(token=BOT_TOKEN)
dp = Dispatcher()

@dp.message(Command("start"))
async def cmd_start(message: types.Message):
    """Обработчик команды /start"""
    user_name = message.from_user.first_name
    
    # Создаем клавиатуру с кнопкой для открытия WebApp
    builder = ReplyKeyboardBuilder()
    builder.add(
        KeyboardButton(
            text="📊 Открыть Ads Statistics",
            web_app=WebAppInfo(url=WEBAPP_URL)
        )
    )
    builder.add(KeyboardButton(text="ℹ️ Помощь"))
    builder.adjust(1)
    
    await message.answer(
        f"Привет, {user_name}! 👋\n\n"
        f"Добро пожаловать в Ads Statistics Dashboard!\n\n"
        f"Нажмите кнопку ниже, чтобы открыть приложение:",
        reply_markup=builder.as_markup(resize_keyboard=True)
    )

@dp.message(Command("help"))
async def cmd_help(message: types.Message):
    """Обработчик команды /help"""
    help_text = """
🤖 **Ads Statistics Dashboard Bot**

**Команды:**
/start - Начать работу с ботом
/help - Показать эту справку
/app - Открыть приложение

**Как использовать:**
1. Нажмите кнопку "📊 Открыть Ads Statistics"
2. В открывшемся приложении войдите через Telegram
3. Загружайте и анализируйте ваши рекламные отчеты

**Поддержка:**
Если у вас возникли проблемы, обратитесь к администратору.
    """
    
    # Создаем inline кнопку для открытия WebApp
    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(
            text="🚀 Открыть приложение",
            web_app=WebAppInfo(url=WEBAPP_URL)
        )]
    ])
    
    await message.answer(help_text, reply_markup=keyboard, parse_mode="Markdown")

@dp.message(Command("app"))
async def cmd_app(message: types.Message):
    """Обработчик команды /app - открывает WebApp"""
    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(
            text="📊 Открыть Ads Statistics",
            web_app=WebAppInfo(url=WEBAPP_URL)
        )]
    ])
    
    await message.answer(
        "Нажмите кнопку ниже, чтобы открыть приложение:",
        reply_markup=keyboard
    )

@dp.message(lambda message: message.text == "ℹ️ Помощь")
async def help_button(message: types.Message):
    """Обработчик кнопки помощи"""
    await cmd_help(message)

@dp.message()
async def echo_message(message: types.Message):
    """Обработчик всех остальных сообщений"""
    await message.answer(
        "Используйте команду /start для начала работы или /help для справки."
    )

async def main():
    """Главная функция"""
    logger.info("Запуск бота...")
    
    # Удаляем webhook и включаем polling
    await bot.delete_webhook(drop_pending_updates=True)
    
    try:
        await dp.start_polling(bot)
    except KeyboardInterrupt:
        logger.info("Бот остановлен")
    finally:
        await bot.session.close()

if __name__ == "__main__":
    asyncio.run(main()) 