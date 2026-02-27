from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.database import db  # استيراد Prisma client
import jwt
import os
from datetime import datetime, timedelta

router = APIRouter()

class LoginRequest(BaseModel):
    manager_id: str   # manager_id الموجود في جدول restaurants
    password: str

class LoginResponse(BaseModel):
    token: str
    restaurant_id: str
    restaurant_name: str   # للترحيب (يمكن اختيار name_en أو name_ar)
    slug: str

SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key-please-change")

@router.post("/auth/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    try:
        # البحث عن المطعم باستخدام manager_id وكلمة المرور
        restaurant = await db.restaurants.find_first(
            where={
                "manager_id": request.manager_id,
                "password": request.password   # ⚠️ يجب استخدام تشفير في الإنتاج
            }
        )
        
        if not restaurant:
            raise HTTPException(status_code=401, detail="Invalid manager ID or password")
        
        # إنشاء التوكن
        token = jwt.encode(
            {
                "restaurant_id": restaurant.id,
                "manager_id": restaurant.manager_id,
                "slug": restaurant.slug,
                "role": "manager",
                "exp": datetime.utcnow() + timedelta(days=7)
            },
            SECRET_KEY,
            algorithm="HS256"
        )
        
        return LoginResponse(
            token=token,
            restaurant_id=restaurant.id,
            restaurant_name=restaurant.name_en,  # أو name_ar حسب تفضيلك
            slug=restaurant.slug
        )
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"🔥 Login error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")