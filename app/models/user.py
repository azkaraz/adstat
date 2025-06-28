from sqlalchemy import Column, String, Boolean, Text
from sqlalchemy.orm import relationship
from app.models.base import BaseModel

class User(BaseModel):
    """Модель пользователя"""
    __tablename__ = "users"
    
    telegram_id = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, index=True)
    first_name = Column(String)
    last_name = Column(String)
    email = Column(String, unique=True, index=True)
    is_active = Column(Boolean, default=True)
    google_access_token = Column(Text)
    google_refresh_token = Column(Text)
    google_sheet_id = Column(String)

    # Связь с отчетами
    reports = relationship("Report", back_populates="user")
    
    def __repr__(self):
        return f"<User(id={self.id}, telegram_id={self.telegram_id}, username={self.username})>" 