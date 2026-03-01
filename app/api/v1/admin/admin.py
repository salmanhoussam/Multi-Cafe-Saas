# app/routes/admin.py
from fastapi import APIRouter, HTTPException, Depends
from app.database import db
from pydantic import BaseModel
from typing import Optional
from app.api.v1.admin.auth import get_current_user

router = APIRouter(prefix="/api/admin", tags=["Admin"])

# ==========================================
# 📑 نماذج الفئات (Categories)
# ==========================================
class CategoryCreate(BaseModel):
    name_ar: str
    name_en: str
    sort_order: int = 0
    image_url: Optional[str] = None

class CategoryUpdate(BaseModel):
    name_ar: Optional[str] = None
    name_en: Optional[str] = None
    sort_order: Optional[int] = None
    image_url: Optional[str] = None

@router.get("/categories")
async def get_categories(manager = Depends(get_current_user)):
    restaurant_id = manager.get("restaurant_id")
    if not restaurant_id:
        raise HTTPException(403, "غير مصرح")
    return await db.categories.find_many(
        where={"restaurant_id": restaurant_id},
        order={"sort_order": "asc"}
    )

@router.get("/categories/{category_id}")
async def get_single_category(category_id: str, manager = Depends(get_current_user)):
    if category_id == "undefined":
        return None 
    category = await db.categories.find_unique(where={"id": category_id})
    if not category or category.restaurant_id != manager.get("restaurant_id"):
        raise HTTPException(404, "الفئة غير موجودة")
    return category

@router.post("/categories")
async def create_category(category: CategoryCreate, manager = Depends(get_current_user)):
    restaurant_id = manager.get("restaurant_id")
    if not restaurant_id:
        raise HTTPException(403, "غير مصرح")
    return await db.categories.create(
        data={
            "name_ar": category.name_ar,
            "name_en": category.name_en,
            "sort_order": category.sort_order,
            "image_url": category.image_url,
            "restaurant_id": restaurant_id 
        }
    )

@router.put("/categories/{category_id}")
async def update_category(category_id: str, updates: CategoryUpdate, manager = Depends(get_current_user)):
    category = await db.categories.find_unique(where={"id": category_id})
    if not category or category.restaurant_id != manager.get("restaurant_id"):
        raise HTTPException(404, "الفئة غير موجودة")
    update_data = {k: v for k, v in updates.dict().items() if v is not None}
    return await db.categories.update(where={"id": category_id}, data=update_data)

@router.delete("/categories/{category_id}")
async def delete_category(category_id: str, manager = Depends(get_current_user)):
    category = await db.categories.find_unique(where={"id": category_id})
    if not category or category.restaurant_id != manager.get("restaurant_id"):
        raise HTTPException(404, "الفئة غير موجودة")
    await db.categories.delete(where={"id": category_id})
    return {"message": "تم الحذف"}


# ==========================================
# 🍔 نماذج الأصناف (Menu Items)
# ==========================================
class MenuItemCreate(BaseModel):
    name_ar: str
    name_en: str
    description_ar: Optional[str] = None
    description_en: Optional[str] = None
    price: float
    currency: str = "$"
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

@router.get("/menu-items")
async def get_menu_items(category_id: Optional[str] = None, manager = Depends(get_current_user)):
    restaurant_id = manager.get("restaurant_id")
    where_clause = {"restaurant_id": restaurant_id}
    if category_id and category_id != "undefined":
        where_clause["category_id"] = category_id
    return await db.menu_items.find_many(where=where_clause, order={"created_at": "desc"})

@router.post("/menu-items")
async def create_menu_item(item: MenuItemCreate, manager = Depends(get_current_user)):
    restaurant_id = manager.get("restaurant_id")
    category = await db.categories.find_unique(where={"id": item.category_id})
    if not category or category.restaurant_id != restaurant_id:
        raise HTTPException(400, "الفئة المختارة غير صالحة")
    return await db.menu_items.create(
        data={
            "name_ar": item.name_ar, "name_en": item.name_en, "description_ar": item.description_ar,
            "description_en": item.description_en, "price": item.price, "currency": item.currency,
            "image_url": item.image_url, "is_available": item.is_available,
            "category_id": item.category_id, "restaurant_id": restaurant_id
        }
    )

@router.put("/menu-items/{item_id}")
async def update_menu_item(item_id: str, updates: MenuItemUpdate, manager = Depends(get_current_user)):
    item = await db.menu_items.find_unique(where={"id": item_id})
    if not item or item.restaurant_id != manager.get("restaurant_id"):
        raise HTTPException(404, "الصنف غير موجود")
    update_data = {k: v for k, v in updates.dict().items() if v is not None}
    return await db.menu_items.update(where={"id": item_id}, data=update_data)

@router.delete("/menu-items/{item_id}")
async def delete_menu_item(item_id: str, manager = Depends(get_current_user)):
    item = await db.menu_items.find_unique(where={"id": item_id})
    if not item or item.restaurant_id != manager.get("restaurant_id"):
        raise HTTPException(404, "الصنف غير موجود")
    await db.menu_items.delete(where={"id": item_id})
    return {"message": "تم الحذف"}