import os
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "Multi-Menu-Saas"
    VERSION: str = "1.0.0"
    
    # 🔗 إعدادات قاعدة البيانات (أساسية) - ضرورية لـ Prisma
    DATABASE_URL: str
    DIRECT_URL: str

    # ⏰ إعدادات المنطقة الزمنية
    TIMEZONE: str = "Asia/Beirut"
    
    # 🚀 إعدادات إضافية
    ENVIRONMENT: str = "production"
    PORT: int = 8000

    class Config:
        env_file = ".env"
        extra = "ignore"  # يتجاهل أي متغيرات إضافية في .env
        case_sensitive = True

# نسخة واحدة مشتركة من الإعدادات
settings = Settings()