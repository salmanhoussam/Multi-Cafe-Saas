from fastapi import HTTPException
from app.database import db
from app.schemas.orders import OrderCreate, OrderResponse
from decimal import Decimal

async def process_new_order(order_data: OrderCreate) -> OrderResponse:
    """
    هذه الدالة تستقبل بيانات الطلب، تتأكد منها، وتحفظها في قاعدة البيانات بأمان
    """
    # 1. التحقق من وجود المطعم
    restaurant = await db.restaurant.find_unique(
        where={"id": order_data.restaurant_id}
    )
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")

    # 2. نستخدم transaction لضمان إنشاء order و order_items معاً بدون أخطاء
    async with db.tx() as transaction:
        # إنشاء الطلب الرئيسي
        new_order = await transaction.order.create(
            data={
                "customerName": order_data.customer_name,
                "customerPhone": order_data.customer_phone,
                "totalPrice": Decimal(str(order_data.total_price)),
                "currency": "USD", # يمكن تعديله لاحقاً ليأخذ عملة المطعم
                "status": "PENDING",
                "restaurantId": order_data.restaurant_id,
            }
        )

        order_items = []
        # إنشاء عناصر الطلب (المنتجات)
        for item in order_data.items:
            # التأكد من أن المنتج موجود فعلاً
            menu_item = await transaction.menuitem.find_unique(
                where={"id": item.menu_item_id}  # استخدمنا النقطة لأنها Pydantic Model
            )
            if not menu_item:
                raise HTTPException(status_code=404, detail=f"Menu item not found")

            # تحديد السعر
            unit_price = Decimal(str(item.unit_price if item.unit_price else menu_item.price))

            # حفظ العنصر
            order_item = await transaction.orderitem.create(
                data={
                    "quantity": item.quantity,
                    "unitPrice": unit_price,
                    "notes": item.notes,
                    "orderId": new_order.id,
                    "menuItemId": item.menu_item_id
                }
            )
            order_items.append(order_item)

    # 3. تجميع البيانات وإرجاعها بنفس شكل الـ Pydantic Schema
    return OrderResponse(
        id=new_order.id,
        customer_name=new_order.customerName,
        customer_phone=new_order.customerPhone,
        total_price=float(new_order.totalPrice),
        currency=new_order.currency,
        status=new_order.status,
        restaurant_id=new_order.restaurantId,
        items=[
            {
                "id": i.id,
                "quantity": i.quantity,
                "unit_price": float(i.unitPrice),
                "notes": i.notes,
                "menu_item_id": i.menuItemId
            } for i in order_items
        ],
        created_at=new_order.createdAt.isoformat()
    )