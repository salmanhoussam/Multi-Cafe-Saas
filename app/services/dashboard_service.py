# app/services/dashboard_service.py
from app.database import db
from fastapi import HTTPException
from typing import Optional
import logging
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

async def get_dashboard_summary_data(restaurant_id: str, days_back: Optional[int] = 30):
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

        # 💰 حساب المبيعات الشهرية (بدون aggregate)
        thirty_days_ago = datetime.utcnow() - timedelta(days=days_back)
        
        # جلب جميع الطلبات المكتملة في آخر 30 يوم
        monthly_orders = await db.orders.find_many(
            where={
                "restaurant_id": restaurant_id,
                "created_at": {"gte": thirty_days_ago},
                "status": "completed"
            }
        )
        
        # حساب المجموع يدوياً
        total_sales = sum(float(order.total_price) for order in monthly_orders)

        # 📋 آخر الطلبات
        recent_orders = await db.orders.find_many(
            where={"restaurant_id": restaurant_id},
            order={"created_at": "desc"},
            take=10
        )

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
                "created_at": restaurant.created_at.isoformat() if restaurant.created_at else None
            },
            "stats": {
                "items_count": items_count,
                "orders_count": orders_count,
                "categories_count": categories_count,
                "monthly_sales": float(total_sales),
                "currency": "$"
            },
            "recent_orders": [
                {
                    "id": o.id,
                    "customer_name": o.customer_name,
                    "customer_phone": getattr(o, "customer_phone", None),
                    "total_price": float(o.total_price),
                    "currency": getattr(o, "currency", "$"),
                    "status": o.status,
                    "created_at": o.created_at.isoformat() if o.created_at else None,
                    "created_at_formatted": o.created_at.strftime("%Y-%m-%d %H:%M") if o.created_at else None
                } for o in recent_orders
            ]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"🔥 Error in dashboard service for restaurant {restaurant_id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal Server Error")