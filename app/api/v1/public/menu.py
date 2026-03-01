# app/api/v1/public/menu.py
from fastapi import APIRouter, HTTPException, Depends, Request
from typing import List, Optional
from app.services.public.menu_service import get_full_menu, get_categories, get_menu_items
# ✅ استيراد مباشر من الملفات (وليس من المجلدات)
from app.schemas.public.menu import FullMenuOut, CategoryOut, MenuItemOut
from app.utils.tenant import get_restaurant_from_subdomain, verify_restaurant_exists
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/public", tags=["Public Menu"])

@router.get("/menu/full", response_model=FullMenuOut)
async def get_full_menu_route(
    request: Request,
    restaurant_slug: str = Depends(get_restaurant_from_subdomain)
):
    """
    جلب القائمة الكاملة للمطعم
    الرابط: https://[slug].salmansaas.com/api/v1/public/menu/full?slug=restaurant
    مثال: http://127.0.0.1:8000/api/v1/public/menu/full?slug=menu1
    """
    try:
        logger.info(f"📋 Fetching full menu for restaurant: {restaurant_slug}")
        
        # التحقق من وجود المطعم
        await verify_restaurant_exists(restaurant_slug)
        
        # جلب القائمة
        data = await get_full_menu(restaurant_slug)
        
        if data is None:
            raise HTTPException(
                status_code=404, 
                detail=f"Menu not found for restaurant: {restaurant_slug}"
            )
            
        return data
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"🔥 ERROR in /menu/full: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal Server Error")
    
# للـ query parameter (تطوير محلي)
@router.get("/menu/full", response_model=FullMenuOut)
async def get_full_menu_with_query(
    request: Request,
    restaurant_slug: str = Depends(get_restaurant_from_subdomain)
):
    """ /menu/full?slug=arizona """
    # نفس الكود السابق

# للـ path parameter (مع subdomain)
@router.get("/menu/full/{restaurant_slug}", response_model=FullMenuOut)
async def get_full_menu_with_path(
    restaurant_slug: str,
    request: Request
):
    """ /menu/full/arizona """
    try:
        logger.info(f"📋 Fetching full menu for restaurant: {restaurant_slug}")
        await verify_restaurant_exists(restaurant_slug)
        data = await get_full_menu(restaurant_slug)
        if data is None:
            raise HTTPException(status_code=404, detail="Menu not found")
        return data
    except Exception as e:
        logger.error(f"ERROR: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")
    
@router.get("/categories", response_model=List[CategoryOut])
async def get_categories_route(
    request: Request,
    restaurant_slug: str = Depends(get_restaurant_from_subdomain)
):
    """
    جلب فئات المطعم
    """
    try:
        restaurant = await verify_restaurant_exists(restaurant_slug)
        categories = await get_categories(restaurant.id)
        return categories
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching categories: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")

@router.get("/items", response_model=List[MenuItemOut])
async def get_items_route(
    request: Request,
    category_id: Optional[str] = None,
    restaurant_slug: str = Depends(get_restaurant_from_subdomain)
):
    """
    جلب عناصر القائمة (يمكن تصفيتها حسب الفئة)
    """
    try:
        restaurant = await verify_restaurant_exists(restaurant_slug)
        items = await get_menu_items(restaurant.id, category_id)
        return items
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching items: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")