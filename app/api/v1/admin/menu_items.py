# app/api/v1/admin/menu_items.py
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, List
from app.database import db
from app.core.security import get_current_restaurant
from datetime import datetime
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/admin/menu-items", tags=["Admin Menu Items"])

# ==========================================
# 🍔 نماذج الأصناف (Menu Items)
# ==========================================
class MenuItemCreate(BaseModel):
    name_ar: str
    name_en: str
    description_ar: Optional[str] = None
    description_en: Optional[str] = None
    price: float
    currency: str = "LBP"
    image_url: Optional[str] = None
    is_available: bool = True
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

class MenuItemOut(BaseModel):
    id: str
    name_ar: str
    name_en: str
    description_ar: Optional[str] = None
    description_en: Optional[str] = None
    price: float
    currency: str
    image_url: Optional[str] = None
    is_available: bool
    category_id: str
    restaurant_id: str
    created_at: Optional[str] = None

    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat() if v else None
        }

@router.get("", response_model=List[MenuItemOut])
async def get_menu_items(
    category_id: Optional[str] = None,
    current_restaurant = Depends(get_current_restaurant)
):
    """
    جلب عناصر القائمة (يمكن تصفيتها حسب الفئة)
    """
    try:
        restaurant_id = current_restaurant.get("restaurant_id")
        
        where_clause = {"restaurant_id": restaurant_id}
        
        if category_id and category_id != "undefined" and category_id != "all":
            where_clause["category_id"] = category_id
        
        items = await db.menu_items.find_many(
            where=where_clause,
            order={"created_at": "desc"}
        )
        
        logger.info(f"📋 Retrieved {len(items)} menu items for restaurant {restaurant_id}")
        
        # ✅ تحويل البيانات يدوياً
        result = []
        for item in items:
            item_dict = {
                "id": item.id,
                "name_ar": item.name_ar,
                "name_en": item.name_en,
                "description_ar": item.description_ar,
                "description_en": item.description_en,
                "price": float(item.price) if item.price else 0,
                "currency": item.currency or "LBP",
                "image_url": item.image_url,
                "is_available": item.is_available if item.is_available is not None else True,
                "category_id": item.category_id,
                "restaurant_id": item.restaurant_id,
                "created_at": item.created_at.isoformat() if item.created_at else None
            }
            result.append(item_dict)
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching menu items: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")

