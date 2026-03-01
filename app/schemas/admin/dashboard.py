# app/schemas/admin/dashboard.py
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class RestaurantInfo(BaseModel):
    id: str
    name_ar: str
    name_en: str
    slug: str
    is_active: bool
    image_url: Optional[str] = None
    phone: Optional[str] = None
    manager_phone: str
    created_at: Optional[str] = None

class DashboardStats(BaseModel):
    items_count: int
    orders_count: int
    categories_count: int
    monthly_sales: float
    currency: str

class RecentOrder(BaseModel):
    id: str
    customer_name: str
    customer_phone: Optional[str] = None
    total_price: float
    currency: str
    status: str
    created_at: Optional[str] = None
    created_at_formatted: Optional[str] = None
    items_count: int = 0

class PopularItem(BaseModel):
    id: str
    name_ar: str
    name_en: str
    count: int
    total_revenue: float

class PeriodInfo(BaseModel):
    days: int
    start_date: str
    end_date: str

class DashboardSummaryResponse(BaseModel):
    restaurant: RestaurantInfo
    stats: DashboardStats
    recent_orders: List[RecentOrder]
    popular_items: List[PopularItem]
    period: PeriodInfo