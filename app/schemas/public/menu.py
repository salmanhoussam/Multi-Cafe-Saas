# app/schemas/public/menu.py
from pydantic import BaseModel
from typing import Optional, List

class RestaurantOut(BaseModel):
    id: str
    name_ar: str
    name_en: str
    slug: str
    phone: Optional[str] = None
    manager_phone: str
    is_active: bool
    image_url: Optional[str] = None
    cover_image: Optional[str] = None
    manager_id: str
    
    class Config:
        from_attributes = True

class CategoryOut(BaseModel):
    id: str
    name_ar: str
    name_en: str
    sort_order: Optional[int] = 0
    image_url: Optional[str] = None
    restaurant_id: str
    
    class Config:
        from_attributes = True

class MenuItemOut(BaseModel):
    id: str
    restaurant_id: str
    category_id: Optional[str] = None
    name_ar: str
    name_en: str
    description_ar: Optional[str] = None
    description_en: Optional[str] = None
    price: float
    currency: str = "LBP"
    image_url: Optional[str] = None
    is_available: bool = True
    
    class Config:
        from_attributes = True

class FullMenuOut(BaseModel):
    restaurant: RestaurantOut
    categories: List[CategoryOut]
    items: List[MenuItemOut]
    
    class Config:
        from_attributes = True