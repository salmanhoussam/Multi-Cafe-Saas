# app/services/public/menu_service.py
from app.database import db
from typing import Optional, Dict, Any, List
import logging
from decimal import Decimal

logger = logging.getLogger(__name__)

async def get_full_menu(slug: str) -> Optional[Dict[str, Any]]:
    """
    جلب القائمة الكاملة للمطعم
    """
    try:
        # جلب المطعم مع الفئات والأصناف في استعلام واحد (إذا كانت العلاقات موجودة)
        restaurant = await db.restaurants.find_first(
            where={
                "slug": slug,
                "is_active": True
            },
            include={
                "categories": {
                    "order_by": {"sort_order": "asc"}
                },
                "menu_items": True
            }
        )
        
        if not restaurant:
            logger.warning(f"⚠️ Restaurant not found with slug: {slug}")
            return None

        # تجهيز البيانات للرد
        return {
            "restaurant": {
                "id": restaurant.id,
                "name_ar": restaurant.name_ar,
                "name_en": restaurant.name_en,
                "slug": restaurant.slug,
                "phone": restaurant.phone,
                "manager_phone": restaurant.manager_phone,
                "is_active": restaurant.is_active,
                "image_url": restaurant.image_url,
                "cover_image": restaurant.cover_image,
                "manager_id": restaurant.manager_id,
                "created_at": restaurant.created_at.isoformat() if restaurant.created_at else None
            },
            "categories": [
                {
                    "id": cat.id,
                    "name_ar": cat.name_ar,
                    "name_en": cat.name_en,
                    "sort_order": cat.sort_order,
                    "image_url": cat.image_url,
                    "restaurant_id": cat.restaurant_id
                } for cat in (restaurant.categories or [])
            ],
            "items": [
                {
                    "id": item.id,
                    "restaurant_id": item.restaurant_id,
                    "category_id": item.category_id,
                    "name_ar": item.name_ar,
                    "name_en": item.name_en,
                    "description_ar": item.description_ar,
                    "description_en": item.description_en,
                    "price": float(item.price) if item.price else 0,
                    "currency": item.currency or "LBP",
                    "image_url": item.image_url,
                    "is_available": item.is_available if item.is_available is not None else True,
                    "created_at": item.created_at.isoformat() if item.created_at else None
                } for item in (restaurant.menu_items or [])
            ]
        }
    except Exception as e:
        logger.error(f"🔥 Error in get_full_menu for slug {slug}: {e}", exc_info=True)
        return None

async def get_categories(restaurant_id: str) -> List[Dict[str, Any]]:
    """
    جلب فئات مطعم معين
    """
    try:
        categories = await db.categories.find_many(
            where={"restaurant_id": restaurant_id},
            order={"sort_order": "asc"}
        )
        
        return [
            {
                "id": cat.id,
                "name_ar": cat.name_ar,
                "name_en": cat.name_en,
                "sort_order": cat.sort_order,
                "image_url": cat.image_url,
                "restaurant_id": cat.restaurant_id
            } for cat in categories
        ]
    except Exception as e:
        logger.error(f"Error fetching categories for restaurant {restaurant_id}: {e}")
        return []

async def get_menu_items(restaurant_id: str, category_id: Optional[str] = None) -> List[Dict[str, Any]]:
    """
    جلب عناصر القائمة (يمكن تصفيتها حسب الفئة)
    """
    try:
        where_condition = {"restaurant_id": restaurant_id}
        if category_id and category_id != "all" and category_id != "undefined":
            where_condition["category_id"] = category_id
            
        items = await db.menu_items.find_many(
            where=where_condition,
            order={"created_at": "desc"}
        )
        
        return [
            {
                "id": item.id,
                "restaurant_id": item.restaurant_id,
                "category_id": item.category_id,
                "name_ar": item.name_ar,
                "name_en": item.name_en,
                "description_ar": item.description_ar,
                "description_en": item.description_en,
                "price": float(item.price) if item.price else 0,
                "currency": item.currency or "LBP",
                "image_url": item.image_url,
                "is_available": item.is_available if item.is_available is not None else True
            } for item in items
        ]
    except Exception as e:
        logger.error(f"Error fetching menu items for restaurant {restaurant_id}: {e}")
        return []

async def get_menu_item_by_id(item_id: str, restaurant_id: str) -> Optional[Dict[str, Any]]:
    """
    جلب عنصر محدد من القائمة
    """
    try:
        item = await db.menu_items.find_first(
            where={
                "id": item_id,
                "restaurant_id": restaurant_id
            }
        )
        
        if not item:
            return None
            
        return {
            "id": item.id,
            "restaurant_id": item.restaurant_id,
            "category_id": item.category_id,
            "name_ar": item.name_ar,
            "name_en": item.name_en,
            "description_ar": item.description_ar,
            "description_en": item.description_en,
            "price": float(item.price) if item.price else 0,
            "currency": item.currency or "LBP",
            "image_url": item.image_url,
            "is_available": item.is_available if item.is_available is not None else True
        }
    except Exception as e:
        logger.error(f"Error fetching menu item {item_id}: {e}")
        return None

async def check_restaurant_exists(slug: str) -> bool:
    """
    التحقق من وجود مطعم
    """
    try:
        count = await db.restaurants.count(
            where={
                "slug": slug,
                "is_active": True
            }
        )
        return count > 0
    except Exception as e:
        logger.error(f"Error checking restaurant {slug}: {e}")
        return False