# app/api/v1/admin/orders.py
from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional
from app.core.security import get_current_restaurant
from app.services.admin.order_management import (
    get_restaurant_orders,
    update_order_status,
    get_order_stats
)
from app.schemas.admin.orders import OrderUpdate, OrderFilter, OrderStats
from app.schemas.public.orders import OrderResponse
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/admin/orders", tags=["Admin Orders"])

@router.get("/", response_model=List[OrderResponse])
async def get_orders(
    status: Optional[str] = Query(None, description="تصفية حسب الحالة"),
    limit: int = Query(50, description="عدد الطلبات"),
    current_restaurant = Depends(get_current_restaurant)
):
    """جلب طلبات المطعم"""
    try:
        restaurant_id = current_restaurant.get("restaurant_id")
        orders = await get_restaurant_orders(restaurant_id, status, limit)
        return orders
    except Exception as e:
        logger.error(f"Error: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")

@router.put("/{order_id}/status")
async def update_status(
    order_id: str,
    update: OrderUpdate,
    current_restaurant = Depends(get_current_restaurant)
):
    """تحديث حالة الطلب"""
    try:
        restaurant_id = current_restaurant.get("restaurant_id")
        result = await update_order_status(order_id, restaurant_id, update)
        return result
    except Exception as e:
        logger.error(f"Error: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")

@router.get("/stats", response_model=OrderStats)
async def get_stats(
    days: int = Query(7, description="آخر X يوم"),
    current_restaurant = Depends(get_current_restaurant)
):
    """إحصائيات الطلبات"""
    try:
        restaurant_id = current_restaurant.get("restaurant_id")
        stats = await get_order_stats(restaurant_id, days)
        return stats
    except Exception as e:
        logger.error(f"Error: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")