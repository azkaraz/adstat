from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
import os

from app.core.config import settings
from app.api.routes import auth, user, sheets, upload
from app.core.database import engine
from app.models import base

# Создаем таблицы в базе данных только если не в тестовом режиме
if not os.getenv("TESTING"):
    base.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Ads Statistics Dashboard",
    description="Личный кабинет для управления рекламными отчетами",
    version="1.0.0"
)

# Настройка CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_HOSTS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Подключаем роуты
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(user.router, prefix="/user", tags=["user"])
app.include_router(sheets.router, prefix="/sheets", tags=["sheets"])
app.include_router(upload.router, prefix="/upload", tags=["upload"])

# Подключаем статические файлы для фронтенда
if os.path.exists("frontend/dist"):
    app.mount("/static", StaticFiles(directory="frontend/dist"), name="static")

@app.get("/", response_class=HTMLResponse)
async def root():
    """Главная страница приложения"""
    return """
    <!DOCTYPE html>
    <html>
    <head>
        <title>Ads Statistics Dashboard</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
    </head>
    <body>
        <div id="root"></div>
        <script type="module" src="/static/index.js"></script>
    </body>
    </html>
    """

@app.get("/health")
async def health_check():
    """Проверка здоровья приложения"""
    return {"status": "healthy", "message": "Ads Statistics Dashboard is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 