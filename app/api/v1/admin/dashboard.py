# app/api/v1/admin/dashboard.py
from fastapi import APIRouter, HTTPException, Depends, Query
from typing import Optional
from app.services.admin.dashboard_service import (
    get_dashboard_summary_data, 
    get_orders_by_status
)
from app.core.security import get_current_restaurant
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/admin/dashboard", tags=["Admin Dashboard"])

@router.get("/summary")
async def get_dashboard_summary(
    days_back: Optional[int] = Query(30, description="عدد الأيام السابقة للإحصائيات"),
    current_restaurant = Depends(get_current_restaurant)
):
    """
    جلب ملخص لوحة التحكم للمطعم الحالي
    
    - days_back: عدد الأيام السابقة لحساب المبيعات (افتراضي 30)
    """
    try:
        restaurant_id = current_restaurant.get("restaurant_id")
        
        if not restaurant_id:
            raise HTTPException(status_code=403, detail="Access denied: No restaurant linked")
        
        logger.info(f"📊 Fetching dashboard summary for restaurant {restaurant_id} (last {days_back} days)")
        
        summary = await get_dashboard_summary_data(restaurant_id, days_back)
        return summary
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"🔥 ERROR in dashboard summary: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal Server Error")

@router.get("/orders-by-status")
async def get_orders_status(
    current_restaurant = Depends(get_current_restaurant)
):
    """
    جلب عدد الطلبات حسب الحالة
    """
    try:
        restaurant_id = current_restaurant.get("restaurant_id")
        
        if not restaurant_id:
            raise HTTPException(status_code=403, detail="Access denied")
        
        status_counts = await get_orders_by_status(restaurant_id)
        return status_counts
        
    except Exception as e:
        logger.error(f"Error fetching orders by status: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")

@router.get("/recent-orders")
async def get_recent_orders(
    limit: int = Query(10, description="عدد الطلبات الأخيرة"),
    current_restaurant = Depends(get_current_restaurant)
):
    """
    جلب آخر الطلبات
    """
    try:
        restaurant_id = current_restaurant.get("restaurant_id")
        
        if not restaurant_id:
            raise HTTPException(status_code=403, detail="Access denied")
        
        # استخدام نفس الدالة ولكن نرجع فقط recent_orders
        summary = await get_dashboard_summary_data(restaurant_id)
        return summary.get("recent_orders", [])[:limit]
        
    except Exception as e:
        logger.error(f"Error fetching recent orders: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")