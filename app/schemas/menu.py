from pydantic import BaseModel
from typing import Optional, List
class RestaurantOut(BaseModel):
    id: str
    name_ar: str
    name_en: str
    slug: str
    image_url: Optional[str] = None
    is_active: bool
    phone: Optional[str] = None
    manager_id: Optional[str] = None

class CategoryOut(BaseModel):
    id: str
    name_ar: str
    name_en: str
    sort_order: int
    image_url: Optional[str] = None
    restaurant_id: str

class MenuItemOut(BaseModel):
    id: str
    restaurant_id: str
    category_id: Optional[str] = None
    name_ar: str
    name_en: str
    description_ar: Optional[str] = None
    description_en: Optional[str] = None
    price: float
    currency: str
    image_url: Optional[str] = None
    is_available: bool
    
MenuItem = MenuItemOut
class FullMenuOut(BaseModel):
    restaurant: RestaurantOut
    categories: List[CategoryOut]
    items: List[MenuItemOut]
    