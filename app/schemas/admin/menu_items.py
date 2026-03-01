# app/schemas/admin/menu_items.py
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class MenuItemBase(BaseModel):
    name_ar: str
    name_en: str
    description_ar: Optional[str] = None
    description_en: Optional[str] = None
    price: float
    currency: str = "LBP"
    image_url: Optional[str] = None
    is_available: bool = True

class MenuItemCreate(MenuItemBase):
    category_id: str

class MenuItemUpdate(BaseModel):
    name_ar: Optional[str] = None
    name_en: Optional[str] = None
    description_ar: Optional[str] = None
    description_en: Optional[str] = None
    price: Optional[float] = None
    currency: Optional[str] = None
    image_url: Optional[str] = None
    is_available: Optional[bool] = None
    category_id: Optional[str] = None

class MenuItemOut(MenuItemBase):
    id: str
    category_id: str
    restaurant_id: str
    created_at: Optional[str] = None
    
    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat() if v else None
        }