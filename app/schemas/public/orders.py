# app/schemas/public/orders.py
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class OrderItem(BaseModel):
    menu_item_id: str
    quantity: int
    notes: Optional[str] = None

class OrderCreate(BaseModel):
    restaurant_slug: str
    customer_name: str
    customer_phone: str
    items: List[OrderItem]

class OrderItemResponse(BaseModel):
    id: str
    quantity: int
    unit_price: float
    notes: Optional[str] = None
    menu_item_id: str
    menu_item_name: Optional[str] = None
    
    class Config:
        from_attributes = True

class OrderResponse(BaseModel):
    id: str
    customer_name: str
    customer_phone: str
    total_price: float
    currency: str
    status: str
    restaurant_id: str
    restaurant_name: Optional[str] = None
    items: List[OrderItemResponse]
    created_at: Optional[str] = None
    estimated_time: Optional[int] = None  # وقت التجهيز المقدر

    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat() if v else None
        }