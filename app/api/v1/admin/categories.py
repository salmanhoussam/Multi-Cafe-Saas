# app/api/v1/admin/categories.py
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, List
from app.database import db
from app.core.security import get_current_restaurant
from datetime import datetime
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/admin/categories", tags=["Admin Categories"])

# ==========================================
# 📑 نماذج الفئات (Categories)
# ==========================================
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

class CategoryOut(BaseModel):
    id: str
    name_ar: str
    name_en: str
    sort_order: int
    image_url: Optional[str] = None
    restaurant_id: str
    created_at: Optional[str] = None
    
    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat() if v else None
        }

@router.get("", response_model=List[CategoryOut])
async def get_categories(
    current_restaurant = Depends(get_current_restaurant)
):
    """
    جلب جميع فئات المطعم الحالي
    """
    try:
        restaurant_id = current_restaurant.get("restaurant_id")
        
        categories = await db.categories.find_many(
            where={"restaurant_id": restaurant_id},
            order={"sort_order": "asc"}
        )
        
        logger.info(f"📋 Retrieved {len(categories)} categories for restaurant {restaurant_id}")
        
        # ✅ تحويل البيانات يدوياً للتأكد
        result = []
        for cat in categories:
            cat_dict = {
                "id": cat.id,
                "name_ar": cat.name_ar,
                "name_en": cat.name_en,
                "sort_order": cat.sort_order or 0,
                "image_url": cat.image_url,
                "restaurant_id": cat.restaurant_id,
                "created_at": cat.created_at.isoformat() if cat.created_at else None
            }
            result.append(cat_dict)
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching categories: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")

@router.get("/{category_id}", response_model=CategoryOut)
async def get_single_category(
    category_id: str,
    current_restaurant = Depends(get_current_restaurant)
):
    """
    جلب فئة محددة
    """
    try:
        if category_id == "undefined":
            return None
        
        restaurant_id = current_restaurant.get("restaurant_id")
        
        category = await db.categories.find_first(
            where={
                "id": category_id,
                "restaurant_id": restaurant_id
            }
        )
        
        if not category:
            raise HTTPException(status_code=404, detail="Category not found")
        
        # ✅ تحويل البيانات يدوياً
        return {
            "id": category.id,
            "name_ar": category.name_ar,
            "name_en": category.name_en,
            "sort_order": category.sort_order or 0,
            "image_url": category.image_url,
            "restaurant_id": category.restaurant_id,
            "created_at": category.created_at.isoformat() if category.created_at else None
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching category {category_id}: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")

@router.post("", response_model=CategoryOut)
async def create_category(
    category: CategoryCreate,
    current_restaurant = Depends(get_current_restaurant)
):
    """
    إنشاء فئة جديدة
    """
    try:
        restaurant_id = current_restaurant.get("restaurant_id")
        
        new_category = await db.categories.create(
            data={
                "name_ar": category.name_ar,
                "name_en": category.name_en,
                "sort_order": category.sort_order,
                "image_url": category.image_url,
                "restaurant_id": restaurant_id 
            }
        )
        
        logger.info(f"✅ Created category: {category.name_ar} for restaurant {restaurant_id}")
        
        # ✅ تحويل البيانات يدوياً
        return {
            "id": new_category.id,
            "name_ar": new_category.name_ar,
            "name_en": new_category.name_en,
            "sort_order": new_category.sort_order or 0,
            "image_url": new_category.image_url,
            "restaurant_id": new_category.restaurant_id,
            "created_at": new_category.created_at.isoformat() if new_category.created_at else None
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating category: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")

@router.put("/{category_id}", response_model=CategoryOut)
async def update_category(
    category_id: str,
    updates: CategoryUpdate,
    current_restaurant = Depends(get_current_restaurant)
):
    """
    تحديث فئة موجودة
    """
    try:
        restaurant_id = current_restaurant.get("restaurant_id")
        
        # التحقق من وجود الفئة
        category = await db.categories.find_first(
            where={
                "id": category_id,
                "restaurant_id": restaurant_id
            }
        )
        
        if not category:
            raise HTTPException(status_code=404, detail="Category not found")
        
        # تحضير بيانات التحديث
        update_data = {k: v for k, v in updates.model_dump(exclude_unset=True).items() if v is not None}
        
        if not update_data:
            # إذا لم يكن هناك تحديث، نرجع الفئة الحالية
            return {
                "id": category.id,
                "name_ar": category.name_ar,
                "name_en": category.name_en,
                "sort_order": category.sort_order or 0,
                "image_url": category.image_url,
                "restaurant_id": category.restaurant_id,
                "created_at": category.created_at.isoformat() if category.created_at else None
            }
        
        updated_category = await db.categories.update(
            where={"id": category_id},
            data=update_data
        )
        
        logger.info(f"✅ Updated category: {category_id}")
        
        return {
            "id": updated_category.id,
            "name_ar": updated_category.name_ar,
            "name_en": updated_category.name_en,
            "sort_order": updated_category.sort_order or 0,
            "image_url": updated_category.image_url,
            "restaurant_id": updated_category.restaurant_id,
            "created_at": updated_category.created_at.isoformat() if updated_category.created_at else None
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating category {category_id}: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")

@router.delete("/{category_id}")
async def delete_category(
    category_id: str,
    current_restaurant = Depends(get_current_restaurant)
):
    """
    حذف فئة
    """
    try:
        restaurant_id = current_restaurant.get("restaurant_id")
        
        # التحقق من وجود الفئة
        category = await db.categories.find_first(
            where={
                "id": category_id,
                "restaurant_id": restaurant_id
            }
        )
        
        if not category:
            raise HTTPException(status_code=404, detail="Category not found")
        
        # حذف الفئة
        await db.categories.delete(where={"id": category_id})
        
        logger.info(f"✅ Deleted category: {category_id}")
        return {"message": "Category deleted successfully", "id": category_id}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting category {category_id}: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")