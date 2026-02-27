# app/main.py
import os
import logging
from datetime import datetime
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from dotenv import load_dotenv

load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

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

app = FastAPI(title="Restaurant SaaS", lifespan=lifespan)

# ✅ استيراد auth من المجلد الرئيسي
from app import auth

# ✅ استيراد الرواتر من مجلد routers (تصحيح الاسم)
from app.routes import dashboard, menu, orders, admin, upload

# ✅ تسجيل الرواتر
app.include_router(auth.router)        
app.include_router(dashboard.router)   
app.include_router(menu.router)        
app.include_router(orders.router)      
app.include_router(admin.router)       
app.include_router(upload.router)

logger.info("✅ Routers imported successfully")

# ✅ CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",       # إضافة هذا السطر للاحتياط
        "http://localhost:3000",
        "https://resto.salmansaas.com",
        "https://admin.salmansaas.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health():
    return {"status": "ok", "timestamp": datetime.utcnow().isoformat()}

@app.get("/")
async def root():
    return {"message": "Restaurant API", "version": "1.0.0", "docs": "/docs"}

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", "8000"))
    logger.info(f"🚀 Starting server on port {port}")
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=False)