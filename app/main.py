from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging
import os

from app.routes import menu, orders, dashboard
from app.database import db
from contextlib import asynccontextmanager

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        await db.connect()
        logger.info("✅ Database connected")
    except Exception as e:
        logger.error(f"❌ Database connection failed: {e}")
    yield
    if hasattr(db, '_connected') and db._connected:
        await db.disconnect()
        logger.info("🛑 Database connection closed")

app = FastAPI(title="Restaurant SaaS", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# تضمين الرواتر مباشرة (بدون try/except)
app.include_router(menu.router, prefix="/api")
app.include_router(orders.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")

@app.get("/health")
async def health():
    return {"status": "ok"}

@app.get("/")
async def root():
    return {"message": "Restaurant SaaS API"}

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=False)