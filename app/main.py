from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os
import logging

# إعداد logging مبكر جداً لمشاهدة السجلات في Railway
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# استيراد قاعدة البيانات والرواتر (بعد logging)
from app.database import db
from app.routes import menu, orders, dashboard

@asynccontextmanager
async def lifespan(app: FastAPI):
    # محاولة الاتصال بقاعدة البيانات ولكن لا نمنع بدء التشغيل إذا فشل
    try:
        await db.connect()
        logger.info("🚀 Database connected successfully")
    except Exception as e:
        logger.error(f"❌ Database connection failed: {e}")
    yield
    # فصل الاتصال إذا كان متصلاً
    try:
        if hasattr(db, '_connected') and db._connected:
            await db.disconnect()
            logger.info("🛑 Database connection closed")
    except Exception as e:
        logger.error(f"Error disconnecting database: {e}")

# إنشاء تطبيق FastAPI
app = FastAPI(title="Restaurant SaaS", lifespan=lifespan)

# إضافة CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# تضمين الرواتر
app.include_router(menu.router, prefix="/api")
app.include_router(orders.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")

# نقطة نهاية healthcheck بسيطة جداً (لا تعتمد على قاعدة البيانات)
@app.get("/health")
async def health():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    # قراءة المنفذ من متغير البيئة PORT الذي يوفره Railway
    port = int(os.getenv("PORT", "8000"))
    logger.info(f"Starting server on port {port}")
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=False)