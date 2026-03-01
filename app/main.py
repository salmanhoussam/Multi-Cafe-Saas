# app/main.py
import os
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config import settings
from app.database import db

# ✅ استيراد مباشر من الملفات (وليس من المجلدات)
from app.api.v1.public.menu import router as public_menu_router
from app.api.v1.public.orders import router as public_orders_router
from app.api.v1.admin.auth import router as admin_auth_router
from app.api.v1.admin.dashboard import router as admin_dashboard_router
from app.api.v1.admin.categories import router as admin_categories_router
from app.api.v1.admin.menu_items import router as admin_menu_items_router
from app.api.v1.admin.upload import router as admin_upload_router

# إعداد التسجيل
logging.basicConfig(
    level=logging.INFO if settings.is_production() else logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # بدء التشغيل
    logger.info(f"🚀 Starting {settings.PROJECT_NAME} v{settings.VERSION}")
    logger.info(f"🌍 Environment: {settings.ENVIRONMENT}")
    
    logger.info("⏳ Connecting to database...")
    try:
        await db.connect()
        logger.info("✅ Database connected successfully")
    except Exception as e:
        logger.error(f"❌ Database connection failed: {e}")
        if settings.is_production():
            raise e
    
    yield 
    
    # إيقاف التشغيل
    logger.info("🛑 Shutting down...")
    try:
        await db.disconnect()
        logger.info("✅ Database disconnected")
    except Exception as e:
        logger.error(f"❌ Database disconnection failed: {e}")

# إنشاء تطبيق FastAPI
app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Multi-Restaurant SaaS Platform",
    version=settings.VERSION,
    lifespan=lifespan,
    docs_url="/docs" if not settings.is_production() else None,
    redoc_url="/redoc" if not settings.is_production() else None,
)

# إعداد CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ تسجيل الراوترز مباشرة
app.include_router(public_menu_router)
app.include_router(admin_auth_router)
app.include_router(admin_dashboard_router)
app.include_router(admin_categories_router)
app.include_router(admin_menu_items_router)
app.include_router(admin_upload_router)
app.include_router(public_orders_router)

# نقاط النهاية العامة
@app.get("/")
async def root():
    return {
        "message": f"Welcome to {settings.PROJECT_NAME}",
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "docs": "/docs" if not settings.is_production() else "disabled in production",
        "status": "operational"
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": __import__('datetime').datetime.now().isoformat()
    }

if __name__ == "__main__":
    import uvicorn
    port = settings.PORT
    logger.info(f"🚀 Server running on port {port}")
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=port,
        reload=settings.is_development(),
    )