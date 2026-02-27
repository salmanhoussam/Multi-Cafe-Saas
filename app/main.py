import os
import logging
from datetime import datetime  # أضف هذا
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from dotenv import load_dotenv

# تحميل متغيرات البيئة المحلية (للتطوير فقط)
load_dotenv()

# إعداد التسجيل
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# استيراد قاعدة البيانات مرة واحدة
from app.database import db

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("⏳ Attempting to connect Prisma database...")
    try:
        await db.connect()
        logger.info("✅ Prisma Database connected successfully")
    except Exception as e:
        logger.error(f"❌ Prisma Database connection failed: {e}")
    
    yield 
    
    try:
        await db.disconnect()
        logger.info("✅ Prisma Database disconnected successfully")
    except Exception as e:
        logger.error(f"❌ Prisma Database disconnection failed: {e}")

# إنشاء التطبيق مع تفعيل lifespan
app = FastAPI(title="Restaurant SaaS", lifespan=lifespan)

# نقاط نهاية الصحة
@app.get("/health")
async def health():
    try:
        from app.database import db
        db_connected = db.is_connected() if hasattr(db, 'is_connected') else "unknown"
    except:
        db_connected = "error"

    return {
        "status": "ok",
        "timestamp": datetime.utcnow().isoformat(),
        "database": db_connected
    }

@app.get("/")
async def root():
    return {"message": "Hello World"}

# استيراد الرواتر
try:
    from app.routes import menu, orders, dashboard, auth
    app.include_router(menu.router, prefix="/api")
    app.include_router(orders.router, prefix="/api")
    app.include_router(dashboard.router, prefix="/api")
    app.include_router(auth.router, prefix="/api")
    logger.info("✅ Routers imported successfully")
except Exception as e:
    logger.error(f"❌ Failed to import routers: {e}")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", "8000"))
    logger.info(f"🚀 Starting server on port {port}")
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=False)