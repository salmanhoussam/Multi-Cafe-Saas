# app/services/admin/auth_service.py
from app.database import db
from datetime import datetime, timedelta
from jose import jwt
from app.core.config import settings
import logging
from typing import Optional, Dict

logger = logging.getLogger(__name__)

async def authenticate_restaurant(slug: str, password: str) -> Optional[Dict]:
    """
    مصادقة المطعم باستخدام slug وكلمة المرور
    """
    try:
        # البحث عن المطعم باستخدام slug
        restaurant = await db.restaurants.find_first(
            where={"slug": slug}
        )
        
        if not restaurant:
            logger.warning(f"Restaurant not found with slug: {slug}")
            return None
        
        # التحقق من كلمة المرور (ملاحظة: في الإنتاج يجب استخدام hashing)
        if restaurant.password != password:
            logger.warning(f"Invalid password for restaurant: {slug}")
            return None
        
        # التحقق من أن المطعم نشط
        if not restaurant.is_active:
            logger.warning(f"Restaurant is inactive: {slug}")
            return None
        
        return restaurant
        
    except Exception as e:
        logger.error(f"Authentication error: {e}")
        return None

def create_access_token(data: dict) -> str:
    """
    إنشاء JWT token
    """
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=7)  # 7 أيام
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def verify_token(token: str) -> Optional[Dict]:
    """
    التحقق من صحة التوكن
    """
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except jwt.JWTError as e:
        logger.error(f"Token verification error: {e}")
        return None