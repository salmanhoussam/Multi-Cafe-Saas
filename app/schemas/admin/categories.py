# app/schemas/admin/categories.py
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class CategoryBase(BaseModel):
    name_ar: str
    name_en: str
    sort_order: int = 0
    image_url: Optional[str] = None

class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(BaseModel):
    name_ar: Optional[str] = None
    name_en: Optional[str] = None
    sort_order: Optional[int] = None
    image_url: Optional[str] = None

class CategoryOut(CategoryBase):
    id: str
    restaurant_id: str
    created_at: Optional[str] = None
    
    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat() if v else None
        }