# app/services/public/order_service.py
from app.database import db
from app.schemas.public.orders import OrderCreate
from fastapi import HTTPException
import logging

logger = logging.getLogger(__name__)

async def process_new_order(order_data: OrderCreate):
    """
    معالجة طلب جديد
    """
    try:
        # 1. جلب المطعم
        restaurant = await db.restaurants.find_first(
            where={"slug": order_data.restaurant_slug, "is_active": True}
        )
        if not restaurant:
            raise HTTPException(status_code=404, detail="Restaurant not found")

        # 2. التحقق من العناصر وحساب السعر
        total_price = 0
        validated_items = []
        currency = "LBP"
        
        for item in order_data.items:
            menu_item = await db.menu_items.find_unique(
                where={"id": item.menu_item_id}
            )
            
            if not menu_item:
                raise HTTPException(status_code=404, detail=f"Item {item.menu_item_id} not found")
            
            if not menu_item.is_available:
                raise HTTPException(status_code=400, detail=f"{menu_item.name_ar} غير متوفر")
            
            unit_price = float(menu_item.price)
            quantity = item.quantity
            total_price += unit_price * quantity
            currency = menu_item.currency or "LBP"
            
            validated_items.append({
                "menu_item_id": item.menu_item_id,
                "quantity": quantity,
                "unit_price": unit_price,
                "notes": item.notes,
                "name_ar": menu_item.name_ar
            })

        # 3. إنشاء الطلب
        new_order = await db.orders.create(
            data={
                "restaurant_id": restaurant.id,
                "customer_name": order_data.customer_name,
                "customer_phone": order_data.customer_phone,
                "total_price": total_price,
                "currency": currency,
                "status": "pending",
                "items": validated_items
            }
        )

        # 4. إنشاء order_items
        for item in validated_items:
            await db.order_items.create(
                data={
                    "order_id": new_order.id,
                    "menu_item_id": item["menu_item_id"],
                    "quantity": item["quantity"],
                    "unit_price": item["unit_price"],
                    "notes": item.get("notes")
                }
            )

        # 5. تجهيز الرد
        response_items = [{
            "id": f"temp_{i}",
            "quantity": item["quantity"],
            "unit_price": item["unit_price"],
            "notes": item.get("notes"),
            "menu_item_id": item["menu_item_id"],
            "menu_item_name": item.get("name_ar")
        } for i, item in enumerate(validated_items)]

        return {
            "id": new_order.id,
            "customer_name": new_order.customer_name,
            "customer_phone": new_order.customer_phone,
            "total_price": float(new_order.total_price),
            "currency": new_order.currency,
            "status": new_order.status,
            "restaurant_id": restaurant.id,
            "restaurant_name": restaurant.name_ar,
            "items": response_items,
            "created_at": new_order.created_at.isoformat() if new_order.created_at else None,
            "estimated_time": 20  # وقت تقديري
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"🔥 Error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal Server Error")