# app/services/admin/dashboard_service.py
from app.database import db
from fastapi import HTTPException
from typing import Optional, Dict, Any, List
import logging
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

async def get_dashboard_summary_data(
    restaurant_id: str, 
    days_back: int = 30
) -> Dict[str, Any]:
    """
    جلب ملخص لوحة التحكم للمطعم
    """
    try:
        # 🔍 جلب المطعم مع التحقق
        restaurant = await db.restaurants.find_unique(
            where={"id": restaurant_id}
        )
        if not restaurant:
            logger.warning(f"Restaurant not found: {restaurant_id}")
            raise HTTPException(status_code=404, detail="Restaurant not found")

        # 🍽️ عدد الأصناف
        items_count = await db.menu_items.count(
            where={"restaurant_id": restaurant_id}
        )
        
        # 📦 عدد الطلبات
        orders_count = await db.orders.count(
            where={"restaurant_id": restaurant_id}
        )
        
        # 🗂️ عدد الفئات
        categories_count = await db.categories.count(
            where={"restaurant_id": restaurant_id}
        )

        # 💰 حساب المبيعات
        thirty_days_ago = datetime.utcnow() - timedelta(days=days_back)
        
        monthly_orders = await db.orders.find_many(
            where={
                "restaurant_id": restaurant_id,
                "created_at": {"gte": thirty_days_ago},
                "status": "completed"
            }
        )
        
        total_sales = sum(float(order.total_price) for order in monthly_orders)

        # 📋 آخر الطلبات
        recent_orders = await db.orders.find_many(
            where={"restaurant_id": restaurant_id},
            order={"created_at": "desc"},
            take=10
        )

        # 🔥 العناصر الأكثر مبيعاً
        popular_items = []
        try:
            thirty_days_ago = datetime.utcnow() - timedelta(days=days_back)
            
            orders_with_items = await db.orders.find_many(
                where={
                    "restaurant_id": restaurant_id,
                    "created_at": {"gte": thirty_days_ago},
                    "status": "completed"
                }
            )
            
            popular_items_dict = {}
            
            for order in orders_with_items:
                order_items = await db.order_items.find_many(
                    where={"order_id": order.id}
                )
                
                for order_item in order_items:
                    menu_item = await db.menu_items.find_unique(
                        where={"id": order_item.menu_item_id}
                    )
                    
                    if menu_item:
                        item_id = menu_item.id
                        if item_id not in popular_items_dict:
                            popular_items_dict[item_id] = {
                                "id": menu_item.id,
                                "name_ar": menu_item.name_ar,
                                "name_en": menu_item.name_en,
                                "count": 0,
                                "total_revenue": 0
                            }
                        popular_items_dict[item_id]["count"] += order_item.quantity or 1
                        popular_items_dict[item_id]["total_revenue"] += float(order_item.unit_price or 0) * (order_item.quantity or 1)
            
            popular_items = sorted(popular_items_dict.values(), key=lambda x: x["count"], reverse=True)[:5]
            
        except Exception as e:
            logger.error(f"Error getting popular items: {e}")
            popular_items = []

        # ✅ تحديد العملة
        try:
            currency = await get_restaurant_currency(restaurant_id)
        except Exception as e:
            logger.error(f"Error getting currency: {e}")
            currency = "LBP"

        # تحضير الرد
        return {
            "restaurant": {
                "id": restaurant.id,
                "name_ar": restaurant.name_ar,
                "name_en": restaurant.name_en,
                "slug": restaurant.slug,
                "is_active": restaurant.is_active,
                "image_url": restaurant.image_url,
                "phone": restaurant.phone,
                "manager_phone": restaurant.manager_phone,
                "created_at": restaurant.created_at.isoformat() if restaurant.created_at else None
            },
            "stats": {
                "items_count": items_count,
                "orders_count": orders_count,
                "categories_count": categories_count,
                "monthly_sales": float(total_sales),
                "currency": currency
            },
            "recent_orders": [
                {
                    "id": o.id,
                    "customer_name": o.customer_name,
                    "customer_phone": getattr(o, "customer_phone", None),
                    "total_price": float(o.total_price),
                    "currency": getattr(o, "currency", "LBP"),
                    "status": o.status,
                    "created_at": o.created_at.isoformat() if o.created_at else None,
                    "created_at_formatted": o.created_at.strftime("%Y-%m-%d %H:%M") if o.created_at else None,
                    "items_count": 0
                } for o in recent_orders
            ],
            "popular_items": popular_items,
            "period": {
                "days": days_back,
                "start_date": thirty_days_ago.isoformat(),
                "end_date": datetime.utcnow().isoformat()
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"🔥 Error in dashboard service for restaurant {restaurant_id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal Server Error")

# ==================== الدوال المساعدة ====================

async def get_restaurant_currency(restaurant_id: str) -> str:
    """
    تحديد العملة الافتراضية للمطعم
    """
    try:
        first_item = await db.menu_items.find_first(
            where={"restaurant_id": restaurant_id}
        )
        if first_item and first_item.currency:
            return first_item.currency
        return "LBP"
    except Exception as e:
        logger.error(f"Error getting currency: {e}")
        return "LBP"

async def get_orders_by_status(restaurant_id: str) -> Dict[str, int]:
    """
    جلب عدد الطلبات حسب الحالة
    """
    try:
        statuses = ["pending", "confirmed", "preparing", "ready", "completed", "cancelled"]
        result = {}
        
        for status in statuses:
            count = await db.orders.count(
                where={
                    "restaurant_id": restaurant_id,
                    "status": status
                }
            )
            result[status] = count
            
        return result
        
    except Exception as e:
        logger.error(f"Error getting orders by status: {e}")
        return {}

# (اختياري) إذا أردت استخدام get_popular_items بشكل منفصل
async def get_popular_items(restaurant_id: str, days_back: int = 30) -> List[Dict[str, Any]]:
    """
    جلب العناصر الأكثر مبيعاً
    """
    try:
        thirty_days_ago = datetime.utcnow() - timedelta(days=days_back)
        
        orders = await db.orders.find_many(
            where={
                "restaurant_id": restaurant_id,
                "created_at": {"gte": thirty_days_ago},
                "status": "completed"
            }
        )
        
        items_count = {}
        
        for order in orders:
            order_items = await db.order_items.find_many(
                where={"order_id": order.id}
            )
            
            for order_item in order_items:
                menu_item = await db.menu_items.find_unique(
                    where={"id": order_item.menu_item_id}
                )
                
                if menu_item:
                    item_id = menu_item.id
                    if item_id not in items_count:
                        items_count[item_id] = {
                            "id": menu_item.id,
                            "name_ar": menu_item.name_ar,
                            "name_en": menu_item.name_en,
                            "count": 0,
                            "total_revenue": 0
                        }
                    items_count[item_id]["count"] += order_item.quantity or 1
                    items_count[item_id]["total_revenue"] += float(order_item.unit_price or 0) * (order_item.quantity or 1)
        
        popular = sorted(items_count.values(), key=lambda x: x["count"], reverse=True)[:5]
        return popular
        
    except Exception as e:
        logger.error(f"Error getting popular items: {e}")
        return []