from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import db
from app.routes import menu, orders, dashboard 
from contextlib import asynccontextmanager

# 1️⃣ أضفنا dashboard هنا
from app.routes import menu, orders, dashboard

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=False)
    
@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        await db.connect()
        print("🚀 Database connected successfully")
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
    yield
    if db.is_connected():
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
# 2️⃣ أضفنا مسار الداشبورد هنا
app.include_router(dashboard.router, prefix="/api")

@app.get("/health")
async def health():
    return {
        "status": "ok",
        "database": "connected" if db.is_connected() else "disconnected"
    }