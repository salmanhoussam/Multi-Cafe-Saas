# app/services/admin/restaurant_service.py
from app.database import db
from typing import Optional, List, Dict, Any
import logging

logger = logging.getLogger(__name__)

async def get_all_restaurants() -> List[Dict[str, Any]]:
    """
    جلب جميع المطاعم
    """
    try:
        restaurants = await db.restaurants.find_many()
        return restaurants
    except Exception as e:
        logger.error(f"Error fetching restaurants: {e}")
        return []

async def get_restaurant_by_slug(slug: str) -> Optional[Dict[str, Any]]:
    """
    جلب مطعم بواسطة slug
    """
    try:
        restaurant = await db.restaurants.find_first(
            where={"slug": slug}
        )
        return restaurant
    except Exception as e:
        logger.error(f"Error fetching restaurant by slug {slug}: {e}")
        return None

async def create_restaurant(data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """
    إنشاء مطعم جديد
    """
    try:
        restaurant = await db.restaurants.create(
            data=data
        )
        return restaurant
    except Exception as e:
        logger.error(f"Error creating restaurant: {e}")
        return None

async def update_restaurant(restaurant_id: str, data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """
    تحديث بيانات مطعم
    """
    try:
        restaurant = await db.restaurants.update(
            where={"id": restaurant_id},
            data=data
        )
        return restaurant
    except Exception as e:
        logger.error(f"Error updating restaurant {restaurant_id}: {e}")
        return None

async def delete_restaurant(restaurant_id: str) -> bool:
    """
    حذف مطعم
    """
    try:
        await db.restaurants.delete(
            where={"id": restaurant_id}
        )
        return True
    except Exception as e:
        logger.error(f"Error deleting restaurant {restaurant_id}: {e}")
        return False