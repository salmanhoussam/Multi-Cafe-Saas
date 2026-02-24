from fastapi import HTTPException
from app.database import db

async def get_dashboard_summary_data(restaurant_id: str):
    """
    هذه الدالة تجلب إحصائيات المطعم (الطلبات، الأرباح، وأحدث الطلبات) من قاعدة البيانات
    """
    # 1. التحقق من وجود المطعم
    restaurant = await db.restaurant.find_unique(
        where={"id": restaurant_id}
    )
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")

    # 2. جلب إجمالي عدد الطلبات
    total_orders = await db.order.count(
        where={"restaurantId": restaurant_id}
    )

    # 3. جلب جميع الطلبات المكتملة لحساب إجمالي المبيعات
    completed_orders = await db.order.find_many(
        where={
            "restaurantId": restaurant_id,
            "status": "COMPLETED" 
        }
    )
    total_revenue = sum(float(order.totalPrice) for order in completed_orders)

    # 4. جلب آخر 5 طلبات حديثة
    recent_orders = await db.order.find_many(
        where={"restaurantId": restaurant_id},
        order={"createdAt": "desc"},
        take=5,
        include={"items": True}
    )

    # 5. حساب عدد الأصناف في المنيو
    total_menu_items = await db.menuitem.count(
        where={"restaurantId": restaurant_id}
    )

    # تجميع البيانات
    return {
        "restaurant_name": restaurant.nameEn,
        "statistics": {
            "total_orders": total_orders,
            "total_revenue": total_revenue,
            "total_menu_items": total_menu_items
        },
        "recent_orders": [
            {
                "id": order.id,
                "customer_name": order.customerName,
                "total_price": float(order.totalPrice),
                "status": order.status,
                "created_at": order.createdAt.isoformat()
            }
            for order in recent_orders
        ]
    }