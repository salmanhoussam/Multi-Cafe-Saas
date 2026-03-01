# app/core/security.py
from fastapi import Depends, HTTPException, status, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from app.core.config import settings
from app.database import db
import logging

logger = logging.getLogger(__name__)
security = HTTPBearer()

async def get_current_restaurant(
    credentials: HTTPAuthorizationCredentials = Security(security)
):
    """
    التحقق من توكن المطعم الحالي (المدير)
    """
    token = credentials.credentials
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # فك تشفير التوكن
        payload = jwt.decode(
            token, 
            settings.SECRET_KEY, 
            algorithms=[settings.ALGORITHM]
        )
        
        restaurant_id: str = payload.get("restaurant_id")
        manager_id: str = payload.get("manager_id")
        slug: str = payload.get("slug")
        
        if restaurant_id is None or manager_id is None:
            logger.warning("Missing restaurant_id or manager_id in token")
            raise credentials_exception
            
    except JWTError as e:
        logger.error(f"JWT Error: {e}")
        raise credentials_exception
    
    # التحقق من وجود المطعم في قاعدة البيانات
    restaurant = await db.restaurants.find_first(
        where={
            "id": restaurant_id,
            "manager_id": manager_id,
            "is_active": True
        }
    )
    
    if restaurant is None:
        logger.warning(f"Restaurant not found: {restaurant_id}")
        raise credentials_exception
    
    return {
        "restaurant_id": restaurant.id,
        "manager_id": restaurant.manager_id,
        "slug": restaurant.slug,
        "name_ar": restaurant.name_ar,
        "name_en": restaurant.name_en
    }