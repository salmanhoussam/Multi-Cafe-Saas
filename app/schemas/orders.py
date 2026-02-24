from pydantic import BaseModel
from typing import List, Optional
from decimal import Decimal

class OrderCreate(BaseModel):
    restaurant_id: str
    customer_name: str
    customer_phone: str
    items: List[dict]      # نتوقع أن تحتوي على menu_item_id, quantity, notes
    total_price: float

class OrderItemResponse(BaseModel):
    id: str
    quantity: int
    unit_price: float
    notes: Optional[str] = None
    menu_item_id: str

class OrderResponse(BaseModel):
    id: str
    customer_name: Optional[str]
    customer_phone: Optional[str]
    total_price: float
    currency: str
    status: str
    restaurant_id: str
    items: List[OrderItemResponse]
    created_at: str

    class Config:
        from_attributes = True