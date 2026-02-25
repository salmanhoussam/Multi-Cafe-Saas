import os
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 1. إعداد Lifespan للاتصال بـ Prisma بشكل صحيح وآمن
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("⏳ Attempting to connect Prisma database...")
    try:
        from app.database import db
        await db.connect()
        logger.info("✅ Prisma Database connected successfully")
    except Exception as e:
        logger.error(f"❌ Prisma Database connection failed: {e}")
    
    yield 
    
    try:
        from app.database import db
        await db.disconnect()
        logger.info("✅ Prisma Database disconnected successfully")
    except Exception as e:
        logger.error(f"❌ Prisma Database disconnection failed: {e}")

# 2. إنشاء التطبيق مع تفعيل lifespan
app = FastAPI(title="Restaurant SaaS", lifespan=lifespan)

@app.get("/health")
async def health():
    return {"status": "ok"}

@app.get("/")
async def root():
    return {"message": "Hello World"}

# 3. استيراد الرواتر
try:
    from app.routes import menu, orders, dashboard
    app.include_router(menu.router, prefix="/api")
    app.include_router(orders.router, prefix="/api")
    app.include_router(dashboard.router, prefix="/api")
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