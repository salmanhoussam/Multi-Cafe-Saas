# app/schemas/admin/orders.py
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from enum import Enum

class OrderStatus(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    PREPARING = "preparing"
    READY = "ready"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class OrderUpdate(BaseModel):
    status: Optional[OrderStatus] = None
    estimated_time: Optional[int] = None  # بالدقائق
    notes: Optional[str] = None

class OrderFilter(BaseModel):
    status: Optional[OrderStatus] = None
    date_from: Optional[datetime] = None
    date_to: Optional[datetime] = None
    customer_phone: Optional[str] = None

class OrderStats(BaseModel):
    total_orders: int
    pending_orders: int
    completed_orders: int
    cancelled_orders: int
    total_revenue: float
    average_order_value: float