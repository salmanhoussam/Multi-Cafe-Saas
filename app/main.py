from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import db
from app.routes import menu, orders, dashboard
from contextlib import asynccontextmanager
from app.core.config import settings

@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        await db.connect()
        print("🚀 Database connected successfully")
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        # لا نرفع الخطأ، نترك التطبيق يعمل بدون قاعدة بيانات (اختياري)
    yield
    if hasattr(db, 'is_connected') and db.is_connected():
        await db.disconnect()
        print("🛑 Database connection closed")
    else:
        # بديل: نحاول فصل الاتصال فقط إذا كان متصلاً (Prisma يوفر _connected)
        if db._connected:
            await db.disconnect()
            print("🛑 Database connection closed")

app = FastAPI(title="Restaurant SaaS", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(menu.router, prefix="/api")
app.include_router(orders.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")

@app.get("/health")
async def health():
    # لا نستخدم db.is_connected()، نعيد حالة بسيطة
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    port = settings.PORT  # استخدام PORT من الإعدادات (8000 افتراضياً)
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=False)