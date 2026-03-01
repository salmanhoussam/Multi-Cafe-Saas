# app/api/v1/admin/auth.py
from fastapi import APIRouter, HTTPException, Depends
from app.database import db
from app.core.security import get_current_restaurant
from app.core.config import settings
from app.schemas.admin.auth import LoginRequest, LoginResponse, RestaurantOut  # ✅ الآن الموجود موجود
from datetime import datetime, timedelta
import jwt
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/admin/auth", tags=["Admin Authentication"])

@router.post("/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    """
    تسجيل دخول المدير باستخدام slug المطعم وكلمة المرور
    """
    try:
        # البحث عن المطعم باستخدام slug
        restaurant = await db.restaurants.find_first(
            where={"slug": request.slug}
        )
        
        if not restaurant:
            logger.warning(f"Login failed: Restaurant not found with slug {request.slug}")
            raise HTTPException(status_code=401, detail="Invalid slug or password")
        
        # التحقق من كلمة المرور
        if restaurant.password != request.password:
            logger.warning(f"Login failed: Invalid password for restaurant {request.slug}")
            raise HTTPException(status_code=401, detail="Invalid slug or password")
        
        # التحقق من أن المطعم نشط
        if not restaurant.is_active:
            logger.warning(f"Login failed: Restaurant {request.slug} is inactive")
            raise HTTPException(status_code=403, detail="Restaurant is inactive")
        
        # إنشاء التوكن
        token = jwt.encode(
            {
                "restaurant_id": restaurant.id,
                "manager_id": restaurant.manager_id,
                "slug": restaurant.slug,
                "manager_phone": restaurant.manager_phone,
                "exp": datetime.utcnow() + timedelta(days=7)
            },
            settings.SECRET_KEY,
            algorithm=settings.ALGORITHM
        )
        
        logger.info(f"✅ Login successful for restaurant: {restaurant.slug}")
        
        return LoginResponse(
            token=token,
            restaurant_id=restaurant.id,
            restaurant_name=restaurant.name_en or restaurant.name_ar,
            slug=restaurant.slug,
            manager_id=restaurant.manager_id,
            manager_phone=restaurant.manager_phone
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"🔥 Login error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")