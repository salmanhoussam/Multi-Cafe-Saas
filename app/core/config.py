# app/core/config.py
import os
from typing import List, Optional
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    # المشروع
    PROJECT_NAME: str = "Multi-Menu-Saas"
    VERSION: str = "2.0.0"
    
    # 🔗 إعدادات قاعدة البيانات (أساسية) - ضرورية لـ Prisma
    DATABASE_URL: str
    DIRECT_URL: str

    # ⏰ إعدادات المنطقة الزمنية
    TIMEZONE: str = "Asia/Beirut"
    
    # 🚀 إعدادات إضافية
    ENVIRONMENT: str = "production"
    PORT: int = 8000
    
    # 🔐 إعدادات الأمان والمصادقة (مضافة)
    SECRET_KEY: str = os.getenv("SECRET_KEY", "My-Super-Secret-Key-salmansaas-03571590")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 ساعة
    
    # 🌐 إعدادات الدومين (مهمة جداً للـ subdomains)
    MAIN_DOMAIN: str = "salmansaas.com"
    
    # 🌍 إعدادات CORS (محدثة)
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://localhost:8000",
        "https://resto.salmansaas.com",
        "https://admin.salmansaas.com",
        # دعم جميع الـ subdomains
        "https://*.salmansaas.com",
    ]
    
    # 📁 إعدادات رفع الملفات
    UPLOAD_DIR: str = "uploads"
    MAX_UPLOAD_SIZE: int = 5 * 1024 * 1024  # 5MB
    ALLOWED_EXTENSIONS: List[str] = [".jpg", ".jpeg", ".png", ".gif", ".webp"]
    
    # 👥 إعدادات المستخدمين
    DEFAULT_ADMIN_EMAIL: Optional[str] = os.getenv("DEFAULT_ADMIN_EMAIL")
    DEFAULT_ADMIN_PASSWORD: Optional[str] = os.getenv("DEFAULT_ADMIN_PASSWORD")
    
    # 📊 إعدادات Prisma
    PRISMA_STUDIO_PORT: int = 5555
    
    # 🧪 إعدادات البيئة المحلية للتطوير
    LOCAL_DOMAINS: List[str] = ["localhost", "127.0.0.1"]
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"  # يتجاهل أي متغيرات إضافية في .env
        case_sensitive = True

    # دالة مساعدة للتحقق من صحة الإعدادات
    def is_development(self) -> bool:
        return self.ENVIRONMENT.lower() == "development"
    
    def is_production(self) -> bool:
        return self.ENVIRONMENT.lower() == "production"
    
    # دالة للحصول على رابط CORS كامل مع الـ wildcard
    def get_cors_origins(self) -> List[str]:
        """توسيع قائمة CORS لتشمل جميع الـ subdomains في الإنتاج"""
        origins = self.CORS_ORIGINS.copy()
        
        if self.is_production():
            # إضافة جميع الـ subdomains المحتملة
            origins.append(f"https://{self.MAIN_DOMAIN}")
            origins.append(f"https://admin.{self.MAIN_DOMAIN}")
            origins.append(f"https://*.{self.MAIN_DOMAIN}")  # لاحظ أن FastAPI لا يدعم * مباشرة في CORS
            
        return origins

# نسخة واحدة مشتركة من الإعدادات
settings = Settings()

# للتحقق من الإعدادات عند بدء التشغيل
if settings.is_production() and settings.SECRET_KEY == "your-super-secret-key-change-this":
    raise ValueError("⚠️ يجب تغيير SECRET_KEY في بيئة الإنتاج!")