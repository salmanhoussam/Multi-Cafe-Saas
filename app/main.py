import os
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# إعداد logging فوري
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# إنشاء التطبيق أولاً (قبل أي استيرادات معقدة)
app = FastAPI(title="Restaurant SaaS")

# نقطة نهاية health بسيطة جداً (حتى لو فشل كل شيء)
@app.get("/health")
async def health():
    return {"status": "ok"}

@app.get("/")
async def root():
    return {"message": "Hello World"}

# محاولة استيراد الرواتر بعد إنشاء التطبيق
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

# محاولة الاتصال بقاعدة البيانات (لكن لا نمنع بدء التشغيل)
try:
    from app.database import db
    import asyncio
    asyncio.create_task(db.connect())
    logger.info("✅ Database connection initiated")
except Exception as e:
    logger.error(f"❌ Database connection setup failed: {e}")

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", "8000"))
    logger.info(f"🚀 Starting server on port {port}")
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=False)