@router.get("/{item_id}", response_model=MenuItemOut)
async def get_single_menu_item(
    item_id: str,
    current_restaurant = Depends(get_current_restaurant)
):
    """
    جلب عنصر محدد
    """
    try:
        restaurant_id = current_restaurant.get("restaurant_id")
        
        item = await db.menu_items.find_first(
            where={
                "id": item_id,
                "restaurant_id": restaurant_id
            }
        )
        
        if not item:
            raise HTTPException(status_code=404, detail="Menu item not found")
        
        # ✅ تحويل البيانات يدوياً
        return {
            "id": item.id,
            "name_ar": item.name_ar,
            "name_en": item.name_en,
            "description_ar": item.description_ar,
            "description_en": item.description_en,
            "price": float(item.price) if item.price else 0,
            "currency": item.currency or "LBP",
            "image_url": item.image_url,
            "is_available": item.is_available if item.is_available is not None else True,
            "category_id": item.category_id,
            "restaurant_id": item.restaurant_id,
            "created_at": item.created_at.isoformat() if item.created_at else None
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching menu item {item_id}: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")

@router.post("", response_model=MenuItemOut)
async def create_menu_item(
    item: MenuItemCreate,
    current_restaurant = Depends(get_current_restaurant)
):
    """
    إنشاء عنصر جديد في القائمة
    """
    try:
        restaurant_id = current_restaurant.get("restaurant_id")
        
        # التحقق من وجود الفئة
        category = await db.categories.find_first(
            where={
                "id": item.category_id,
                "restaurant_id": restaurant_id
            }
        )
        
        if not category:
            raise HTTPException(status_code=400, detail="Invalid category selected")
        
        # إنشاء العنصر
        new_item = await db.menu_items.create(
            data={
                "name_ar": item.name_ar,
                "name_en": item.name_en,
                "description_ar": item.description_ar,
                "description_en": item.description_en,
                "price": item.price,
                "currency": item.currency,
                "image_url": item.image_url,
                "is_available": item.is_available,
                "category_id": item.category_id,
                "restaurant_id": restaurant_id
            }
        )
        
        logger.info(f"✅ Created menu item: {item.name_ar} for restaurant {restaurant_id}")
        
        # ✅ تحويل البيانات يدوياً
        return {
            "id": new_item.id,
            "name_ar": new_item.name_ar,
            "name_en": new_item.name_en,
            "description_ar": new_item.description_ar,
            "description_en": new_item.description_en,
            "price": float(new_item.price) if new_item.price else 0,
            "currency": new_item.currency or "LBP",
            "image_url": new_item.image_url,
            "is_available": new_item.is_available if new_item.is_available is not None else True,
            "category_id": new_item.category_id,
            "restaurant_id": new_item.restaurant_id,
            "created_at": new_item.created_at.isoformat() if new_item.created_at else None
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating menu item: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")

@router.put("/{item_id}", response_model=MenuItemOut)
async def update_menu_item(
    item_id: str,
    updates: MenuItemUpdate,
    current_restaurant = Depends(get_current_restaurant)
):
    """
    تحديث عنصر موجود
    """
    try:
        restaurant_id = current_restaurant.get("restaurant_id")
        
        # التحقق من وجود العنصر
        item = await db.menu_items.find_first(
            where={
                "id": item_id,
                "restaurant_id": restaurant_id
            }
        )
        
        if not item:
            raise HTTPException(status_code=404, detail="Menu item not found")
        
        # إذا تم تغيير الفئة، تحقق من صحتها
        if updates.category_id and updates.category_id != item.category_id:
            category = await db.categories.find_first(
                where={
                    "id": updates.category_id,
                    "restaurant_id": restaurant_id
                }
            )
            if not category:
                raise HTTPException(status_code=400, detail="Invalid category selected")
        
        # تحضير بيانات التحديث
        update_data = {k: v for k, v in updates.model_dump(exclude_unset=True).items() if v is not None}
        
        updated_item = item
        if update_data:
            updated_item = await db.menu_items.update(
                where={"id": item_id},
                data=update_data
            )
        
        logger.info(f"✅ Updated menu item: {item_id}")
        
        # ✅ تحويل البيانات يدوياً
        return {
            "id": updated_item.id,
            "name_ar": updated_item.name_ar,
            "name_en": updated_item.name_en,
            "description_ar": updated_item.description_ar,
            "description_en": updated_item.description_en,
            "price": float(updated_item.price) if updated_item.price else 0,
            "currency": updated_item.currency or "LBP",
            "image_url": updated_item.image_url,
            "is_available": updated_item.is_available if updated_item.is_available is not None else True,
            "category_id": updated_item.category_id,
            "restaurant_id": updated_item.restaurant_id,
            "created_at": updated_item.created_at.isoformat() if updated_item.created_at else None
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating menu item {item_id}: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")

@router.delete("/{item_id}")
async def delete_menu_item(
    item_id: str,
    current_restaurant = Depends(get_current_restaurant)
):
    """
    حذف عنصر من القائمة
    """
    try:
        restaurant_id = current_restaurant.get("restaurant_id")
        
        # التحقق من وجود العنصر
        item = await db.menu_items.find_first(
            where={
                "id": item_id,
                "restaurant_id": restaurant_id
            }
        )
        
        if not item:
            raise HTTPException(status_code=404, detail="Menu item not found")
        
        # حذف العنصر
        await db.menu_items.delete(where={"id": item_id})
        
        logger.info(f"✅ Deleted menu item: {item_id}")
        return {"message": "Menu item deleted successfully", "id": item_id}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting menu item {item_id}: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")