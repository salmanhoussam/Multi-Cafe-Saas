from fastapi import APIRouter, HTTPException
from app.schemas.orders import OrderCreate, OrderResponse
from app.services.order_service import process_new_order

router = APIRouter()

@router.post("/orders", response_model=OrderResponse)
async def create_order(order_data: OrderCreate):
    try:
        # استدعاء الخدمة التي تقوم بكل العمل
        return await process_new_order(order_data)

    except HTTPException:
        raise  # نمرر أخطاء الـ HTTP (مثل 404) كما هي
    except Exception as e:
        print("🔥 ERROR in create_order:", e)
        raise HTTPException(status_code=500, detail="Internal Server Error")