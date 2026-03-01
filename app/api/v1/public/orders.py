# app/api/v1/public/orders.py
from fastapi import APIRouter, HTTPException, Depends, Request
from app.schemas.public.orders import OrderCreate, OrderResponse
from app.services.public.order_service import process_new_order
from app.utils.tenant import get_restaurant_from_subdomain
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/public/orders", tags=["Public Orders"])

@router.post("/", response_model=OrderResponse)
async def create_order(
    order_data: OrderCreate,
    request: Request
):
    """إنشاء طلب جديد"""
    try:
        if not order_data.restaurant_slug:
            order_data.restaurant_slug = await get_restaurant_from_subdomain(request)
        
        result = await process_new_order(order_data)
        return result

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"🔥 Error: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")