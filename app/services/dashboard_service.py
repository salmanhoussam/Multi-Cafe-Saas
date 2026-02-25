from app.database import db  # استيراد عميل Prisma
from fastapi import HTTPException

async def get_dashboard_summary_data(restaurant_id: str):
    try:
        # تأكد من اتصال Prisma (يمكن إدارته في main.py أحداث startup/shutdown)
        # جلب إحصائيات سريعة للمطعم
        restaurant = await db.restaurants.find_unique(where={"id": restaurant_id})
        if not restaurant:
            raise HTTPException(status_code=404, detail="Restaurant not found")

        # عدد الأصناف
        items_count = await db.menu_items.count(where={"restaurant_id": restaurant_id})
        # عدد الطلبات (مثال)
        orders_count = await db.orders.count(where={"restaurant_id": restaurant_id})
        # آخر الطلبات
        recent_orders = await db.orders.find_many(
            where={"restaurant_id": restaurant_id},
            order={"created_at": "desc"},
            take=5
        )

        return {
            "restaurant": {
                "id": restaurant.id,
                "name_ar": restaurant.name_ar,
                "name_en": restaurant.name_en,
                "slug": restaurant.slug,
                "is_active": restaurant.is_active,
            },
            "stats": {
                "items_count": items_count,
                "orders_count": orders_count,
            },
            "recent_orders": [
                {
                    "id": o.id,
                    "customer_name": o.customer_name,
                    "total_price": float(o.total_price),
                    "status": o.status,
                    "created_at": o.created_at.isoformat(),
                } for o in recent_orders
            ]
        }
    except Exception as e:
        print("🔥 Error in dashboard service:", e)
        raise HTTPException(status_code=500, detail="Internal Server Error")